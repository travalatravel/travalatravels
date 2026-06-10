/** Turn Travala autocomplete labels into terms that match our local hotel catalog. */
export function normalizeSearchQuery(raw: string): string {
  const clean = raw.replace(/<[^>]*>/g, "").trim();
  if (!clean) return "";

  const parts = clean.split(",").map((p) => p.trim()).filter(Boolean);
  const first = (parts[0] || clean)
    .replace(/\s*\(and vicinity\)/i, "")
    .replace(/\s*\([^)]*\)\s*$/g, "")
    .trim();

  return first || clean;
}

/** Variants to try when matching SQLite (comma-separated Travala names, provinces, etc.). */
export function searchTermsForQuery(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const terms = new Set<string>();
  terms.add(trimmed);

  const primary = normalizeSearchQuery(trimmed);
  if (primary) terms.add(primary);

  for (const part of trimmed.split(",").map((p) => p.trim()).filter(Boolean)) {
    terms.add(part);
    const stripped = part.replace(/\s*\(and vicinity\)/i, "").replace(/\s*\([^)]*\)\s*$/g, "").trim();
    if (stripped) terms.add(stripped);
  }

  return [...terms].filter(Boolean);
}
