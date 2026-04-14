# Shape3D Codebase Guide

## Overview

Shape3D is a React + TypeScript + Vite app for sketching 2D shapes and turning them into 3D meshes. The current implementation is organized as a studio layout:

- a left control panel
- a large canvas stage
- a bottom status bar

## Runtime Flow

1. `src/main.tsx` boots the app.
2. `src/App.tsx` owns workspace state through a reducer.
3. `src/components/Toolbar.tsx` controls shape selection, detail, grid snapping, and history.
4. `src/components/Canvas2D.tsx` handles drawing, snapping, control-point editing, and grid rendering.
5. `src/components/Canvas3D.tsx` renders the generated mesh with Three.js and orbit controls.
6. `src/utils/STL.ts` imports and exports ASCII STL files.

## State Model

`App.tsx` manages:

- selected shape type
- interaction mode
- 2D or 3D view
- mesh detail
- snap-to-grid state
- grid spacing
- current mesh data
- undo and redo history

## Shape System

The shape classes live in `src/shapes/`.

- `Shape.ts` defines the abstract contract
- `Rectangle.ts` builds a cuboid mesh
- `Square.ts` builds a cube mesh
- `Circle.ts` builds a sphere mesh and supports detail-based tessellation

## Added Features

The refactor adds three meaningful workflow improvements:

- Mesh detail control for smoother or lighter generated geometry
- Snap-to-grid drawing, with grid rendering inside the 2D canvas
- Undo and redo for shape creation, editing, clearing, and STL loading

## File Map

- [`src/App.tsx`](src/App.tsx)
- [`src/main.tsx`](src/main.tsx)
- [`src/app/types.ts`](src/app/types.ts)
- [`src/app/shapeFactory.ts`](src/app/shapeFactory.ts)
- [`src/components/Toolbar.tsx`](src/components/Toolbar.tsx)
- [`src/components/Canvas2D.tsx`](src/components/Canvas2D.tsx)
- [`src/components/Canvas3D.tsx`](src/components/Canvas3D.tsx)
- [`src/components/StatusBar.tsx`](src/components/StatusBar.tsx)
- [`src/shapes/Shape.ts`](src/shapes/Shape.ts)
- [`src/shapes/Rectangle.ts`](src/shapes/Rectangle.ts)
- [`src/shapes/Square.ts`](src/shapes/Square.ts)
- [`src/shapes/Circle.ts`](src/shapes/Circle.ts)
- [`src/utils/STL.ts`](src/utils/STL.ts)
- [`src/utils/DataClass.ts`](src/utils/DataClass.ts)

## Notes

- The codebase is now structured around a reducer-driven workspace instead of scattered state setters.
- The 3D mesh is regenerated from the shape object when needed, rather than being tied to the canvas pixels.
- STL support remains ASCII-based for browser compatibility.
