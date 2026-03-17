"use client";

import { useEffect } from "react";
import { useMap } from "@/components/ui/map";

const SOURCE_ID = "lake-markers";
const CLUSTERS_LAYER_ID = "clusters";
const CLUSTER_COUNT_LAYER_ID = "cluster-count";
const MARKERS_LAYER_ID = "markers";
const SOURCE_LAYER = "markers";

export function MarkerTileLayer({
  tileUrl = "https://5b6a-103-159-214-137.ngrok-free.app/api/lakes/markers/{z}/{x}/{y}.mvt",
}: {
  tileUrl?: string;
}) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;

    // Clean up in case of hot reload or remount.
    [CLUSTER_COUNT_LAYER_ID, CLUSTERS_LAYER_ID, MARKERS_LAYER_ID].forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);

    // Add the vector tile source
    map.addSource(SOURCE_ID, {
      type: "vector",
      tiles: [tileUrl],
      minzoom: 0,
      maxzoom: 18,
    });

    // ── Cluster circles ──────────────────────────────────────────
    map.addLayer({
      id: CLUSTERS_LAYER_ID,
      type: "circle",
      source: SOURCE_ID,
      "source-layer": SOURCE_LAYER,
      filter: ["==", ["get", "is_cluster"], true],
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["get", "point_count"],
          1,
          16,
          50,
          28,
          500,
          44,
          5000,
          60,
        ],
        // Color by avg_wqi: green = good, red = poor
        "circle-color": [
          "interpolate",
          ["linear"],
          ["get", "avg_wqi"],
          0,
          "#e74c3c", // poor
          50,
          "#f39c12", // moderate
          100,
          "#27ae60", // good
        ],
        "circle-opacity": 0.88,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });

    // ── Cluster count labels ─────────────────────────────────────
    map.addLayer({
      id: CLUSTER_COUNT_LAYER_ID,
      type: "symbol",
      source: SOURCE_ID,
      "source-layer": SOURCE_LAYER,
      filter: ["==", ["get", "is_cluster"], true],
      layout: {
        "text-field": ["to-string", ["get", "point_count"]],
        "text-size": 12,
      },
      paint: { "text-color": "#ffffff" },
    });

    // ── Individual markers ───────────────────────────────────────
    map.addLayer({
      id: MARKERS_LAYER_ID,
      type: "circle",
      source: SOURCE_ID,
      "source-layer": SOURCE_LAYER,
      filter: ["==", ["get", "is_cluster"], false],
      paint: {
        "circle-radius": 7,
        "circle-color": [
          "interpolate",
          ["linear"],
          ["get", "wqi"],
          0,
          "#e74c3c",
          50,
          "#f39c12",
          100,
          "#27ae60",
        ],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });

    return () => {
      try {
        [CLUSTER_COUNT_LAYER_ID, CLUSTERS_LAYER_ID, MARKERS_LAYER_ID].forEach((id) => {
          if (map.getLayer(id)) map.removeLayer(id);
        });
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      } catch {
        // ignore
      }
    };
  }, [map, isLoaded, tileUrl]);

  return null;
}

