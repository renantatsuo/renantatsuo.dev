import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronsLeftRight,
  Download,
  FileDown,
  Image as ImageIcon,
  Images,
  SlidersHorizontal,
  Sparkles,
  Spline,
  Upload,
} from "lucide-react";
import * as React from "react";
import CampSnapCurveEditor, {
  type ChannelKey,
} from "~/components/CampSnapCurveEditor";
import UserInfo from "~/components/UserInfo";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import {
  applyPerChannelLUT,
  buildCampSnapPreLutBytes,
  CampSnapBrowserError,
  createBaselineCurvePoints,
  curvePointsToLut,
  exportCampSnapFilter,
  exportCampSnapPhotos,
  parseFlt,
  renderCampSnapPhoto,
  revokeCampSnapPhotoUrls,
  validateCampSnapFilterFile,
  validateCampSnapPhotoBatch,
  type CurvePoint,
  type ParsedFilter,
  type ProcessedCampSnapPhoto,
} from "~/lib/campsnap";
import { loadUser } from "~/pages";

type FilterState =
  | { data: ParsedFilter; error?: never; fileName: string }
  | { error: string; data?: never; fileName: string }
  | { fileName?: undefined; data?: undefined; error?: undefined };

type ProcessingState = {
  isProcessing: boolean;
  message: string;
};

type CurvePointsByChannel = Record<ChannelKey, CurvePoint[]>;
type LutsByChannel = Record<ChannelKey, number[]>;

const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";
const PHOTO_EXTENSION_PATTERN = /\.(jpe?g|png|webp)$/i;
const PHOTO_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const LIVE_PREVIEW_MAX_EDGE = 1024;
const LIVE_PREVIEW_DEBOUNCE_MS = 90;

export const Route = createFileRoute("/camp-snap")({
  component: CampSnapPage,
  loader: async () => {
    return {
      user: await loadUser(),
    };
  },
  head: () => ({
    meta: [
      { title: "Camp Snap V105 Filter Tool — renan.dev" },
      {
        name: "description",
        content:
          "Apply Camp Snap V105 .flt filters to local images offline and export processed batches as ZIP.",
      },
    ],
  }),
});

function CampSnapPage() {
  const { user } = Route.useLoaderData();
  const isMountedRef = React.useRef(true);
  const processedPhotosRef = React.useRef<ProcessedCampSnapPhoto[]>([]);
  const [filterState, setFilterState] = React.useState<FilterState>({});
  const [sourceFiles, setSourceFiles] = React.useState<File[]>([]);
  const [processedPhotos, setProcessedPhotos] = React.useState<
    ProcessedCampSnapPhoto[]
  >([]);
  const [selectedPhotoId, setSelectedPhotoId] = React.useState<string | null>(
    null,
  );
  const [processingState, setProcessingState] = React.useState<ProcessingState>(
    {
      isProcessing: false,
      message: "",
    },
  );
  const [curvePoints, setCurvePoints] =
    React.useState<CurvePointsByChannel | null>(null);
  const [activeCurveChannel, setActiveCurveChannel] =
    React.useState<ChannelKey>("R");
  const [arePhotosStale, setArePhotosStale] = React.useState(false);

  const selectedPhoto =
    processedPhotos.find((photo) => photo.id === selectedPhotoId) ??
    processedPhotos[0];

  const baselines = React.useMemo<LutsByChannel | null>(() => {
    if (!filterState.data) return null;
    return {
      R: filterState.data.lutR,
      G: filterState.data.lutG,
      B: filterState.data.lutB,
    };
  }, [filterState.data]);

  const editedLuts = React.useMemo<LutsByChannel | null>(() => {
    if (!curvePoints) return null;
    return {
      R: curvePointsToLut(curvePoints.R),
      G: curvePointsToLut(curvePoints.G),
      B: curvePointsToLut(curvePoints.B),
    };
  }, [curvePoints]);

  const renderFilter = React.useMemo<ParsedFilter | null>(() => {
    if (!filterState.data) return null;
    if (!editedLuts) return filterState.data;
    return {
      ...filterState.data,
      lutR: editedLuts.R,
      lutG: editedLuts.G,
      lutB: editedLuts.B,
    };
  }, [filterState.data, editedLuts]);

  const isEdited = React.useMemo(() => {
    if (!baselines || !editedLuts) return false;
    for (const channel of ["R", "G", "B"] as const) {
      const baseline = baselines[channel];
      const edited = editedLuts[channel];
      for (let index = 0; index < baseline.length; index += 1) {
        if (baseline[index] !== edited[index]) return true;
      }
    }
    return false;
  }, [baselines, editedLuts]);

  const sourceFileByPhotoId = React.useMemo(() => {
    const map = new Map<string, File>();
    processedPhotos.forEach((photo, index) => {
      const file = sourceFiles[index];
      if (file) map.set(photo.id, file);
    });
    return map;
  }, [processedPhotos, sourceFiles]);

  const livePreviewUrl = useCampSnapLivePreview({
    selectedPhoto: selectedPhoto ?? null,
    sourceFile: selectedPhoto
      ? (sourceFileByPhotoId.get(selectedPhoto.id) ?? null)
      : null,
    filter: filterState.data ?? null,
    editedLuts,
    enabled: isEdited,
  });

  const canProcess =
    !processingState.isProcessing &&
    filterState.data !== undefined &&
    sourceFiles.length > 0 &&
    (processedPhotos.length === 0 || arePhotosStale);
  const canExport =
    !processingState.isProcessing &&
    processedPhotos.length > 0 &&
    !arePhotosStale &&
    !filterState.error;
  const canExportFilter =
    filterState.data !== undefined && !processingState.isProcessing;

  const filterSummary = React.useMemo(() => {
    if (!filterState.data) {
      return [];
    }

    return [
      ["brightness", filterState.data.brightness],
      ["contrast", filterState.data.contrast],
      ["saturation", filterState.data.saturation],
      ["hue", filterState.data.hue],
      ["gammaR", filterState.data.gammaR],
      ["gammaG", filterState.data.gammaG],
      ["gammaB", filterState.data.gammaB],
    ] as const;
  }, [filterState.data]);

  React.useEffect(() => {
    processedPhotosRef.current = processedPhotos;
  }, [processedPhotos]);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
      revokeCampSnapPhotoUrls(processedPhotosRef.current);
    };
  }, []);

  async function handleFilterChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    clearProcessedPhotos();
    setCurvePoints(null);
    setActiveCurveChannel("R");
    setArePhotosStale(false);

    if (!file) {
      setFilterState({});
      return;
    }

    const validationError = validateCampSnapFilterFile(file);

    if (validationError) {
      setFilterState({ error: validationError, fileName: file.name });
      return;
    }

    const text = await file.text();
    const parsed = parseFlt(text);

    if (!isMountedRef.current) {
      return;
    }

    if (parsed.error) {
      setFilterState({ error: parsed.error.message, fileName: file.name });
      return;
    }

    setFilterState({
      data: parsed.data,
      fileName: file.name,
    });
    setCurvePoints(createCurvePointsFromFilter(parsed.data));
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    handlePhotoFiles(Array.from(event.target.files ?? []));
    event.currentTarget.value = "";
  }

  function handlePhotoFiles(files: File[]) {
    const acceptedFiles = files.filter(isAcceptedPhotoFile);
    const validationError = validateCampSnapPhotoBatch(acceptedFiles);

    clearProcessedPhotos();
    setArePhotosStale(false);

    if (validationError) {
      setSourceFiles([]);
      setProcessingState({
        isProcessing: false,
        message: validationError,
      });
      return;
    }

    setSourceFiles(acceptedFiles);
    setProcessingState({
      isProcessing: false,
      message:
        acceptedFiles.length === 0 ? "Ready for a filter and photo batch" : "",
    });
  }

  async function handleProcessPhotos() {
    if (!renderFilter || !filterState.data || sourceFiles.length === 0) {
      return;
    }

    clearProcessedPhotos();
    setProcessingState({
      isProcessing: true,
      message: `Processing 0/${sourceFiles.length} photos`,
    });

    const nextPhotos: ProcessedCampSnapPhoto[] = [];

    try {
      for (const [index, file] of sourceFiles.entries()) {
        if (!isMountedRef.current) {
          revokeCampSnapPhotoUrls(nextPhotos);
          return;
        }

        setProcessingState({
          isProcessing: true,
          message: `Processing ${index + 1}/${sourceFiles.length} photos`,
        });

        const processedPhoto = await renderCampSnapPhoto(
          file,
          renderFilter,
          filterState.fileName,
        );
        nextPhotos.push(processedPhoto);

        if (!isMountedRef.current) {
          revokeCampSnapPhotoUrls(nextPhotos);
          return;
        }

        setProcessedPhotos((currentPhotos) => {
          const updatedPhotos = [...currentPhotos, processedPhoto];

          processedPhotosRef.current = updatedPhotos;

          return updatedPhotos;
        });
        if (index === 0) {
          setSelectedPhotoId(processedPhoto.id);
        }
      }

      if (!isMountedRef.current) {
        revokeCampSnapPhotoUrls(nextPhotos);
        return;
      }

      setProcessingState({
        isProcessing: false,
        message: `Processed ${nextPhotos.length} photo${nextPhotos.length === 1 ? "" : "s"}`,
      });
      setArePhotosStale(false);
    } catch (error) {
      revokeCampSnapPhotoUrls(nextPhotos);

      if (!isMountedRef.current) {
        return;
      }

      setProcessedPhotos([]);
      processedPhotosRef.current = [];
      setSelectedPhotoId(null);
      setProcessingState({
        isProcessing: false,
        message: getProcessingErrorMessage(error),
      });
    }
  }

  async function handleExportZip() {
    if (!canExport) {
      return;
    }

    await exportCampSnapPhotos(processedPhotos, filterState.fileName);
  }

  function handleExportFilter() {
    if (!renderFilter) {
      return;
    }

    exportCampSnapFilter(renderFilter, filterState.fileName);
  }

  function handleCurvePointsChange(channel: ChannelKey, points: CurvePoint[]) {
    setCurvePoints((currentPoints) => {
      if (!currentPoints || currentPoints[channel] === points) {
        return currentPoints;
      }

      if (processedPhotosRef.current.length > 0) {
        setArePhotosStale(true);
      }

      return {
        ...currentPoints,
        [channel]: points,
      };
    });
  }

  function handleResetCurveChannel(channel: ChannelKey) {
    if (!filterState.data) {
      return;
    }

    const nextPoints = createBaselineCurvePoints(
      getFilterLut(filterState.data, channel),
    );

    handleCurvePointsChange(channel, nextPoints);
  }

  function handleResetAllCurves() {
    if (!filterState.data) {
      return;
    }

    setCurvePoints(createCurvePointsFromFilter(filterState.data));

    if (processedPhotosRef.current.length > 0) {
      setArePhotosStale(true);
    }
  }

  function clearProcessedPhotos() {
    setProcessedPhotos((currentPhotos) => {
      revokeCampSnapPhotoUrls(currentPhotos);
      processedPhotosRef.current = [];
      return [];
    });
    setSelectedPhotoId(null);
  }

  function handleSelectPhoto(photoId: string) {
    setSelectedPhotoId(photoId);
  }

  return (
    <main
      className="bg-background flex min-h-screen w-full flex-col items-center
        gap-8 p-4"
    >
      <header className="w-full max-w-185">
        <UserInfo user={user} />
      </header>

      <article className="flex w-full max-w-7xl flex-col gap-6">
        <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="flex max-w-3xl flex-col gap-3">
            <div>
              <Badge variant="outline" className="mb-3 w-fit">
                Camp Snap V105
              </Badge>
              <h1 className="m-0 text-4xl!">Filter Workbench</h1>
            </div>
            <p className="text-muted-foreground m-0 max-w-3xl text-base">
              Apply a V105 <code>.flt</code> file to local photos offline,
              compare the result, and export the processed batch as a ZIP.
            </p>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="flex min-w-0 flex-col gap-4">
            <BeforeAfterPreview
              photo={selectedPhoto}
              overrideProcessedUrl={livePreviewUrl}
            />
            <PhotoCarousel
              photos={processedPhotos}
              selectedPhoto={selectedPhoto}
              arePhotosStale={arePhotosStale}
              onSelectPhoto={handleSelectPhoto}
            />
          </section>

          <ControlsSidebar
            activeCurveChannel={activeCurveChannel}
            baselines={baselines}
            canExport={canExport}
            canExportFilter={canExportFilter}
            canProcess={canProcess}
            curvePoints={curvePoints}
            editedLuts={editedLuts}
            filterState={filterState}
            filterSummary={filterSummary}
            isPhotosStale={arePhotosStale}
            onActiveCurveChannelChange={setActiveCurveChannel}
            onCurvePointsChange={handleCurvePointsChange}
            onExportFilter={handleExportFilter}
            onExportZip={handleExportZip}
            onFilterChange={handleFilterChange}
            onPhotoChange={handlePhotoChange}
            onPhotoFiles={handlePhotoFiles}
            onProcessPhotos={handleProcessPhotos}
            onResetAllCurves={handleResetAllCurves}
            onResetCurveChannel={handleResetCurveChannel}
            processingState={processingState}
            selectedPhoto={selectedPhoto}
            sourceFiles={sourceFiles}
          />
        </div>
      </article>
    </main>
  );
}

function isAcceptedPhotoFile(file: File) {
  return (
    PHOTO_MIME_TYPES.has(file.type) || PHOTO_EXTENSION_PATTERN.test(file.name)
  );
}

function getProcessingErrorMessage(error: unknown) {
  if (error instanceof CampSnapBrowserError) {
    return error.message;
  }

  return "Failed to process photos";
}

function createCurvePointsFromFilter(
  filter: ParsedFilter,
): CurvePointsByChannel {
  return {
    R: createBaselineCurvePoints(filter.lutR),
    G: createBaselineCurvePoints(filter.lutG),
    B: createBaselineCurvePoints(filter.lutB),
  };
}

function getFilterLut(filter: ParsedFilter, channel: ChannelKey) {
  if (channel === "R") return filter.lutR;
  if (channel === "G") return filter.lutG;

  return filter.lutB;
}

type CampSnapLivePreviewInput = {
  selectedPhoto: ProcessedCampSnapPhoto | null;
  sourceFile: File | null;
  filter: ParsedFilter | null;
  editedLuts: LutsByChannel | null;
  enabled: boolean;
};

type CampSnapPreLutPreview = {
  pixels: Uint8ClampedArray;
  width: number;
  height: number;
};

function useCampSnapLivePreview({
  selectedPhoto,
  sourceFile,
  filter,
  editedLuts,
  enabled,
}: CampSnapLivePreviewInput) {
  const cacheRef = React.useRef<CampSnapPreLutPreview | null>(null);
  const previewUrlRef = React.useRef<string | null>(null);
  const [cacheVersion, setCacheVersion] = React.useState(0);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  React.useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  React.useEffect(() => {
    let isCurrent = true;

    cacheRef.current = null;
    setCacheVersion((version) => version + 1);
    setPreviewUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return null;
    });

    if (!enabled || !selectedPhoto || !sourceFile || !filter) {
      return () => {
        isCurrent = false;
      };
    }

    void buildCampSnapPreLutBytes(
      sourceFile,
      filter,
      LIVE_PREVIEW_MAX_EDGE,
    ).then(
      (cache) => {
        if (isCurrent) {
          cacheRef.current = cache;
          setCacheVersion((version) => version + 1);
        }
      },
      () => {
        if (isCurrent) {
          cacheRef.current = null;
        }
      },
    );

    return () => {
      isCurrent = false;
    };
  }, [enabled, selectedPhoto?.id, sourceFile, filter]);

  React.useEffect(() => {
    if (!enabled || !editedLuts) {
      setPreviewUrl((currentUrl) => {
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        return null;
      });
      return;
    }

    let isCurrent = true;
    const timeout = window.setTimeout(() => {
      const cache = cacheRef.current;

      if (!cache) {
        return;
      }

      void createEditedPreviewUrl(cache, editedLuts).then(
        (nextUrl) => {
          if (!isCurrent) {
            URL.revokeObjectURL(nextUrl);
            return;
          }

          setPreviewUrl((currentUrl) => {
            if (currentUrl) URL.revokeObjectURL(currentUrl);
            return nextUrl;
          });
        },
        () => undefined,
      );
    }, LIVE_PREVIEW_DEBOUNCE_MS);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeout);
    };
  }, [enabled, editedLuts, cacheVersion]);

  return previewUrl;
}

async function createEditedPreviewUrl(
  cache: CampSnapPreLutPreview,
  editedLuts: LutsByChannel,
) {
  const pixels = new Uint8ClampedArray(cache.pixels);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new CampSnapBrowserError(
      "Canvas rendering is not available in this browser",
    );
  }

  applyPerChannelLUT(pixels, editedLuts.R, editedLuts.G, editedLuts.B);

  canvas.width = cache.width;
  canvas.height = cache.height;
  context.putImageData(new ImageData(pixels, cache.width, cache.height), 0, 0);

  const blob = await canvasToBlob(canvas, "image/webp", 0.9);

  return URL.createObjectURL(blob);
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new CampSnapBrowserError("Failed to encode image"));
          return;
        }

        resolve(blob);
      },
      type,
      quality,
    );
  });
}

type PhotoCarouselProps = {
  photos: ProcessedCampSnapPhoto[];
  selectedPhoto: ProcessedCampSnapPhoto | null;
  arePhotosStale: boolean;
  onSelectPhoto: (photoId: string) => void;
};

function PhotoCarousel({
  photos,
  selectedPhoto,
  arePhotosStale,
  onSelectPhoto,
}: PhotoCarouselProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Images className="size-4" />
              Uploaded Pictures
              {arePhotosStale && (
                <Badge variant="outline">Edited - re-process to refresh</Badge>
              )}
            </CardTitle>
            <CardDescription>{photos.length} processed photos</CardDescription>
          </div>
          <Badge variant="secondary">{selectedPhoto?.name ?? "none"}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {photos.length > 0 ? (
          <ScrollArea scrollbars="horizontal" className="w-full">
            <div className="flex w-max gap-3 pb-3">
              {photos.map((photo) => {
                const isSelected = photo.id === selectedPhoto?.id;

                return (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => onSelectPhoto(photo.id)}
                    className={`group w-36 shrink-0 rounded-lg border p-1
                      text-left transition ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : `border-border bg-background
                            hover:border-primary/60`
                      }`}
                  >
                    <img
                      src={photo.thumbnailUrl}
                      alt={`${photo.name} processed thumbnail`}
                      className="bg-muted aspect-4/3 w-full rounded-md
                        object-cover"
                      decoding="async"
                      loading="lazy"
                    />
                    <span className="mt-2 block truncate px-1 text-sm font-bold">
                      {photo.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div
            className="border-border bg-background text-muted-foreground flex
              min-h-32 items-center justify-center rounded-lg border
              border-dashed text-sm"
          >
            Process photos to populate the carousel.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type BeforeAfterPreviewProps = {
  photo: ProcessedCampSnapPhoto | null;
  overrideProcessedUrl?: string | null;
};

function BeforeAfterPreview({
  photo,
  overrideProcessedUrl,
}: BeforeAfterPreviewProps) {
  const [comparisonPosition, setComparisonPosition] = React.useState(50);

  React.useEffect(() => {
    setComparisonPosition(50);
  }, [photo?.id]);

  function setClampedComparisonPosition(position: number) {
    setComparisonPosition(Math.min(100, Math.max(0, position)));
  }

  function updateComparisonFromPointer(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = ((event.clientX - rect.left) / rect.width) * 100;

    setClampedComparisonPosition(position);
  }

  function handleComparisonPointerDown(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateComparisonFromPointer(event);
  }

  function handleComparisonPointerMove(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    if (event.buttons !== 1) {
      return;
    }

    updateComparisonFromPointer(event);
  }

  function handleComparisonKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 10 : 5;
    const keyPositions: Partial<Record<string, number>> = {
      ArrowLeft: comparisonPosition - step,
      ArrowDown: comparisonPosition - step,
      ArrowRight: comparisonPosition + step,
      ArrowUp: comparisonPosition + step,
      Home: 0,
      End: 100,
    };
    const nextPosition = keyPositions[event.key];

    if (nextPosition === undefined) {
      return;
    }

    event.preventDefault();
    setClampedComparisonPosition(nextPosition);
  }

  if (!photo) {
    return (
      <Card className="rounded-lg">
        <CardContent
          className="text-muted-foreground flex min-h-112 flex-col items-center
            justify-center gap-3 text-center"
        >
          <ImageIcon className="size-10" />
          <p className="m-0 max-w-sm">
            Select a filter and photos, then process the batch to inspect the
            before and after result here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const processedUrl = overrideProcessedUrl ?? photo.processedUrl;

  return (
    <Card className="rounded-lg">
      <CardHeader className="pb-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="size-4" />
              Before / After
            </CardTitle>
            <CardDescription>{photo.name}</CardDescription>
          </div>
          <Badge variant="outline">
            {photo.width}x{photo.height}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div
          role="slider"
          tabIndex={0}
          aria-label="Before and after comparison position"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(comparisonPosition)}
          className="bg-background relative isolate h-[min(70vh,34rem)] min-h-96
            cursor-ew-resize touch-none overflow-hidden rounded-lg border
            select-none"
          onPointerDown={handleComparisonPointerDown}
          onPointerMove={handleComparisonPointerMove}
          onKeyDown={handleComparisonKeyDown}
        >
          <img
            src={processedUrl}
            alt={`${photo.name} processed`}
            draggable={false}
            className="pointer-events-none absolute inset-0 size-full
              object-contain"
            decoding="async"
          />
          <img
            src={photo.originalUrl}
            alt={`${photo.name} original`}
            draggable={false}
            decoding="async"
            className="pointer-events-none absolute inset-0 size-full
              object-contain"
            style={{
              clipPath: `inset(0 ${100 - comparisonPosition}% 0 0)`,
            }}
          />
          <div
            className="bg-primary pointer-events-none absolute top-0 bottom-0
              z-10 w-0.5 -translate-x-1/2"
            style={{ left: `${comparisonPosition}%` }}
          >
            <div
              className="border-background bg-primary text-primary-foreground
                absolute top-1/2 left-1/2 flex size-10 -translate-x-1/2
                -translate-y-1/2 items-center justify-center rounded-full
                border-2 shadow-md"
              aria-hidden="true"
            >
              <ChevronsLeftRight className="size-5" />
            </div>
          </div>
          <div
            className="pointer-events-none absolute right-3 bottom-3 left-3 flex
              justify-between text-xs font-bold"
          >
            <Badge variant="secondary">Original</Badge>
            <Badge variant="secondary">Processed</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type ControlsSidebarProps = {
  activeCurveChannel: ChannelKey;
  baselines: LutsByChannel | null;
  canExport: boolean;
  canExportFilter: boolean;
  canProcess: boolean;
  curvePoints: CurvePointsByChannel | null;
  editedLuts: LutsByChannel | null;
  filterState: FilterState;
  filterSummary: readonly (readonly [string, number])[];
  isPhotosStale: boolean;
  onActiveCurveChannelChange: (channel: ChannelKey) => void;
  onCurvePointsChange: (channel: ChannelKey, points: CurvePoint[]) => void;
  onExportFilter: () => void;
  onExportZip: () => void;
  onFilterChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPhotoChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPhotoFiles: (files: File[]) => void;
  onProcessPhotos: () => void;
  onResetAllCurves: () => void;
  onResetCurveChannel: (channel: ChannelKey) => void;
  processingState: ProcessingState;
  selectedPhoto: ProcessedCampSnapPhoto | null;
  sourceFiles: File[];
};

function ControlsSidebar({
  activeCurveChannel,
  baselines,
  canExport,
  canExportFilter,
  canProcess,
  curvePoints,
  editedLuts,
  filterState,
  filterSummary,
  isPhotosStale,
  onActiveCurveChannelChange,
  onCurvePointsChange,
  onExportFilter,
  onExportZip,
  onFilterChange,
  onPhotoChange,
  onPhotoFiles,
  onProcessPhotos,
  onResetAllCurves,
  onResetCurveChannel,
  processingState,
  selectedPhoto,
  sourceFiles,
}: ControlsSidebarProps) {
  return (
    <aside className="lg:sticky lg:top-4 lg:self-start">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4" />
            Controls
          </CardTitle>
          <CardDescription>
            {processingState.message || "Ready for a filter and photo batch"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="camp-snap-filter">Filter file</Label>
              <Input
                id="camp-snap-filter"
                type="file"
                accept=".flt,text/plain"
                onChange={onFilterChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="camp-snap-photos">Photos</Label>
              <PhotoDropzone
                inputId="camp-snap-photos"
                files={sourceFiles}
                onChange={onPhotoChange}
                onDropFiles={onPhotoFiles}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              onClick={onProcessPhotos}
              disabled={!canProcess}
              className="w-full"
            >
              <Upload className="size-4" />
              {isPhotosStale ? "Re-process" : "Process"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onExportZip}
              disabled={!canExport}
              className="w-full"
            >
              <Download className="size-4" />
              Export Photos
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onExportFilter}
              disabled={!canExportFilter}
              className="col-span-2 w-full"
            >
              <FileDown className="size-4" />
              Export filter
            </Button>
          </div>

          {filterState.data && curvePoints && baselines && editedLuts && (
            <div className="grid gap-3">
              <Separator />
              <div className="grid gap-2">
                <h2 className="m-0 flex items-center gap-2 text-base!">
                  <Spline className="size-4" />
                  RGB Curves
                </h2>
                <CampSnapCurveEditor
                  activeChannel={activeCurveChannel}
                  baselines={baselines}
                  curvePoints={curvePoints}
                  editedLuts={editedLuts}
                  onActiveChannelChange={onActiveCurveChannelChange}
                  onCurvePointsChange={onCurvePointsChange}
                  onResetAll={onResetAllCurves}
                  onResetChannel={onResetCurveChannel}
                />
              </div>
            </div>
          )}

          <Separator />

          <InfoRows
            rows={[
              ["Filter", filterState.fileName ?? "none selected"],
              ["Queued", `${sourceFiles.length}`],
              ["Processed", selectedPhoto ? selectedPhoto.outputName : "none"],
            ]}
          />

          {filterState.error && (
            <p className="text-destructive m-0 text-sm font-bold">
              {filterState.error}
            </p>
          )}

          {selectedPhoto && (
            <>
              <Separator />
              <InfoRows
                rows={[
                  ["Selected", selectedPhoto.name],
                  ["Output", selectedPhoto.outputName],
                  ["Size", `${selectedPhoto.width}x${selectedPhoto.height}`],
                ]}
              />
            </>
          )}

          {filterSummary.length > 0 && (
            <>
              <Separator />
              <div className="grid gap-2">
                <h2 className="m-0 text-base!">Filter Metadata</h2>
                <div className="grid grid-cols-2 gap-2">
                  {filterSummary.map(([label, value]) => (
                    <div
                      key={label}
                      className="bg-background rounded-lg border px-3 py-2"
                    >
                      <span
                        className="text-muted-foreground block truncate text-xs
                          uppercase"
                      >
                        {label}
                      </span>
                      <strong className="block truncate text-sm">
                        {value}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}

type PhotoDropzoneProps = {
  inputId: string;
  files: File[];
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDropFiles: (files: File[]) => void;
};

function PhotoDropzone({
  inputId,
  files,
  onChange,
  onDropFiles,
}: PhotoDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const selectedLabel =
    files.length === 0
      ? "JPEG, PNG, or WebP"
      : `${files.length} photo${files.length === 1 ? "" : "s"} selected`;
  const previewFiles = files.slice(0, 3);

  function openFilePicker() {
    inputRef.current?.click();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    openFilePicker();
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    onDropFiles(Array.from(event.dataTransfer.files));
  }

  return (
    <div
      role="button"
      aria-label="Choose photos to process"
      tabIndex={0}
      onClick={openFilePicker}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-border bg-background hover:border-primary/60
        hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-ring/50
        flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3
        rounded-lg border border-dashed p-4 text-center transition-colors
        outline-none focus-visible:ring-3 ${
          isDragging ? "border-primary bg-primary/10" : ""
        }`}
    >
      <Input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={PHOTO_ACCEPT}
        multiple
        onChange={onChange}
        className="sr-only"
        tabIndex={-1}
      />
      <span
        className="bg-secondary text-secondary-foreground flex size-10
          items-center justify-center rounded-lg"
      >
        <ImageIcon className="size-5" />
      </span>
      <span className="grid gap-1">
        <strong className="text-sm">Drop photos here or click to upload</strong>
        <span className="text-muted-foreground text-xs">{selectedLabel}</span>
      </span>
      {previewFiles.length > 0 && (
        <span
          className="text-muted-foreground flex max-w-full flex-col gap-1
            text-xs"
        >
          {previewFiles.map((file, index) => (
            <span key={`${file.name}-${index}`} className="max-w-64 truncate">
              {file.name}
            </span>
          ))}
          {files.length > previewFiles.length && (
            <span>+{files.length - previewFiles.length} more</span>
          )}
        </span>
      )}
    </div>
  );
}

type InfoRowsProps = {
  rows: Array<[string, string]>;
};

function InfoRows({ rows }: InfoRowsProps) {
  return (
    <dl className="m-0 grid gap-2 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-1">
          <dt className="text-muted-foreground text-xs uppercase">{label}</dt>
          <dd className="m-0 truncate font-bold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
