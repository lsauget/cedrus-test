"use client";

import { useQueryStates, parseAsArrayOf, parseAsString } from "nuqs";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function FilterSummary() {
  const [filters, setFilters] = useQueryStates(
    {
      usage: parseAsArrayOf(parseAsString).withDefault([]),
      dpeMin: parseAsString.withDefault(""),
      dpeMax: parseAsString.withDefault(""),
      search: parseAsString.withDefault(""),
    },
    {
      history: "push",
      shallow: false,
    }
  );

  const activeFilterCount =
    (filters.usage?.length ?? 0) +
    (filters.dpeMin ? 1 : 0) +
    (filters.dpeMax ? 1 : 0) +
    (filters.search ? 1 : 0);

  const clearAll = () => {
    setFilters({
      usage: null,
      dpeMin: null,
      dpeMax: null,
      search: null,
    });
  };

  if (activeFilterCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} active
        </span>
        <div className="flex flex-wrap gap-1">
          {filters.usage?.map((usage) => (
            <span
              key={usage}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-background border rounded"
            >
              Usage: {usage}
              <button
                type="button"
                onClick={() => {
                  const newUsage = filters.usage?.filter((u) => u !== usage) || [];
                  setFilters({ usage: newUsage.length > 0 ? newUsage : null });
                }}
                className="hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {filters.dpeMin && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-background border rounded">
              DPE Min: {filters.dpeMin}
              <button
                type="button"
                onClick={() => setFilters({ dpeMin: null })}
                className="hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.dpeMax && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-background border rounded">
              DPE Max: {filters.dpeMax}
              <button
                type="button"
                onClick={() => setFilters({ dpeMax: null })}
                className="hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-background border rounded">
              Search: {filters.search}
              <button
                type="button"
                onClick={() => setFilters({ search: null })}
                className="hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={clearAll}
        className="text-sm text-muted-foreground hover:text-foreground font-medium"
      >
        Clear all
      </button>
    </div>
  );
}
