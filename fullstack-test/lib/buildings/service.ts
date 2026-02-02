import { Building, QueryParams, Cursor } from "./types";
import { Dpe, DPE_ORDER } from "./constants";

export function decodeCursor(cursor: string): Cursor | null {
  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded);
    return parsed as Cursor;
  } catch {
    return null;
  }
}

export function encodeCursor(sortValue: string | number, id: string): string {
  const cursor: Cursor = { sortValue, id };
  return Buffer.from(JSON.stringify(cursor)).toString("base64");
}

export function getSortValue(building: Building, sortField: string): string | number {
  switch (sortField) {
    case "name":
      return building.name.toLowerCase();
    case "dpe":
      return building.dpe;
    case "city":
      return building.city.toLowerCase();
    case "constructionYear":
      return building.constructionYear;
    default:
      return building.id;
  }
}

export function compareBuildings(a: Building, b: Building, sortField: string): number {
  const aValue = getSortValue(a, sortField);
  const bValue = getSortValue(b, sortField);

  if (sortField === "dpe") {
    // For DPE, use the order array
    const aIndex = DPE_ORDER.indexOf(a.dpe);
    const bIndex = DPE_ORDER.indexOf(b.dpe);
    if (aIndex !== bIndex) return aIndex - bIndex;
  } else if (sortField === "constructionYear") {
    // For numbers, compare directly
    if (aValue < bValue) return -1;
    if (aValue > bValue) return 1;
  } else {
    // For strings, compare lexicographically
    if (aValue < bValue) return -1;
    if (aValue > bValue) return 1;
  }

  // Secondary sort by id for stability
  return a.id.localeCompare(b.id);
}

export function filterBuildings(buildings: Building[], params: QueryParams): Building[] {
  return buildings.filter((building) => {
    // Filter by usage
    if (params.usage && params.usage.length > 0) {
      if (!params.usage.includes(building.usage)) {
        return false;
      }
    }

    // Filter by DPE range
    // Note: Lower index = better DPE (A=0 is best, G=6 is worst)
    if (params.dpeMin || params.dpeMax) {
      const buildingDpeIndex = DPE_ORDER.indexOf(building.dpe);
      if (buildingDpeIndex === -1) return false;

      if (params.dpeMin) {
        const minIndex = DPE_ORDER.indexOf(params.dpeMin);
        // Building must be at least as good as min (lower or equal index)
        if (buildingDpeIndex > minIndex) return false;
      }

      if (params.dpeMax) {
        const maxIndex = DPE_ORDER.indexOf(params.dpeMax);
        // Building must be at most as bad as max (higher or equal index)
        if (buildingDpeIndex < maxIndex) return false;
      }
    }

    // Filter by search (full-text on name, address, city)
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      const matchesName = building.name.toLowerCase().includes(searchLower);
      const matchesAddress = building.address.toLowerCase().includes(searchLower);
      const matchesCity = building.city.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesAddress && !matchesCity) {
        return false;
      }
    }

    // Filter by bounding box
    if (params.bbox) {
      const [minLng, minLat, maxLng, maxLat] = params.bbox;
      if (
        building.lng < minLng ||
        building.lng > maxLng ||
        building.lat < minLat ||
        building.lat > maxLat
      ) {
        return false;
      }
    }

    return true;
  });
}

export function calculateAggregations(buildings: Building[]): {
  byUsage: Record<string, number>;
  byDpe: Record<string, number>;
} {
  const byUsage: Record<string, number> = {};
  const byDpe: Record<string, number> = {};

  for (const building of buildings) {
    byUsage[building.usage] = (byUsage[building.usage] || 0) + 1;
    byDpe[building.dpe] = (byDpe[building.dpe] || 0) + 1;
  }

  return { byUsage, byDpe };
}

export function sortBuildings(buildings: Building[], sortField: string): Building[] {
  const sorted = [...buildings];
  sorted.sort((a, b) => compareBuildings(a, b, sortField));
  return sorted;
}

export function paginateBuildings(
  buildings: Building[],
  cursor: string | undefined,
  limit: number,
  sortField: string
): {
  data: Building[];
  nextCursor: string | null;
  startIndex: number;
} {
  let startIndex = 0;

  if (cursor) {
    const decodedCursor = decodeCursor(cursor);
    if (decodedCursor) {
      // Find the index where we should start (after the cursor position)
      for (let i = 0; i < buildings.length; i++) {
        const building = buildings[i];
        const sortValue = getSortValue(building, sortField);

        // Compare with cursor to determine if we should start after this position
        let isAfterCursor = false;

        if (sortField === "dpe") {
          const cursorDpeIndex = DPE_ORDER.indexOf(decodedCursor.sortValue as Dpe);
          const buildingDpeIndex = DPE_ORDER.indexOf(building.dpe);
          isAfterCursor =
            buildingDpeIndex > cursorDpeIndex ||
            (buildingDpeIndex === cursorDpeIndex && building.id > decodedCursor.id);
        } else if (sortField === "constructionYear") {
          isAfterCursor =
            building.constructionYear > (decodedCursor.sortValue as number) ||
            (building.constructionYear === decodedCursor.sortValue &&
              building.id > decodedCursor.id);
        } else {
          // String comparison
          const cursorStr = String(decodedCursor.sortValue).toLowerCase();
          const buildingStr = String(sortValue).toLowerCase();
          isAfterCursor =
            buildingStr > cursorStr ||
            (buildingStr === cursorStr && building.id > decodedCursor.id);
        }

        if (isAfterCursor) {
          startIndex = i;
          break;
        }
      }
    }
  }

  // Apply pagination
  const paginated = buildings.slice(startIndex, startIndex + limit);

  // Generate next cursor
  let nextCursor: string | null = null;
  if (paginated.length === limit && startIndex + limit < buildings.length) {
    const lastBuilding = paginated[paginated.length - 1];
    const lastSortValue = getSortValue(lastBuilding, sortField);
    nextCursor = encodeCursor(lastSortValue, lastBuilding.id);
  }

  return {
    data: paginated,
    nextCursor,
    startIndex,
  };
}
