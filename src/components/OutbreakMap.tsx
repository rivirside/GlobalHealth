"use client";

import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Layer, LeafletMouseEvent } from "leaflet";
import { DISEASE_CATEGORY_COLORS, type Outbreak } from "@/types";

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

        {outbreaks.map((outbreak) => {
          const isSelected = selectedOutbreak?.id === outbreak.id;
          const color =
            DISEASE_CATEGORY_COLORS[outbreak.diseaseCategory] || "#6B7280";
          const radius = getMarkerRadius(outbreak.cases);

          return (
            <CircleMarker
              key={outbreak.id}
              center={[outbreak.lat, outbreak.lon]}
              radius={radius}
              pathOptions={{
                color: isSelected ? "#111827" : color,
                fillColor: color,
                fillOpacity: isSelected ? 0.9 : 0.6,
                weight: isSelected ? 3 : 1.5,
              }}
              eventHandlers={{
                click: () => onSelectOutbreak(outbreak),
              }}
            >
              <Tooltip direction="top" offset={[0, -radius]} opacity={0.95}>
                <span className="text-xs font-semibold">{outbreak.disease}</span>
                {" — "}
                <span className="text-xs">{outbreak.country}</span>
                {outbreak.cases !== null && (
                  <span className="text-xs text-gray-500">
                    {" "}({outbreak.cases.toLocaleString()} cases)
                  </span>
                )}
              </Tooltip>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{outbreak.disease}</p>
                  <p className="text-gray-600">{outbreak.country}</p>
                  {outbreak.cases !== null && (
                    <p className="text-gray-500">
                      {outbreak.cases.toLocaleString()} cases
                    </p>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
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
