import { describe, it, expect, beforeEach } from 'vitest'
import {
  getHomebrewPerks,
  upsertHomebrewPerk,
  deleteHomebrewPerk,
  replaceHomebrewPerks,
  invalidatePerksCache,
} from './perksStorage'
import type { Perk } from '../types/character'

const KEY = 'unity_ttrpg_homebrew_perks'

const makePerk = (id: string, name = 'Perk'): Perk => ({
  id,
  name,
  description: 'A perk.',
  source: 'General',
})

beforeEach(() => {
  localStorage.clear()
  invalidatePerksCache()
})

describe('getHomebrewPerks', () => {
  it('returns an empty array when nothing is stored', () => {
    expect(getHomebrewPerks()).toEqual([])
  })

  it('returns stored perks', () => {
    localStorage.setItem(KEY, JSON.stringify([makePerk('k1')]))
    expect(getHomebrewPerks()).toHaveLength(1)
  })

  it('returns an empty array when localStorage value is corrupted', () => {
    localStorage.setItem(KEY, 'not-valid-json')
    expect(getHomebrewPerks()).toEqual([])
  })
})

describe('upsertHomebrewPerk', () => {
  it('adds a new perk when the id does not exist', () => {
    upsertHomebrewPerk(makePerk('k1'))
    expect(getHomebrewPerks()).toHaveLength(1)
  })

  it('updates an existing perk when the id matches', () => {
    upsertHomebrewPerk(makePerk('k1', 'Original'))
    upsertHomebrewPerk(makePerk('k1', 'Updated'))
    const perks = getHomebrewPerks()
    expect(perks).toHaveLength(1)
    expect(perks[0].name).toBe('Updated')
  })

  it('appends without disturbing other entries', () => {
    upsertHomebrewPerk(makePerk('k1'))
    upsertHomebrewPerk(makePerk('k2'))
    expect(getHomebrewPerks()).toHaveLength(2)
  })

  // Regression: in-place mutation of the cached array would defeat React-state mirrors
  // (HomebrewProvider) that rely on Object.is identity to detect changes.
  it('returns a new array reference after each upsert (no in-place cache mutation)', () => {
    upsertHomebrewPerk(makePerk('k1'))
    const before = getHomebrewPerks()
    upsertHomebrewPerk(makePerk('k2'))
    const afterAdd = getHomebrewPerks()
    expect(afterAdd).not.toBe(before)

    upsertHomebrewPerk(makePerk('k1', 'Updated'))
    const afterUpdate = getHomebrewPerks()
    expect(afterUpdate).not.toBe(afterAdd)
  })
})

describe('deleteHomebrewPerk', () => {
  it('removes the perk with the given id', () => {
    upsertHomebrewPerk(makePerk('k1'))
    upsertHomebrewPerk(makePerk('k2'))
    deleteHomebrewPerk('k1')
    const perks = getHomebrewPerks()
    expect(perks).toHaveLength(1)
    expect(perks[0].id).toBe('k2')
  })

  it('is a no-op when the id does not exist', () => {
    upsertHomebrewPerk(makePerk('k1'))
    deleteHomebrewPerk('nonexistent')
    expect(getHomebrewPerks()).toHaveLength(1)
  })
})

describe('replaceHomebrewPerks', () => {
  it('overwrites all existing perks with the supplied array', () => {
    upsertHomebrewPerk(makePerk('old'))
    replaceHomebrewPerks([makePerk('new1'), makePerk('new2')])
    const perks = getHomebrewPerks()
    expect(perks).toHaveLength(2)
    expect(perks.map((p) => p.id)).toEqual(['new1', 'new2'])
  })

  it('clears all perks when called with an empty array', () => {
    upsertHomebrewPerk(makePerk('k1'))
    replaceHomebrewPerks([])
    expect(getHomebrewPerks()).toHaveLength(0)
  })
})
