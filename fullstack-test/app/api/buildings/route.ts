import { NextRequest } from "next/server";

import buildings from "@/data/buildings.json";
import { Building, BuildingsResponse } from "@/lib/buildings/types";
import { parseQueryParams, validateParams } from "@/lib/buildings/validation";
import {
  filterBuildings,
  sortBuildings,
  calculateAggregations,
  paginateBuildings,
} from "@/lib/buildings/service";

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const params = parseQueryParams(request);

    // Validate parameters
    const validation = validateParams(params);
    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    // Set defaults
    const limit = params.limit || 20;
    const sortField = params.sort || "id";

    // Filter buildings
    let filtered = filterBuildings(buildings as Building[], params);

    // Calculate aggregations on filtered data (before sorting/pagination)
    const aggregations = calculateAggregations(filtered);

    // Sort buildings
    const sorted = sortBuildings(filtered, sortField);

    // Apply pagination
    const { data: paginated, nextCursor } = paginateBuildings(
      sorted,
      params.cursor,
      limit,
      sortField
    );

    // Get total count before pagination
    const totalCount = sorted.length;

    // Return response
    const response: BuildingsResponse = {
      data: paginated,
      pagination: {
        nextCursor,
        totalCount,
      },
      aggregations,
    };

    return Response.json(response);
  } catch (error) {
    console.error("Error in GET /api/buildings:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
