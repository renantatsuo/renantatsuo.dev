import * as React from "react";
import { Button } from "~/components/ui/button";
import {
  insertCurvePoint,
  moveCurvePoint,
  removeCurvePoint,
  type CurvePoint,
} from "~/lib/campsnap";

export type ChannelKey = "R" | "G" | "B";

type CampSnapCurveEditorProps = {
  activeChannel: ChannelKey;
  curvePoints: Record<ChannelKey, CurvePoint[]>;
  baselines: Record<ChannelKey, number[]>;
  editedLuts: Record<ChannelKey, number[]>;
  onActiveChannelChange: (channel: ChannelKey) => void;
  onCurvePointsChange: (channel: ChannelKey, points: CurvePoint[]) => void;
  onResetChannel: (channel: ChannelKey) => void;
  onResetAll: () => void;
};

const CHANNELS: readonly ChannelKey[] = ["R", "G", "B"];
const CHANNEL_LABELS: Record<ChannelKey, string> = {
  R: "Red",
  G: "Green",
  B: "Blue",
};
const CHANNEL_COLORS: Record<ChannelKey, string> = {
  R: "#ef4444",
  G: "#22c55e",
  B: "#3b82f6",
};
const BYTE_MAX = 255;

function CampSnapCurveEditor({
  activeChannel,
  curvePoints,
  baselines,
  editedLuts,
  onActiveChannelChange,
  onCurvePointsChange,
  onResetChannel,
  onResetAll,
}: CampSnapCurveEditorProps) {
  const [focusedPointIndex, setFocusedPointIndex] = React.useState<
    number | null
  >(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const draggingIndexRef = React.useRef<number | null>(null);

  const activePoints = curvePoints[activeChannel];
  const activeBaseline = baselines[activeChannel];
  const activeLut = editedLuts[activeChannel];
  const activeColor = CHANNEL_COLORS[activeChannel];
  const editedMatchesBaseline = React.useMemo(
    () => activeLut.every((value, index) => value === activeBaseline[index]),
    [activeLut, activeBaseline],
  );
  const inactiveChannels = CHANNELS.filter(
    (channel) => channel !== activeChannel,
  );

  function pointerToCoords(event: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;

    if (!svg) {
      return { x: 0, y: 0 };
    }

    const rect = svg.getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left) / rect.width) * BYTE_MAX);
    const y = Math.round(
      ((rect.bottom - event.clientY) / rect.height) * BYTE_MAX,
    );

    return {
      x: Math.max(0, Math.min(BYTE_MAX, x)),
      y: Math.max(0, Math.min(BYTE_MAX, y)),
    };
  }

  function getHandleIndexFromEvent(event: React.PointerEvent<SVGSVGElement>) {
    const target = event.target as Element | null;
    const attribute = target?.getAttribute?.("data-point-index");

    return attribute === null || attribute === undefined
      ? null
      : Number(attribute);
  }

  function handlePointerDown(event: React.PointerEvent<SVGSVGElement>) {
    svgRef.current?.focus();
    const handleIndex = getHandleIndexFromEvent(event);

    if (event.altKey && handleIndex !== null) {
      const next = removeCurvePoint(activePoints, handleIndex);

      onCurvePointsChange(activeChannel, next);
      setFocusedPointIndex(null);
      return;
    }

    if (handleIndex !== null) {
      draggingIndexRef.current = handleIndex;
      setFocusedPointIndex(handleIndex);
      svgRef.current?.setPointerCapture(event.pointerId);
      return;
    }

    const pointerCoords = pointerToCoords(event);
    const coords = {
      x: pointerCoords.x,
      y: activeLut[pointerCoords.x] ?? pointerCoords.y,
    };
    const inserted = insertCurvePoint(activePoints, coords);

    if (inserted === activePoints) {
      return;
    }

    const newIndex = inserted.findIndex((point) => point.x === coords.x);

    onCurvePointsChange(activeChannel, inserted);
    draggingIndexRef.current = newIndex;
    setFocusedPointIndex(newIndex);
    svgRef.current?.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (draggingIndexRef.current === null) {
      return;
    }

    const coords = pointerToCoords(event);
    const next = moveCurvePoint(activePoints, draggingIndexRef.current, coords);

    onCurvePointsChange(activeChannel, next);
  }

  function handlePointerUp(event: React.PointerEvent<SVGSVGElement>) {
    if (draggingIndexRef.current === null) {
      return;
    }

    draggingIndexRef.current = null;

    if (svgRef.current?.hasPointerCapture(event.pointerId)) {
      svgRef.current.releasePointerCapture(event.pointerId);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<SVGSVGElement>) {
    if (focusedPointIndex === null) {
      return;
    }

    if (event.key === "Delete" || event.key === "Backspace") {
      const next = removeCurvePoint(activePoints, focusedPointIndex);

      if (next !== activePoints) {
        event.preventDefault();
        onCurvePointsChange(activeChannel, next);
        setFocusedPointIndex(null);
      }
      return;
    }

    const step = event.shiftKey ? 10 : 1;
    const current = activePoints[focusedPointIndex];
    let dx = 0;
    let dy = 0;

    if (event.key === "ArrowLeft") dx = -step;
    else if (event.key === "ArrowRight") dx = step;
    else if (event.key === "ArrowUp") dy = step;
    else if (event.key === "ArrowDown") dy = -step;
    else return;

    event.preventDefault();
    const next = moveCurvePoint(activePoints, focusedPointIndex, {
      x: current.x + dx,
      y: current.y + dy,
    });

    onCurvePointsChange(activeChannel, next);
  }

  function handleResetChannel() {
    onResetChannel(activeChannel);
    setFocusedPointIndex(null);
  }

  function handleResetAll() {
    onResetAll();
    setFocusedPointIndex(null);
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-1">
        {CHANNELS.map((channel) => {
          const isActive = channel === activeChannel;
          const color = CHANNEL_COLORS[channel];

          return (
            <button
              key={channel}
              type="button"
              aria-pressed={isActive}
              onClick={() => {
                onActiveChannelChange(channel);
                setFocusedPointIndex(null);
              }}
              className={`flex-1 rounded-md border px-2.5 py-1 text-xs font-bold
              transition-colors ${
                isActive
                  ? "text-white"
                  : `border-border bg-background text-muted-foreground
                    hover:bg-muted/40`
              }`}
              style={
                isActive
                  ? { borderColor: color, backgroundColor: color }
                  : undefined
              }
            >
              {CHANNEL_LABELS[channel]}
            </button>
          );
        })}
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 256 256"
        role="application"
        aria-label={`${CHANNEL_LABELS[activeChannel]} channel curve editor`}
        tabIndex={0}
        preserveAspectRatio="none"
        className="bg-background ring-ring/40 w-full touch-none rounded-md
          border select-none focus-visible:ring-2 focus-visible:outline-none"
        style={{ aspectRatio: "1 / 1" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        <rect x={0} y={0} width={256} height={256} fill="transparent" />
        <g stroke="currentColor" strokeWidth={0.5} opacity={0.2}>
          <line x1={0} y1={64} x2={256} y2={64} />
          <line x1={0} y1={128} x2={256} y2={128} />
          <line x1={0} y1={192} x2={256} y2={192} />
          <line x1={64} y1={0} x2={64} y2={256} />
          <line x1={128} y1={0} x2={128} y2={256} />
          <line x1={192} y1={0} x2={192} y2={256} />
        </g>
        <line
          x1={0}
          y1={256}
          x2={256}
          y2={0}
          stroke="currentColor"
          strokeDasharray="4 4"
          strokeWidth={0.75}
          opacity={0.3}
        />
        {inactiveChannels.map((channel) => (
          <path
            key={channel}
            d={lutToPath(editedLuts[channel])}
            stroke={CHANNEL_COLORS[channel]}
            strokeWidth={1}
            fill="none"
            opacity={0.3}
          />
        ))}
        {!editedMatchesBaseline && (
          <path
            d={lutToPath(activeBaseline)}
            stroke={activeColor}
            strokeWidth={1}
            strokeDasharray="2 3"
            fill="none"
            opacity={0.55}
          />
        )}
        <path
          d={lutToPath(activeLut)}
          stroke={activeColor}
          strokeWidth={2}
          fill="none"
        />
        {activePoints.map((point, index) => {
          const isFocused = index === focusedPointIndex;
          return (
            <circle
              key={index}
              role="slider"
              tabIndex={0}
              aria-label={`${CHANNEL_LABELS[activeChannel]} point ${index + 1}`}
              aria-valuemin={0}
              aria-valuemax={255}
              aria-valuenow={point.y}
              aria-valuetext={`input ${point.x}, output ${point.y}`}
              cx={point.x}
              cy={BYTE_MAX - point.y}
              r={isFocused ? 5.5 : 4}
              data-point-index={index}
              className="fill-background"
              stroke={activeColor}
              strokeWidth={isFocused ? 2.5 : 1.75}
              style={{ cursor: "grab" }}
              onFocus={() => setFocusedPointIndex(index)}
            />
          );
        })}
      </svg>

      <p className="text-muted-foreground m-0 text-xs">
        Click empty space to add a point. Alt+click or press Delete on a focused
        point to remove it. Arrow keys nudge the focused point (Shift for x10).
      </p>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResetChannel}
        >
          Reset {CHANNEL_LABELS[activeChannel]}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResetAll}
        >
          Reset all
        </Button>
      </div>
    </div>
  );
}

function lutToPath(lut: number[]) {
  let path = "";

  for (let x = 0; x < lut.length; x += 1) {
    path += `${x === 0 ? "M" : "L"}${x} ${BYTE_MAX - lut[x]} `;
  }

  return path.trimEnd();
}

export default CampSnapCurveEditor;
