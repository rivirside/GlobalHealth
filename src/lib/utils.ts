/**
 * Shared utility functions used across multiple features.
 */

/**
 * Convert a disease name to a URL-safe slug matching the pipeline's format.
 * E.g., "Ebola virus disease" → "ebola-virus-disease"
 */
export function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[()]/g, "");
}

/**
 * Convert an array of objects to CSV format and trigger a browser download.
 * Handles quoting for values containing commas, quotes, or newlines.
 */
export function downloadCsv(
  data: Record<string, unknown>[],
  filename: string
): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          const str =
            val === null || val === undefined ? "" : String(val);
          return str.includes(",") ||
            str.includes('"') ||
            str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(",")
    ),
  ];

  const blob = new Blob([csvRows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
