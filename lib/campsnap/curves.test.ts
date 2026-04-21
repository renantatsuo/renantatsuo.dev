import {
  createBaselineCurvePoints,
  curvePointsToLut,
  insertCurvePoint,
  moveCurvePoint,
  removeCurvePoint,
  type CurvePoint,
} from "~/lib/campsnap/curves";

describe("createBaselineCurvePoints()", () => {
  it("returns 9 points including endpoints sampled from the baseline LUT", () => {
    const baseline = Array.from({ length: 256 }, (_, index) =>
      Math.min(255, index + 3),
    );

    const points = createBaselineCurvePoints(baseline);

    expect(points).toHaveLength(9);
    expect(points[0]).toStrictEqual({ x: 0, y: baseline[0] });
    expect(points[8]).toStrictEqual({ x: 255, y: baseline[255] });
    expect(points.map((point) => point.x)).toStrictEqual([
      0, 32, 64, 96, 128, 160, 192, 224, 255,
    ]);
    expect(points.map((point) => point.y)).toStrictEqual([
      baseline[0],
      baseline[32],
      baseline[64],
      baseline[96],
      baseline[128],
      baseline[160],
      baseline[192],
      baseline[224],
      baseline[255],
    ]);
  });
});

describe("curvePointsToLut()", () => {
  it("returns a 256-entry identity LUT for the trivial diagonal", () => {
    const lut = curvePointsToLut([
      { x: 0, y: 0 },
      { x: 255, y: 255 },
    ]);

    expect(lut).toHaveLength(256);
    expect(lut[0]).toBe(0);
    expect(lut[128]).toBe(128);
    expect(lut[255]).toBe(255);
    for (let index = 0; index < 256; index += 1) {
      expect(lut[index]).toBe(index);
    }
  });

  it("anchors the curve to the endpoint y values", () => {
    const lut = curvePointsToLut([
      { x: 0, y: 10 },
      { x: 128, y: 128 },
      { x: 255, y: 240 },
    ]);

    expect(lut[0]).toBe(10);
    expect(lut[128]).toBe(128);
    expect(lut[255]).toBe(240);
  });

  it("clamps output integers into the byte range", () => {
    const lut = curvePointsToLut([
      { x: 0, y: 0 },
      { x: 128, y: 400 },
      { x: 255, y: 255 },
    ]);

    for (const value of lut) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(255);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it("stays monotonic when the input points are monotonic", () => {
    const lut = curvePointsToLut([
      { x: 0, y: 0 },
      { x: 64, y: 40 },
      { x: 128, y: 140 },
      { x: 192, y: 220 },
      { x: 255, y: 255 },
    ]);

    for (let index = 1; index < lut.length; index += 1) {
      expect(lut[index]).toBeGreaterThanOrEqual(lut[index - 1]);
    }
  });
});

describe("insertCurvePoint()", () => {
  it("inserts a new point in x-sorted order", () => {
    const points: CurvePoint[] = [
      { x: 0, y: 0 },
      { x: 255, y: 255 },
    ];

    const next = insertCurvePoint(points, { x: 128, y: 120 });

    expect(next).toStrictEqual([
      { x: 0, y: 0 },
      { x: 128, y: 120 },
      { x: 255, y: 255 },
    ]);
  });

  it("returns the same points when the new x collides with an existing one", () => {
    const points: CurvePoint[] = [
      { x: 0, y: 0 },
      { x: 128, y: 120 },
      { x: 255, y: 255 },
    ];

    const next = insertCurvePoint(points, { x: 128, y: 200 });

    expect(next).toStrictEqual(points);
  });

  it("rejects points within 1px of a neighbor", () => {
    const points: CurvePoint[] = [
      { x: 0, y: 0 },
      { x: 128, y: 120 },
      { x: 255, y: 255 },
    ];

    expect(insertCurvePoint(points, { x: 127, y: 200 })).toBe(points);
    expect(insertCurvePoint(points, { x: 129, y: 200 })).toBe(points);
  });

  it("returns a new array without mutating the input", () => {
    const points: CurvePoint[] = [
      { x: 0, y: 0 },
      { x: 255, y: 255 },
    ];

    const next = insertCurvePoint(points, { x: 64, y: 64 });

    expect(next).not.toBe(points);
    expect(points).toStrictEqual([
      { x: 0, y: 0 },
      { x: 255, y: 255 },
    ]);
  });
});

describe("moveCurvePoint()", () => {
  it("clamps x between the previous and next point", () => {
    const points: CurvePoint[] = [
      { x: 0, y: 0 },
      { x: 100, y: 100 },
      { x: 200, y: 200 },
      { x: 255, y: 255 },
    ];

    const next = moveCurvePoint(points, 1, { x: 210, y: 210 });

    expect(next[1].x).toBeLessThan(200);
    expect(next[1].x).toBeGreaterThan(0);
    expect(next[1].y).toBe(210);
  });

  it("locks endpoints to x=0 and x=255", () => {
    const points: CurvePoint[] = [
      { x: 0, y: 0 },
      { x: 128, y: 128 },
      { x: 255, y: 255 },
    ];

    const atStart = moveCurvePoint(points, 0, { x: 50, y: 20 });
    const atEnd = moveCurvePoint(points, 2, { x: 200, y: 240 });

    expect(atStart[0]).toStrictEqual({ x: 0, y: 20 });
    expect(atEnd[2]).toStrictEqual({ x: 255, y: 240 });
  });

  it("clamps y to the byte range", () => {
    const points: CurvePoint[] = [
      { x: 0, y: 0 },
      { x: 128, y: 128 },
      { x: 255, y: 255 },
    ];

    const high = moveCurvePoint(points, 1, { x: 128, y: 400 });
    const low = moveCurvePoint(points, 1, { x: 128, y: -10 });

    expect(high[1].y).toBe(255);
    expect(low[1].y).toBe(0);
  });
});

describe("removeCurvePoint()", () => {
  it("removes an interior point", () => {
    const points: CurvePoint[] = [
      { x: 0, y: 0 },
      { x: 128, y: 128 },
      { x: 255, y: 255 },
    ];

    const next = removeCurvePoint(points, 1);

    expect(next).toStrictEqual([
      { x: 0, y: 0 },
      { x: 255, y: 255 },
    ]);
  });

  it("refuses to remove the first or last endpoint", () => {
    const points: CurvePoint[] = [
      { x: 0, y: 0 },
      { x: 128, y: 128 },
      { x: 255, y: 255 },
    ];

    expect(removeCurvePoint(points, 0)).toStrictEqual(points);
    expect(removeCurvePoint(points, 2)).toStrictEqual(points);
  });
});
