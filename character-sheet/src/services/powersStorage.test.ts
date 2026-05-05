import { describe, it, expect, beforeEach } from 'vitest'
import {
  getHomebrewPowers,
  upsertHomebrewPower,
  deleteHomebrewPower,
  replaceHomebrewPowers,
  invalidatePowerCache,
} from './powersStorage'
import type { HomebrewPower } from './powersStorage'

const KEY = 'unity_ttrpg_homebrew_powers'

const makePower = (id: string, name = 'Power'): HomebrewPower => ({
  id,
  name,
  className: 'Dreadnought',
  tier: 1,
  actionType: 'Standard',
  cost: '1 AP',
  target: 'Single',
  range: 'Nearby',
  effectsText: '',
  upgrades: [],
})

beforeEach(() => {
  localStorage.clear()
  invalidatePowerCache()
})

describe('getHomebrewPowers', () => {
  it('returns an empty array when nothing is stored', () => {
    expect(getHomebrewPowers()).toEqual([])
  })

  it('returns stored powers', () => {
    localStorage.setItem(KEY, JSON.stringify([makePower('p1')]))
    expect(getHomebrewPowers()).toHaveLength(1)
  })

  it('returns an empty array when localStorage value is corrupted', () => {
    localStorage.setItem(KEY, 'not-valid-json')
    expect(getHomebrewPowers()).toEqual([])
  })
})

describe('upsertHomebrewPower', () => {
  it('adds a new power when the id does not exist', () => {
    upsertHomebrewPower(makePower('p1'))
    expect(getHomebrewPowers()).toHaveLength(1)
  })

  it('updates an existing power when the id matches', () => {
    upsertHomebrewPower(makePower('p1', 'Original'))
    upsertHomebrewPower(makePower('p1', 'Updated'))
    const powers = getHomebrewPowers()
    expect(powers).toHaveLength(1)
    expect(powers[0].name).toBe('Updated')
  })

  it('appends without disturbing other entries', () => {
    upsertHomebrewPower(makePower('p1'))
    upsertHomebrewPower(makePower('p2'))
    expect(getHomebrewPowers()).toHaveLength(2)
  })
})

describe('deleteHomebrewPower', () => {
  it('removes the power with the given id', () => {
    upsertHomebrewPower(makePower('p1'))
    upsertHomebrewPower(makePower('p2'))
    deleteHomebrewPower('p1')
    const powers = getHomebrewPowers()
    expect(powers).toHaveLength(1)
    expect(powers[0].id).toBe('p2')
  })

  it('is a no-op when the id does not exist', () => {
    upsertHomebrewPower(makePower('p1'))
    deleteHomebrewPower('nonexistent')
    expect(getHomebrewPowers()).toHaveLength(1)
  })
})

describe('replaceHomebrewPowers', () => {
  it('overwrites all existing powers with the supplied array', () => {
    upsertHomebrewPower(makePower('old'))
    replaceHomebrewPowers([makePower('new1'), makePower('new2')])
    const powers = getHomebrewPowers()
    expect(powers).toHaveLength(2)
    expect(powers.map((p) => p.id)).toEqual(['new1', 'new2'])
  })

  it('clears all powers when called with an empty array', () => {
    upsertHomebrewPower(makePower('p1'))
    replaceHomebrewPowers([])
    expect(getHomebrewPowers()).toHaveLength(0)
  })
})
