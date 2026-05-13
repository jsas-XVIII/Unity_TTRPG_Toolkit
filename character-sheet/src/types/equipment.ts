export type WeaponCategory =
  | 'Light Melee'
  | 'Medium Melee'
  | 'Heavy Melee'
  | 'Thrown Light'
  | 'Ranged Light'
  | 'Ranged Heavy'

export type ArmorCategory = 'Light' | 'Heavy' | 'Shield'
export type ArmorQuality = 'Basic' | 'Reinforced' | 'Mastercrafted'

export interface Weapon {
  id: string
  name: string
  category: WeaponCategory
  damageDie: string
  cost: number
  notes: string
}

export interface ArmorItem {
  id: string
  name: string
  category: ArmorCategory
  quality: ArmorQuality
  av: number
  cost: number
  notes: string
}
