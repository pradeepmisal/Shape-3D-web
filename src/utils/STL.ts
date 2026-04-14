export class STL {
  static parseASCII(text: string): number[] {
    const points: number[] = [];
    const lines = text.split("\n");

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts[0] === "vertex" && parts.length >= 4) {
        points.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
      }
    }

    return points;
  }

  static loadSTL(): Promise<number[]> {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".stl";
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) {
          resolve([]);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          resolve(STL.parseASCII(text));
        };
        reader.readAsText(file);
      };
      input.click();
    });
  }

  static saveSTL(points: number[], filename = "model.stl") {
    let content = "solid model\n";
    for (let i = 0; i < points.length; i += 9) {
      content += "facet normal 0 0 0\n outer loop\n";
      for (let j = 0; j < 3; j++) {
        const x = points[i + j * 3];
        const y = points[i + j * 3 + 1];
        const z = points[i + j * 3 + 2];
        content += `  vertex ${x} ${y} ${z}\n`;
      }
      content += " endloop\nendfacet\n";
    }
    content += "endsolid\n";

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
