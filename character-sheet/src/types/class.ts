import type { ClassName } from './character'
import type { WeaponCategory, ArmorCategory } from './equipment'

export type MainAttribute = 'might' | 'agility' | 'mind' | 'presence'

export interface ClassPerkOption {
  id: string
  name: string
  description: string
}

export interface ClassPathBaselinePower {
  name: string
  actionType: string
  cost: string
  target: string
  range: string
  successEffect: string
  failureEffect: string
}

export interface ClassPathOption {
  id: string
  name: string
  description: string
  primaryResourceMax?: number
  primaryResourceRechargeDie?: string
  secondaryResourceMax?: number
  additionalArmorCompetencies?: ArmorCategory[]
  additionalWeaponCompetencies?: WeaponCategory[]
  baselinePower?: ClassPathBaselinePower
}

export interface ClassDefinition {
  name: ClassName
  description: string
  mainAttribute: MainAttribute
  hpBase: number
  recuperationDie: string
  primaryResourceName: string
  primaryResourceMax: number
  primaryResourceRechargeDie: string
  secondaryResourceName: string | null
  secondaryResourceMax: number | null
  secondaryResourceStarting?: number // defaults to 0 if omitted
  weaponCompetencies: WeaponCategory[]
  armorCompetencies: ArmorCategory[]
  classPerks: ClassPerkOption[]
  classPaths?: ClassPathOption[]
  startingArtifactCapacity: number
}
