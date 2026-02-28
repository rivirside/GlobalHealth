"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { DISEASE_CATEGORY_COLORS, type Outbreak } from "@/types";

interface OutbreakMapProps {
  outbreaks: Outbreak[];
  selectedOutbreak: Outbreak | null;
  onSelectOutbreak: (outbreak: Outbreak) => void;
}

function FlyToSelected({ outbreak }: { outbreak: Outbreak | null }) {
  const map = useMap();
  if (outbreak) {
    map.flyTo([outbreak.lat, outbreak.lon], 5, { duration: 1 });
  }
  return null;
}

export default function OutbreakMap({
  outbreaks,
  selectedOutbreak,
  onSelectOutbreak,
}: OutbreakMapProps) {
  return (
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
