import {
  applyCampSnapV105,
  applyGammaTableRGBA,
  applyInverseGammaTableRGBA,
  applyMatrixRGBAFloat,
  applyPerChannelLUT,
  parseFlt,
  type ParsedFilter,
} from "~/lib/campSnap";

describe("parseFlt()", () => {
  it("parses the baked matrix and LUTs", () => {
    const result = parseFlt(createDisposableFlt());

    expect(result.error).toBeUndefined();
    if (result.error || !result.data) {
      throw result.error ?? new Error("Expected parsed filter");
    }

    expect(result.data.brightness).toBe(4);
    expect(result.data.contrast).toBe(0.81);
    expect(result.data.saturation).toBe(1.08);
    expect(result.data.hue).toBe(0);
    expect(result.data.gammaR).toBe(1.32);
    expect(result.data.gammaG).toBe(1);
    expect(result.data.gammaB).toBe(0.75);
    expect(result.data.matrix1024).toStrictEqual([
      [1085, -51, -10],
      [-20, 1055, -10],
      [-20, -51, 1096],
    ]);
    expect(result.data.matrix).toStrictEqual([
      [1.0595703125, -0.0498046875, -0.009765625],
      [-0.01953125, 1.0302734375, -0.009765625],
      [-0.01953125, -0.0498046875, 1.0703125],
    ]);
    expect(result.data.lutR).toHaveLength(256);
    expect(result.data.lutG).toHaveLength(256);
    expect(result.data.lutB).toHaveLength(256);
    expect(result.data.lutR[0]).toBe(0);
    expect(result.data.lutG[42]).toBe(42);
    expect(result.data.lutB[255]).toBe(255);
  });

  it("rejects invalid param counts", () => {
    const result = parseFlt("1,2,3\n1,2,3");

    expect(result).toStrictEqual({
      error: new Error("Filter params must contain 7 numeric values"),
    });
  });

  it("rejects wrong payload lengths", () => {
    const result = parseFlt(["1,2,3,4,5,6,7", "1,2,3"].join("\n"));

    expect(result).toStrictEqual({
      error: new Error("Filter payload must contain 777 values"),
    });
  });

  it("rejects non-numeric payload values", () => {
    const result = parseFlt(["1,2,3,4,5,6,7", "1,2,nope"].join("\n"));

    expect(result).toStrictEqual({
      error: new Error("Filter payload contains a non-numeric value"),
    });
  });
});

describe("pixel transforms", () => {
  it("preserves alpha while applying LUTs", () => {
    const pixels = new Uint8ClampedArray([10, 20, 30, 77]);
    const lutR = createIdentityLut();
    const lutG = createIdentityLut();
    const lutB = createIdentityLut();
    lutR[10] = 100;
    lutG[20] = 110;
    lutB[30] = 120;

    applyPerChannelLUT(pixels, lutR, lutG, lutB);

    expect(Array.from(pixels)).toStrictEqual([100, 110, 120, 77]);
  });

  it("clamps matrix output to byte range", () => {
    const pixels = new Uint8ClampedArray([255, 255, 255, 10]);

    applyMatrixRGBAFloat(pixels, [
      [2, 0, 0],
      [0, 2, 0],
      [0, 0, 2],
    ]);

    expect(Array.from(pixels)).toStrictEqual([255, 255, 255, 10]);
  });

  it("round trips through inverse and forward gamma close to the original value", () => {
    const pixels = new Uint8ClampedArray([12, 128, 240, 55]);

    applyInverseGammaTableRGBA(pixels);
    applyGammaTableRGBA(pixels);

    expect(Array.from(pixels)).toStrictEqual([13, 128, 240, 55]);
  });

  it("applies the full pipeline in the expected order", () => {
    const filter: ParsedFilter = {
      brightness: 0,
      contrast: 1,
      saturation: 1,
      hue: 0,
      gammaR: 1,
      gammaG: 1,
      gammaB: 1,
      matrix1024: [
        [1024, 0, 0],
        [0, 1024, 0],
        [0, 0, 1024],
      ],
      matrix: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
      lutR: createShiftLut(10),
      lutG: createShiftLut(20),
      lutB: createShiftLut(30),
    };

    const result = applyCampSnapV105(
      {
        data: new Uint8ClampedArray([40, 50, 60, 70]),
        width: 1,
        height: 1,
      },
      filter,
    );

    expect(Array.from(result.data)).toStrictEqual([48, 70, 91, 70]);
  });
});

function createIdentityLut() {
  return Array.from({ length: 256 }, (_, index) => index);
}

function createShiftLut(shift: number) {
  return Array.from({ length: 256 }, (_, index) =>
    Math.min(255, index + shift),
  );
}

function createDisposableFlt() {
  const matrix = [1085, -51, -10, -20, 1055, -10, -20, -51, 1096];
  const lut = createIdentityLut();

  return [
    "4,0.81,1.08,0,1.32,1.0,0.75",
    matrix.slice(0, 3).join(","),
    matrix.slice(3, 6).join(","),
    matrix.slice(6, 9).join(","),
    lut.join(","),
    lut.join(","),
    lut.join(","),
  ].join("\n");
}
