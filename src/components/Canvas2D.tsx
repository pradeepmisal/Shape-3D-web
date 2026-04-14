import React, { useCallback, useEffect, useRef } from "react";
import type { Mode, ShapeType } from "../app/types";
import { Shape, type Point2D } from "../shapes/Shape";

interface Props {
  shape: Shape | null;
  mode: Mode;
  shapeType: ShapeType;
  detail: number;
  gridSize: number;
  snapToGrid: boolean;
  onShapeCreated: (shape: Shape) => void;
  onShapeCommitted: (shape: Shape | null) => void;
  createShape: (type: ShapeType, start: Point2D, end: Point2D) => Shape | null;
}

const TOL = 12;

const snap = (value: number, step: number) => Math.round(value / step) * step;

export const Canvas2D: React.FC<Props> = ({
  shape,
  mode,
  shapeType,
  detail,
  gridSize,
  snapToGrid,
  onShapeCreated,
  onShapeCommitted,
  createShape,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const interactionRef = useRef(false);
  const selectedRef = useRef(-1);
  const activeShape = useRef<Shape | null>(null);

  useEffect(() => {
    activeShape.current = shape;
  }, [shape]);

  const getPoint = useCallback(
    (e: React.MouseEvent): Point2D => {
      const canvas = canvasRef.current!;
      const bounds = canvas.getBoundingClientRect();
      const point = { x: e.clientX - bounds.left, y: e.clientY - bounds.top };
      if (!snapToGrid) return point;
      return {
        x: snap(point.x, gridSize),
        y: snap(point.y, gridSize),
      };
    },
    [gridSize, snapToGrid],
  );

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = 0; x <= width; x += gridSize) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, height);
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
    }

    ctx.stroke();
    ctx.restore();
  };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);

    const current = activeShape.current;
    if (!current) return;

    const vertices = current.getVertices(detail);
    ctx.strokeStyle = "#e5f8ff";
    ctx.lineWidth = 1.75;
    ctx.beginPath();
    for (let i = 0; i < vertices.length; i += 4) {
      ctx.moveTo(vertices[i], vertices[i + 1]);
      ctx.lineTo(vertices[i + 2], vertices[i + 3]);
    }
    ctx.stroke();

    if (mode === "edit") {
      const points = current.getControlPoints();
      for (let i = 0; i < points.length; i++) {
        const { x, y } = points[i];
        const selected = i === selectedRef.current;
        ctx.strokeStyle = selected ? "#00f5c7" : "#65fbc5";
        ctx.fillStyle = selected ? "#00f5c7" : "#0d1517";
        ctx.lineWidth = 1.5;
        const size = 6;
        ctx.beginPath();
        ctx.moveTo(x - size, y);
        ctx.lineTo(x + size, y);
        ctx.moveTo(x, y - size);
        ctx.lineTo(x, y + size);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [detail, gridSize, mode]);

  useEffect(() => {
    render();
  }, [render, shape, mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const observer = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      render();
    });

    observer.observe(canvas);
    return () => observer.disconnect();
  }, [render]);

  const onMouseDown = (e: React.MouseEvent) => {
    const pos = getPoint(e);

    if (mode === "draw" && shapeType !== "none") {
      const next = createShape(shapeType, pos, pos);
      if (next) {
        activeShape.current = next;
        onShapeCreated(next);
        drawingRef.current = true;
        interactionRef.current = true;
        render();
      }
      return;
    }

    if (mode === "edit" && activeShape.current) {
      selectedRef.current = activeShape.current.nearestControlPoint(pos, TOL);
      interactionRef.current = selectedRef.current !== -1;
      render();
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const pos = getPoint(e);

    if (mode === "draw" && drawingRef.current && activeShape.current) {
      activeShape.current.setEnd(pos);
      render();
      return;
    }

    if (mode === "edit" && selectedRef.current !== -1 && activeShape.current) {
      activeShape.current.moveControlPoint(selectedRef.current, pos);
      render();
    }
  };

  const onMouseUp = () => {
    if (interactionRef.current) {
      onShapeCommitted(activeShape.current ? activeShape.current.clone() : null);
    }

    drawingRef.current = false;
    interactionRef.current = false;
    selectedRef.current = -1;
    render();
  };

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full cursor-crosshair bg-transparent"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    />
  );
};
