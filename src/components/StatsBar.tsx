interface StatsBarProps {
  outbreakCount: number;
  countryCount: number;
}

export function StatsBar({ outbreakCount, countryCount }: StatsBarProps) {
  return (
    <p className="text-xs text-gray-500">
      <span className="font-semibold text-gray-700">{outbreakCount}</span>{" "}
      outbreak{outbreakCount !== 1 ? "s" : ""} across{" "}
      <span className="font-semibold text-gray-700">{countryCount}</span>{" "}
      {countryCount !== 1 ? "countries" : "country"}
    </p>
  );
}
