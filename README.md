# Interactive Map Distance Tool (Mengnan Wu)

A single-page web application featuring an interactive OpenStreetMap-based map with built-in measurement tools. Users can draw lines and circles directly on the map to measure distances and radii in real time. All measurements appear on the map and in a side panel.

## Features

### Core Functionality
- Draw line segments between points.
- Draw circles by selecting a center and defining a radius.
- Automatic calculations:
  - Line distance
  - Circle radius
  - Circle circumference
- Measurements displayed on-map and in a side panel (kilometers by default).
- Uses OpenStreetMap tiles and standard browser technologies (HTML/JS/CSS).

### User Interface
- “Draw Line” button for multi-point distance measurement.
- “Draw Circle” button for radius measurement.
- Clear-all/reset control.
- Responsive layout suitable for desktop and tablet.

## Technology Stack
- **Frontend:** HTML5, JavaScript, CSS.
- **Map Library:** Leaflet or MapLibre GL.
- **Tiles:** OpenStreetMap.
- **Optional Backend (future):** Lightweight API for saving/loading projects.

### Installation
Download or clone the repository:
```bash
git clone <your-repo-url>
cd <project-folder>
```

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.
  
