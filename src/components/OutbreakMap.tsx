"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { Layer, LeafletMouseEvent } from "leaflet";
import { DISEASE_CATEGORY_COLORS, type Outbreak, type DiseaseCategory } from "@/types";

// Expose L globally so leaflet.markercluster can extend it
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).L = L;
}

interface ReadinessEntry {
  score: number;
}

interface OutbreakMapProps {
  outbreaks: Outbreak[];
  selectedOutbreak: Outbreak | null;
  onSelectOutbreak: (outbreak: Outbreak) => void;
  readinessScores?: Record<string, ReadinessEntry>;
}

function FlyToSelected({ outbreak }: { outbreak: Outbreak | null }) {
  const map = useMap();
  if (outbreak) {
    map.flyTo([outbreak.lat, outbreak.lon], 5, { duration: 1 });
  }
  return null;
}

function getReadinessColor(score: number | undefined): string {
  if (score === undefined) return "#D1D5DB";
  if (score >= 75) return "#10B981";
  if (score >= 40) return "#F59E0B";
  return "#EF4444";
}

function getReadinessLabel(score: number | undefined): string {
  if (score === undefined) return "No data";
  if (score >= 75) return "Strong";
  if (score >= 40) return "Moderate";
  return "Limited";
}

function ChoroplethLayer({ readinessScores }: { readinessScores: Record<string, ReadinessEntry> }) {
  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    fetch("/world.geojson")
      .then((r) => r.json())
      .then(setGeoData)
      .catch(() => {});
  }, []);

  const style = useCallback(
    (feature: GeoJSON.Feature | undefined) => {
      const iso3 = feature?.properties?.ISO_A3;
      const score = iso3 ? readinessScores[iso3]?.score : undefined;
      return {
        fillColor: getReadinessColor(score),
        weight: 0.5,
        opacity: 0.8,
        color: "#FFFFFF",
        fillOpacity: score !== undefined ? 0.5 : 0.1,
      };
    },
    [readinessScores]
  );

  const onEachFeature = useCallback(
    (feature: GeoJSON.Feature, layer: Layer) => {
      const iso3 = feature.properties?.ISO_A3;
      const name = feature.properties?.NAME;
      const score = iso3 ? readinessScores[iso3]?.score : undefined;
      layer.bindTooltip(
        `<strong>${name}</strong><br/>Readiness: ${score !== undefined ? `${Math.round(score)} (${getReadinessLabel(score)})` : "No data"}`,
        { sticky: true }
      );
      layer.on({
        mouseover: (e: LeafletMouseEvent) => {
          e.target.setStyle({ weight: 2, color: "#111827", fillOpacity: 0.7 });
        },
        mouseout: (e: LeafletMouseEvent) => {
          e.target.setStyle(style(feature));
        },
      });
    },
    [readinessScores, style]
  );

  if (!geoData) return null;

  return (
    <GeoJSON
      key={JSON.stringify(readinessScores).length}
      data={geoData}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}

function ChoroplethLegend() {
  return (
    <div className="absolute bottom-6 left-3 z-[1000] bg-white rounded-lg shadow-md border border-gray-200 p-3">
      <p className="text-xs font-semibold text-gray-700 mb-2">Readiness Score</p>
      <div className="space-y-1.5">
        {[
          { color: "#10B981", label: "Strong (75+)" },
          { color: "#F59E0B", label: "Moderate (40–74)" },
          { color: "#EF4444", label: "Limited (<40)" },
          { color: "#D1D5DB", label: "No data" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color, opacity: 0.6 }} />
            <span className="text-xs text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Severity ranking for cluster color: highest-severity disease category wins
const SEVERITY_RANK: Record<string, number> = {
  hemorrhagic: 6,
  respiratory: 5,
  "vaccine-preventable": 4,
  "vector-borne": 3,
  diarrheal: 2,
  zoonotic: 1,
  other: 0,
};

function ClusteredMarkers({
  outbreaks,
  selectedOutbreak,
  onSelectOutbreak,
}: {
  outbreaks: Outbreak[];
  selectedOutbreak: Outbreak | null;
  onSelectOutbreak: (outbreak: Outbreak) => void;
}) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const [pluginReady, setPluginReady] = useState(false);

  // Load leaflet.markercluster plugin dynamically (needs window.L set first)
  useEffect(() => {
    import("leaflet.markercluster").then(() => setPluginReady(true));
  }, []);

  useEffect(() => {
    if (!pluginReady) return;

    // Clean up previous cluster group
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current);
    }

    const cluster = L.markerClusterGroup({
      maxClusterRadius: 45,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (c) => {
        const childMarkers = c.getAllChildMarkers();
        const count = childMarkers.length;

        // Find the most severe disease category in this cluster
        let maxRank = -1;
        let dominantColor = "#6B7280";
        for (const m of childMarkers) {
          const cat = (m.options as { diseaseCategory?: string }).diseaseCategory || "other";
          const rank = SEVERITY_RANK[cat] ?? 0;
          if (rank > maxRank) {
            maxRank = rank;
            dominantColor = DISEASE_CATEGORY_COLORS[cat as DiseaseCategory] || "#6B7280";
          }
        }

        const size = count < 10 ? 36 : count < 50 ? 44 : 52;
        return L.divIcon({
          html: `<div style="
            background: ${dominantColor};
            opacity: 0.75;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: 600;
            border: 2px solid rgba(255,255,255,0.8);
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">${count}</div>`,
          className: "",
          iconSize: L.point(size, size),
          iconAnchor: L.point(size / 2, size / 2),
        });
      },
    });

    for (const outbreak of outbreaks) {
      const color = DISEASE_CATEGORY_COLORS[outbreak.diseaseCategory] || "#6B7280";
      const radius = getMarkerRadius(outbreak.cases);
      const isSelected = selectedOutbreak?.id === outbreak.id;
      const d = radius * 2;

      const marker = L.marker([outbreak.lat, outbreak.lon], {
        icon: L.divIcon({
          html: `<div style="
            width: ${d}px;
            height: ${d}px;
            border-radius: 50%;
            background: ${color};
            opacity: ${isSelected ? 0.9 : 0.6};
            border: ${isSelected ? "3px solid #111827" : `1.5px solid ${color}`};
            box-sizing: border-box;
          "></div>`,
          className: "",
          iconSize: L.point(d, d),
          iconAnchor: L.point(radius, radius),
        }),
        // Store category on options for cluster icon coloring
        diseaseCategory: outbreak.diseaseCategory,
      } as L.MarkerOptions & { diseaseCategory: string });

      const tooltipContent = `<span style="font-size:12px;font-weight:600">${outbreak.disease}</span> — <span style="font-size:12px">${outbreak.country}</span>${outbreak.cases !== null ? ` <span style="font-size:12px;color:#6B7280">(${outbreak.cases.toLocaleString()} cases)</span>` : ""}`;
      marker.bindTooltip(tooltipContent, { direction: "top", offset: L.point(0, -radius) });

      marker.on("click", () => onSelectOutbreak(outbreak));
      cluster.addLayer(marker);
    }

    map.addLayer(cluster);
    clusterRef.current = cluster;

    return () => {
      map.removeLayer(cluster);
      clusterRef.current = null;
    };
  }, [outbreaks, selectedOutbreak, onSelectOutbreak, map, pluginReady]);

  return null;
}

export default function OutbreakMap({
  outbreaks,
  selectedOutbreak,
  onSelectOutbreak,
  readinessScores,
}: OutbreakMapProps) {
  const [showChoropleth, setShowChoropleth] = useState(false);

  return (
    <div className="relative h-full w-full">
      {/* Layer toggle */}
      <div className="absolute top-3 right-3 z-[1000] flex bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <button
          onClick={() => setShowChoropleth(false)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            !showChoropleth
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Outbreaks
        </button>
        <button
          onClick={() => setShowChoropleth(true)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            showChoropleth
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
          disabled={!readinessScores}
        >
          Readiness
        </button>
      </div>

      {showChoropleth && <ChoroplethLegend />}

      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={10}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <FlyToSelected outbreak={selectedOutbreak} />

        {showChoropleth && readinessScores && (
          <ChoroplethLayer readinessScores={readinessScores} />
        )}

        <ClusteredMarkers
          outbreaks={outbreaks}
          selectedOutbreak={selectedOutbreak}
          onSelectOutbreak={onSelectOutbreak}
        />
      </MapContainer>
    </div>
  );
}

function getMarkerRadius(cases: number | null): number {
  if (cases === null) return 6;
  if (cases < 10) return 5;
  if (cases < 100) return 7;
  if (cases < 1000) return 9;
  if (cases < 10000) return 12;
  return 15;
}
