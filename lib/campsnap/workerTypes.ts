import type { ParsedFilter } from "./CampSnap";

export type CampSnapWorkerImage = {
  data: ArrayBuffer;
  width: number;
  height: number;
};

export type CampSnapWorkerRequest =
  | {
      id: number;
      type: "process-photo";
      image: CampSnapWorkerImage;
      filter: ParsedFilter;
    }
  | {
      id: number;
      type: "build-pre-lut-preview";
      image: CampSnapWorkerImage;
      filter: ParsedFilter;
    }
  | {
      id: number;
      type: "apply-preview-lut";
      image: CampSnapWorkerImage;
      lutR: number[];
      lutG: number[];
      lutB: number[];
    };

export type CampSnapWorkerResponse =
  | {
      id: number;
      type: "success";
      image: CampSnapWorkerImage;
    }
  | {
      id: number;
      type: "error";
      message: string;
    };
