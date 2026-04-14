import { Shape, type Point2D } from "./Shape";

export class Rectangle extends Shape {
  constructor(s: Point2D, e: Point2D) {
    super();
    this.pts = new Array(4).fill(null).map(() => ({ x: 0, y: 0 }));
    this.rebuild(s, e);
  }

  name() {
    return "Rectangle";
  }

  clone() {
    return new Rectangle(this.pts[0], this.pts[2]);
  }

  setEnd(p: Point2D) {
    this.rebuild(this.pts[3], p);
  }

  moveControlPoint(i: number, p: Point2D) {
    this.rebuild(p, this.pts[(i + 2) % 4]);
  }

  getControlPoints() {
    return this.pts;
  }

  private rebuild(a: Point2D, b: Point2D) {
    const x0 = Math.min(a.x, b.x);
    const x1 = Math.max(a.x, b.x);
    const y0 = Math.min(a.y, b.y);
    const y1 = Math.max(a.y, b.y);
    this.pts[0] = { x: x0, y: y1 };
    this.pts[1] = { x: x1, y: y1 };
    this.pts[2] = { x: x1, y: y0 };
    this.pts[3] = { x: x0, y: y0 };
  }

  getVertices(): number[] {
    const vertices: number[] = [];
    for (let i = 0; i < 4; i++) {
      vertices.push(this.pts[i].x, this.pts[i].y);
      vertices.push(this.pts[(i + 1) % 4].x, this.pts[(i + 1) % 4].y);
    }
    return vertices;
  }

  getMesh3D(): number[] {
    const cx = (this.pts[0].x + this.pts[2].x) / 2;
    const cy = (this.pts[0].y + this.pts[2].y) / 2;
    const hw = Math.abs(this.pts[1].x - this.pts[0].x) / 2;
    const hh = Math.abs(this.pts[2].y - this.pts[1].y) / 2;
    const depth = (hw + hh) * 0.5;

    const verts: [number, number, number][] = [
      [-hw, -hh, -depth], [hw, -hh, -depth], [hw, hh, -depth], [-hw, hh, -depth],
      [-hw, -hh, depth], [hw, -hh, depth], [hw, hh, depth], [-hw, hh, depth],
    ];

    const idx = [
      0, 1, 2, 0, 2, 3,
      4, 5, 6, 4, 6, 7,
      0, 3, 7, 0, 7, 4,
      1, 2, 6, 1, 6, 5,
      3, 2, 6, 3, 6, 7,
      0, 1, 5, 0, 5, 4,
    ];

    const mesh: number[] = [];
    for (const id of idx) {
      mesh.push(cx + verts[id][0], cy + verts[id][1], verts[id][2]);
    }
    return mesh;
  }
}
