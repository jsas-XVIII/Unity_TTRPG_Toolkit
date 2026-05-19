import type { Power, ClassName } from '../types/character'
import { makeHomebrewStore } from './homebrewStore'

export interface HomebrewPower extends Power {
  className: ClassName
}

const store = makeHomebrewStore<HomebrewPower>('unity_ttrpg_homebrew_powers')

export const invalidatePowerCache = store.invalidateCache
export const getHomebrewPowers = store.getAll
export const replaceHomebrewPowers = store.replace
export const upsertHomebrewPower = store.upsert
export const deleteHomebrewPower = store.remove
