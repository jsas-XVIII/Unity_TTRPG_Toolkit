import { describe, it, expect, beforeEach } from 'vitest'
import {
  getAllPerks,
  getOfficialPerks,
  getPerkById,
  getPerkByName,
  isOfficialPerk,
} from './perksData'

beforeEach(() => {
  localStorage.clear()
})

describe('getOfficialPerks', () => {
  it('returns at least 12 official perks', () => {
    expect(getOfficialPerks().length).toBeGreaterThanOrEqual(12)
  })

  it('every official perk has a non-empty id, name, and description', () => {
    for (const p of getOfficialPerks()) {
      expect(p.id.length, `${p.id} id`).toBeGreaterThan(0)
      expect(p.name.length, `${p.id} name`).toBeGreaterThan(0)
      expect(p.description.length, `${p.id} description`).toBeGreaterThan(0)
    }
  })

  it('every official perk id is unique', () => {
    const ids = getOfficialPerks().map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('getAllPerks — no homebrew', () => {
  it('returns the same list as getOfficialPerks when localStorage is empty', () => {
    expect(getAllPerks()).toEqual(getOfficialPerks())
  })
})

describe('isOfficialPerk', () => {
  it('returns true for a known official perk id', () => {
    expect(isOfficialPerk('gp-001')).toBe(true)
  })

  it('returns true for the last known official perk id', () => {
    expect(isOfficialPerk('gp-012')).toBe(true)
  })

  it('returns false for an unknown id', () => {
    expect(isOfficialPerk('not-a-real-perk')).toBe(false)
  })

  it('returns false for a homebrew-prefixed id that does not exist in the JSON', () => {
    expect(isOfficialPerk('hb-perk-12345')).toBe(false)
  })
})

describe('getPerkById', () => {
  it('finds Relentless by id', () => {
    const perk = getPerkById('gp-001')
    expect(perk).toBeDefined()
    expect(perk?.name).toBe('Relentless')
  })

  it('returns undefined for an unknown id', () => {
    expect(getPerkById('not-real')).toBeUndefined()
  })
})

describe('getPerkByName', () => {
  it('finds a perk by exact name', () => {
    const perk = getPerkByName('Relentless')
    expect(perk).toBeDefined()
    expect(perk?.id).toBe('gp-001')
  })

  it('returns undefined for an unknown name', () => {
    expect(getPerkByName('Not A Perk')).toBeUndefined()
  })
})
