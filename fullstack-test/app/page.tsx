"use client";

import { useState } from "react";
import { Map } from "@/components/ui/map";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { useBuildings } from "@/lib/hooks/useBuildings";
import {
  BuildingsLayer,
  BuildingPopup,
  MapBoundsFitter,
  LoadingOverlay,
  DrawToFilter,
} from "@/components/map";
import { Building } from "@/lib/buildings/types";

export default function Home() {
  const { buildings, loading } = useBuildings({ limit: 100 });
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null
  );

  const handleBuildingClick = (building: Building) => {
    setSelectedBuilding(building);
  };

  const handleClosePopup = () => {
    setSelectedBuilding(null);
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-80 border-r bg-background p-4 overflow-y-auto">
        <FilterPanel />
      </aside>
      <main className="flex-1 relative">
        <div className="h-screen w-full relative">
          <Map center={[2.35, 48.85]} zoom={12}>
            <BuildingsLayer
              buildings={buildings}
              onBuildingClick={handleBuildingClick}
            />
            <MapBoundsFitter buildings={buildings} enabled={true} />
            <DrawToFilter enabled={true} />
            {selectedBuilding && (
              <BuildingPopup
                building={selectedBuilding}
                coordinates={[selectedBuilding.lng, selectedBuilding.lat]}
                onClose={handleClosePopup}
              />
            )}
          </Map>
          <LoadingOverlay loading={loading} />
        </div>
      </main>
    </div>
  );
}
