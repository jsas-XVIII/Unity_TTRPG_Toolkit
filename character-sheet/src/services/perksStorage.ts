import type { Perk } from '../types/character'
import { makeHomebrewStore } from './homebrewStore'

const store = makeHomebrewStore<Perk>('unity_ttrpg_homebrew_perks')

export const invalidatePerksCache = store.invalidateCache
export const getHomebrewPerks = store.getAll
export const replaceHomebrewPerks = store.replace
export const upsertHomebrewPerk = store.upsert
export const deleteHomebrewPerk = store.remove
