// useApi.ts — returns the active character persistence repository.
//
// Currently always returns localStorageRepository (Phase 1: browser storage, no server).
// If a backend is added later (e.g. Supabase, IndexedDB), swap the return value here
// without touching any component code.

import { localStorageRepository } from '../services/localStorage'
import type { CharacterRepository } from '../services/api'

export function useApi(): CharacterRepository {
  return localStorageRepository
}
