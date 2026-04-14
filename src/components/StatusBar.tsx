import React from "react";

interface Props {
  shapeName: string | null;
  mode: string;
  show3D: boolean;
  detail: number;
  snapToGrid: boolean;
  vertCount: number;
}

export const StatusBar: React.FC<Props> = ({ shapeName, mode, show3D, detail, snapToGrid, vertCount }) => (
  <footer className="rounded-2xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-xs text-zinc-400 backdrop-blur-xl">
    <div className="flex flex-wrap items-center gap-3">
      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
        Shape <span className="text-zinc-100">{shapeName ?? "none"}</span>
      </span>
      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
        Mode <span className="text-zinc-100">{show3D ? "3D" : mode}</span>
      </span>
      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
        Detail <span className="text-cyan-300">{detail}</span>
      </span>
      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
        Grid <span className="text-cyan-300">{snapToGrid ? "snap on" : "snap off"}</span>
      </span>
      {show3D && (
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
          Triangles <span className="text-cyan-300">{Math.round(vertCount / 9)}</span>
        </span>
      )}
      <span className="ml-auto text-zinc-500">
        Ctrl/Cmd+Z and Ctrl/Cmd+Y support undo and redo.
      </span>
    </div>
  </footer>
);
