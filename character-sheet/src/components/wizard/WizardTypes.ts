import type { Race, ClassName, CorePath, Power } from '../../types/character'
import type { Weapon, ArmorItem } from '../../types/equipment'
import type { Attributes } from '../../types/character'

export type ArrayChoice = 'balanced' | 'focused'

// balanced: +1, +1, 0, -1
// focused:  +2, 0, 0, -1
export const ARRAY_MODIFIERS: Record<ArrayChoice, number[]> = {
  balanced: [1, 1, 0, -1],
  focused:  [2, 0, 0, -1],
}

export interface WizardDraft {
  // Step 0 — Name
  name: string
  age: string
  startingDenerim: 150 | 250

  // Step 1 — Race
  race: Race | null

  // Step 2 — Attributes
  arrayChoice: ArrayChoice
  // Maps attribute key to the modifier value assigned to it (or null if unassigned)
  attrAssignments: Record<keyof Attributes, number | null>

  // Step 3 — Class
  className: ClassName | null

  // Step 4 — Core Paths
  corePaths: CorePath[]

  // Step 5 — Perk
  selectedPerkId: string | null

  // Step 6 — Powers
  powers: Power[]

  // Step 7 — Equipment
  weapons: Weapon[]
  armor: ArmorItem[]
}

export const INITIAL_DRAFT: WizardDraft = {
  name: '',
  age: '',
  startingDenerim: 150,
  race: null,
  arrayChoice: 'balanced',
  attrAssignments: { might: null, agility: null, mind: null, presence: null },
  className: null,
  corePaths: [],
  selectedPerkId: null,
  powers: [],
  weapons: [],
  armor: [],
}

export const STEPS = [
  'Name',
  'Race',
  'Attributes',
  'Class',
  'Core Paths',
  'Perk',
  'Powers',
  'Equipment',
  'Review',
] as const

export type StepName = (typeof STEPS)[number]
