"use client";

import { useEffect, useMemo, useId } from "react";
import { useMap } from "@/components/ui/map";
import { Building } from "@/lib/buildings/types";
import { buildingsToGeoJSON, getDpeColor } from "@/lib/utils/buildings";
import MapLibreGL from "maplibre-gl";

interface BuildingsLayerProps {
  buildings: Building[];
  onBuildingClick?: (building: Building) => void;
}

export function BuildingsLayer({ buildings, onBuildingClick }: BuildingsLayerProps) {
  const { map, isLoaded } = useMap();
  const id = useId();
  const sourceId = `buildings-source-${id}`;
  const clusterLayerId = `clusters-${id}`;
  const clusterCountLayerId = `cluster-count-${id}`;
  const unclusteredLayerId = `unclustered-point-${id}`;

  const geoJSON = useMemo(
    () => buildingsToGeoJSON(buildings),
    [buildings]
  );

  // Add source and layers
  useEffect(() => {
    if (!isLoaded || !map) return;

    // Add clustered GeoJSON source
    map.addSource(sourceId, {
      type: "geojson",
      data: geoJSON,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    });

    // Add cluster circles layer
    map.addLayer({
      id: clusterLayerId,
      type: "circle",
      source: sourceId,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": [
          "step",
          ["get", "point_count"],
          "#51bbd6",
          100,
          "#f1f075",
          750,
          "#f28cb1",
        ],
        "circle-radius": [
          "step",
          ["get", "point_count"],
          20,
          100,
          30,
          750,
          40,
        ],
      },
    });

    // Add cluster count text layer
    map.addLayer({
      id: clusterCountLayerId,
      type: "symbol",
      source: sourceId,
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-size": 12,
      },
      paint: {
        "text-color": "#fff",
      },
    });

    // Add unclustered point layer with DPE-based colors
    map.addLayer({
      id: unclusteredLayerId,
      type: "circle",
      source: sourceId,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": [
          "match",
          ["get", "dpe"],
          "A",
          "#22c55e",
          "B",
          "#4ade80",
          "C",
          "#facc15",
          "D",
          "#fbbf24",
          "E",
          "#fb923c",
          "F",
          "#f97316",
          "G",
          "#ef4444",
          "#6b7280", // default gray
        ],
        "circle-radius": 8,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#fff",
      },
    });

    return () => {
      if (map.getLayer(clusterLayerId)) map.removeLayer(clusterLayerId);
      if (map.getLayer(clusterCountLayerId)) map.removeLayer(clusterCountLayerId);
      if (map.getLayer(unclusteredLayerId)) map.removeLayer(unclusteredLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map, isLoaded, sourceId, clusterLayerId, clusterCountLayerId, unclusteredLayerId, geoJSON]);

  // Update data when buildings change
  useEffect(() => {
    if (!isLoaded || !map) return;
    const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
    if (source) {
      source.setData(geoJSON);
    }
  }, [map, isLoaded, sourceId, geoJSON]);

  // Handle click events
  useEffect(() => {
    if (!isLoaded || !map || !onBuildingClick) return;

    const handlePointClick = (e: MapLibreGL.MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (feature && feature.properties) {
        const building = feature.properties as Building;
        onBuildingClick(building);
      }
    };

    const handleClusterClick = (e: MapLibreGL.MapLayerMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [clusterLayerId],
      });
      const clusterId = features[0]?.properties?.cluster_id;
      if (clusterId !== undefined) {
        const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          if (zoom === undefined) return;
          map.easeTo({
            center: (e.lngLat as any),
            zoom: zoom,
            duration: 500,
          });
        });
      }
    };

    map.on("click", unclusteredLayerId, handlePointClick);
    map.on("click", clusterLayerId, handleClusterClick);
    map.on("mouseenter", unclusteredLayerId, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", unclusteredLayerId, () => {
      map.getCanvas().style.cursor = "";
    });
    map.on("mouseenter", clusterLayerId, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", clusterLayerId, () => {
      map.getCanvas().style.cursor = "";
    });

    return () => {
      map.off("click", unclusteredLayerId, handlePointClick);
      map.off("click", clusterLayerId, handleClusterClick);
    };
  }, [map, isLoaded, unclusteredLayerId, clusterLayerId, sourceId, onBuildingClick]);

  return null;
}
