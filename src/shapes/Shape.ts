export interface Point2D {
  x: number;
  y: number;
}

export abstract class Shape {
  protected pts: Point2D[] = [];

  abstract name(): string;
  abstract clone(): Shape;
  abstract setEnd(p: Point2D): void;
  abstract getVertices(detail?: number): number[];
  abstract getMesh3D(detail?: number): number[];
  abstract getControlPoints(): Point2D[];
  abstract moveControlPoint(idx: number, p: Point2D): void;

  nearestControlPoint(pos: Point2D, tol: number): number {
    for (let i = 0; i < this.pts.length; i++) {
      const dx = this.pts[i].x - pos.x;
      const dy = this.pts[i].y - pos.y;
      if (dx * dx + dy * dy < tol * tol) return i;
    }
    return -1;
  }
}
