// Lightweight ID for homebrew content (monsters, abilities, powers, perks).
// Intentionally NOT a UUID — homebrew IDs only need to be locally unique.
// Character and equipment records use uuidv4() from services/localStorage.ts instead.
export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}
