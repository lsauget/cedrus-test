"use client";

import { useEffect, useRef, useState } from "react";
import { useMap } from "@/components/ui/map";
import MapLibreGL from "maplibre-gl";
import { useQueryStates, parseAsString } from "nuqs";

interface DrawToFilterProps {
  enabled?: boolean;
}

export function DrawToFilter({ enabled = true }: DrawToFilterProps) {
  const { map, isLoaded } = useMap();
  const [isDrawing, setIsDrawing] = useState(false);
  const startPointRef = useRef<[number, number] | null>(null);
  const boxElementRef = useRef<HTMLDivElement | null>(null);
  const [, setBbox] = useQueryStates(
    {
      bbox: parseAsString.withDefault(""),
    },
    {
      history: "push",
      shallow: false,
    }
  );

  useEffect(() => {
    if (!isLoaded || !map || !enabled) return;

    const container = map.getContainer();
    const canvas = map.getCanvas();

    // Disable box zoom (which uses Shift) to allow our custom draw
    const boxZoom = map.boxZoom;
    if (boxZoom) {
      boxZoom.disable();
    }

    // Track modifier keys
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.shiftKey || e.ctrlKey || e.metaKey) && !isDrawing) {
        canvas.style.cursor = "crosshair";
        // Prevent map dragging when modifier keys are held
        map.dragPan.disable();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.shiftKey && !e.ctrlKey && !e.metaKey && !isDrawing) {
        canvas.style.cursor = "";
        map.dragPan.enable();
      }
    };

    const handleMouseDown = (e: MapLibreGL.MapMouseEvent) => {
      if (e.originalEvent.button !== 0) return; // Only left mouse button
      if (e.originalEvent.shiftKey || e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
        // Prevent default map behaviors
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();

        // Start drawing box
        setIsDrawing(true);
        startPointRef.current = [e.lngLat.lng, e.lngLat.lat];

        // Disable map interactions while drawing
        map.dragPan.disable();
        map.scrollZoom.disable();
        map.boxZoom.disable();
        map.doubleClickZoom.disable();
        map.touchZoomRotate.disable();

        // Create a box element
        const box = document.createElement("div");
        box.className = "absolute border-2 border-primary bg-primary/10 pointer-events-none z-50";
        box.style.width = "0px";
        box.style.height = "0px";
        box.style.left = `${e.point.x}px`;
        box.style.top = `${e.point.y}px`;
        box.style.position = "absolute";

        container.appendChild(box);
        boxElementRef.current = box;
      }
    };

    const handleMouseMove = (e: MapLibreGL.MapMouseEvent) => {
      if (!isDrawing || !startPointRef.current || !boxElementRef.current) return;

      const [startLng, startLat] = startPointRef.current;
      const startPoint = map.project([startLng, startLat]);
      const currentPoint = e.point;

      const width = Math.abs(currentPoint.x - startPoint.x);
      const height = Math.abs(currentPoint.y - startPoint.y);
      const left = Math.min(startPoint.x, currentPoint.x);
      const top = Math.min(startPoint.y, currentPoint.y);

      boxElementRef.current.style.width = `${width}px`;
      boxElementRef.current.style.height = `${height}px`;
      boxElementRef.current.style.left = `${left}px`;
      boxElementRef.current.style.top = `${top}px`;
    };

    const handleMouseUp = (e: MapLibreGL.MapMouseEvent) => {
      if (!isDrawing || !startPointRef.current) {
        // Re-enable map interactions if we're not drawing
        map.dragPan.enable();
        map.scrollZoom.enable();
        map.boxZoom.enable();
        map.doubleClickZoom.enable();
        map.touchZoomRotate.enable();
        return;
      }

      const [startLng, startLat] = startPointRef.current;
      const { lng, lat } = e.lngLat;

      // Calculate bounding box
      const minLng = Math.min(startLng, lng);
      const minLat = Math.min(startLat, lat);
      const maxLng = Math.max(startLng, lng);
      const maxLat = Math.max(startLat, lat);

      // Only set bbox if the box is large enough (avoid accidental clicks)
      const width = Math.abs(maxLng - minLng);
      const height = Math.abs(maxLat - minLat);
      if (width > 0.001 && height > 0.001) {
        setBbox({ bbox: `${minLng},${minLat},${maxLng},${maxLat}` });
      }

      // Clean up
      if (boxElementRef.current) {
        boxElementRef.current.remove();
        boxElementRef.current = null;
      }
      setIsDrawing(false);
      startPointRef.current = null;

      // Re-enable map interactions
      map.dragPan.enable();
      map.scrollZoom.enable();
      map.boxZoom.enable();
      map.doubleClickZoom.enable();
      map.touchZoomRotate.enable();
      canvas.style.cursor = "";
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawing) {
        if (boxElementRef.current) {
          boxElementRef.current.remove();
          boxElementRef.current = null;
        }
        setIsDrawing(false);
        startPointRef.current = null;

        // Re-enable map interactions
        map.dragPan.enable();
        map.scrollZoom.enable();
        map.boxZoom.enable();
        map.doubleClickZoom.enable();
        map.touchZoomRotate.enable();
        canvas.style.cursor = "";
      }
    };

    // Event listeners
    map.on("mousedown", handleMouseDown);
    map.on("mousemove", handleMouseMove);
    map.on("mouseup", handleMouseUp);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("keydown", handleEscape);

    return () => {
      map.off("mousedown", handleMouseDown);
      map.off("mousemove", handleMouseMove);
      map.off("mouseup", handleMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keydown", handleEscape);
      
      // Re-enable map interactions on cleanup
      map.dragPan.enable();
      map.scrollZoom.enable();
      if (boxZoom) {
        boxZoom.enable();
      }
      map.doubleClickZoom.enable();
      map.touchZoomRotate.enable();
      canvas.style.cursor = "";
      
      if (boxElementRef.current) {
        boxElementRef.current.remove();
      }
    };
  }, [map, isLoaded, enabled, isDrawing, setBbox]);

  return null;
}
