import type { WizardDraft } from './WizardTypes'

const TOTAL_CORE_PATH_POINTS = 5

export function validateStepName(draft: WizardDraft): string | null {
  if (!draft.name.trim()) return 'Character name is required.'
  return null
}

export function validateStepRace(draft: WizardDraft): string | null {
  if (!draft.race) return 'Please select a race.'
  return null
}

export function validateStepAttributes(draft: WizardDraft): string | null {
  const allAssigned = (['might', 'agility', 'mind', 'presence'] as const).every(
    (k) => draft.attrAssignments[k] !== null
  )
  if (!allAssigned) return 'Assign a modifier to every attribute.'
  return null
}

export function validateStepClass(draft: WizardDraft): string | null {
  if (!draft.className) return 'Please select a class.'
  return null
}

export function validateStepCorePaths(draft: WizardDraft): string | null {
  if (draft.corePaths.length !== 3) return 'You must have exactly 3 Core Paths.'
  const total = draft.corePaths.reduce((s, p) => s + p.points, 0)
  if (total !== TOTAL_CORE_PATH_POINTS)
    return `You must spend exactly 5 points (currently ${total}).`
  if (draft.corePaths.some((p) => !p.name.trim())) return 'All Core Paths must have a name.'
  return null
}

export function validateStepPerk(draft: WizardDraft): string | null {
  if (!draft.selectedPerkId) return 'Please choose a Class Perk.'
  return null
}

// Powers step is optional — no hard validation
export function validateStepPowers(_draft: WizardDraft): string | null {
  return null
}

export function validateStepEquipment(_draft: WizardDraft): string | null {
  return null
}
