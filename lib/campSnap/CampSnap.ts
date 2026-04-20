type Result<T> = { data: T; error?: never } | { error: Error; data?: never };

type Matrix3x3 = [
  [number, number, number],
  [number, number, number],
  [number, number, number],
];

export type ParsedFilter = {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  gammaR: number;
  gammaG: number;
  gammaB: number;
  matrix1024: Matrix3x3;
  matrix: Matrix3x3;
  lutR: number[];
  lutG: number[];
  lutB: number[];
};

export type ParseFltResult = Result<ParsedFilter>;

export type RGBAImage = {
  data: Uint8ClampedArray;
  width: number;
  height: number;
};

const PARAM_COUNT = 7;
const MATRIX_VALUE_COUNT = 9;
const LUT_LENGTH = 256;
const FILTER_VALUE_COUNT = MATRIX_VALUE_COUNT + LUT_LENGTH * 3;

export function parseFlt(text: string): ParseFltResult {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { error: new Error("Filter file is incomplete") };
  }

  const params = lines[0]
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => Number.parseFloat(value.trim()));

  if (params.length !== PARAM_COUNT || params.some(Number.isNaN)) {
    return { error: new Error("Filter params must contain 7 numeric values") };
  }

  const values = lines
    .slice(1)
    .flatMap((line) =>
      line
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    )
    .map((value) => Number.parseFloat(value.trim()));

  if (values.some(Number.isNaN)) {
    return { error: new Error("Filter payload contains a non-numeric value") };
  }

  if (values.length !== FILTER_VALUE_COUNT) {
    return {
      error: new Error(
        `Filter payload must contain ${FILTER_VALUE_COUNT} values`,
      ),
    };
  }

  const matrixValues = values.slice(0, MATRIX_VALUE_COUNT);
  const matrix1024 = toMatrix(matrixValues);
  const matrix = matrix1024.map((row) =>
    row.map((value) => value / 1024),
  ) as Matrix3x3;

  const lutStart = MATRIX_VALUE_COUNT;
  const lutR = values.slice(lutStart, lutStart + LUT_LENGTH);
  const lutG = values.slice(lutStart + LUT_LENGTH, lutStart + LUT_LENGTH * 2);
  const lutB = values.slice(lutStart + LUT_LENGTH * 2);

  return {
    data: {
      brightness: params[0],
      contrast: params[1],
      saturation: params[2],
      hue: params[3],
      gammaR: params[4],
      gammaG: params[5],
      gammaB: params[6],
      matrix1024,
      matrix,
      lutR,
      lutG,
      lutB,
    },
  };
}

export function applyInverseGammaTableRGBA(pixels: Uint8ClampedArray) {
  const table = createInverseGammaTable();
  applyTableToPixels(pixels, table, table, table);
}

export function applyGammaTableRGBA(pixels: Uint8ClampedArray) {
  const table = createGammaTable();
  applyTableToPixels(pixels, table, table, table);
}

export function applyMatrixRGBAFloat(
  pixels: Uint8ClampedArray,
  matrix: Matrix3x3,
) {
  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];

    pixels[index] = clampToByte(
      red * matrix[0][0] + green * matrix[0][1] + blue * matrix[0][2],
    );
    pixels[index + 1] = clampToByte(
      red * matrix[1][0] + green * matrix[1][1] + blue * matrix[1][2],
    );
    pixels[index + 2] = clampToByte(
      red * matrix[2][0] + green * matrix[2][1] + blue * matrix[2][2],
    );
  }
}

export function applyPerChannelLUT(
  pixels: Uint8ClampedArray,
  lutR: number[],
  lutG: number[],
  lutB: number[],
) {
  for (let index = 0; index < pixels.length; index += 4) {
    pixels[index] = clampToByte(lutR[pixels[index]] ?? pixels[index]);
    pixels[index + 1] = clampToByte(
      lutG[pixels[index + 1]] ?? pixels[index + 1],
    );
    pixels[index + 2] = clampToByte(
      lutB[pixels[index + 2]] ?? pixels[index + 2],
    );
  }
}

export function applyCampSnapV105(
  image: RGBAImage,
  filter: ParsedFilter,
): RGBAImage {
  const pixels = new Uint8ClampedArray(image.data);

  applyInverseGammaTableRGBA(pixels);
  applyMatrixRGBAFloat(pixels, filter.matrix);
  applyGammaTableRGBA(pixels);
  applyPerChannelLUT(pixels, filter.lutR, filter.lutG, filter.lutB);

  return {
    data: pixels,
    width: image.width,
    height: image.height,
  };
}

function toMatrix(values: number[]): Matrix3x3 {
  return [
    [values[0], values[1], values[2]],
    [values[3], values[4], values[5]],
    [values[6], values[7], values[8]],
  ];
}

function createInverseGammaTable() {
  return Array.from({ length: LUT_LENGTH }, (_, index) => {
    const channel = index / 255;
    const linear =
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    return clampToByte(linear * 255);
  });
}

function createGammaTable() {
  return Array.from({ length: LUT_LENGTH }, (_, index) => {
    const channel = index / 255;
    const encoded =
      channel <= 0.0031308
        ? channel * 12.92
        : 1.055 * channel ** (1 / 2.4) - 0.055;
    return clampToByte(encoded * 255);
  });
}

function applyTableToPixels(
  pixels: Uint8ClampedArray,
  tableR: number[],
  tableG: number[],
  tableB: number[],
) {
  for (let index = 0; index < pixels.length; index += 4) {
    pixels[index] = tableR[pixels[index]];
    pixels[index + 1] = tableG[pixels[index + 1]];
    pixels[index + 2] = tableB[pixels[index + 2]];
  }
}

function clampToByte(value: number) {
  return Math.min(255, Math.max(0, Math.round(value)));
}
