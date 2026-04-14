import { Shape, type Point2D } from "./Shape";

const PI = Math.PI;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export class Circle extends Shape {
  private start: Point2D;

  constructor(s: Point2D, e: Point2D) {
    super();
    this.start = { ...s };
    this.pts = [{ x: 0, y: 0 }, { x: 0, y: 0 }];
    this.setEnd(e);
  }

  name() {
    return "Circle";
  }

  clone() {
    const radius = this.pts[1].x - this.pts[0].x;
    return new Circle(
      { x: this.pts[0].x - radius, y: this.pts[0].y - radius },
      { x: this.pts[0].x + radius, y: this.pts[0].y + radius },
    );
  }

  setEnd(p: Point2D) {
    const center = {
      x: (this.start.x + p.x) / 2,
      y: (this.start.y + p.y) / 2,
    };
    const r = Math.max(
      1,
      Math.min(Math.abs(p.x - this.start.x), Math.abs(p.y - this.start.y)) / 2,
    );
    this.pts[0] = center;
    this.pts[1] = { x: center.x + r, y: center.y };
  }

  moveControlPoint(i: number, p: Point2D) {
    if (i === 0) {
      const diff = { x: p.x - this.pts[0].x, y: p.y - this.pts[0].y };
      this.pts[0] = p;
      this.pts[1] = { x: this.pts[1].x + diff.x, y: this.pts[1].y + diff.y };
      return;
    }

    const dx = p.x - this.pts[0].x;
    const dy = p.y - this.pts[0].y;
    const r = Math.max(1, Math.round(Math.sqrt(dx * dx + dy * dy)));
    this.pts[1] = { x: this.pts[0].x + r, y: this.pts[0].y };
  }

  getControlPoints() {
    return this.pts;
  }

  getVertices(detail = 48): number[] {
    const vertices: number[] = [];
    const cx = this.pts[0].x;
    const cy = this.pts[0].y;
    const radius = this.pts[1].x - this.pts[0].x;
    const segments = clamp(Math.round(detail), 16, 180);

    for (let i = 0; i < segments; i++) {
      const t1 = (2 * PI * i) / segments;
      const t2 = (2 * PI * (i + 1)) / segments;
      vertices.push(cx + radius * Math.cos(t1), cy + radius * Math.sin(t1));
      vertices.push(cx + radius * Math.cos(t2), cy + radius * Math.sin(t2));
    }

    return vertices;
  }

  getMesh3D(detail = 32): number[] {
    const cx = this.pts[0].x;
    const cy = this.pts[0].y;
    const radius = this.pts[1].x - this.pts[0].x;
    const rings = clamp(Math.round(detail), 10, 80);
    const slices = clamp(rings * 2, 20, 160);
    const mesh: number[] = [];

    for (let i = 0; i < rings; i++) {
      const t1 = (PI * i) / rings - PI / 2;
      const t2 = (PI * (i + 1)) / rings - PI / 2;

      for (let j = 0; j < slices; j++) {
        const p1 = (2 * PI * j) / slices;
        const p2 = (2 * PI * (j + 1)) / slices;

        const x1 = radius * Math.cos(t1) * Math.cos(p1);
        const y1 = radius * Math.sin(t1);
        const z1 = radius * Math.cos(t1) * Math.sin(p1);
        const x2 = radius * Math.cos(t1) * Math.cos(p2);
        const y2 = radius * Math.sin(t1);
        const z2 = radius * Math.cos(t1) * Math.sin(p2);
        const x3 = radius * Math.cos(t2) * Math.cos(p1);
        const y3 = radius * Math.sin(t2);
        const z3 = radius * Math.cos(t2) * Math.sin(p1);
        const x4 = radius * Math.cos(t2) * Math.cos(p2);
        const y4 = radius * Math.sin(t2);
        const z4 = radius * Math.cos(t2) * Math.sin(p2);

        mesh.push(cx + x1, cy + y1, z1, cx + x2, cy + y2, z2, cx + x3, cy + y3, z3);
        mesh.push(cx + x2, cy + y2, z2, cx + x4, cy + y4, z4, cx + x3, cy + y3, z3);
      }
    }

    return mesh;
  }
}
