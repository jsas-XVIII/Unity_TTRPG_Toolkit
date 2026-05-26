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
// Module-scope cache — avoids re-parsing and re-migrating on every read.
// ---------------------------------------------------------------------------

let cache: Character[] | null = null

export function invalidateCharacterCache(): void {
  cache = null
}

// Invalidate when another tab writes to the same key.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY || e.key === null) cache = null
  })
}

// ---------------------------------------------------------------------------
// Internal helpers — not part of the public interface
// ---------------------------------------------------------------------------

// Saves the raw blob to a write-once backup key so corrupt data can be recovered.
// Best-effort: never throws, never overwrites an existing backup.
// [JSas | 2026-05-25] Added: corruption resilience — back up before discarding bad data
function backupCorruptBlob(raw: string): void {
  try {
    const backupKey = `${STORAGE_KEY}__backup`
    if (localStorage.getItem(backupKey) === null) {
      localStorage.setItem(backupKey, raw)
    }
  } catch {
    // Intentionally swallowed — backup must never break a load.
  }
}

// Reads and deserialises all characters from localStorage.
// null storage  → empty roster, no backup (legitimate first-run state).
// Corrupt blob  → backup written, empty roster returned.
// Bad record    → that record skipped, backup written, others survive.
// [JSas | 2026-05-25] Modified: per-record try/catch so one bad entry doesn't wipe the whole roster
function loadAll(): Character[] {
  if (cache !== null) return cache

  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === null) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    backupCorruptBlob(raw)
    cache = []
    return cache
  }

  if (!Array.isArray(parsed)) {
    backupCorruptBlob(raw)
    cache = []
    return cache
  }

  const survivors: Character[] = []
  let anyDropped = false
  for (const record of parsed) {
    try {
      survivors.push(migrateCharacter(record as Character))
    } catch {
      anyDropped = true
    }
  }
  if (anyDropped) backupCorruptBlob(raw)
  cache = survivors
  return cache
}

// Serialises the full character array back to localStorage.
// Throws QuotaExceededError if the browser storage limit is reached — callers must handle it.
function saveAll(characters: Character[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters))
  cache = characters
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
    try {
      saveAll(characters)
    } catch (e) {
      cache = null
      throw e
    }
    return character
  },

  async update(id: string, patch: Partial<Character>): Promise<Character> {
    const characters = loadAll()
    const index = characters.findIndex((c) => c.id === id)
    if (index === -1) throw new Error(`Character ${id} not found`)
    // Merge patch fields onto the existing record
    characters[index] = { ...characters[index], ...patch }
    try {
      saveAll(characters)
    } catch (e) {
      cache = null
      throw e
    }
    return characters[index]
  },

  async delete(id: string): Promise<void> {
    const characters = loadAll().filter((c) => c.id !== id)
    saveAll(characters)
  },
}
