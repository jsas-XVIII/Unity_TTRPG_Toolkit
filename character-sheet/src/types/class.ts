import type { ClassName } from './character'
import type { WeaponCategory, ArmorCategory } from './equipment'

export type MainAttribute = 'might' | 'agility' | 'mind' | 'presence'

export interface ClassPerkOption {
  id: string
  name: string
  description: string
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
  weaponCompetencies: WeaponCategory[]
  armorCompetencies: ArmorCategory[]
  classPerks: ClassPerkOption[]
  classPaths?: ClassPathOption[]
  startingArtifactCapacity: number
}
