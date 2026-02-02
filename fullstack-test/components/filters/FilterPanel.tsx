"use client";

import { UsageMultiSelect } from "./UsageMultiSelect";
import { DpeRangeSelector } from "./DpeRangeSelector";
import { SearchInput } from "./SearchInput";
import { FilterSummary } from "./FilterSummary";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  className?: string;
}

export function FilterPanel({ className }: FilterPanelProps) {
  return (
    <div
      className={cn(
        "w-full max-w-md bg-background border rounded-lg shadow-lg p-4 space-y-6",
        className
      )}
    >
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Filters</h2>
        <p className="text-sm text-muted-foreground">
          Filter buildings by usage, DPE rating, or search term
        </p>
      </div>

      <FilterSummary />

      <div className="space-y-6">
        <UsageMultiSelect />
        <DpeRangeSelector />
        <SearchInput />
      </div>
    </div>
  );
}
