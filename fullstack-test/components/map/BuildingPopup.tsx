"use client";

import { Building } from "@/lib/buildings/types";
import { MapPopup } from "@/components/ui/map";
import { getDpeColor } from "@/lib/utils/buildings";
import { cn } from "@/lib/utils";

interface BuildingPopupProps {
  building: Building;
  coordinates: [number, number];
  onClose?: () => void;
}

export function BuildingPopup({
  building,
  coordinates,
  onClose,
}: BuildingPopupProps) {
  const dpeColor = getDpeColor(building.dpe);

  return (
    <MapPopup
      longitude={coordinates[0]}
      latitude={coordinates[1]}
      onClose={onClose}
      closeButton={true}
      className="max-w-xs"
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base">{building.name}</h3>
          <div
            className={cn(
              "w-6 h-6 rounded-full border-2 border-foreground flex items-center justify-center text-xs font-bold"
            )}
            style={{ backgroundColor: dpeColor }}
          >
            {building.dpe}
          </div>
        </div>
        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground">{building.address}</p>
          <p className="text-muted-foreground">{building.city}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <div>
            <span className="text-xs text-muted-foreground">Usage</span>
            <p className="text-sm font-medium capitalize">{building.usage}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">DPE</span>
            <p className="text-sm font-medium">{building.dpe}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Surface</span>
            <p className="text-sm font-medium">
              {building.surface.toLocaleString()} m²
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Floors</span>
            <p className="text-sm font-medium">{building.floors}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Year</span>
            <p className="text-sm font-medium">{building.constructionYear}</p>
          </div>
        </div>
      </div>
    </MapPopup>
  );
}
