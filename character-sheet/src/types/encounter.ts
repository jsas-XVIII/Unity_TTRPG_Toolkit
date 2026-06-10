export interface EncounterEntry {
  monsterId: string
  count: number
  // Optional so encounters saved before template support load cleanly; treated as [] throughout.
  templateIds?: string[]
}

export interface SavedEncounter {
  id: string
  name: string
  entries: EncounterEntry[]
}
