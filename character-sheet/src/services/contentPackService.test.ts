import { describe, it, expect, beforeEach } from 'vitest'
import { importContentPack } from './contentPackService'
import type { ContentPack } from './contentPackService'

const POWERS_KEY = 'unity_ttrpg_homebrew_powers'
const PERKS_KEY = 'unity_ttrpg_homebrew_perks'

beforeEach(() => {
  localStorage.clear()
})

describe('importContentPack', () => {
  it('merges powers and perks into localStorage and returns counts', () => {
    const pack: ContentPack = {
      version: 1,
      powers: [
        {
          id: 'hb-p1',
          name: 'Test Power',
          className: 'Dreadnought',
          tier: 1,
          actionType: 'Standard',
          cost: '2 AP',
          target: 'Single',
          range: 'Nearby',
          effectsText: 'Does stuff.',
          upgrades: [],
        },
      ],
      perks: [{ id: 'hb-perk1', name: 'Test Perk', description: 'A perk.', source: 'General' }],
    }

    const result = importContentPack(JSON.stringify(pack))

    expect(result).toEqual({ powersCount: 1, perksCount: 1 })
    expect(JSON.parse(localStorage.getItem(POWERS_KEY)!)).toHaveLength(1)
    expect(JSON.parse(localStorage.getItem(PERKS_KEY)!)).toHaveLength(1)
  })

  it('merges incrementally — existing entries are preserved', () => {
    localStorage.setItem(POWERS_KEY, JSON.stringify([{ id: 'existing', name: 'Old' }]))

    const pack: ContentPack = {
      version: 1,
      powers: [
        {
          id: 'hb-new',
          name: 'New Power',
          className: 'Mystic',
          tier: 1,
          actionType: 'Standard',
          cost: '1 AP',
          target: 'Single',
          range: 'Nearby',
          effectsText: '',
          upgrades: [],
        },
      ],
      perks: [],
    }

    importContentPack(JSON.stringify(pack))

    const stored = JSON.parse(localStorage.getItem(POWERS_KEY)!)
    expect(stored).toHaveLength(2)
    expect(stored.map((p: { id: string }) => p.id)).toContain('existing')
    expect(stored.map((p: { id: string }) => p.id)).toContain('hb-new')
  })

  it('returns zero counts for empty arrays', () => {
    const pack: ContentPack = { version: 1, powers: [], perks: [] }
    const result = importContentPack(JSON.stringify(pack))
    expect(result).toEqual({ powersCount: 0, perksCount: 0 })
  })

  it('handles missing powers/perks keys gracefully', () => {
    const result = importContentPack(JSON.stringify({ version: 1 }))
    expect(result).toEqual({ powersCount: 0, perksCount: 0 })
  })

  it('throws on invalid JSON', () => {
    expect(() => importContentPack('not-json')).toThrow()
  })
})
