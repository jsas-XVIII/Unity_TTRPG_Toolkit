// api.ts — defines the CharacterRepository interface.
//
// This is the contract that both persistence backends must satisfy:
//   - LocalStorageRepository  (Phase 1 — browser storage, no server)
//   - RestApiRepository       (Phase 2 — C# ASP.NET Core + SQLite)
//
// Components and hooks only ever interact with this interface, never with a
// concrete implementation directly. Swapping backends (localStorage → REST API)
// requires only changing the env variable VITE_USE_API — zero component changes.

import type { Character, CharacterSummary, CreateCharacterDto } from '../types/character'

export interface CharacterRepository {
  // Returns lightweight summaries (id, name, class, race, level) for listing characters
  getAll(): Promise<CharacterSummary[]>

  // Returns the full character object by UUID
  getById(id: string): Promise<Character>

  // Creates a new character record; the implementation assigns the UUID
  create(character: CreateCharacterDto): Promise<Character>

  // Partial update — only the provided fields are merged into the stored record
  update(id: string, character: Partial<Character>): Promise<Character>

  // Permanently removes a character record
  delete(id: string): Promise<void>
}
