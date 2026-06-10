import { describe, it, expect, beforeEach } from 'vitest'
import {
  getEncounters,
  upsertEncounter,
  deleteEncounter,
  invalidateEncountersCache,
} from './encounterStorage'
import type { SavedEncounter } from '../types/encounter'

const KEY = 'unity_ttrpg_encounters'

const makeEncounter = (id: string, name = 'Ambush'): SavedEncounter => ({
  id,
  name,
  entries: [{ monsterId: 'm-028', count: 1 }],
})

beforeEach(() => {
  localStorage.clear()
  invalidateEncountersCache()
})

describe('getEncounters', () => {
  it('returns an empty array when nothing is stored', () => {
    expect(getEncounters()).toEqual([])
  })

  it('returns stored encounters', () => {
    localStorage.setItem(KEY, JSON.stringify([makeEncounter('e1')]))
    expect(getEncounters()).toHaveLength(1)
  })

  it('returns an empty array when localStorage value is corrupted', () => {
    localStorage.setItem(KEY, 'not-valid-json')
    expect(getEncounters()).toEqual([])
  })
})

describe('upsertEncounter', () => {
  it('adds a new encounter when the id does not exist', () => {
    upsertEncounter(makeEncounter('e1'))
    expect(getEncounters()).toHaveLength(1)
  })

  it('updates an existing encounter when the id matches', () => {
    upsertEncounter(makeEncounter('e1', 'Original'))
    upsertEncounter(makeEncounter('e1', 'Updated'))
    const encounters = getEncounters()
    expect(encounters).toHaveLength(1)
    expect(encounters[0].name).toBe('Updated')
  })

  it('appends without disturbing other entries', () => {
    upsertEncounter(makeEncounter('e1'))
    upsertEncounter(makeEncounter('e2'))
    expect(getEncounters()).toHaveLength(2)
  })

  it('returns a new array reference after each upsert (no in-place cache mutation)', () => {
    upsertEncounter(makeEncounter('e1'))
    const before = getEncounters()
    upsertEncounter(makeEncounter('e2'))
    const afterAdd = getEncounters()
    expect(afterAdd).not.toBe(before)

    upsertEncounter(makeEncounter('e1', 'Updated'))
    const afterUpdate = getEncounters()
    expect(afterUpdate).not.toBe(afterAdd)
  })
})

describe('deleteEncounter', () => {
  it('removes the encounter with the given id', () => {
    upsertEncounter(makeEncounter('e1'))
    upsertEncounter(makeEncounter('e2'))
    deleteEncounter('e1')
    const encounters = getEncounters()
    expect(encounters).toHaveLength(1)
    expect(encounters[0].id).toBe('e2')
  })

  it('is a no-op when the id does not exist', () => {
    upsertEncounter(makeEncounter('e1'))
    deleteEncounter('nonexistent')
    expect(getEncounters()).toHaveLength(1)
  })
})
