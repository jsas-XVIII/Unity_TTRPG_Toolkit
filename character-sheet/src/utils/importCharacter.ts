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

const VALID_RACES = new Set<string>(['Valla', 'Furian', 'Human', 'Afflicted'])
const VALID_CLASS_NAMES = new Set<string>([
  'Dreadnought',
  'Driftwalker',
  'Fell Hunter',
  'Judge',
  'Mystic',
  'Phantom',
  'Priest',
  'Primalist',
  'Sentinel',
])

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

// Migrates a character saved before the Artifact System refactor.
// Old format stored freeform Artifact objects; new format stores only string IDs.
// Old UUIDs cannot map to official artifact IDs, so they are discarded.
function migrateArtifacts(character: Character): Character {
  const c = character as unknown as Record<string, unknown>
  if (Array.isArray(c.artifacts)) {
    const migrated = { ...c }
    delete migrated.artifacts
    return { ...(migrated as Character), artifactIds: [] }
  }
  if (!Array.isArray(c.artifactIds)) {
    return { ...character, artifactIds: [] }
  }
  return character
}

// Applies all field migrations in sequence. Called whenever a character is loaded
// from localStorage or imported from a JSON file, so old saves stay compatible.
export function migrateCharacter(character: Character): Character {
  let c = migratePowers(character)
  // hpBonus added in the Advancement Table feature — default 0 for pre-existing characters
  if ((c as { hpBonus?: number }).hpBonus === undefined) {
    c = { ...c, hpBonus: 0 }
  }
  c = migrateArtifacts(c)
  return c
}

export type ImportCheckResult =
  | { status: 'new'; parsed: Character }
  | { status: 'duplicate'; parsed: Character }
  | { status: 'invalid' }

function isValidCharacter(obj: unknown): obj is Character {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false
  const c = obj as Record<string, unknown>
  return (
    typeof c.id === 'string' &&
    typeof c.name === 'string' &&
    typeof c.race === 'string' &&
    VALID_RACES.has(c.race) &&
    typeof c.className === 'string' &&
    VALID_CLASS_NAMES.has(c.className) &&
    typeof c.level === 'number' &&
    typeof c.xp === 'number' &&
    typeof c.age === 'string' &&
    typeof c.notes === 'string' &&
    !!c.attributes &&
    typeof c.attributes === 'object' &&
    !Array.isArray(c.attributes) &&
    typeof c.arBonus === 'number' &&
    typeof c.drBonus === 'number' &&
    typeof c.currentHp === 'number' &&
    typeof c.fadingStacks === 'number' &&
    !!c.primaryResource &&
    typeof c.primaryResource === 'object' &&
    !Array.isArray(c.primaryResource) &&
    typeof c.recuperationBonus === 'number' &&
    typeof c.recuperationDie === 'string' &&
    Array.isArray(c.corePaths) &&
    Array.isArray(c.powers) &&
    Array.isArray(c.perks) &&
    Array.isArray(c.weapons) &&
    Array.isArray(c.armor) &&
    (Array.isArray(c.artifactIds) || Array.isArray(c.artifacts)) &&
    typeof c.artifactCapacity === 'number' &&
    typeof c.denerim === 'number' &&
    typeof c.necessities === 'number' &&
    typeof c.gear === 'number'
  )
}

// Returns a new Character with only known fields — drops any extra keys from the imported JSON.
function sanitizeCharacter(c: Character): Character {
  const out: Character = {
    id: c.id,
    name: c.name,
    race: c.race,
    className: c.className,
    level: c.level,
    xp: c.xp,
    age: c.age,
    notes: c.notes,
    attributes: c.attributes,
    arBonus: c.arBonus,
    drBonus: c.drBonus,
    hpBonus: c.hpBonus,
    currentHp: c.currentHp,
    fadingStacks: c.fadingStacks,
    primaryResource: c.primaryResource,
    secondaryResource: c.secondaryResource,
    recuperationBonus: c.recuperationBonus,
    recuperationDie: c.recuperationDie,
    corePaths: c.corePaths,
    powers: c.powers,
    perks: c.perks,
    weapons: c.weapons,
    armor: c.armor,
    artifactIds: c.artifactIds,
    artifactCapacity: c.artifactCapacity,
    denerim: c.denerim,
    necessities: c.necessities,
    gear: c.gear,
  }
  if (c.classPath !== undefined) out.classPath = c.classPath
  if (c.featureUpgrades !== undefined) out.featureUpgrades = c.featureUpgrades
  if (c.usedPowerIds !== undefined) out.usedPowerIds = c.usedPowerIds
  return out
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

  const parsed = sanitizeCharacter(migrateCharacter(raw))

  try {
    await api.getById(parsed.id)
    // getById resolved — this id is already in storage
    return { status: 'duplicate', parsed }
  } catch {
    // getById threw — character not found, safe to create
    return { status: 'new', parsed }
  }
}
