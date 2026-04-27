// importCharacter.ts — reads an imported JSON file and checks whether the
// character already exists in storage.
//
// Returns a discriminated union so the caller decides what to do:
//   { status: 'new',       parsed }  — id not found, safe to create
//   { status: 'duplicate', parsed }  — id already exists, ask the user
//
// Extracted as a standalone utility so it can be tested independently of the
// React component tree.

import type { Character, CharacterPower } from '../types/character'
import type { CharacterRepository } from '../services/api'

// Migrates a character saved before the CharacterPower refactor.
// Old format stored full Power objects; new format stores only { id, purchasedUpgradeIds }.
function migratePowers(character: Character): Character {
  const powers = character.powers as unknown as Array<
    CharacterPower | { id: string; upgrades?: Array<{ id: string; purchased?: boolean }> }
  >
  const migrated: CharacterPower[] = powers.map((p) => {
    // Already in new format
    if ('purchasedUpgradeIds' in p) return p
    // Old format — extract purchased upgrade IDs from the nested upgrades array
    const purchasedUpgradeIds = (p.upgrades ?? []).filter((u) => u.purchased).map((u) => u.id)
    return { id: p.id, purchasedUpgradeIds }
  })
  return { ...character, powers: migrated }
}

// Applies all field migrations in sequence. Called whenever a character is loaded
// from localStorage or imported from a JSON file, so old saves stay compatible.
export function migrateCharacter(character: Character): Character {
  let c = migratePowers(character)
  // hpBonus added in the Advancement Table feature — default 0 for pre-existing characters
  if ((c as { hpBonus?: number }).hpBonus === undefined) {
    c = { ...c, hpBonus: 0 }
  }
  return c
}

export type ImportCheckResult =
  | { status: 'new'; parsed: Character }
  | { status: 'duplicate'; parsed: Character }
  | { status: 'invalid' }

function isValidCharacter(obj: unknown): obj is Character {
  if (!obj || typeof obj !== 'object') return false
  const c = obj as Record<string, unknown>
  return typeof c.id === 'string' && typeof c.name === 'string' && typeof c.className === 'string'
}

// Wraps FileReader in a Promise so the async/await flow stays clean.
// file.text() is not supported in jsdom (the test environment).
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export async function checkImport(
  file: File,
  api: CharacterRepository
): Promise<ImportCheckResult> {
  const text = await readFileAsText(file)

  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { status: 'invalid' }
  }

  if (!isValidCharacter(raw)) return { status: 'invalid' }

  const parsed = migrateCharacter(raw)

  try {
    await api.getById(parsed.id)
    // getById resolved — this id is already in storage
    return { status: 'duplicate', parsed }
  } catch {
    // getById threw — character not found, safe to create
    return { status: 'new', parsed }
  }
}
