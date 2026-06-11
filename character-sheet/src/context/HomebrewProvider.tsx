// HomebrewProvider — owns the React state mirror of the homebrew and official localStorage stores.
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
  replaceHomebrewMonsters,
  getHomebrewAbilities,
  addHomebrewAbility,
  replaceHomebrewAbilities,
} from '../services/monsterStorage'
import {
  getHomebrewArtifacts,
  upsertHomebrewArtifact,
  deleteHomebrewArtifact,
  replaceHomebrewArtifacts,
} from '../services/artifactsStorage'
import {
  getOfficialPowers,
  setOfficialPowers,
  getOfficialPerks,
  setOfficialPerks,
  getOfficialMonsters,
  setOfficialMonsters,
  getOfficialAbilities,
  setOfficialAbilities,
  getOfficialArtifacts,
  setOfficialArtifacts,
  clearAllOfficialContent,
} from '../services/officialContentStorage'
import type { Perk } from '../types/character'
import type { Monster, MonsterAbility } from '../types/monster'
import type { ArtifactDefinition } from '../types/artifact'
import type { ClassPowerPool } from '../data/powersData'
import type { OfficialContentBundle } from '../utils/parseOfficialBundle'
import { HomebrewContext } from './HomebrewContext'

export function HomebrewProvider({ children }: { children: ReactNode }) {
  const [powers, setPowers] = useState<HomebrewPower[]>(() => getHomebrewPowers())
  const [perks, setPerks] = useState<Perk[]>(() => getHomebrewPerks())
  const [monsters, setMonsters] = useState<Monster[]>(() => getHomebrewMonsters())
  const [abilities, setAbilities] = useState<MonsterAbility[]>(() => getHomebrewAbilities())
  const [artifacts, setArtifacts] = useState<ArtifactDefinition[]>(() => getHomebrewArtifacts())

  const [officialPowers, setOfficialPowersState] = useState<Record<string, ClassPowerPool> | null>(
    () => getOfficialPowers()
  )
  const [officialPerks, setOfficialPerksState] = useState<Perk[]>(() => getOfficialPerks() ?? [])
  const [officialMonsters, setOfficialMonstersState] = useState<Monster[]>(
    () => getOfficialMonsters() ?? []
  )
  const [officialAbilities, setOfficialAbilitiesState] = useState<MonsterAbility[]>(
    () => getOfficialAbilities() ?? []
  )
  const [officialArtifacts, setOfficialArtifactsState] = useState<ArtifactDefinition[]>(
    () => getOfficialArtifacts() ?? []
  )

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

  const upsertArtifact = useCallback((artifact: ArtifactDefinition) => {
    upsertHomebrewArtifact(artifact)
    setArtifacts(getHomebrewArtifacts())
  }, [])

  const deleteArtifact = useCallback((id: string) => {
    deleteHomebrewArtifact(id)
    setArtifacts(getHomebrewArtifacts())
  }, [])

  const replaceArtifacts = useCallback((next: ArtifactDefinition[]) => {
    replaceHomebrewArtifacts(next)
    setArtifacts(getHomebrewArtifacts())
  }, [])

  const clearAllHomebrew = useCallback(() => {
    replaceHomebrewPowers([])
    setPowers([])
    replaceHomebrewPerks([])
    setPerks([])
    replaceHomebrewMonsters([])
    setMonsters([])
    replaceHomebrewAbilities([])
    setAbilities([])
    replaceHomebrewArtifacts([])
    setArtifacts([])
  }, [])

  const importOfficialContent = useCallback((bundle: OfficialContentBundle) => {
    try {
      setOfficialPowers(bundle.powers)
      setOfficialPerks(bundle.perks)
      setOfficialMonsters(bundle.monsters)
      setOfficialAbilities(bundle.monsterAbilities)
      setOfficialArtifacts(bundle.artifacts)
    } catch (e) {
      // Partial write (quota): wipe whatever was committed so storage is consistent.
      // We don't attempt to restore the previous values — re-writing large JSON blobs
      // when already at quota would also fail. The caller surfaces an error to the user.
      clearAllOfficialContent()
      setOfficialPowersState(null)
      setOfficialPerksState([])
      setOfficialMonstersState([])
      setOfficialAbilitiesState([])
      setOfficialArtifactsState([])
      throw e
    }
    setOfficialPowersState(getOfficialPowers())
    setOfficialPerksState(getOfficialPerks() ?? [])
    setOfficialMonstersState(getOfficialMonsters() ?? [])
    setOfficialAbilitiesState(getOfficialAbilities() ?? [])
    setOfficialArtifactsState(getOfficialArtifacts() ?? [])
  }, [])

  const clearOfficialContent = useCallback(() => {
    clearAllOfficialContent()
    setOfficialPowersState(null)
    setOfficialPerksState([])
    setOfficialMonstersState([])
    setOfficialAbilitiesState([])
    setOfficialArtifactsState([])
  }, [])

  return (
    <HomebrewContext.Provider
      value={{
        powers,
        perks,
        monsters,
        abilities,
        artifacts,
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
        upsertArtifact,
        deleteArtifact,
        replaceArtifacts,
        clearAllHomebrew,
        officialPowers,
        officialPerks,
        officialMonsters,
        officialAbilities,
        officialArtifacts,
        importOfficialContent,
        clearOfficialContent,
      }}
    >
      {children}
    </HomebrewContext.Provider>
  )
}
