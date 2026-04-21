import {
  applyCampSnapV105,
  createCampSnapOutputName,
  createCampSnapZipName,
  type ParsedFilter,
  type RGBAImage,
} from "~/lib/campsnap/CampSnap";
import { createZipArchive } from "~/lib/zip";

export type ProcessedCampSnapPhoto = {
  id: string;
  name: string;
  outputName: string;
  originalUrl: string;
  processedUrl: string;
  thumbnailUrl: string;
  blob: Blob;
  width: number;
  height: number;
};

export async function renderCampSnapPhoto(
  file: File,
  filter: ParsedFilter,
  filterFileName: string,
) {
  const image = await decodePhoto(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    image.close?.();
    throw new Error("Canvas rendering is not available in this browser");
  }

  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image.source, 0, 0);
  image.close?.();

  const originalPreviewBlob = await createPreviewBlob(canvas);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const processed = applyCampSnapV105(toRgbaImage(imageData), filter);
  const processedImageData = new ImageData(
    toImageDataArray(processed.data),
    processed.width,
    processed.height,
  );
  context.putImageData(processedImageData, 0, 0);

  const [blob, processedPreviewBlob, thumbnailBlob] = await Promise.all([
    canvasToBlob(canvas, "image/png"),
    createPreviewBlob(canvas),
    createThumbnailBlob(canvas),
  ]);
  const originalUrl = URL.createObjectURL(originalPreviewBlob);
  const processedPreviewUrl = URL.createObjectURL(processedPreviewBlob);
  const thumbnailUrl = URL.createObjectURL(thumbnailBlob);

  return {
    id: `${file.name}-${file.lastModified}`,
    name: file.name,
    outputName: createCampSnapOutputName(file.name, filterFileName),
    originalUrl,
    processedUrl: processedPreviewUrl,
    thumbnailUrl,
    blob,
    width: canvas.width,
    height: canvas.height,
  } satisfies ProcessedCampSnapPhoto;
}

export function revokeCampSnapPhotoUrls(photos: ProcessedCampSnapPhoto[]) {
  for (const photo of photos) {
    URL.revokeObjectURL(photo.originalUrl);
    URL.revokeObjectURL(photo.processedUrl);
    URL.revokeObjectURL(photo.thumbnailUrl);
  }
}

export async function exportCampSnapPhotos(
  photos: ProcessedCampSnapPhoto[],
  filterFileName: string | undefined,
) {
  const files = await Promise.all(
    photos.map(async (photo) => {
      const bytes = new Uint8Array(await photo.blob.arrayBuffer());
      return { name: photo.outputName, data: bytes };
    }),
  );
  const zipBlob = createZipArchive(files);

  downloadBlob(zipBlob, createCampSnapZipName(filterFileName));
}

function toRgbaImage(imageData: ImageData): RGBAImage {
  return {
    data: toImageDataArray(imageData.data),
    width: imageData.width,
    height: imageData.height,
  };
}

function toImageDataArray(data: Uint8ClampedArray) {
  const copy = new Uint8ClampedArray(data.length);

  copy.set(data);

  return copy;
}

type DecodedPhoto = {
  source: CanvasImageSource;
  width: number;
  height: number;
  close?: () => void;
};

async function decodePhoto(file: File): Promise<DecodedPhoto> {
  if ("createImageBitmap" in window) {
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });

      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        close: () => bitmap.close(),
      };
    } catch {
      // Some browsers reject specific image formats here that <img> can decode.
    }
  }

  const url = URL.createObjectURL(file);

  try {
    const image = await loadImage(url);

    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to decode image"));
    image.src = url;
  });
}

function createThumbnailBlob(canvas: HTMLCanvasElement) {
  return createScaledBlob(canvas, 320, "image/webp", 0.82);
}

function createPreviewBlob(canvas: HTMLCanvasElement) {
  return createScaledBlob(canvas, 1800, "image/webp", 0.9);
}

function createScaledBlob(
  canvas: HTMLCanvasElement,
  maxEdge: number,
  type: string,
  quality: number,
) {
  const scale = Math.min(1, maxEdge / Math.max(canvas.width, canvas.height));
  const scaled = document.createElement("canvas");
  const width = Math.max(1, Math.round(canvas.width * scale));
  const height = Math.max(1, Math.round(canvas.height * scale));
  const context = scaled.getContext("2d");

  if (!context) {
    throw new Error("Canvas rendering is not available in this browser");
  }

  scaled.width = width;
  scaled.height = height;
  context.drawImage(canvas, 0, 0, width, height);

  return canvasToBlob(scaled, type, quality);
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
          reject(new Error("Failed to encode image"));
          return;
        }

        resolve(blob);
      },
      type,
      quality,
    );
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
