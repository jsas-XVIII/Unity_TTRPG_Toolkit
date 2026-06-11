import { describe, it, expect, beforeEach } from 'vitest'
import {
  getOfficialPowers,
  getOfficialPerks,
  setOfficialPowers,
  invalidateOfficialPowersCache,
  invalidateOfficialPerksCache,
} from './officialContentStorage'

beforeEach(() => {
  localStorage.clear()
  invalidateOfficialPowersCache()
  invalidateOfficialPerksCache()
})

describe('getOfficialPowers', () => {
  it('returns null when the key is absent', () => {
    expect(getOfficialPowers()).toBeNull()
  })

  it('returns parsed value when the key holds valid JSON', () => {
    const data = { Dreadnought: { baseline: [] } }
    localStorage.setItem('unity_official_powers', JSON.stringify(data))
    invalidateOfficialPowersCache()
    expect(getOfficialPowers()).toEqual(data)
  })

  it('returns null (not throw) when the key holds corrupt JSON', () => {
    localStorage.setItem('unity_official_powers', '{not valid json')
    invalidateOfficialPowersCache()
    expect(() => getOfficialPowers()).not.toThrow()
    expect(getOfficialPowers()).toBeNull()
  })
})

describe('getOfficialPerks', () => {
  it('returns null when the key is absent', () => {
    expect(getOfficialPerks()).toBeNull()
  })

  it('returns null (not throw) when the key holds corrupt JSON', () => {
    localStorage.setItem('unity_official_perks', '[bad')
    invalidateOfficialPerksCache()
    expect(() => getOfficialPerks()).not.toThrow()
    expect(getOfficialPerks()).toBeNull()
  })
})

describe('setOfficialPowers', () => {
  it('persists and caches the value so subsequent reads return it without re-parsing', () => {
    const data = { Mystic: { baseline: [] } }
    setOfficialPowers(data as never)
    expect(getOfficialPowers()).toEqual(data)
  })
})
