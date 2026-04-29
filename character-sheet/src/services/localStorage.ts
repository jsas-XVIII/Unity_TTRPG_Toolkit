// localStorage.ts — Phase 1 persistence implementation of CharacterRepository.
//
// All characters are stored as a single JSON array under the key
// "unity_ttrpg_characters" in the browser's localStorage.
// This means data survives page refreshes but is scoped to the browser/device.
//
// Why a single array instead of one key per character?
// Simpler to iterate for getAll() and keeps the storage structure easy to inspect
// in DevTools. With a small number of characters (typical for a TTRPG group) the
// parse overhead is negligible.

import { v4 as uuidv4 } from 'uuid'
import type { CharacterRepository } from './api'
import type { Character, CharacterSummary, CreateCharacterDto } from '../types/character'
import { migrateCharacter } from '../utils/importCharacter'

const STORAGE_KEY = 'unity_ttrpg_characters'

// ---------------------------------------------------------------------------
// Internal helpers — not part of the public interface
// ---------------------------------------------------------------------------

// Reads and deserialises all characters from localStorage.
// Returns an empty array on parse failure so a corrupt entry doesn't crash the app.
function loadAll(): Character[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const characters: Character[] = raw ? (JSON.parse(raw) as Character[]) : []
    return characters.map(migrateCharacter)
  } catch {
    return []
  }
}

// Serialises the full character array back to localStorage.
// Throws QuotaExceededError if the browser storage limit is reached — callers must handle it.
function saveAll(characters: Character[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters))
}

// ---------------------------------------------------------------------------
// Repository implementation
// ---------------------------------------------------------------------------
export const localStorageRepository: CharacterRepository = {
  async getAll(): Promise<CharacterSummary[]> {
    // Only expose the fields needed for a character list — avoids passing large objects around
    return loadAll().map(({ id, name, className, race, level }) => ({
      id,
      name,
      className,
      race,
      level,
    }))
  },

  async getById(id: string): Promise<Character> {
    const found = loadAll().find((c) => c.id === id)
    if (!found) throw new Error(`Character ${id} not found`)
    return found
  },

  async create(dto: CreateCharacterDto): Promise<Character> {
    const characters = loadAll()
    // Preserve the id if the dto already has one (e.g. an imported character).
    // Only generate a fresh UUID when no id is supplied (e.g. new characters from the wizard).
    const character: Character = { ...dto, id: dto.id ?? uuidv4() }
    characters.push(character)
    saveAll(characters)
    return character
  },

  async update(id: string, patch: Partial<Character>): Promise<Character> {
    const characters = loadAll()
    const index = characters.findIndex((c) => c.id === id)
    if (index === -1) throw new Error(`Character ${id} not found`)
    // Merge patch fields onto the existing record
    characters[index] = { ...characters[index], ...patch }
    saveAll(characters)
    return characters[index]
  },

  async delete(id: string): Promise<void> {
    const characters = loadAll().filter((c) => c.id !== id)
    saveAll(characters)
  },
}
