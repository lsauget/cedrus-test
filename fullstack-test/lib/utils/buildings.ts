import { Building } from "@/lib/buildings/types";
import { DPE_ORDER } from "@/lib/buildings/constants";

/**
 * Convert buildings array to GeoJSON FeatureCollection
 * Properties are flattened for MapLibre GL to access them directly
 */
export function buildingsToGeoJSON(
  buildings: Building[]
): GeoJSON.FeatureCollection<GeoJSON.Point, Building> {
  return {
    type: "FeatureCollection",
    features: buildings.map((building) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [building.lng, building.lat],
      },
      properties: {
        ...building,
        // Ensure DPE is accessible at top level for MapLibre expressions
        dpe: building.dpe,
      },
    })),
  };
}

/**
 * Get color for DPE rating (A=green → G=red gradient)
 */
export function getDpeColor(dpe: string): string {
  const dpeIndex = DPE_ORDER.indexOf(dpe as any);
  if (dpeIndex === -1) return "#6b7280"; // gray for unknown

  // Color gradient from green (A) to red (G)
  const colors = [
    "#22c55e", // A - green
    "#4ade80", // B - light green
    "#facc15", // C - yellow
    "#fbbf24", // D - orange-yellow
    "#fb923c", // E - orange
    "#f97316", // F - dark orange
    "#ef4444", // G - red
  ];

  return colors[dpeIndex] || "#6b7280";
}

/**
 * Calculate bounding box from buildings array
 */
export function calculateBounds(buildings: Building[]): {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
} | null {
  if (buildings.length === 0) return null;

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const building of buildings) {
    minLng = Math.min(minLng, building.lng);
    minLat = Math.min(minLat, building.lat);
    maxLng = Math.max(maxLng, building.lng);
    maxLat = Math.max(maxLat, building.lat);
  }

  return { minLng, minLat, maxLng, maxLat };
}
