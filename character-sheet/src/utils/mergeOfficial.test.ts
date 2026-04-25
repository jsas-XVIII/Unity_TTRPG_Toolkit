import { describe, it, expect } from 'vitest'
import { mergeOfficial } from './mergeOfficial'

type Item = { id: string; value: string }

const official: Item[] = [
  { id: 'a', value: 'official-a' },
  { id: 'b', value: 'official-b' },
  { id: 'c', value: 'official-c' },
]

describe('mergeOfficial — no homebrew', () => {
  it('returns all official entries unchanged when homebrew is empty', () => {
    expect(mergeOfficial(official, [])).toEqual(official)
  })

  it('returns homebrew entries when official is empty', () => {
    const homebrew: Item[] = [{ id: 'x', value: 'homebrew-x' }]
    expect(mergeOfficial([], homebrew)).toEqual(homebrew)
  })

  it('returns empty array when both are empty', () => {
    expect(mergeOfficial([], [])).toEqual([])
  })
})

describe('mergeOfficial — homebrew shadows official', () => {
  it('replaces an official entry with a matching homebrew entry', () => {
    const homebrew: Item[] = [{ id: 'b', value: 'homebrew-b' }]
    const result = mergeOfficial(official, homebrew)
    const b = result.find((x) => x.id === 'b')
    expect(b?.value).toBe('homebrew-b')
  })

  it('keeps unaffected official entries when one is overridden', () => {
    const homebrew: Item[] = [{ id: 'b', value: 'homebrew-b' }]
    const result = mergeOfficial(official, homebrew)
    expect(result.find((x) => x.id === 'a')?.value).toBe('official-a')
    expect(result.find((x) => x.id === 'c')?.value).toBe('official-c')
  })

  it('does not include the official version of an overridden entry', () => {
    const homebrew: Item[] = [{ id: 'b', value: 'homebrew-b' }]
    const result = mergeOfficial(official, homebrew)
    const bs = result.filter((x) => x.id === 'b')
    expect(bs).toHaveLength(1)
  })

  it('shadows all official entries when every ID is overridden', () => {
    const homebrew: Item[] = official.map((x) => ({ id: x.id, value: `homebrew-${x.id}` }))
    const result = mergeOfficial(official, homebrew)
    expect(result).toHaveLength(3)
    expect(result.every((x) => x.value.startsWith('homebrew'))).toBe(true)
  })
})

describe('mergeOfficial — homebrew additions', () => {
  it('appends a homebrew entry with a new ID', () => {
    const homebrew: Item[] = [{ id: 'z', value: 'homebrew-z' }]
    const result = mergeOfficial(official, homebrew)
    expect(result.find((x) => x.id === 'z')?.value).toBe('homebrew-z')
  })

  it('result length is official + new homebrew entries', () => {
    const homebrew: Item[] = [{ id: 'z', value: 'homebrew-z' }]
    const result = mergeOfficial(official, homebrew)
    expect(result).toHaveLength(official.length + 1)
  })

  it('keeps all official entries when homebrew only adds new IDs', () => {
    const homebrew: Item[] = [{ id: 'z', value: 'homebrew-z' }]
    const result = mergeOfficial(official, homebrew)
    for (const o of official) {
      expect(result.find((x) => x.id === o.id)?.value).toBe(o.value)
    }
  })
})

describe('mergeOfficial — mixed override and addition', () => {
  it('handles overrides and additions in the same homebrew list', () => {
    const homebrew: Item[] = [
      { id: 'b', value: 'homebrew-b' }, // override
      { id: 'z', value: 'homebrew-z' }, // addition
    ]
    const result = mergeOfficial(official, homebrew)
    expect(result).toHaveLength(4)
    expect(result.find((x) => x.id === 'b')?.value).toBe('homebrew-b')
    expect(result.find((x) => x.id === 'z')?.value).toBe('homebrew-z')
  })

  it('official non-overridden entries appear before homebrew entries', () => {
    const homebrew: Item[] = [
      { id: 'b', value: 'homebrew-b' },
      { id: 'z', value: 'homebrew-z' },
    ]
    const result = mergeOfficial(official, homebrew)
    const aIdx = result.findIndex((x) => x.id === 'a')
    const zIdx = result.findIndex((x) => x.id === 'z')
    expect(aIdx).toBeLessThan(zIdx)
  })
})
