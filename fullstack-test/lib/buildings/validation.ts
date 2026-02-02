import { NextRequest } from "next/server";
import { QueryParams, ValidationResult } from "./types";
import { DPE_ORDER, Dpe, SORT_FIELDS } from "./constants";

export function parseQueryParams(request: NextRequest): QueryParams {
  const searchParams = request.nextUrl.searchParams;
  const params: QueryParams = {};

  // Parse usage (comma-separated)
  const usageParam = searchParams.get("usage");
  if (usageParam) {
    params.usage = usageParam.split(",").map((u) => u.trim()).filter(Boolean);
  }

  // Parse DPE range
  params.dpeMin = searchParams.get("dpeMin") as Dpe || undefined;
  params.dpeMax = searchParams.get("dpeMax") as Dpe || undefined;

  // Parse search
  params.search = searchParams.get("search") || undefined;

  // Parse bbox (minLng,minLat,maxLng,maxLat)
  const bboxParam = searchParams.get("bbox");
  if (bboxParam) {
    const parts = bboxParam.split(",").map((p) => parseFloat(p.trim()));
    if (parts.length === 4 && parts.every((p) => !isNaN(p))) {
      params.bbox = [parts[0], parts[1], parts[2], parts[3]];
    }
  }

  // Parse cursor
  params.cursor = searchParams.get("cursor") || undefined;

  // Parse limit
  const limitParam = searchParams.get("limit");
  if (limitParam) {
    const limit = parseInt(limitParam, 10);
    if (!isNaN(limit)) {
      params.limit = Math.min(Math.max(1, limit), 100); // Clamp between 1 and 100
    }
  }

  // Parse sort
  params.sort = searchParams.get("sort") || undefined;

  return params;
}

export function validateParams(params: QueryParams): ValidationResult {
  // Validate DPE ratings
  if (params.dpeMin && !DPE_ORDER.includes(params.dpeMin)) {
    return {
      valid: false,
      error: `Invalid dpeMin: ${params.dpeMin}. Must be one of: ${DPE_ORDER.join(", ")}`,
    };
  }
  if (params.dpeMax && !DPE_ORDER.includes(params.dpeMax)) {
    return {
      valid: false,
      error: `Invalid dpeMax: ${params.dpeMax}. Must be one of: ${DPE_ORDER.join(", ")}`,
    };
  }

  // Validate sort field
  if (params.sort && !SORT_FIELDS.includes(params.sort as any)) {
    return {
      valid: false,
      error: `Invalid sort: ${params.sort}. Must be one of: ${SORT_FIELDS.join(", ")}`,
    };
  }

  // Validate bbox
  if (params.bbox) {
    const [minLng, minLat, maxLng, maxLat] = params.bbox;
    if (minLng >= maxLng || minLat >= maxLat) {
      return {
        valid: false,
        error: "Invalid bbox: min values must be less than max values",
      };
    }
    if (minLng < -180 || maxLng > 180 || minLat < -90 || maxLat > 90) {
      return {
        valid: false,
        error: "Invalid bbox: coordinates out of valid range",
      };
    }
  }

  return { valid: true };
}
