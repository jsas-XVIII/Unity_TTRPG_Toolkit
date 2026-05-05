import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { importContentPack, exportContentPack } from './contentPackService'
import type { ContentPack } from './contentPackService'
import { invalidatePowerCache } from './powersStorage'
import { invalidatePerksCache } from './perksStorage'

const POWERS_KEY = 'unity_ttrpg_homebrew_powers'
const PERKS_KEY = 'unity_ttrpg_homebrew_perks'

beforeEach(() => {
  localStorage.clear()
  invalidatePowerCache()
  invalidatePerksCache()
})

describe('importContentPack', () => {
  it('writes powers and perks to localStorage and returns counts', () => {
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

  it('replaces all existing powers — entries not in the new pack are removed', () => {
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
    expect(stored).toHaveLength(1)
    expect(stored[0].id).toBe('hb-new')
  })

  it('replaces all existing perks — entries not in the new pack are removed', () => {
    localStorage.setItem(PERKS_KEY, JSON.stringify([{ id: 'old-perk', name: 'Old Perk' }]))

    const pack: ContentPack = {
      version: 1,
      powers: [],
      perks: [{ id: 'new-perk', name: 'New Perk', description: 'desc', source: 'General' }],
    }

    importContentPack(JSON.stringify(pack))

    const stored = JSON.parse(localStorage.getItem(PERKS_KEY)!)
    expect(stored).toHaveLength(1)
    expect(stored[0].id).toBe('new-perk')
  })

  it('propagates GM deletions — power absent from new pack is removed from player storage', () => {
    const deletedPower = {
      id: 'deleted-power',
      name: 'Deleted',
      className: 'Dreadnought',
      tier: 1,
      actionType: 'Standard',
      cost: '1 AP',
      target: 'Single',
      range: 'Nearby',
      effectsText: '',
      upgrades: [],
    }
    localStorage.setItem(POWERS_KEY, JSON.stringify([deletedPower]))

    const pack: ContentPack = { version: 1, powers: [], perks: [] }
    importContentPack(JSON.stringify(pack))

    expect(JSON.parse(localStorage.getItem(POWERS_KEY)!)).toHaveLength(0)
  })

  it('propagates GM deletions — perk absent from new pack is removed from player storage', () => {
    localStorage.setItem(PERKS_KEY, JSON.stringify([{ id: 'deleted-perk', name: 'Old' }]))

    const pack: ContentPack = { version: 1, powers: [], perks: [] }
    importContentPack(JSON.stringify(pack))

    expect(JSON.parse(localStorage.getItem(PERKS_KEY)!)).toHaveLength(0)
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

  it('throws when version is missing', () => {
    expect(() => importContentPack(JSON.stringify({ powers: [], perks: [] }))).toThrow(
      'Unsupported content pack version'
    )
  })

  it('throws when version is not 1', () => {
    expect(() => importContentPack(JSON.stringify({ version: 2, powers: [], perks: [] }))).toThrow(
      'Unsupported content pack version'
    )
  })

  it('throws when the JSON is not an object', () => {
    expect(() => importContentPack(JSON.stringify([{ version: 1 }]))).toThrow()
  })
})

function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(blob)
  })
}

describe('exportContentPack', () => {
  const createObjectURL = vi.fn().mockReturnValue('blob:mock-url')
  const revokeObjectURL = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    createObjectURL.mockClear()
    revokeObjectURL.mockClear()
  })

  it('triggers a download named unity-content-pack.json and releases the object URL', () => {
    const anchor = { href: '', download: '', click: vi.fn() }
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor as unknown as HTMLElement)

    exportContentPack()

    expect(anchor.download).toBe('unity-content-pack.json')
    expect(anchor.click).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('includes current homebrew powers and perks in the downloaded pack', async () => {
    localStorage.setItem(POWERS_KEY, JSON.stringify([{ id: 'p1', name: 'A Power' }]))
    localStorage.setItem(PERKS_KEY, JSON.stringify([{ id: 'k1', name: 'A Perk' }]))

    const anchor = { href: '', download: '', click: vi.fn() }
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor as unknown as HTMLElement)

    exportContentPack()

    const blob = createObjectURL.mock.calls[0][0] as Blob
    const pack = JSON.parse(await readBlob(blob)) as ContentPack
    expect(pack.version).toBe(1)
    expect(pack.powers).toHaveLength(1)
    expect(pack.powers[0].id).toBe('p1')
    expect(pack.perks).toHaveLength(1)
    expect(pack.perks[0].id).toBe('k1')
  })

  it('exports empty arrays when no homebrew content exists', async () => {
    const anchor = { href: '', download: '', click: vi.fn() }
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor as unknown as HTMLElement)

    exportContentPack()

    const blob = createObjectURL.mock.calls[0][0] as Blob
    const pack = JSON.parse(await readBlob(blob)) as ContentPack
    expect(pack.powers).toHaveLength(0)
    expect(pack.perks).toHaveLength(0)
  })
})
