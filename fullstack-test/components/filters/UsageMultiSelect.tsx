"use client";

import { useQueryStates, parseAsArrayOf, parseAsString } from "nuqs";
import { BUILDING_USAGES, type BuildingUsage } from "@/lib/buildings/constants";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useMemo } from "react";

export function UsageMultiSelect() {
  const [selectedUsages, setSelectedUsages] = useQueryStates(
    {
      usage: parseAsArrayOf(parseAsString).withDefault([]),
    },
    {
      history: "push",
      shallow: false,
    }
  );

  // Validate and filter out invalid usage values from URL
  const validUsages = useMemo(() => {
    const usages = selectedUsages.usage || [];
    return usages.filter((u): u is BuildingUsage =>
      BUILDING_USAGES.includes(u as BuildingUsage)
    );
  }, [selectedUsages.usage]);

  // Sync valid usages back to URL if there were invalid ones
  useMemo(() => {
    const usages = selectedUsages.usage || [];
    const hasInvalid = usages.some(
      (u) => !BUILDING_USAGES.includes(u as BuildingUsage)
    );
    if (hasInvalid && validUsages.length !== usages.length) {
      setSelectedUsages({ usage: validUsages.length > 0 ? validUsages : null });
    }
  }, [selectedUsages.usage, validUsages, setSelectedUsages]);

  const toggleUsage = (usage: BuildingUsage) => {
    if (validUsages.includes(usage)) {
      setSelectedUsages({ usage: validUsages.filter((u) => u !== usage) });
    } else {
      setSelectedUsages({ usage: [...validUsages, usage] });
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Building Usage</label>
      <div className="grid grid-cols-2 gap-2">
        {BUILDING_USAGES.map((usage) => {
          const isSelected = validUsages.includes(usage);
          return (
            <button
              key={usage}
              type="button"
              onClick={() => toggleUsage(usage)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-accent border-input"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-4 h-4 rounded border",
                  isSelected
                    ? "bg-primary-foreground border-primary-foreground"
                    : "border-input"
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-primary" />}
              </div>
              <span className="capitalize">{usage}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
