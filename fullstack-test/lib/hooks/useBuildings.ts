"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Building, BuildingsResponse } from "@/lib/buildings/types";
import { useQueryStates, parseAsArrayOf, parseAsString } from "nuqs";

interface UseBuildingsOptions {
  limit?: number;
}

export function useBuildings(options: UseBuildingsOptions = {}) {
  const { limit = 100 } = options;
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [filters] = useQueryStates(
    {
      usage: parseAsArrayOf(parseAsString).withDefault([]),
      dpeMin: parseAsString.withDefault(""),
      dpeMax: parseAsString.withDefault(""),
      search: parseAsString.withDefault(""),
      bbox: parseAsString.withDefault(""),
    },
    {
      history: "push",
      shallow: false,
    }
  );

  const fetchBuildings = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters.usage && filters.usage.length > 0) {
        params.append("usage", filters.usage.join(","));
      }
      if (filters.dpeMin) {
        params.append("dpeMin", filters.dpeMin);
      }
      if (filters.dpeMax) {
        params.append("dpeMax", filters.dpeMax);
      }
      if (filters.search) {
        params.append("search", filters.search);
      }
      if (filters.bbox) {
        params.append("bbox", filters.bbox);
      }
      params.append("limit", limit.toString());

      const response = await fetch(`/api/buildings?${params.toString()}`, {
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch buildings: ${response.statusText}`);
      }

      const data: BuildingsResponse = await response.json();
      setBuildings(data.data);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
        console.error("Error fetching buildings:", err);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [filters.usage, filters.dpeMin, filters.dpeMax, filters.search, filters.bbox, limit]);

  useEffect(() => {
    fetchBuildings();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchBuildings]);

  return { buildings, loading, error, refetch: fetchBuildings };
}
