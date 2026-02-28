import { getOutbreaks } from "@/lib/data";
import { OutbreakTimeline } from "@/components/OutbreakTimeline";

export const metadata = {
  title: "Outbreak Timeline | Outbreak Context",
  description: "Historical timeline of disease outbreak reports worldwide.",
};

export default function TimelinePage() {
  const outbreaks = getOutbreaks();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Outbreak Timeline
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Monthly breakdown of WHO Disease Outbreak News reports. Use filters to
        explore trends by category or country.
      </p>
      <OutbreakTimeline outbreaks={outbreaks} />
    </div>
  );
}
