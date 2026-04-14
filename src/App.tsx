import { useEffect, useReducer } from "react";
import { createShape } from "./app/shapeFactory";
import type { Mode, ShapeType } from "./app/types";
import { Canvas2D } from "./components/Canvas2D";
import { Canvas3D } from "./components/Canvas3D";
import { StatusBar } from "./components/StatusBar";
import { Toolbar } from "./components/Toolbar";
import { Shape } from "./shapes/Shape";
import { STL } from "./utils/STL";

type Snapshot = {
  shape: Shape | null;
  shapeType: ShapeType;
  mode: Mode;
  show3D: boolean;
  detail: number;
  snapToGrid: boolean;
  gridSize: number;
  meshData: number[];
};

type WorkspaceState = Snapshot & {
  undoStack: Snapshot[];
  redoStack: Snapshot[];
};

type Action =
  | { type: "beginShape"; shape: Shape }
  | { type: "commitShape"; shape: Shape | null }
  | { type: "selectShape"; shapeType: ShapeType }
  | { type: "setMode"; mode: Mode }
  | { type: "toggle3D" }
  | { type: "setDetail"; detail: number }
  | { type: "toggleSnap" }
  | { type: "clear" }
  | { type: "loadSTL"; meshData: number[] }
  | { type: "undo" }
  | { type: "redo" };

const DEFAULT_DETAIL = 32;
const DEFAULT_GRID = 24;

const cloneState = (state: Snapshot): Snapshot => ({
  ...state,
  shape: state.shape?.clone() ?? null,
  meshData: [...state.meshData],
});

const initialState: WorkspaceState = {
  shape: null,
  shapeType: "none",
  mode: "none",
  show3D: false,
  detail: DEFAULT_DETAIL,
  snapToGrid: false,
  gridSize: DEFAULT_GRID,
  meshData: [],
  undoStack: [],
  redoStack: [],
};

const snapshot = (state: WorkspaceState): Snapshot => cloneState(state);

const withHistory = (state: WorkspaceState, next: Snapshot): WorkspaceState => ({
  ...cloneState(next),
  undoStack: [...state.undoStack, snapshot(state)],
  redoStack: [],
});

function reducer(state: WorkspaceState, action: Action): WorkspaceState {
  switch (action.type) {
    case "beginShape":
      return {
        ...state,
        shape: action.shape,
        mode: "draw",
        show3D: false,
        meshData: [],
      };
    case "commitShape":
      return withHistory(state, {
        ...state,
        shape: action.shape,
        show3D: false,
        meshData: state.show3D && action.shape ? action.shape.getMesh3D(state.detail) : [],
      });
    case "selectShape":
      return withHistory(state, {
        ...state,
        shapeType: action.shapeType,
        mode: "draw",
        show3D: false,
        shape: null,
        meshData: [],
      });
    case "setMode":
      return {
        ...state,
        mode: action.mode,
        show3D: false,
      };
    case "toggle3D": {
      if (!state.shape && state.meshData.length === 0) return state;
      const nextShow3D = !state.show3D;
      const nextMesh = nextShow3D && state.shape ? state.shape.getMesh3D(state.detail) : state.meshData;
      return {
        ...state,
        show3D: nextShow3D,
        meshData: nextMesh,
      };
    }
    case "setDetail": {
      const nextMesh = state.show3D && state.shape ? state.shape.getMesh3D(action.detail) : state.meshData;
      return {
        ...state,
        detail: action.detail,
        meshData: nextMesh,
      };
    }
    case "toggleSnap":
      return {
        ...state,
        snapToGrid: !state.snapToGrid,
      };
    case "clear":
      return withHistory(state, {
        ...state,
        shape: null,
        shapeType: "none",
        mode: "none",
        show3D: false,
        meshData: [],
      });
    case "loadSTL":
      return withHistory(state, {
        ...state,
        shape: null,
        shapeType: "none",
        mode: "none",
        show3D: true,
        meshData: action.meshData,
      });
    case "undo": {
      if (state.undoStack.length === 0) return state;
      const previous = state.undoStack[state.undoStack.length - 1];
      const undoStack = state.undoStack.slice(0, -1);
      const redoStack = [...state.redoStack, snapshot(state)];
      return {
        ...cloneState(previous),
        undoStack,
        redoStack,
      };
    }
    case "redo": {
      if (state.redoStack.length === 0) return state;
      const next = state.redoStack[state.redoStack.length - 1];
      const redoStack = state.redoStack.slice(0, -1);
      const undoStack = [...state.undoStack, snapshot(state)];
      return {
        ...cloneState(next),
        undoStack,
        redoStack,
      };
    }
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && key === "z" && !event.shiftKey) {
        event.preventDefault();
        dispatch({ type: "undo" });
      } else if ((event.ctrlKey || event.metaKey) && (key === "y" || (key === "z" && event.shiftKey))) {
        event.preventDefault();
        dispatch({ type: "redo" });
      } else if (key === "g" && !event.ctrlKey && !event.metaKey && !event.altKey) {
        dispatch({ type: "toggleSnap" });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleShapeCreated = (nextShape: Shape) => {
    dispatch({ type: "beginShape", shape: nextShape });
  };

  const handleShapeCommitted = (nextShape: Shape | null) => {
    dispatch({ type: "commitShape", shape: nextShape });
  };

  const handleShapeSelect = (nextShapeType: ShapeType) => {
    dispatch({ type: "selectShape", shapeType: nextShapeType });
  };

  const handleModeChange = (nextMode: Mode) => {
    dispatch({ type: "setMode", mode: nextMode });
  };

  const handleToggle3D = () => {
    dispatch({ type: "toggle3D" });
  };

  const handleClear = () => {
    dispatch({ type: "clear" });
  };

  const handleSaveSTL = () => {
    const data = state.meshData.length > 0 ? state.meshData : state.shape?.getMesh3D(state.detail) ?? [];
    if (data.length) {
      STL.saveSTL(data);
    }
  };

  const handleLoadSTL = async () => {
    const data = await STL.loadSTL();
    if (data.length === 0) return;
    dispatch({ type: "loadSTL", meshData: data });
  };

  const hasShape = Boolean(state.shape) || state.meshData.length > 0;

  return (
    <div className="min-h-screen w-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#1f2342_0%,_#0c0f18_48%,_#06070b_100%)] text-zinc-100">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-4 p-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Toolbar
          activeShape={state.shapeType}
          mode={state.mode}
          show3D={state.show3D}
          hasShape={hasShape}
          detail={state.detail}
          snapToGrid={state.snapToGrid}
          canUndo={state.undoStack.length > 0}
          canRedo={state.redoStack.length > 0}
          onShapeSelect={handleShapeSelect}
          onModeChange={handleModeChange}
          onToggle3D={handleToggle3D}
          onClear={handleClear}
          onSaveSTL={handleSaveSTL}
          onLoadSTL={handleLoadSTL}
          onDetailChange={(detail) => dispatch({ type: "setDetail", detail })}
          onToggleSnap={() => dispatch({ type: "toggleSnap" })}
          onUndo={() => dispatch({ type: "undo" })}
          onRedo={() => dispatch({ type: "redo" })}
        />

        <main className="relative flex min-h-[70vh] flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/30 backdrop-blur-sm">
          <div className="relative flex-1 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_rgba(255,255,255,0.02)_35%,_rgba(0,0,0,0.08)_100%)]">
            <div className={`absolute inset-0 transition-opacity duration-200 ${state.show3D ? "pointer-events-none opacity-0" : "opacity-100"}`}>
              <Canvas2D
                shape={state.shape}
                mode={state.mode}
                shapeType={state.shapeType}
                detail={state.detail}
                gridSize={state.gridSize}
                snapToGrid={state.snapToGrid}
                onShapeCreated={handleShapeCreated}
                onShapeCommitted={handleShapeCommitted}
                createShape={createShape}
              />

              {!state.shape && !state.show3D && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-zinc-400">
                    Pick a primitive and drag on the canvas
                  </div>
                </div>
              )}
            </div>

            {state.show3D && (
              <div className="absolute inset-0">
                <Canvas3D meshData={state.meshData} />
              </div>
            )}
          </div>

          <StatusBar
            shapeName={state.shape?.name() ?? (state.meshData.length > 0 ? "STL Model" : null)}
            mode={state.mode}
            show3D={state.show3D}
            detail={state.detail}
            snapToGrid={state.snapToGrid}
            vertCount={state.meshData.length}
          />
        </main>
      </div>
    </div>
  );
}
