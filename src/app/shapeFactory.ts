import { Circle } from "../shapes/Circle";
import { Rectangle } from "../shapes/Rectangle";
import { Square } from "../shapes/Square";
import type { Shape, Point2D } from "../shapes/Shape";
import type { ShapeType } from "./types";

export function createShape(type: ShapeType, start: Point2D, end: Point2D): Shape | null {
  switch (type) {
    case "rect":
      return new Rectangle(start, end);
    case "square":
      return new Square(start, end);
    case "circle":
      return new Circle(start, end);
    default:
      return null;
  }
}
