"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import type { Outbreak, ReadinessScore, DiseaseCategory } from "@/types";

const OutbreakMap = dynamic(() => import("@/components/OutbreakMap"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-2" />
        <p className="text-sm text-gray-500">Loading map...</p>
      </div>
    </div>
  ),
});

function EmbedMapInner() {
  const searchParams = useSearchParams();
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [readiness, setReadiness] = useState<Record<string, ReadinessScore>>({});
  const [loading, setLoading] = useState(true);

  const disease = searchParams.get("disease") || "";
  const activeOnly = searchParams.get("active") === "1";
  const showChoropleth = searchParams.get("choropleth") === "1";

  useEffect(() => {
    Promise.all([
      fetch("/api/outbreaks").then((r) => r.json()),
      fetch("/api/readiness/all").then((r) => (r.ok ? r.json() : {})),
    ])
      .then(([outbreakData, readinessData]) => {
        setOutbreaks(outbreakData);
        setReadiness(readinessData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = outbreaks.filter((o) => {
    if (disease && o.diseaseCategory !== (disease as DiseaseCategory)) return false;
    if (activeOnly && o.status !== "active") return false;
    return true;
  });

  if (loading) return null;

  return (
    <div className="h-screen w-screen relative">
      <OutbreakMap
        outbreaks={filtered}
        selectedOutbreak={null}
        onSelectOutbreak={() => {}}
        readinessScores={showChoropleth ? readiness : undefined}
      />
      <a
        href="https://global-health-two.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 left-2 z-[1000] bg-white/90 backdrop-blur-sm border border-gray-200 rounded px-2 py-1 text-[10px] text-gray-500 hover:text-blue-600 no-underline"
      >
        Powered by <span className="font-semibold">Outbreak Context</span>
      </a>
    </div>
  );
}

export default function EmbedPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen bg-gray-100 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    }>
      <EmbedMapInner />
    </Suspense>
  );
}
