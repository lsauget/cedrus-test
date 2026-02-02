"use client";

import { useEffect, useRef } from "react";
import { useMap } from "@/components/ui/map";
import { Building } from "@/lib/buildings/types";
import { calculateBounds } from "@/lib/utils/buildings";

interface MapBoundsFitterProps {
  buildings: Building[];
  enabled?: boolean;
  padding?: number;
}

export function MapBoundsFitter({
  buildings,
  enabled = true,
  padding = 50,
}: MapBoundsFitterProps) {
  const { map, isLoaded } = useMap();
  const previousBuildingsRef = useRef<Building[]>([]);

  useEffect(() => {
    if (!isLoaded || !map || !enabled || buildings.length === 0) return;

    // Only fit bounds if buildings have changed
    const buildingsChanged =
      previousBuildingsRef.current.length !== buildings.length ||
      previousBuildingsRef.current.some(
        (prev, index) => prev.id !== buildings[index]?.id
      );

    if (!buildingsChanged) return;

    const bounds = calculateBounds(buildings);
    if (!bounds) return;

    try {
      map.fitBounds(
        [
          [bounds.minLng, bounds.minLat],
          [bounds.maxLng, bounds.maxLat],
        ],
        {
          padding: padding,
          duration: 500,
        }
      );
    } catch (error) {
      console.error("Error fitting bounds:", error);
    }

    previousBuildingsRef.current = buildings;
  }, [map, isLoaded, buildings, enabled, padding]);

  return null;
}
