/**
 * Merges an official list with a homebrew list by ID.
 * Homebrew entries with matching IDs shadow official ones; new IDs are appended.
 */
export function mergeOfficial<T extends { id: string }>(official: T[], homebrew: T[]): T[] {
  const overriddenIds = new Set(homebrew.map((item) => item.id))
  return [...official.filter((item) => !overriddenIds.has(item.id)), ...homebrew]
}
