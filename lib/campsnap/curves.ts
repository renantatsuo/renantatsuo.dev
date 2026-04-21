export type CurvePoint = { x: number; y: number };

const BASELINE_XS = [0, 32, 64, 96, 128, 160, 192, 224, 255] as const;
const LUT_LENGTH = 256;

export function createBaselineCurvePoints(baseline: number[]): CurvePoint[] {
  return BASELINE_XS.map((x) => ({ x, y: clampByte(baseline[x] ?? 0) }));
}

export function curvePointsToLut(points: CurvePoint[]): number[] {
  const sorted = [...points].sort((a, b) => a.x - b.x);
  const tangents = computeMonotoneTangents(sorted);
  const lut = new Array<number>(LUT_LENGTH);
  let segment = 0;

  for (let x = 0; x < LUT_LENGTH; x += 1) {
    while (segment < sorted.length - 2 && x > sorted[segment + 1].x) {
      segment += 1;
    }

    const start = sorted[segment];
    const end = sorted[segment + 1] ?? start;
    const width = end.x - start.x || 1;
    const t = (x - start.x) / width;
    const t2 = t * t;
    const t3 = t2 * t;
    const y =
      (2 * t3 - 3 * t2 + 1) * start.y +
      (t3 - 2 * t2 + t) * width * tangents[segment] +
      (-2 * t3 + 3 * t2) * end.y +
      (t3 - t2) * width * tangents[segment + 1];

    lut[x] = clampByte(Math.round(y));
  }

  return lut;
}

export function insertCurvePoint(
  points: CurvePoint[],
  newPoint: CurvePoint,
): CurvePoint[] {
  const point = {
    x: clampByte(newPoint.x),
    y: clampByte(newPoint.y),
  };

  if (
    points.some((existingPoint) => Math.abs(existingPoint.x - point.x) <= 1)
  ) {
    return points;
  }

  return [...points, point].sort((a, b) => a.x - b.x);
}

export function removeCurvePoint(
  points: CurvePoint[],
  index: number,
): CurvePoint[] {
  if (index <= 0 || index >= points.length - 1) {
    return points;
  }

  return points.filter((_, position) => position !== index);
}

export function moveCurvePoint(
  points: CurvePoint[],
  index: number,
  next: CurvePoint,
): CurvePoint[] {
  const isEndpoint = index === 0 || index === points.length - 1;
  const y = clampByte(Math.round(next.y));
  let x: number;

  if (isEndpoint) {
    x = points[index].x;
  } else {
    const minX = points[index - 1].x + 1;
    const maxX = points[index + 1].x - 1;
    x = Math.max(minX, Math.min(maxX, Math.round(next.x)));
  }

  const updated = [...points];
  updated[index] = { x, y };

  return updated;
}

function computeMonotoneTangents(points: CurvePoint[]): number[] {
  const n = points.length;

  if (n < 2) {
    return new Array(n).fill(0);
  }

  const slopes: number[] = new Array(n - 1);

  for (let index = 0; index < n - 1; index += 1) {
    const width = points[index + 1].x - points[index].x;
    slopes[index] =
      width === 0 ? 0 : (points[index + 1].y - points[index].y) / width;
  }

  const tangents: number[] = new Array(n);
  tangents[0] = slopes[0];
  tangents[n - 1] = slopes[n - 2];

  for (let index = 1; index < n - 1; index += 1) {
    tangents[index] = (slopes[index - 1] + slopes[index]) / 2;
  }

  for (let index = 0; index < n - 1; index += 1) {
    const slope = slopes[index];

    if (slope === 0) {
      tangents[index] = 0;
      tangents[index + 1] = 0;
      continue;
    }

    const a = tangents[index] / slope;
    const b = tangents[index + 1] / slope;
    const magnitude = a * a + b * b;

    if (magnitude > 9) {
      const scale = 3 / Math.sqrt(magnitude);
      tangents[index] = scale * a * slope;
      tangents[index + 1] = scale * b * slope;
    }
  }

  return tangents;
}

function clampByte(value: number) {
  return Math.min(255, Math.max(0, Math.round(value)));
}
