import { describe, it, expect } from 'vitest'
import {
  getAllMonsters,
  getMonsterById,
  getMonstersByFaction,
  getMonstersByDangerLevel,
  getFactions,
  getAllAbilities,
  getAbilityById,
  resolveTraits,
  resolvePowers,
  getAllTemplates,
  applyTemplates,
} from './monstersData'
import type { Monster } from '../types/monster'

// ─── Data integrity ───────────────────────────────────────────────────────────

describe('monsters.json — data integrity', () => {
  const monsters = getAllMonsters()

  it('contains all 36 compendium monsters', () => {
    // homebrew is empty in tests (no localStorage), so static count = total
    expect(monsters.length).toBeGreaterThanOrEqual(36)
  })

  it('every monster has a unique id', () => {
    const ids = monsters.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every monster has all four attributes defined as numbers', () => {
    for (const m of monsters) {
      expect(typeof m.might, `${m.name} might`).toBe('number')
      expect(typeof m.agility, `${m.name} agility`).toBe('number')
      expect(typeof m.mind, `${m.name} mind`).toBe('number')
      expect(typeof m.presence, `${m.name} presence`).toBe('number')
    }
  })

  it('every monster has a dangerLevel between 1 and 12', () => {
    for (const m of monsters) {
      expect(m.dangerLevel, m.name).toBeGreaterThanOrEqual(1)
      expect(m.dangerLevel, m.name).toBeLessThanOrEqual(12)
    }
  })

  it('every traitId and powerId resolves to a known ability', () => {
    for (const m of monsters) {
      for (const id of m.traitIds) {
        expect(getAbilityById(id), `${m.name} traitId ${id}`).toBeDefined()
      }
      for (const id of m.powerIds) {
        expect(getAbilityById(id), `${m.name} powerId ${id}`).toBeDefined()
      }
    }
  })

  it('every monster has hp > 0', () => {
    for (const m of monsters) {
      expect(m.hp, m.name).toBeGreaterThan(0)
    }
  })
})

// ─── Lookup helpers ───────────────────────────────────────────────────────────

describe('getMonsterById', () => {
  it('finds Goblin Fighter by id', () => {
    const m = getMonsterById('m-009')
    expect(m).toBeDefined()
    expect(m?.name).toBe('Goblin Fighter')
  })

  it('returns undefined for unknown id', () => {
    expect(getMonsterById('m-999')).toBeUndefined()
  })
})

describe('getMonstersByFaction', () => {
  it('returns only monsters from the requested faction', () => {
    const fell = getMonstersByFaction('The Fell')
    expect(fell.length).toBeGreaterThan(0)
    expect(fell.every((m) => m.faction === 'The Fell')).toBe(true)
  })

  it('returns empty array for unknown faction', () => {
    expect(getMonstersByFaction('Unknown Faction X')).toHaveLength(0)
  })
})

describe('getMonstersByDangerLevel', () => {
  it('Goblin Fighter is DL2', () => {
    const dl2 = getMonstersByDangerLevel(2)
    expect(dl2.some((m) => m.id === 'm-009')).toBe(true)
  })

  it('every returned monster matches the requested DL', () => {
    const dl5 = getMonstersByDangerLevel(5)
    expect(dl5.every((m) => m.dangerLevel === 5)).toBe(true)
  })
})

describe('getFactions', () => {
  it('includes Crimson Horde, The Fell, The Risen', () => {
    const factions = getFactions()
    expect(factions).toContain('Crimson Horde')
    expect(factions).toContain('The Fell')
    expect(factions).toContain('The Risen')
  })

  it('contains no duplicates', () => {
    const factions = getFactions()
    expect(new Set(factions).size).toBe(factions.length)
  })

  it('contains no null values', () => {
    expect(getFactions().every((f) => f !== null)).toBe(true)
  })
})

// ─── Ability helpers ──────────────────────────────────────────────────────────

describe('getAllAbilities', () => {
  it('contains at least 121 static abilities', () => {
    expect(getAllAbilities().length).toBeGreaterThanOrEqual(121)
  })

  it('every ability has a non-empty id, name, and description', () => {
    for (const a of getAllAbilities()) {
      expect(a.id.length, `ability ${a.id} id`).toBeGreaterThan(0)
      expect(a.name.length, `ability ${a.id} name`).toBeGreaterThan(0)
      expect(a.description.length, `ability ${a.id} description`).toBeGreaterThan(0)
    }
  })

  it('every ability kind is "trait" or "power"', () => {
    for (const a of getAllAbilities()) {
      expect(['trait', 'power']).toContain(a.kind)
    }
  })
})

describe('resolveTraits / resolvePowers', () => {
  it('resolveTraits returns only trait-kind abilities', () => {
    const vampire = getMonsterById('m-032')!
    const traits = resolveTraits(vampire)
    expect(traits.length).toBeGreaterThan(0)
    expect(traits.every((t) => t.kind === 'trait')).toBe(true)
  })

  it('resolvePowers returns only power-kind abilities', () => {
    const vampire = getMonsterById('m-032')!
    const powers = resolvePowers(vampire)
    expect(powers.length).toBeGreaterThan(0)
    expect(powers.every((p) => p.kind === 'power')).toBe(true)
  })

  it('resolveTraits returns empty array for a monster with no traits', () => {
    const rikkisi = getMonsterById('m-019')!
    expect(resolveTraits(rikkisi)).toHaveLength(0)
  })
})

// ─── Template helpers ─────────────────────────────────────────────────────────

describe('getAllTemplates', () => {
  it('returns at least 7 built-in templates', () => {
    expect(getAllTemplates().length).toBeGreaterThanOrEqual(7)
  })

  it('every template has a unique id', () => {
    const ids = getAllTemplates().map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes Enraged, Fortified, Weakened, Slowed', () => {
    const names = getAllTemplates().map((t) => t.name)
    expect(names).toContain('Enraged')
    expect(names).toContain('Fortified')
    expect(names).toContain('Weakened')
    expect(names).toContain('Slowed')
  })
})

describe('applyTemplates', () => {
  const base: Monster = {
    id: 'test',
    name: 'Test Monster',
    dangerLevel: 5,
    type: 'Standard',
    size: 'Medium',
    faction: null,
    xp: 100,
    hp: 50,
    ar: 14,
    dr: 18,
    mr: 16,
    av: 2,
    spd: 14,
    might: 5,
    agility: 4,
    mind: 3,
    presence: 2,
    attacks: [],
    traitIds: ['ma-001'],
    powerIds: ['ma-010'],
  }

  it('returns the original monster reference when no templates applied', () => {
    expect(applyTemplates(base, [])).toBe(base)
  })

  it('applies a single template delta correctly', () => {
    const [enraged] = getAllTemplates().filter((t) => t.name === 'Enraged')
    const result = applyTemplates(base, [enraged])
    expect(result.hp).toBe(base.hp + enraged.hpDelta)
    expect(result.av).toBe(base.av + enraged.avDelta)
    expect(result.might).toBe(base.might + enraged.mightDelta)
  })

  it('stacks multiple templates additively', () => {
    const templates = getAllTemplates().filter((t) => ['Enraged', 'Slowed'].includes(t.name))
    const result = applyTemplates(base, templates)
    const totalAvDelta = templates.reduce((s, t) => s + t.avDelta, 0)
    const totalSpdDelta = templates.reduce((s, t) => s + t.spdDelta, 0)
    expect(result.av).toBe(base.av + totalAvDelta)
    expect(result.spd).toBe(base.spd + totalSpdDelta)
  })

  it('does not mutate the original monster', () => {
    const [enraged] = getAllTemplates().filter((t) => t.name === 'Enraged')
    applyTemplates(base, [enraged])
    expect(base.hp).toBe(50)
    expect(base.av).toBe(2)
  })

  it('addTraitIds adds abilities to the result', () => {
    const template = getAllTemplates()[0]
    const withAdd = { ...template, addTraitIds: ['ma-002'], removeTraitIds: [] }
    const result = applyTemplates(base, [withAdd])
    expect(result.traitIds).toContain('ma-001')
    expect(result.traitIds).toContain('ma-002')
  })

  it('removeTraitIds removes abilities from the result', () => {
    const template = getAllTemplates()[0]
    const withRemove = { ...template, removeTraitIds: ['ma-001'], addTraitIds: [] }
    const result = applyTemplates(base, [withRemove])
    expect(result.traitIds).not.toContain('ma-001')
  })

  it('preserves unaffected stats exactly', () => {
    const [slowed] = getAllTemplates().filter((t) => t.name === 'Slowed')
    const result = applyTemplates(base, [slowed])
    expect(result.hp).toBe(base.hp)
    expect(result.ar).toBe(base.ar)
    expect(result.dr).toBe(base.dr)
    expect(result.mr).toBe(base.mr)
    expect(result.might).toBe(base.might)
  })
})
