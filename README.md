# Shape3D

Shape3D is a React + TypeScript application for sketching 2D primitives and turning them into 3D meshes. It combines direct canvas drawing, editable control points, Three.js preview rendering, and ASCII STL import/export in one browser-based workflow.

## Features

- Rectangle, square, and circle drawing
- Control-point editing in 2D
- 3D mesh preview with orbit controls
- Mesh detail slider for smoother or lighter geometry
- Snap-to-grid drawing with visible grid overlay
- Undo and redo for workspace actions
- ASCII STL import and export

## How It Works

The app follows a simple pipeline:

1. Select a shape in the toolbar.
2. Draw it on the 2D canvas.
3. Adjust it with control points if needed.
4. Switch to 3D view to generate and inspect the mesh.
5. Save the mesh as STL or load an existing STL file.

## Controls

- `Rectangle`, `Square`, `Circle`: choose the primitive to draw
- `Edit`: move control points for the active shape
- `Idle`: leave the canvas in a neutral state
- `3D View`: generate and inspect the mesh
- `Detail`: change tessellation density for generated geometry
- `Snap Grid`: align drawing and editing to the grid
- `Undo` and `Redo`: navigate workspace history

Keyboard shortcuts:

- `Ctrl/Cmd + Z`: undo
- `Ctrl/Cmd + Y`: redo
- `G`: toggle snap-to-grid

## Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

## Project Structure

- `src/App.tsx`: workspace state, history, and layout orchestration
- `src/app/types.ts`: shared state types
- `src/app/shapeFactory.ts`: shape creation helper
- `src/components/Toolbar.tsx`: left control panel
- `src/components/Canvas2D.tsx`: drawing, editing, snapping, and grid rendering
- `src/components/Canvas3D.tsx`: Three.js scene and mesh preview
- `src/components/StatusBar.tsx`: status and hints
- `src/shapes/Shape.ts`: abstract shape contract
- `src/shapes/Rectangle.ts`: rectangle geometry and cuboid output
- `src/shapes/Square.ts`: square geometry and cube output
- `src/shapes/Circle.ts`: circle geometry and sphere output
- `src/utils/STL.ts`: browser-based STL import/export
- `src/utils/DataClass.ts`: triangle deduplication helper

## Design Notes

- The UI uses a split studio layout instead of a traditional top toolbar.
- Geometry is generated from shape objects, not from canvas pixels.
- The 3D output is regenerated from the active shape when the detail setting changes.
- STL support is ASCII-based for browser compatibility.

## Current Package Name

The current package name is `shape3d`. If you rename the project, update `package.json` and the README title together so the repo stays consistent.
