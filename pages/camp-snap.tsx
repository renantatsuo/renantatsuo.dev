import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronsLeftRight,
  Download,
  Image as ImageIcon,
  Images,
  SlidersHorizontal,
  Sparkles,
  Upload,
} from "lucide-react";
import * as React from "react";
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
  exportCampSnapPhotos,
  parseFlt,
  renderCampSnapPhoto,
  revokeCampSnapPhotoUrls,
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

const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";
const PHOTO_EXTENSION_PATTERN = /\.(jpe?g|png|webp)$/i;
const PHOTO_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

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
  const [filterState, setFilterState] = React.useState<FilterState>({});
  const [sourceFiles, setSourceFiles] = React.useState<File[]>([]);
  const [processedPhotos, setProcessedPhotos] = React.useState<
    ProcessedCampSnapPhoto[]
  >([]);
  const [selectedPhotoId, setSelectedPhotoId] = React.useState<string | null>(
    null,
  );
  const [comparisonPosition, setComparisonPosition] = React.useState(50);
  const [processingState, setProcessingState] = React.useState<ProcessingState>(
    {
      isProcessing: false,
      message: "",
    },
  );

  const selectedPhoto = React.useMemo(
    () =>
      processedPhotos.find((photo) => photo.id === selectedPhotoId) ??
      processedPhotos[0] ??
      null,
    [processedPhotos, selectedPhotoId],
  );

  const canProcess =
    !processingState.isProcessing &&
    filterState.data !== undefined &&
    sourceFiles.length > 0;
  const canExport =
    !processingState.isProcessing &&
    processedPhotos.length > 0 &&
    !filterState.error;

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
    return () => {
      revokeCampSnapPhotoUrls(processedPhotos);
    };
  }, [processedPhotos]);

  React.useEffect(() => {
    setComparisonPosition(50);
  }, [selectedPhoto?.id]);

  async function handleFilterChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    clearProcessedPhotos();

    if (!file) {
      setFilterState({});
      return;
    }

    const text = await file.text();
    const parsed = parseFlt(text);

    if (parsed.error) {
      setFilterState({ error: parsed.error.message, fileName: file.name });
      return;
    }

    setFilterState({
      data: parsed.data,
      fileName: file.name,
    });
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    handlePhotoFiles(Array.from(event.target.files ?? []));
    event.currentTarget.value = "";
  }

  function handlePhotoFiles(files: File[]) {
    clearProcessedPhotos();
    setSourceFiles(files.filter(isAcceptedPhotoFile));
  }

  async function handleProcessPhotos() {
    if (!filterState.data || sourceFiles.length === 0) {
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
        setProcessingState({
          isProcessing: true,
          message: `Processing ${index + 1}/${sourceFiles.length} photos`,
        });

        const processedPhoto = await renderCampSnapPhoto(
          file,
          filterState.data,
          filterState.fileName,
        );
        nextPhotos.push(processedPhoto);
      }

      setProcessedPhotos(nextPhotos);
      setSelectedPhotoId(nextPhotos[0]?.id ?? null);
      setProcessingState({
        isProcessing: false,
        message: `Processed ${nextPhotos.length} photo${nextPhotos.length === 1 ? "" : "s"}`,
      });
    } catch (error) {
      revokeCampSnapPhotoUrls(nextPhotos);
      setProcessingState({
        isProcessing: false,
        message:
          error instanceof Error ? error.message : "Failed to process photos",
      });
    }
  }

  async function handleExportZip() {
    if (!canExport) {
      return;
    }

    await exportCampSnapPhotos(processedPhotos, filterState.fileName);
  }

  function clearProcessedPhotos() {
    setProcessedPhotos((currentPhotos) => {
      revokeCampSnapPhotoUrls(currentPhotos);
      return [];
    });
    setSelectedPhotoId(null);
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

          <div className="grid grid-cols-3 gap-2 text-sm lg:min-w-80">
            <Metric label="queued" value={sourceFiles.length} />
            <Metric label="processed" value={processedPhotos.length} />
            <Metric
              label="filter"
              value={filterState.data ? "ready" : "none"}
            />
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="grid min-w-0 gap-4">
            <PhotoCarousel
              photos={processedPhotos}
              selectedPhoto={selectedPhoto}
              onSelectPhoto={setSelectedPhotoId}
            />

            <BeforeAfterPreview
              comparisonPosition={comparisonPosition}
              photo={selectedPhoto}
              onComparisonPositionChange={setComparisonPosition}
            />
          </section>

          <ControlsSidebar
            canExport={canExport}
            canProcess={canProcess}
            filterState={filterState}
            filterSummary={filterSummary}
            onExportZip={handleExportZip}
            onFilterChange={handleFilterChange}
            onPhotoChange={handlePhotoChange}
            onPhotoFiles={handlePhotoFiles}
            onProcessPhotos={handleProcessPhotos}
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

type MetricProps = {
  label: string;
  value: React.ReactNode;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div className="bg-card text-card-foreground rounded-lg border px-3 py-2">
      <span className="text-muted-foreground block text-xs uppercase">
        {label}
      </span>
      <strong className="block truncate text-lg leading-tight">{value}</strong>
    </div>
  );
}

type PhotoCarouselProps = {
  photos: ProcessedCampSnapPhoto[];
  selectedPhoto: ProcessedCampSnapPhoto | null;
  onSelectPhoto: (photoId: string) => void;
};

function PhotoCarousel({
  photos,
  selectedPhoto,
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
            </CardTitle>
            <CardDescription>{photos.length} processed photos</CardDescription>
          </div>
          <Badge variant="secondary">{selectedPhoto?.name ?? "none"}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {photos.length > 0 ? (
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-3">
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
                      src={photo.processedUrl}
                      alt={`${photo.name} processed thumbnail`}
                      className="bg-muted aspect-4/3 w-full rounded-md
                        object-cover"
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
  comparisonPosition: number;
  photo: ProcessedCampSnapPhoto | null;
  onComparisonPositionChange: (value: number) => void;
};

function BeforeAfterPreview({
  comparisonPosition,
  photo,
  onComparisonPositionChange,
}: BeforeAfterPreviewProps) {
  function updateComparisonFromPointer(
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = ((event.clientX - rect.left) / rect.width) * 100;

    onComparisonPositionChange(Math.min(100, Math.max(0, position)));
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
          className="bg-background relative isolate h-[min(70vh,34rem)] min-h-96
            cursor-ew-resize touch-none overflow-hidden rounded-lg border
            select-none"
          onPointerDown={handleComparisonPointerDown}
          onPointerMove={handleComparisonPointerMove}
        >
          <img
            src={photo.processedUrl}
            alt={`${photo.name} processed`}
            draggable={false}
            className="pointer-events-none absolute inset-0 size-full
              object-contain"
          />
          <img
            src={photo.originalUrl}
            alt={`${photo.name} original`}
            draggable={false}
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
  canExport: boolean;
  canProcess: boolean;
  filterState: FilterState;
  filterSummary: readonly (readonly [string, number])[];
  onExportZip: () => void;
  onFilterChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPhotoChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPhotoFiles: (files: File[]) => void;
  onProcessPhotos: () => void;
  processingState: ProcessingState;
  selectedPhoto: ProcessedCampSnapPhoto | null;
  sourceFiles: File[];
};

function ControlsSidebar({
  canExport,
  canProcess,
  filterState,
  filterSummary,
  onExportZip,
  onFilterChange,
  onPhotoChange,
  onPhotoFiles,
  onProcessPhotos,
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
              Process
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onExportZip}
              disabled={!canExport}
              className="w-full"
            >
              <Download className="size-4" />
              Export
            </Button>
          </div>

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
  const previewNames = files.slice(0, 3).map((file) => file.name);

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
      {previewNames.length > 0 && (
        <span
          className="text-muted-foreground flex max-w-full flex-col gap-1
            text-xs"
        >
          {previewNames.map((name) => (
            <span key={name} className="max-w-64 truncate">
              {name}
            </span>
          ))}
          {files.length > previewNames.length && (
            <span>+{files.length - previewNames.length} more</span>
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
