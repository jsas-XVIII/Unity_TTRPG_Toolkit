import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { parseContentPack, exportContentPack } from './contentPackService'
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

describe('parseContentPack', () => {
  it('returns the powers and perks arrays from a valid pack', () => {
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
      artifacts: [],
    }

    const result = parseContentPack(JSON.stringify(pack))

    expect(result.powers).toHaveLength(1)
    expect(result.powers[0].id).toBe('hb-p1')
    expect(result.perks).toHaveLength(1)
    expect(result.perks[0].id).toBe('hb-perk1')
  })

  it('returns empty arrays for an empty pack', () => {
    const pack: ContentPack = { version: 1, powers: [], perks: [], artifacts: [] }
    const result = parseContentPack(JSON.stringify(pack))
    expect(result).toEqual({ powers: [], perks: [], artifacts: [] })
  })

  it('handles missing powers/perks keys gracefully', () => {
    const result = parseContentPack(JSON.stringify({ version: 1 }))
    expect(result).toEqual({ powers: [], perks: [], artifacts: [] })
  })

  it('throws on invalid JSON', () => {
    expect(() => parseContentPack('not-json')).toThrow()
  })

  it('throws when version is missing', () => {
    expect(() => parseContentPack(JSON.stringify({ powers: [], perks: [] }))).toThrow(
      'Unsupported content pack version'
    )
  })

  it('throws when version is not 1', () => {
    expect(() => parseContentPack(JSON.stringify({ version: 2, powers: [], perks: [] }))).toThrow(
      'Unsupported content pack version'
    )
  })

  it('throws when the JSON is not an object', () => {
    expect(() => parseContentPack(JSON.stringify([{ version: 1 }]))).toThrow()
  })

  it('does not write to localStorage', () => {
    const pack: ContentPack = {
      version: 1,
      powers: [
        {
          id: 'hb-p1',
          name: 'Test',
          className: 'Dreadnought',
          tier: 1,
          actionType: 'Standard',
          cost: '1 AP',
          target: 'Single',
          range: 'Nearby',
          effectsText: '',
          upgrades: [],
        },
      ],
      perks: [{ id: 'hb-k1', name: 'Test Perk', description: '', source: 'General' }],
      artifacts: [],
    }
    parseContentPack(JSON.stringify(pack))
    expect(localStorage.getItem(POWERS_KEY)).toBeNull()
    expect(localStorage.getItem(PERKS_KEY)).toBeNull()
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
