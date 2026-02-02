"use client";

import { useQueryStates, parseAsString } from "nuqs";
import { DPE_ORDER, type Dpe } from "@/lib/buildings/constants";
import { cn } from "@/lib/utils";
import { useMemo, useEffect } from "react";

const DPE_COLORS = {
  A: "bg-green-500",
  B: "bg-green-400",
  C: "bg-yellow-400",
  D: "bg-yellow-500",
  E: "bg-orange-400",
  F: "bg-orange-600",
  G: "bg-red-600",
} as const;

export function DpeRangeSelector() {
  const [dpeRange, setDpeRange] = useQueryStates(
    {
      dpeMin: parseAsString.withDefault(""),
      dpeMax: parseAsString.withDefault(""),
    },
    {
      history: "push",
      shallow: false,
    }
  );

  // Validate DPE values from URL
  const validDpeMin = useMemo(() => {
    if (!dpeRange.dpeMin) return null;
    return DPE_ORDER.includes(dpeRange.dpeMin as Dpe)
      ? (dpeRange.dpeMin as Dpe)
      : null;
  }, [dpeRange.dpeMin]);

  const validDpeMax = useMemo(() => {
    if (!dpeRange.dpeMax) return null;
    return DPE_ORDER.includes(dpeRange.dpeMax as Dpe)
      ? (dpeRange.dpeMax as Dpe)
      : null;
  }, [dpeRange.dpeMax]);

  // Sync valid DPE values back to URL if there were invalid ones
  useEffect(() => {
    if (
      (dpeRange.dpeMin && !validDpeMin) ||
      (dpeRange.dpeMax && !validDpeMax)
    ) {
      setDpeRange({
        dpeMin: validDpeMin,
        dpeMax: validDpeMax,
      });
    }
  }, [dpeRange.dpeMin, dpeRange.dpeMax, validDpeMin, validDpeMax, setDpeRange]);

  const minIndex = validDpeMin ? DPE_ORDER.indexOf(validDpeMin) : -1;
  const maxIndex = validDpeMax
    ? DPE_ORDER.indexOf(validDpeMax)
    : DPE_ORDER.length;

  const handleDpeClick = (dpe: Dpe, type: "min" | "max") => {
    const dpeIndex = DPE_ORDER.indexOf(dpe);
    if (type === "min") {
      // If clicking the same min, clear it
      if (validDpeMin === dpe) {
        setDpeRange({ dpeMin: null });
      } else {
        setDpeRange({ dpeMin: dpe });
      }
    } else {
      // If clicking the same max, clear it
      if (validDpeMax === dpe) {
        setDpeRange({ dpeMax: null });
      } else {
        setDpeRange({ dpeMax: dpe });
      }
    }
  };

  const isInRange = (index: number) => {
    if (minIndex === -1 && maxIndex === DPE_ORDER.length) return false;
    if (minIndex === -1) return index <= maxIndex;
    if (maxIndex === DPE_ORDER.length) return index >= minIndex;
    return index >= minIndex && index <= maxIndex;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">DPE Rating Range</label>
        {(validDpeMin || validDpeMax) && (
          <button
            type="button"
            onClick={() => setDpeRange({ dpeMin: null, dpeMax: null })}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex items-center gap-1">
        {DPE_ORDER.map((dpe, index) => {
          const inRange = isInRange(index);
          const isMin = validDpeMin === dpe;
          const isMax = validDpeMax === dpe;

          return (
            <div key={dpe} className="flex flex-col items-center gap-1 flex-1">
              <button
                type="button"
                onClick={() => handleDpeClick(dpe, "min")}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleDpeClick(dpe, "max");
                }}
                className={cn(
                  "w-full h-8 rounded-md border-2 transition-all text-xs font-medium",
                  DPE_COLORS[dpe],
                  inRange
                    ? "opacity-100 border-foreground"
                    : "opacity-30 border-transparent",
                  isMin && "ring-2 ring-offset-2 ring-primary",
                  isMax && "ring-2 ring-offset-2 ring-primary"
                )}
                title={`Left click for min, right click for max: ${dpe}`}
              >
                {dpe}
              </button>
              <div className="text-xs text-muted-foreground">
                {isMin && "Min"}
                {isMax && "Max"}
              </div>
            </div>
          );
        })}
      </div>
      {(validDpeMin || validDpeMax) && (
        <div className="text-xs text-muted-foreground">
          Range: {validDpeMin || "A"} - {validDpeMax || "G"}
        </div>
      )}
    </div>
  );
}
