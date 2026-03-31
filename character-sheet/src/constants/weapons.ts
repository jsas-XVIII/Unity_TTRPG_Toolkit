import type { WeaponCategory } from '../types/equipment'

export interface WeaponTemplate {
  category: WeaponCategory
  damageDie: string
  cost: number
  examples: string[]
}

export const WEAPON_TEMPLATES: WeaponTemplate[] = [
  {
    category: 'Light Melee',
    damageDie: '1d6',
    cost: 40,
    examples: ['Dagger', 'Shortsword', 'Rapier', 'Staff', 'Club', 'Fist Weapon'],
  },
  {
    category: 'Medium Melee',
    damageDie: '1d8',
    cost: 50,
    examples: ['Longsword', 'Scimitar', 'Warhammer', 'Mace', 'Battleaxe', 'Spear'],
  },
  {
    category: 'Heavy Melee',
    damageDie: '1d12',
    cost: 70,
    examples: ['Greatsword', 'Greataxe', 'Maul', 'Halberd'],
  },
  {
    category: 'Thrown Light',
    damageDie: '1d4',
    cost: 10,
    examples: ['Darts', 'Shurikens', 'Slingshot', 'Throwing Knives'],
  },
  {
    category: 'Ranged Light',
    damageDie: '1d6',
    cost: 40,
    examples: ['Hand Crossbow', 'Shortbow', 'Pistol'],
  },
  {
    category: 'Ranged Heavy',
    damageDie: '1d8',
    cost: 60,
    examples: ['Longbow', 'Crossbow', 'Rifle', 'Revolver'],
  },
]

export const WEAPON_TEMPLATE_MAP = Object.fromEntries(
  WEAPON_TEMPLATES.map((w) => [w.category, w])
) as Record<WeaponCategory, WeaponTemplate>
