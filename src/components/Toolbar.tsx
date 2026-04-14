import React from "react";
import type { Mode, ShapeType } from "../app/types";

interface Props {
  activeShape: ShapeType;
  mode: Mode;
  show3D: boolean;
  hasShape: boolean;
  detail: number;
  snapToGrid: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onShapeSelect: (s: ShapeType) => void;
  onModeChange: (m: Mode) => void;
  onToggle3D: () => void;
  onClear: () => void;
  onSaveSTL: () => void;
  onLoadSTL: () => void;
  onDetailChange: (value: number) => void;
  onToggleSnap: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

const Btn: React.FC<{
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ active, onClick, children, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={[
      "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150",
      active
        ? "border-cyan-300/60 bg-cyan-300/15 text-cyan-100 shadow-lg shadow-cyan-950/30"
        : "border-white/10 bg-white/5 text-zinc-300 hover:border-cyan-300/30 hover:bg-white/10",
      disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
    ].join(" ")}
  >
    {children}
  </button>
);

export const Toolbar: React.FC<Props> = ({
  activeShape,
  mode,
  show3D,
  hasShape,
  detail,
  snapToGrid,
  canUndo,
  canRedo,
  onShapeSelect,
  onModeChange,
  onToggle3D,
  onClear,
  onSaveSTL,
  onLoadSTL,
  onDetailChange,
  onToggleSnap,
  onUndo,
  onRedo,
}) => (
  <aside className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-zinc-950/70 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Studio</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Shape3D</h1>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Draw a profile, tune the detail, and generate a 3D mesh with a cleaner workflow.
      </p>
    </div>

    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Draw</div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Btn active={activeShape === "rect"} onClick={() => onShapeSelect("rect")}>Rectangle</Btn>
        <Btn active={activeShape === "square"} onClick={() => onShapeSelect("square")}>Square</Btn>
        <Btn active={activeShape === "circle"} onClick={() => onShapeSelect("circle")}>Circle</Btn>
      </div>
    </div>

    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Mode</div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Btn active={mode === "edit" && !show3D} disabled={!hasShape || show3D} onClick={() => onModeChange("edit")}>Edit</Btn>
        <Btn active={!show3D && mode === "none"} onClick={() => onModeChange("none")}>Idle</Btn>
        <Btn active={show3D} disabled={!hasShape} onClick={onToggle3D}>{show3D ? "Back to 2D" : "3D View"}</Btn>
      </div>
    </div>

    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Detail</div>
        <div className="text-sm text-cyan-300">{detail}</div>
      </div>
      <input
        className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-cyan-400"
        type="range"
        min={16}
        max={80}
        value={detail}
        onChange={(e) => onDetailChange(Number(e.target.value))}
      />
      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Higher values smooth the circle and sphere output.
      </p>
    </div>

    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Workflow</div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Btn active={snapToGrid} onClick={onToggleSnap}>Snap Grid</Btn>
        <Btn disabled={!canUndo} onClick={onUndo}>Undo</Btn>
        <Btn disabled={!canRedo} onClick={onRedo}>Redo</Btn>
      </div>
      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Snap grid is keyboard-friendly too. Press G to toggle it.
      </p>
    </div>

    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Export</div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Btn disabled={!hasShape} onClick={onSaveSTL}>Save STL</Btn>
        <Btn onClick={onLoadSTL}>Load STL</Btn>
        <Btn onClick={onClear}>Clear</Btn>
      </div>
    </div>
  </aside>
);
