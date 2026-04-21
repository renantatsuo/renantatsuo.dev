import {
  applyCampSnapV105,
  applyGammaTableRGBA,
  applyInverseGammaTableRGBA,
  applyMatrixRGBAFloat,
  applyPerChannelLUT,
  parseFlt,
  type ParsedFilter,
} from "~/lib/campsnap";

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

  it("accepts trailing commas and spaced values", () => {
    const result = parseFlt(createDisposableFltWithTrailingCommas());

    expect(result.error).toBeUndefined();
    if (result.error || !result.data) {
      throw result.error ?? new Error("Expected parsed filter");
    }

    expect(result.data.matrix1024).toStrictEqual([
      [1085, -51, -10],
      [-20, 1055, -10],
      [-20, -51, 1096],
    ]);
    expect(result.data.lutR[0]).toBe(47);
    expect(result.data.lutG[0]).toBe(28);
    expect(result.data.lutB[0]).toBe(13);
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

function createDisposableFltWithTrailingCommas() {
  const matrix = [1085, -51, -10, -20, 1055, -10, -20, -51, 1096];
  const lutR = [
    47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65,
    66, 67, 68, 69, 70, 71, 72, 73, 74, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83,
    83, 84, 85, 86, 87, 88, 89, 89, 90, 91, 92, 93, 94, 95, 95, 96, 97, 98, 99,
    100, 100, 101, 102, 103, 104, 105, 105, 106, 107, 108, 109, 109, 110, 111,
    112, 113, 113, 114, 115, 116, 117, 117, 118, 119, 120, 120, 121, 122, 123,
    124, 124, 125, 126, 127, 127, 128, 129, 130, 131, 131, 132, 133, 134, 134,
    135, 136, 137, 137, 138, 139, 140, 140, 141, 142, 142, 143, 144, 145, 145,
    146, 147, 148, 148, 149, 150, 151, 151, 152, 153, 153, 154, 155, 156, 156,
    157, 158, 158, 159, 160, 161, 161, 162, 163, 163, 164, 165, 166, 166, 167,
    168, 168, 169, 170, 170, 171, 172, 173, 173, 174, 175, 175, 176, 177, 177,
    178, 179, 179, 180, 181, 182, 182, 183, 184, 184, 185, 186, 186, 187, 188,
    188, 189, 190, 190, 191, 192, 192, 193, 194, 194, 195, 196, 196, 197, 198,
    198, 199, 200, 200, 201, 202, 202, 203, 204, 204, 205, 206, 206, 207, 208,
    208, 209, 210, 210, 211, 212, 212, 213, 214, 214, 215, 215, 216, 217, 217,
    218, 219, 219, 220, 221, 221, 222, 223, 223, 224, 224, 225, 226, 226, 227,
    228, 228, 229, 230, 230, 231, 231, 232, 233, 233, 234, 235, 235, 236, 237,
    237, 237, 237, 237,
  ];
  const lutG = [
    28, 28, 29, 30, 31, 32, 32, 33, 34, 35, 36, 36, 37, 38, 39, 40, 41, 41, 42,
    43, 44, 45, 45, 46, 47, 48, 49, 49, 50, 51, 52, 53, 53, 54, 55, 56, 57, 58,
    58, 59, 60, 61, 62, 62, 63, 64, 65, 66, 66, 67, 68, 69, 70, 70, 71, 72, 73,
    74, 75, 75, 76, 77, 78, 79, 79, 80, 81, 82, 83, 83, 84, 85, 86, 87, 88, 88,
    89, 90, 91, 92, 92, 93, 94, 95, 96, 96, 97, 98, 99, 100, 100, 101, 102, 103,
    104, 105, 105, 106, 107, 108, 109, 109, 110, 111, 112, 113, 113, 114, 115,
    116, 117, 117, 118, 119, 120, 121, 122, 122, 123, 124, 125, 126, 126, 127,
    128, 129, 130, 130, 131, 132, 133, 134, 134, 135, 136, 137, 138, 139, 139,
    140, 141, 142, 143, 143, 144, 145, 146, 147, 147, 148, 149, 150, 151, 151,
    152, 153, 154, 155, 156, 156, 157, 158, 159, 160, 160, 161, 162, 163, 164,
    164, 165, 166, 167, 168, 169, 169, 170, 171, 172, 173, 173, 174, 175, 176,
    177, 177, 178, 179, 180, 181, 181, 182, 183, 184, 185, 186, 186, 187, 188,
    189, 190, 190, 191, 192, 193, 194, 194, 195, 196, 197, 198, 198, 199, 200,
    201, 202, 203, 203, 204, 205, 206, 207, 207, 208, 209, 210, 211, 211, 212,
    213, 214, 215, 215, 216, 217, 218, 219, 220, 220, 221, 222, 223, 224, 224,
    225, 226, 227, 228, 228, 229, 230, 231, 231, 231, 231, 231,
  ];
  const lutB = [
    13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 19, 19, 20, 20, 21, 21, 22, 23, 23,
    24, 24, 25, 26, 26, 27, 27, 28, 29, 29, 30, 31, 31, 32, 32, 33, 34, 34, 35,
    36, 36, 37, 38, 38, 39, 40, 40, 41, 42, 42, 43, 44, 45, 45, 46, 47, 47, 48,
    49, 49, 50, 51, 52, 52, 53, 54, 55, 55, 56, 57, 58, 58, 59, 60, 61, 61, 62,
    63, 64, 64, 65, 66, 67, 67, 68, 69, 70, 71, 71, 72, 73, 74, 74, 75, 76, 77,
    78, 78, 79, 80, 81, 82, 82, 83, 84, 85, 86, 87, 87, 88, 89, 90, 91, 92, 92,
    93, 94, 95, 96, 97, 97, 98, 99, 100, 101, 102, 103, 103, 104, 105, 106, 107,
    108, 109, 110, 110, 111, 112, 113, 114, 115, 116, 117, 117, 118, 119, 120,
    121, 122, 123, 124, 125, 126, 126, 127, 128, 129, 130, 131, 132, 133, 134,
    135, 136, 137, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148,
    149, 150, 151, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162,
    163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177,
    178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192,
    193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207,
    208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222,
    223, 223, 223, 223, 223,
  ];

  return [
    "4, 0.81, 1.08, 0, 1.32, 1, 0.75",
    `${matrix[0]}, ${matrix[1]}, ${matrix[2]}, `,
    `${matrix[3]}, ${matrix[4]}, ${matrix[5]}, `,
    `${matrix[6]}, ${matrix[7]}, ${matrix[8]}`,
    lutR.join(", "),
    lutG.join(", "),
    lutB.join(", "),
  ].join("\n");
}
