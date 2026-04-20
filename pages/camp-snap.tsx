import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  applyCampSnapV105,
  parseFlt,
  type ParsedFilter,
  type RGBAImage,
} from "~/lib/campSnap";
import { createZipArchive, sanitizeFileName } from "~/lib/campSnap/Zip";

type ProcessedPhoto = {
  id: string;
  name: string;
  outputName: string;
  originalUrl: string;
  processedUrl: string;
  blob: Blob;
  width: number;
  height: number;
};

type FilterState =
  | { data: ParsedFilter; error?: never; fileName: string }
  | { error: string; data?: never; fileName: string }
  | { fileName?: undefined; data?: undefined; error?: undefined };

type ProcessingState = {
  isProcessing: boolean;
  message: string;
};

export const Route = createFileRoute("/camp-snap")({
  component: CampSnapPage,
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
  const [filterState, setFilterState] = useState<FilterState>({});
  const [sourceFiles, setSourceFiles] = useState<File[]>([]);
  const [processedPhotos, setProcessedPhotos] = useState<ProcessedPhoto[]>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    message: "",
  });

  const selectedPhoto =
    processedPhotos.find((photo) => photo.id === selectedPhotoId) ??
    processedPhotos[0] ??
    null;

  const canProcess =
    !processingState.isProcessing &&
    filterState.data !== undefined &&
    sourceFiles.length > 0;
  const canExport =
    !processingState.isProcessing &&
    processedPhotos.length > 0 &&
    !filterState.error;

  const filterSummary = useMemo(() => {
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

  useEffect(() => {
    return () => {
      for (const photo of processedPhotos) {
        URL.revokeObjectURL(photo.originalUrl);
        URL.revokeObjectURL(photo.processedUrl);
      }
    };
  }, [processedPhotos]);

  async function handleFilterChange(event: ChangeEvent<HTMLInputElement>) {
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

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    clearProcessedPhotos();
    setSourceFiles(Array.from(event.target.files ?? []));
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

    const nextPhotos: ProcessedPhoto[] = [];

    for (const [index, file] of sourceFiles.entries()) {
      setProcessingState({
        isProcessing: true,
        message: `Processing ${index + 1}/${sourceFiles.length} photos`,
      });

      const processedPhoto = await renderPhoto(
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
  }

  async function handleExportZip() {
    if (!canExport) {
      return;
    }

    const files = await Promise.all(
      processedPhotos.map(async (photo) => {
        const bytes = new Uint8Array(await photo.blob.arrayBuffer());
        return { name: photo.outputName, data: bytes };
      }),
    );
    const zipBlob = createZipArchive(files);
    const filterName = filterState.fileName?.replace(/\.flt$/i, "") || "filter";
    const zipName = sanitizeFileName(`camp-snap-${filterName}.zip`);
    downloadBlob(zipBlob, zipName);
  }

  function clearProcessedPhotos() {
    setProcessedPhotos((currentPhotos) => {
      for (const photo of currentPhotos) {
        URL.revokeObjectURL(photo.originalUrl);
        URL.revokeObjectURL(photo.processedUrl);
      }
      return [];
    });
    setSelectedPhotoId(null);
  }

  return (
    <section className="flex w-full flex-col gap-6 py-8">
      <header className="flex flex-col gap-3">
        <h1 className="m-0 text-4xl!">Camp Snap V105 Filter Tool</h1>
        <p className="m-0 max-w-3xl">
          Apply a V105 <code>.flt</code> file to local photos offline. The tool
          uses the baked matrix and RGB LUTs from the filter file and exports
          the processed batch as a ZIP.
        </p>
      </header>

      <section
        className="bg-card text-card-foreground flex flex-col gap-4 rounded-lg
          border p-4 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="font-bold">Filter file</span>
            <input
              type="file"
              accept=".flt,text/plain"
              onChange={handleFilterChange}
              className="bg-background rounded-md border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-bold">Photos</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handlePhotoChange}
              className="bg-background rounded-md border px-3 py-2"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleProcessPhotos}
            disabled={!canProcess}
            className="bg-primary text-primary-foreground disabled:bg-muted
              disabled:text-muted-foreground rounded-md px-4 py-2 font-bold"
          >
            Process photos
          </button>
          <button
            type="button"
            onClick={handleExportZip}
            disabled={!canExport}
            className="bg-secondary text-secondary-foreground disabled:bg-muted
              disabled:text-muted-foreground rounded-md px-4 py-2 font-bold"
          >
            Export ZIP
          </button>
          <span className="text-sm">{processingState.message}</span>
        </div>

        <div className="text-sm">
          <p className="m-0">
            Filter: <strong>{filterState.fileName ?? "none selected"}</strong>
          </p>
          <p className="m-0">
            Photos: <strong>{sourceFiles.length}</strong>
          </p>
          {filterState.error && (
            <p className="text-primary my-2! font-bold">{filterState.error}</p>
          )}
        </div>
      </section>

      {filterSummary.length > 0 && (
        <section
          className="bg-card text-card-foreground rounded-lg border p-4
            shadow-sm"
        >
          <h2 className="mt-0 text-2xl!">Filter metadata</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {filterSummary.map(([label, value]) => (
              <div key={label} className="bg-background rounded-md border p-3">
                <strong className="block text-sm uppercase">{label}</strong>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {processedPhotos.length > 0 && selectedPhoto && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {processedPhotos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setSelectedPhotoId(photo.id)}
                className={`rounded-md border px-3 py-2 text-left ${
                  photo.id === selectedPhoto.id
                    ? "bg-accent text-accent-foreground"
                    : "bg-card text-card-foreground"
                }`}
              >
                {photo.name}
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <PreviewCard
              title="Original"
              src={selectedPhoto.originalUrl}
              alt={`${selectedPhoto.name} original`}
              meta={`${selectedPhoto.width}×${selectedPhoto.height}`}
            />
            <PreviewCard
              title="Processed"
              src={selectedPhoto.processedUrl}
              alt={`${selectedPhoto.name} processed`}
              meta={selectedPhoto.outputName}
            />
          </div>
        </section>
      )}
    </section>
  );
}

type PreviewCardProps = {
  title: string;
  src: string;
  alt: string;
  meta: string;
};

function PreviewCard({ title, src, alt, meta }: PreviewCardProps) {
  return (
    <article
      className="bg-card text-card-foreground flex flex-col gap-3 rounded-lg
        border p-4 shadow-sm"
    >
      <div>
        <h2 className="m-0 text-2xl!">{title}</h2>
        <p className="text-muted m-0 text-sm">{meta}</p>
      </div>
      <img
        src={src}
        alt={alt}
        className="bg-background aspect-auto max-h-[28rem] w-full rounded-md
          border object-contain"
      />
    </article>
  );
}

async function renderPhoto(
  file: File,
  filter: ParsedFilter,
  filterFileName: string,
) {
  const originalUrl = URL.createObjectURL(file);
  const image = await loadImage(originalUrl);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    URL.revokeObjectURL(originalUrl);
    throw new Error("Canvas rendering is not available in this browser");
  }

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  context.drawImage(image, 0, 0);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const processed = applyCampSnapV105(toRgbaImage(imageData), filter);
  const processedImageData = new ImageData(
    processed.data,
    processed.width,
    processed.height,
  );
  context.putImageData(processedImageData, 0, 0);

  const blob = await canvasToBlob(canvas);
  const processedUrl = URL.createObjectURL(blob);
  const filterName = filterFileName.replace(/\.flt$/i, "");
  const sourceName = file.name.replace(/\.[^.]+$/, "");

  return {
    id: `${file.name}-${file.lastModified}`,
    name: file.name,
    outputName: sanitizeFileName(`${sourceName}--${filterName}.png`),
    originalUrl,
    processedUrl,
    blob,
    width: canvas.width,
    height: canvas.height,
  } satisfies ProcessedPhoto;
}

function toRgbaImage(imageData: ImageData): RGBAImage {
  return {
    data: new Uint8ClampedArray(imageData.data),
    width: imageData.width,
    height: imageData.height,
  };
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to decode image"));
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to encode image"));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  setTimeout(() => URL.revokeObjectURL(url), 0);
}
