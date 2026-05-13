import { describe, it, expect, beforeEach } from 'vitest'
import {
  getHomebrewArtifacts,
  upsertHomebrewArtifact,
  deleteHomebrewArtifact,
  replaceHomebrewArtifacts,
  invalidateArtifactsCache,
} from './artifactsStorage'
import type { ArtifactDefinition } from '../types/artifact'

const KEY = 'unity_ttrpg_homebrew_artifacts'

const makeArtifact = (id: string, name = 'Artifact'): ArtifactDefinition => ({
  id,
  name,
  category: 'Accessory',
  subtype: 'Amulet',
  description: 'An artifact.',
  effects: [],
})

beforeEach(() => {
  localStorage.clear()
  invalidateArtifactsCache()
})

describe('getHomebrewArtifacts', () => {
  it('returns an empty array when nothing is stored', () => {
    expect(getHomebrewArtifacts()).toEqual([])
  })

  it('returns stored artifacts', () => {
    localStorage.setItem(KEY, JSON.stringify([makeArtifact('a1')]))
    expect(getHomebrewArtifacts()).toHaveLength(1)
  })

  it('returns an empty array when localStorage value is corrupted', () => {
    localStorage.setItem(KEY, 'not-valid-json')
    expect(getHomebrewArtifacts()).toEqual([])
  })
})

describe('upsertHomebrewArtifact', () => {
  it('adds a new artifact when the id does not exist', () => {
    upsertHomebrewArtifact(makeArtifact('a1'))
    expect(getHomebrewArtifacts()).toHaveLength(1)
  })

  it('updates an existing artifact when the id matches', () => {
    upsertHomebrewArtifact(makeArtifact('a1', 'Original'))
    upsertHomebrewArtifact(makeArtifact('a1', 'Updated'))
    const artifacts = getHomebrewArtifacts()
    expect(artifacts).toHaveLength(1)
    expect(artifacts[0].name).toBe('Updated')
  })

  it('appends without disturbing other entries', () => {
    upsertHomebrewArtifact(makeArtifact('a1'))
    upsertHomebrewArtifact(makeArtifact('a2'))
    expect(getHomebrewArtifacts()).toHaveLength(2)
  })

  it('returns a new array reference after each upsert (no in-place cache mutation)', () => {
    upsertHomebrewArtifact(makeArtifact('a1'))
    const before = getHomebrewArtifacts()
    upsertHomebrewArtifact(makeArtifact('a2'))
    const afterAdd = getHomebrewArtifacts()
    expect(afterAdd).not.toBe(before)

    upsertHomebrewArtifact(makeArtifact('a1', 'Updated'))
    const afterUpdate = getHomebrewArtifacts()
    expect(afterUpdate).not.toBe(afterAdd)
  })
})

describe('deleteHomebrewArtifact', () => {
  it('removes the artifact with the given id', () => {
    upsertHomebrewArtifact(makeArtifact('a1'))
    upsertHomebrewArtifact(makeArtifact('a2'))
    deleteHomebrewArtifact('a1')
    const artifacts = getHomebrewArtifacts()
    expect(artifacts).toHaveLength(1)
    expect(artifacts[0].id).toBe('a2')
  })

  it('is a no-op when the id does not exist', () => {
    upsertHomebrewArtifact(makeArtifact('a1'))
    deleteHomebrewArtifact('nonexistent')
    expect(getHomebrewArtifacts()).toHaveLength(1)
  })
})

describe('replaceHomebrewArtifacts', () => {
  it('overwrites all existing artifacts with the supplied array', () => {
    upsertHomebrewArtifact(makeArtifact('old'))
    replaceHomebrewArtifacts([makeArtifact('new1'), makeArtifact('new2')])
    const artifacts = getHomebrewArtifacts()
    expect(artifacts).toHaveLength(2)
    expect(artifacts.map((a) => a.id)).toEqual(['new1', 'new2'])
  })

  it('clears all artifacts when called with an empty array', () => {
    upsertHomebrewArtifact(makeArtifact('a1'))
    replaceHomebrewArtifacts([])
    expect(getHomebrewArtifacts()).toHaveLength(0)
  })
})
