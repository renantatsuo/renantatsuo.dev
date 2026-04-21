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
  blob: Blob;
  width: number;
  height: number;
};

export async function renderCampSnapPhoto(
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
    toImageDataArray(processed.data),
    processed.width,
    processed.height,
  );
  context.putImageData(processedImageData, 0, 0);

  const blob = await canvasToBlob(canvas);
  const processedUrl = URL.createObjectURL(blob);

  return {
    id: `${file.name}-${file.lastModified}`,
    name: file.name,
    outputName: createCampSnapOutputName(file.name, filterFileName),
    originalUrl,
    processedUrl,
    blob,
    width: canvas.width,
    height: canvas.height,
  } satisfies ProcessedCampSnapPhoto;
}

export function revokeCampSnapPhotoUrls(photos: ProcessedCampSnapPhoto[]) {
  for (const photo of photos) {
    URL.revokeObjectURL(photo.originalUrl);
    URL.revokeObjectURL(photo.processedUrl);
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
