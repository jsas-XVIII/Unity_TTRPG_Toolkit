import type { SavedEncounter } from '../types/encounter'
import { makeHomebrewStore } from './homebrewStore'

const store = makeHomebrewStore<SavedEncounter>('unity_ttrpg_encounters')

export const getEncounters = store.getAll
export const upsertEncounter = store.upsert
export const deleteEncounter = store.remove
export const invalidateEncountersCache = store.invalidateCache
