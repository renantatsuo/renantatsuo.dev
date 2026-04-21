import {
  applyCampSnapV105,
  applyGammaTableRGBA,
  applyInverseGammaTableRGBA,
  applyMatrixRGBAFloat,
  applyPerChannelLUT,
  type ParsedFilter,
  type RGBAImage,
} from "./CampSnap";
import type {
  CampSnapWorkerImage,
  CampSnapWorkerRequest,
  CampSnapWorkerResponse,
} from "./workerTypes";

type PendingRequest = {
  reject: (error: Error) => void;
  resolve: (image: RGBAImage) => void;
};

class CampSnapWorkerTerminatedError extends Error {
  constructor() {
    super("Camp Snap worker was terminated");
    this.name = "CampSnapWorkerTerminatedError";
  }
}

type WorkerClientRequest =
  | {
      type: "process-photo";
      image: RGBAImage;
      filter: ParsedFilter;
    }
  | {
      type: "build-pre-lut-preview";
      image: RGBAImage;
      filter: ParsedFilter;
    }
  | {
      type: "apply-preview-lut";
      image: RGBAImage;
      lutR: number[];
      lutG: number[];
      lutB: number[];
    };

const pendingRequests = new Map<number, PendingRequest>();

let requestId = 0;
let worker: Worker | null = null;
let isWorkerDisabled = false;

export async function processCampSnapImage(
  image: RGBAImage,
  filter: ParsedFilter,
) {
  const workerResult = await runWorkerRequest({
    type: "process-photo",
    image,
    filter,
  });

  return workerResult ?? applyCampSnapV105(image, filter);
}

export async function buildCampSnapPreLutImage(
  image: RGBAImage,
  filter: ParsedFilter,
) {
  const workerResult = await runWorkerRequest({
    type: "build-pre-lut-preview",
    image,
    filter,
  });

  if (workerResult) {
    return workerResult;
  }

  const pixels = new Uint8ClampedArray(image.data);

  applyInverseGammaTableRGBA(pixels);
  applyMatrixRGBAFloat(pixels, filter.matrix);
  applyGammaTableRGBA(pixels);

  return {
    data: pixels,
    width: image.width,
    height: image.height,
  };
}

export async function applyCampSnapLutImage(
  image: RGBAImage,
  lutR: number[],
  lutG: number[],
  lutB: number[],
) {
  const workerResult = await runWorkerRequest({
    type: "apply-preview-lut",
    image,
    lutR,
    lutG,
    lutB,
  });

  if (workerResult) {
    return workerResult;
  }

  const pixels = new Uint8ClampedArray(image.data);

  applyPerChannelLUT(pixels, lutR, lutG, lutB);

  return {
    data: pixels,
    width: image.width,
    height: image.height,
  };
}

export function terminateCampSnapWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
  }

  rejectPendingRequests(new CampSnapWorkerTerminatedError());
}

async function runWorkerRequest(request: WorkerClientRequest) {
  const activeWorker = getWorker();

  if (!activeWorker) {
    return null;
  }

  try {
    return await postWorkerRequest(activeWorker, request);
  } catch (error) {
    if (error instanceof CampSnapWorkerTerminatedError) {
      throw error;
    }

    disableWorker();
    return null;
  }
}

function postWorkerRequest(activeWorker: Worker, request: WorkerClientRequest) {
  return new Promise<RGBAImage>((resolve, reject) => {
    const id = requestId;
    const image = cloneImageForTransfer(request.image);
    const workerRequest = {
      ...request,
      id,
      image,
    } as CampSnapWorkerRequest;

    requestId += 1;
    pendingRequests.set(id, { resolve, reject });

    try {
      activeWorker.postMessage(workerRequest, [image.data]);
    } catch (error) {
      pendingRequests.delete(id);
      reject(
        error instanceof Error ? error : new Error("Worker request failed"),
      );
    }
  });
}

function getWorker() {
  if (isWorkerDisabled || typeof Worker === "undefined") {
    return null;
  }

  if (worker) {
    return worker;
  }

  try {
    worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = handleWorkerMessage;
    worker.onerror = () => {
      disableWorker();
    };
    worker.onmessageerror = () => {
      disableWorker();
    };
  } catch {
    isWorkerDisabled = true;
    worker = null;
  }

  return worker;
}

function handleWorkerMessage(event: MessageEvent<CampSnapWorkerResponse>) {
  const response = event.data;
  const pendingRequest = pendingRequests.get(response.id);

  if (!pendingRequest) {
    return;
  }

  pendingRequests.delete(response.id);

  if (response.type === "error") {
    pendingRequest.reject(new Error(response.message));
    return;
  }

  pendingRequest.resolve({
    data: new Uint8ClampedArray(response.image.data),
    width: response.image.width,
    height: response.image.height,
  });
}

function cloneImageForTransfer(image: RGBAImage): CampSnapWorkerImage {
  const data = new Uint8ClampedArray(image.data);

  return {
    data: data.buffer as ArrayBuffer,
    width: image.width,
    height: image.height,
  };
}

function disableWorker() {
  isWorkerDisabled = true;

  if (worker) {
    worker.terminate();
    worker = null;
  }

  rejectPendingRequests(new Error("Camp Snap worker failed"));
}

function rejectPendingRequests(error: Error) {
  for (const pendingRequest of pendingRequests.values()) {
    pendingRequest.reject(error);
  }

  pendingRequests.clear();
}
