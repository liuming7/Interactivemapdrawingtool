import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Ruler, Circle, Trash2, Check } from "lucide-react";

interface DrawingShape {
  id: string;
  type: "line" | "circle" | "polyline";
  points: [number, number][];
  distance: number;
  radius?: number;
  segments?: { start: [number, number]; end: [number, number]; distance: number }[];
}

export function MapComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [drawingMode, setDrawingMode] = useState<"line" | "circle" | "polyline" | null>(null);
  const [currentPoints, setCurrentPoints] = useState<[number, number][]>([]);
  const [shapes, setShapes] = useState<DrawingShape[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedSegments, setSelectedSegments] = useState<{ shapeId: string; segmentIndex: number }[]>([]);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const shapesLayerRef = useRef<any[]>([]);
  const tempPolylineRef = useRef<any>(null);

  useEffect(() => {
    // Load Leaflet CSS and JS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (mapLoaded && mapContainerRef.current && !mapRef.current) {
      // @ts-ignore
      const L = window.L;

      // 1) 禁用默认 zoomControl
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([40.7128, -74.0060], 13);

      // 2) 自己加一个在右上的缩放控件
      L.control
        .zoom({
          position: "bottomright",
        })
        .addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      mapRef.current = map;
    }
  }, [mapLoaded]);

  // const handleMapClick = (latlng: any) => {
  //   // @ts-ignore
  //   const L = window.L;
  //   const point: [number, number] = [latlng.lat, latlng.lng];

  //   if (drawingMode === "polyline") {
  //     const newPoints = [...currentPoints, point];
  //     setCurrentPoints(newPoints);

  //     // Add marker
  //     const marker = L.circleMarker(latlng, {
  //       radius: 5,
  //       fillColor: "#8b5cf6",
  //       color: "#fff",
  //       weight: 2,
  //       fillOpacity: 0.8
  //     }).addTo(mapRef.current);
  //     markersRef.current.push(marker);

  //     // Draw temporary polyline
  //     if (tempPolylineRef.current) {
  //       tempPolylineRef.current.remove();
  //     }
  //     if (newPoints.length > 1) {
  //       tempPolylineRef.current = L.polyline(newPoints, {
  //         color: "#8b5cf6",
  //         weight: 3,
  //         dashArray: "5, 5"
  //       }).addTo(mapRef.current);
  //     }
  //   } else if (drawingMode === "line") {
  //     const newPoints = [...currentPoints, point];
  //     setCurrentPoints(newPoints);

  //     // Add marker
  //     const marker = L.circleMarker(latlng, {
  //       radius: 5,
  //       fillColor: "#3b82f6",
  //       color: "#fff",
  //       weight: 2,
  //       fillOpacity: 0.8
  //     }).addTo(mapRef.current);
  //     markersRef.current.push(marker);

  //     // If we have 2 points, create the line
  //     if (newPoints.length === 2) {
  //       const distance = calculateDistance(newPoints[0], newPoints[1]);
  //       const shape: DrawingShape = {
  //         id: Date.now().toString(),
  //         type: "line",
  //         points: newPoints,
  //         distance
  //       };

  //       // Draw line on map
  //       const polyline = L.polyline(newPoints, {
  //         color: "#3b82f6",
  //         weight: 3
  //       }).addTo(mapRef.current);

  //       // Add distance label
  //       const midPoint = [
  //         (newPoints[0][0] + newPoints[1][0]) / 2,
  //         (newPoints[0][1] + newPoints[1][1]) / 2
  //       ];
  //       const tooltip = L.tooltip({
  //         permanent: true,
  //         direction: "center",
  //         className: "distance-label"
  //       })
  //         .setLatLng(midPoint as [number, number])
  //         .setContent(`${(distance / 1000).toFixed(2)} km`)
  //         .addTo(mapRef.current);

  //       shapesLayerRef.current.push(polyline, tooltip);
  //       setShapes([...shapes, shape]);
  //       setCurrentPoints([]);
  //       setDrawingMode(null);
  //     }
  //   } else if (drawingMode === "circle") {
  //     const newPoints = [...currentPoints, point];
  //     setCurrentPoints(newPoints);

  //     // Add marker
  //     const marker = L.circleMarker(latlng, {
  //       radius: 5,
  //       fillColor: "#10b981",
  //       color: "#fff",
  //       weight: 2,
  //       fillOpacity: 0.8
  //     }).addTo(mapRef.current);
  //     markersRef.current.push(marker);

  //     // If we have 2 points, create the circle
  //     if (newPoints.length === 2) {
  //       const radius = calculateDistance(newPoints[0], newPoints[1]);
  //       const shape: DrawingShape = {
  //         id: Date.now().toString(),
  //         type: "circle",
  //         points: newPoints,
  //         distance: 2 * Math.PI * radius, // Circumference
  //         radius
  //       };

  //       // Draw circle on map
  //       const circle = L.circle(newPoints[0], {
  //         color: "#10b981",
  //         fillColor: "#10b981",
  //         fillOpacity: 0.2,
  //         radius: radius
  //       }).addTo(mapRef.current);

  //       // Add radius label
  //       const tooltip = L.tooltip({
  //         permanent: true,
  //         direction: "center",
  //         className: "distance-label"
  //       })
  //         .setLatLng(newPoints[0])
  //         .setContent(`Radius: ${(radius / 1000).toFixed(2)} km<br>Circumference: ${(shape.distance / 1000).toFixed(2)} km`)
  //         .addTo(mapRef.current);

  //       shapesLayerRef.current.push(circle, tooltip);
  //       setShapes([...shapes, shape]);
  //       setCurrentPoints([]);
  //       setDrawingMode(null);
  //     }
  //   }
  // };

  const handleMapClick = useCallback(
    (latlng: any) => {
      // @ts-ignore
      const L = window.L;
      const point: [number, number] = [latlng.lat, latlng.lng];

      if (drawingMode === "polyline") {
        const newPoints = [...currentPoints, point];
        setCurrentPoints(newPoints);

        const marker = L.circleMarker(latlng, {
          radius: 5,
          fillColor: "#8b5cf6",
          color: "#fff",
          weight: 2,
          fillOpacity: 0.8,
        }).addTo(mapRef.current);
        markersRef.current.push(marker);

        if (tempPolylineRef.current) {
          tempPolylineRef.current.remove();
        }
        if (newPoints.length > 1) {
          tempPolylineRef.current = L.polyline(newPoints, {
            color: "#8b5cf6",
            weight: 3,
            dashArray: "5, 5",
          }).addTo(mapRef.current);
        }
      } else if (drawingMode === "line") {
        const newPoints = [...currentPoints, point];
        setCurrentPoints(newPoints);

        const marker = L.circleMarker(latlng, {
          radius: 5,
          fillColor: "#3b82f6",
          color: "#fff",
          weight: 2,
          fillOpacity: 0.8,
        }).addTo(mapRef.current);
        markersRef.current.push(marker);

        if (newPoints.length === 2) {
          const distance = calculateDistance(newPoints[0], newPoints[1]);
          const shape: DrawingShape = {
            id: Date.now().toString(),
            type: "line",
            points: newPoints,
            distance,
          };

          const polyline = L.polyline(newPoints, {
            color: "#3b82f6",
            weight: 3,
          }).addTo(mapRef.current);

          const midPoint = [
            (newPoints[0][0] + newPoints[1][0]) / 2,
            (newPoints[0][1] + newPoints[1][1]) / 2,
          ];
          const tooltip = L.tooltip({
            permanent: true,
            direction: "center",
            className: "distance-label",
          })
            .setLatLng(midPoint as [number, number])
            .setContent(`${(distance / 1000).toFixed(2)} km`)
            .addTo(mapRef.current);

          shapesLayerRef.current.push(polyline, tooltip);
          setShapes((prev) => [...prev, shape]);
          setCurrentPoints([]);
          setDrawingMode(null);
        }
      } else if (drawingMode === "circle") {
        const newPoints = [...currentPoints, point];
        setCurrentPoints(newPoints);

        const marker = L.circleMarker(latlng, {
          radius: 5,
          fillColor: "#10b981",
          color: "#fff",
          weight: 2,
          fillOpacity: 0.8,
        }).addTo(mapRef.current);
        markersRef.current.push(marker);

        if (newPoints.length === 2) {
          const radius = calculateDistance(newPoints[0], newPoints[1]);
          const shape: DrawingShape = {
            id: Date.now().toString(),
            type: "circle",
            points: newPoints,
            distance: 2 * Math.PI * radius,
            radius,
          };

          const circle = L.circle(newPoints[0], {
            color: "#10b981",
            fillColor: "#10b981",
            fillOpacity: 0.2,
            radius,
          }).addTo(mapRef.current);

          const tooltip = L.tooltip({
            permanent: true,
            direction: "center",
            className: "distance-label",
          })
            .setLatLng(newPoints[0])
            .setContent(
              `Radius: ${(radius / 1000).toFixed(2)} km<br>Circumference: ${(shape.distance / 1000).toFixed(2)} km`
            )
            .addTo(mapRef.current);

          shapesLayerRef.current.push(circle, tooltip);
          setShapes((prev) => [...prev, shape]);
          setCurrentPoints([]);
          setDrawingMode(null);
        }
      }
    },
    [drawingMode, currentPoints, setCurrentPoints, setShapes]
  );

  const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
    // Haversine formula to calculate distance between two points in meters
    const R = 6371000; // Earth's radius in meters
    const lat1 = (point1[0] * Math.PI) / 180;
    const lat2 = (point2[0] * Math.PI) / 180;
    const deltaLat = ((point2[0] - point1[0]) * Math.PI) / 180;
    const deltaLng = ((point2[1] - point1[1]) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const finishPolyline = () => {
    if (currentPoints.length < 2) {
      alert("Please add at least 2 points to create a polyline");
      return;
    }

    // @ts-ignore
    const L = window.L;

    // Calculate segments and total distance
    const segments: { start: [number, number]; end: [number, number]; distance: number }[] = [];
    let totalDistance = 0;

    for (let i = 0; i < currentPoints.length - 1; i++) {
      const distance = calculateDistance(currentPoints[i], currentPoints[i + 1]);
      segments.push({
        start: currentPoints[i],
        end: currentPoints[i + 1],
        distance
      });
      totalDistance += distance;
    }

    const shape: DrawingShape = {
      id: Date.now().toString(),
      type: "polyline",
      points: currentPoints,
      distance: totalDistance,
      segments
    };

    // Remove temporary polyline
    if (tempPolylineRef.current) {
      tempPolylineRef.current.remove();
      tempPolylineRef.current = null;
    }

    // Draw final polyline on map with clickable segments
    const polyline = L.polyline(currentPoints, {
      color: "#8b5cf6",
      weight: 3
    }).addTo(mapRef.current);

    // Add clickable segments
    segments.forEach((segment, index) => {
      const segmentLine = L.polyline([segment.start, segment.end], {
        color: "#8b5cf6",
        weight: 8,
        opacity: 0,
        className: `segment-${shape.id}-${index}`
      }).addTo(mapRef.current);

      segmentLine.on("click", () => {
        toggleSegmentSelection(shape.id, index);
      });

      shapesLayerRef.current.push(segmentLine);

      // Add segment distance label
      const midPoint = [
        (segment.start[0] + segment.end[0]) / 2,
        (segment.start[1] + segment.end[1]) / 2
      ];
      const segmentTooltip = L.tooltip({
        permanent: false,
        direction: "center",
        className: "segment-label"
      })
        .setLatLng(midPoint as [number, number])
        .setContent(`Segment ${index + 1}: ${(segment.distance / 1000).toFixed(2)} km`);

      segmentLine.bindTooltip(segmentTooltip);
    });

    // Add total distance label
    const midIndex = Math.floor(currentPoints.length / 2);
    const tooltip = L.tooltip({
      permanent: true,
      direction: "center",
      className: "distance-label"
    })
      .setLatLng(currentPoints[midIndex])
      .setContent(`Total: ${(totalDistance / 1000).toFixed(2)} km`)
      .addTo(mapRef.current);

    shapesLayerRef.current.push(polyline, tooltip);
    setShapes(prev => [...prev, shape]);
    setCurrentPoints([]);
    setDrawingMode(null);
  };

  const toggleSegmentSelection = (shapeId: string, segmentIndex: number) => {
    setSelectedSegments(prev => {
      const existing = prev.find(s => s.shapeId === shapeId && s.segmentIndex === segmentIndex);
      if (existing) {
        return prev.filter(s => !(s.shapeId === shapeId && s.segmentIndex === segmentIndex));
      } else {
        return [...prev, { shapeId, segmentIndex }];
      }
    });
  };

  const clearAll = () => {
    // Clear all markers and shapes from map
    markersRef.current.forEach(marker => marker.remove());
    shapesLayerRef.current.forEach(layer => layer.remove());
    if (tempPolylineRef.current) {
      tempPolylineRef.current.remove();
      tempPolylineRef.current = null;
    }
    markersRef.current = [];
    shapesLayerRef.current = [];
    setShapes([]);
    setCurrentPoints([]);
    setDrawingMode(null);
    setSelectedSegments([]);
  };

  const startDrawing = (mode: "line" | "circle" | "polyline") => {
    if (drawingMode === mode) {
      setDrawingMode(null);
      setCurrentPoints([]);
      // Clear temporary markers
      if (currentPoints.length > 0) {
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
      }
      if (tempPolylineRef.current) {
        tempPolylineRef.current.remove();
        tempPolylineRef.current = null;
      }
    } else {
      setDrawingMode(mode);
      setCurrentPoints([]);
      setSelectedSegments([]);
    }
  };

  const getSelectedSegmentsDistance = () => {
    let total = 0;
    selectedSegments.forEach(({ shapeId, segmentIndex }) => {
      const shape = shapes.find(s => s.id === shapeId);
      if (shape && shape.segments) {
        total += shape.segments[segmentIndex].distance;
      }
    });
    return total;
  };

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const map = mapRef.current;

    const clickHandler = (e: any) => {
      handleMapClick(e.latlng);
    };

    map.on("click", clickHandler);

    // 清理：每次 handleMapClick 变了，先解绑旧的，再绑新的
    return () => {
      map.off("click", clickHandler);
    };
  }, [mapLoaded, handleMapClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Control Panel */}
      <Card className="absolute top-4 left-4 p-4 shadow-lg z-[1000]">
        <h2 className="mb-4">Map Drawing Tools</h2>
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => startDrawing("line")}
            variant={drawingMode === "line" ? "default" : "outline"}
            className="w-full justify-start"
          >
            <Ruler className="mr-2 h-4 w-4" />
            {drawingMode === "line" ? "Drawing Line..." : "Draw Line"}
          </Button>
          <Button
            onClick={() => startDrawing("polyline")}
            variant={drawingMode === "polyline" ? "default" : "outline"}
            className="w-full justify-start"
          >
            <Ruler className="mr-2 h-4 w-4" />
            {drawingMode === "polyline" ? "Drawing Multi-Line..." : "Draw Multi-Line"}
          </Button>
          <Button
            onClick={() => startDrawing("circle")}
            variant={drawingMode === "circle" ? "default" : "outline"}
            className="w-full justify-start"
          >
            <Circle className="mr-2 h-4 w-4" />
            {drawingMode === "circle" ? "Drawing Circle..." : "Draw Circle"}
          </Button>
          {drawingMode === "polyline" && currentPoints.length >= 2 && (
            <Button
              onClick={finishPolyline}
              variant="default"
              className="w-full justify-start bg-green-600 hover:bg-green-700"
            >
              <Check className="mr-2 h-4 w-4" />
              Finish Multi-Line ({currentPoints.length} points)
            </Button>
          )}
          <Button
            onClick={clearAll}
            variant="destructive"
            className="w-full justify-start"
            disabled={shapes.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>

        {drawingMode && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm">
              {drawingMode === "line" 
                ? `Click ${currentPoints.length === 0 ? "first" : "second"} point on the map`
                : drawingMode === "polyline"
                ? currentPoints.length === 0
                  ? "Click points on the map to create a multi-line path"
                  : `${currentPoints.length} point(s) added. Click to add more or finish.`
                : `Click ${currentPoints.length === 0 ? "center" : "edge"} point on the map`
              }
            </p>
          </div>
        )}
      </Card>

      {/* Measurements Panel */}
      {shapes.length > 0 && (
        <Card className="absolute top-4 right-4 p-4 shadow-lg z-[1000] max-w-xs">
          <h3 className="mb-3">Measurements</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {shapes.map((shape, index) => (
              <div key={shape.id} className="p-2 bg-gray-50 rounded text-sm">
                <div className="flex items-center gap-2">
                  {shape.type === "line" ? (
                    <Ruler className="h-4 w-4 text-blue-600" />
                  ) : shape.type === "polyline" ? (
                    <Ruler className="h-4 w-4 text-purple-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-green-600" />
                  )}
                  <span>{shape.type === "line" ? "Line" : shape.type === "polyline" ? "Multi-Line" : "Circle"} #{index + 1}</span>
                </div>
                {shape.type === "line" ? (
                  <p className="mt-1">Distance: {(shape.distance / 1000).toFixed(2)} km</p>
                ) : shape.type === "polyline" ? (
                  <>
                    <p className="mt-1">Total: {(shape.distance / 1000).toFixed(2)} km</p>
                    <p className="text-xs text-gray-600">{shape.segments?.length} segments</p>
                    <div className="mt-2 space-y-1">
                      {shape.segments?.map((segment, segIndex) => {
                        const isSelected = selectedSegments.some(
                          s => s.shapeId === shape.id && s.segmentIndex === segIndex
                        );
                        return (
                          <button
                            key={segIndex}
                            onClick={() => toggleSegmentSelection(shape.id, segIndex)}
                            className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                              isSelected 
                                ? "bg-purple-200 border border-purple-400" 
                                : "bg-white border border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            Seg {segIndex + 1}: {(segment.distance / 1000).toFixed(2)} km
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-1">Radius: {(shape.radius! / 1000).toFixed(2)} km</p>
                    <p>Circumference: {(shape.distance / 1000).toFixed(2)} km</p>
                  </>
                )}
              </div>
            ))}
          </div>
          {selectedSegments.length > 0 && (
            <div className="mt-3 p-3 bg-purple-50 rounded border border-purple-200">
              <p className="text-sm">Selected Segments</p>
              <p className="text-sm">{selectedSegments.length} segment(s)</p>
              <p className="mt-1">
                Total: {(getSelectedSegmentsDistance() / 1000).toFixed(2)} km
              </p>
            </div>
          )}
        </Card>
      )}

      <style>{`
        .distance-label {
          background: white;
          border: 2px solid #8b5cf6;
          border-radius: 4px;
          padding: 4px 8px;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .segment-label {
          background: white;
          border: 2px solid #8b5cf6;
          border-radius: 4px;
          padding: 4px 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}