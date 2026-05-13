// HomebrewContext — React-aware mirror of the homebrew localStorage stores.
//
// The context object and consumer hook live here (no JSX) so that fast-refresh
// works on the provider component file. Provider lives in HomebrewProvider.tsx.
import { createContext, useContext } from 'react'
import type { Perk } from '../types/character'
import type { Monster, MonsterAbility } from '../types/monster'
import type { HomebrewPower } from '../services/powersStorage'
import type { ArtifactDefinition } from '../types/artifact'

export interface HomebrewContextValue {
  powers: HomebrewPower[]
  perks: Perk[]
  monsters: Monster[]
  abilities: MonsterAbility[]
  artifacts: ArtifactDefinition[]
  upsertPower: (power: HomebrewPower) => void
  deletePower: (id: string) => void
  replacePowers: (powers: HomebrewPower[]) => void
  upsertPerk: (perk: Perk) => void
  deletePerk: (id: string) => void
  replacePerks: (perks: Perk[]) => void
  addMonster: (monster: Monster) => void
  updateMonster: (monster: Monster) => void
  deleteMonster: (id: string) => void
  addAbility: (ability: MonsterAbility) => void
  upsertArtifact: (artifact: ArtifactDefinition) => void
  deleteArtifact: (id: string) => void
  replaceArtifacts: (artifacts: ArtifactDefinition[]) => void
}

export const HomebrewContext = createContext<HomebrewContextValue | null>(null)

export function useHomebrew(): HomebrewContextValue {
  const ctx = useContext(HomebrewContext)
  if (!ctx) throw new Error('useHomebrew must be used inside <HomebrewProvider>')
  return ctx
}
