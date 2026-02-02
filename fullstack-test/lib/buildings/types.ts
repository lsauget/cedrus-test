import { NextRequest } from "next/server";
import { Dpe } from "./constants";

export interface Building {
  id: string;
  name: string;
  city: string;
  address: string;
  usage: string;
  dpe: Dpe;
  lat: number;
  lng: number;
  surface: number;
  floors: number;
  constructionYear: number;
}

export interface QueryParams {
  usage?: string[];
  dpeMin?: Dpe;
  dpeMax?: Dpe;
  search?: string;
  bbox?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  cursor?: string;
  limit?: number;
  sort?: string;
}

export interface Cursor {
  sortValue: string | number;
  id: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface BuildingsResponse {
  data: Building[];
  pagination: {
    nextCursor: string | null;
    totalCount: number;
  };
  aggregations: {
    byUsage: Record<string, number>;
    byDpe: Record<string, number>;
  };
}
