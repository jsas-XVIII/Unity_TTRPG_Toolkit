// HomebrewProvider — owns the React state mirror of the homebrew localStorage stores.
//
// Mutators delegate to the storage services first (which write localStorage and keep
// their internal cache in sync), then update React state. If the storage call throws
// (quota), the React state is not updated, keeping it consistent with what's persisted.
// Non-React callers (data-layer functions like getPowersByClass) read from the storage
// cache, which stays fresh because all mutations flow through this provider.
import { useCallback, useState, type ReactNode } from 'react'
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
import type { Perk } from '../types/character'
import type { Monster, MonsterAbility } from '../types/monster'
import { HomebrewContext } from './HomebrewContext'

export function HomebrewProvider({ children }: { children: ReactNode }) {
  const [powers, setPowers] = useState<HomebrewPower[]>(() => getHomebrewPowers())
  const [perks, setPerks] = useState<Perk[]>(() => getHomebrewPerks())
  const [monsters, setMonsters] = useState<Monster[]>(() => getHomebrewMonsters())
  const [abilities, setAbilities] = useState<MonsterAbility[]>(() => getHomebrewAbilities())

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
