import {
  applyCampSnapV105,
  applyGammaTableRGBA,
  applyInverseGammaTableRGBA,
  applyMatrixRGBAFloat,
  applyPerChannelLUT,
} from "./CampSnap";
import type {
  CampSnapWorkerImage,
  CampSnapWorkerRequest,
  CampSnapWorkerResponse,
} from "./workerTypes";

type CampSnapWorkerScope = {
  onmessage: ((event: MessageEvent<CampSnapWorkerRequest>) => void) | null;
  postMessage: (
    message: CampSnapWorkerResponse,
    transfer?: Transferable[],
  ) => void;
};

const worker = self as unknown as CampSnapWorkerScope;

worker.onmessage = (event: MessageEvent<CampSnapWorkerRequest>) => {
  const request = event.data;

  try {
    const image = handleRequest(request);

    worker.postMessage(
      {
        id: request.id,
        type: "success",
        image,
      } satisfies CampSnapWorkerResponse,
      [image.data],
    );
  } catch (error) {
    worker.postMessage({
      id: request.id,
      type: "error",
      message:
        error instanceof Error ? error.message : "Failed to process image",
    } satisfies CampSnapWorkerResponse);
  }
};

function handleRequest(request: CampSnapWorkerRequest): CampSnapWorkerImage {
  const pixels = new Uint8ClampedArray(request.image.data);

  if (request.type === "process-photo") {
    const processed = applyCampSnapV105(
      {
        data: pixels,
        width: request.image.width,
        height: request.image.height,
      },
      request.filter,
    );

    return {
      data: processed.data.buffer as ArrayBuffer,
      width: processed.width,
      height: processed.height,
    };
  }

  if (request.type === "build-pre-lut-preview") {
    applyInverseGammaTableRGBA(pixels);
    applyMatrixRGBAFloat(pixels, request.filter.matrix);
    applyGammaTableRGBA(pixels);
  } else {
    applyPerChannelLUT(pixels, request.lutR, request.lutG, request.lutB);
  }

  return {
    data: pixels.buffer as ArrayBuffer,
    width: request.image.width,
    height: request.image.height,
  };
}
