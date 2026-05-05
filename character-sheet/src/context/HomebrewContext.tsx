// HomebrewContext — React-aware mirror of the homebrew localStorage stores.
//
// Mutators delegate to the storage services first (which write localStorage and
// keep their internal cache in sync), then update React state. Components that
// render homebrew read from this context so they re-render automatically — no
// manual refresh keys required.
//
// Data-layer functions in src/data/*Data.ts continue to read from the storage
// service caches (which are kept fresh because all mutations flow through here),
// so non-React callers keep working without changes.
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type { Perk } from '../types/character'
import type { Monster, MonsterAbility } from '../types/monster'
import {
  getHomebrewPowers,
  upsertHomebrewPower,
  deleteHomebrewPower,
  replaceHomebrewPowers,
  type HomebrewPower,
} from '../services/powersStorage'
import {
  getHomebrewPerks,
  upsertHomebrewPerk,
  deleteHomebrewPerk,
  replaceHomebrewPerks,
} from '../services/perksStorage'
import {
  getHomebrewMonsters,
  addHomebrewMonster,
  updateHomebrewMonster,
  deleteHomebrewMonster,
  getHomebrewAbilities,
  addHomebrewAbility,
} from '../services/monsterStorage'

interface HomebrewContextValue {
  powers: HomebrewPower[]
  perks: Perk[]
  monsters: Monster[]
  abilities: MonsterAbility[]
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
}

const HomebrewContext = createContext<HomebrewContextValue | null>(null)

export function HomebrewProvider({ children }: { children: ReactNode }) {
  const [powers, setPowers] = useState<HomebrewPower[]>(() => getHomebrewPowers())
  const [perks, setPerks] = useState<Perk[]>(() => getHomebrewPerks())
  const [monsters, setMonsters] = useState<Monster[]>(() => getHomebrewMonsters())
  const [abilities, setAbilities] = useState<MonsterAbility[]>(() => getHomebrewAbilities())

  // Each mutator: persist via the storage service first; if that throws (quota),
  // skip the setState so React state stays consistent with what's persisted.
  const upsertPower = useCallback((power: HomebrewPower) => {
    upsertHomebrewPower(power)
    setPowers(getHomebrewPowers())
  }, [])

  const deletePower = useCallback((id: string) => {
    deleteHomebrewPower(id)
    setPowers(getHomebrewPowers())
  }, [])

  const replacePowers = useCallback((next: HomebrewPower[]) => {
    replaceHomebrewPowers(next)
    setPowers(getHomebrewPowers())
  }, [])

  const upsertPerk = useCallback((perk: Perk) => {
    upsertHomebrewPerk(perk)
    setPerks(getHomebrewPerks())
  }, [])

  const deletePerk = useCallback((id: string) => {
    deleteHomebrewPerk(id)
    setPerks(getHomebrewPerks())
  }, [])

  const replacePerks = useCallback((next: Perk[]) => {
    replaceHomebrewPerks(next)
    setPerks(getHomebrewPerks())
  }, [])

  const addMonster = useCallback((monster: Monster) => {
    addHomebrewMonster(monster)
    setMonsters(getHomebrewMonsters())
  }, [])

  const updateMonster = useCallback((monster: Monster) => {
    updateHomebrewMonster(monster)
    setMonsters(getHomebrewMonsters())
  }, [])

  const deleteMonster = useCallback((id: string) => {
    deleteHomebrewMonster(id)
    setMonsters(getHomebrewMonsters())
  }, [])

  const addAbility = useCallback((ability: MonsterAbility) => {
    addHomebrewAbility(ability)
    setAbilities(getHomebrewAbilities())
  }, [])

  return (
    <HomebrewContext.Provider
      value={{
        powers,
        perks,
        monsters,
        abilities,
        upsertPower,
        deletePower,
        replacePowers,
        upsertPerk,
        deletePerk,
        replacePerks,
        addMonster,
        updateMonster,
        deleteMonster,
        addAbility,
      }}
    >
      {children}
    </HomebrewContext.Provider>
  )
}

export function useHomebrew(): HomebrewContextValue {
  const ctx = useContext(HomebrewContext)
  if (!ctx) throw new Error('useHomebrew must be used inside <HomebrewProvider>')
  return ctx
}
