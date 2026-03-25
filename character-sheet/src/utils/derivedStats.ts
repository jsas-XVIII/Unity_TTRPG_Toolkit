import type { Character } from '../types/character'
import type { ClassDefinition } from '../types/class'

export interface DerivedStats {
  ar: number
  dr: number
  mr: number
  speed: number
  av: number
  maxHp: number
  maxRecuperations: number
  hl: number
}

export function computeDerivedStats(char: Character, classDef: ClassDefinition): DerivedStats {
  const { attributes, level, arBonus, drBonus, recuperationBonus } = char

  const mainAttr = attributes[classDef.mainAttribute]

  const ar = mainAttr + arBonus
  const dr = attributes.agility + drBonus
  const mr = attributes.mind
  const speed = attributes.agility
  const hl = Math.max(1, Math.floor(level / 2))

  const av = char.armor.reduce((sum, a) => sum + a.av, 0)
  const maxHp = classDef.hpBase + attributes.might
  const maxRecuperations = 2 + Math.floor(attributes.might / 2) + recuperationBonus

  return { ar, dr, mr, speed, av, maxHp, maxRecuperations, hl }
}
