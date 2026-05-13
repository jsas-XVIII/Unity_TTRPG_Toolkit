import { v4 as uuidv4 } from 'uuid'
import { RACE_MAP } from '../../constants/races'
import { CLASS_MAP } from '../../constants/classes'
import type { Character, Perk, Attributes } from '../../types/character'
import type { WizardDraft } from './WizardTypes'

export function buildCharacter(draft: WizardDraft): Character {
  const raceDef = RACE_MAP[draft.race!]
  const classDef = CLASS_MAP[draft.className!]
  const selectedPath = classDef.classPaths?.find((p) => p.id === draft.classPath)

  // Compute final attributes
  const attrKeys: (keyof Attributes)[] = ['might', 'agility', 'mind', 'presence']
  const attributes = attrKeys.reduce((acc, key) => {
    acc[key] = raceDef.baseAttributes[key] + (draft.attrAssignments[key] ?? 0)
    return acc
  }, {} as Attributes)

  // Selected class perk → Class perk entry
  const selectedPerk = classDef.classPerks.find((p) => p.id === draft.selectedPerkId)
  const perks: Perk[] = selectedPerk
    ? [
        {
          id: uuidv4(),
          name: selectedPerk.name,
          description: selectedPerk.description,
          source: 'Class',
        },
      ]
    : []

  const spentDenerim = [
    ...draft.weapons.map((w) => w.cost),
    ...draft.armor.map((a) => a.cost),
  ].reduce((s, c) => s + c, 0)

  const maxHp = classDef.hpBase + attributes.might

  return {
    id: uuidv4(),
    name: draft.name,
    race: draft.race!,
    className: draft.className!,
    classPath: draft.classPath,
    level: 1,
    xp: 0,
    age: draft.age,
    notes: '',
    attributes,
    arBonus: 0,
    drBonus: 0,
    hpBonus: 0,
    currentHp: maxHp,
    fadingStacks: 0,
    primaryResource: {
      name: classDef.primaryResourceName,
      current: selectedPath?.primaryResourceMax ?? classDef.primaryResourceMax,
      max: selectedPath?.primaryResourceMax ?? classDef.primaryResourceMax,
      rechargeDie: selectedPath?.primaryResourceRechargeDie ?? classDef.primaryResourceRechargeDie,
    },
    secondaryResource:
      classDef.secondaryResourceName && classDef.secondaryResourceMax
        ? {
            name: classDef.secondaryResourceName,
            current: classDef.secondaryResourceStarting ?? 0,
            max: selectedPath?.secondaryResourceMax ?? classDef.secondaryResourceMax,
          }
        : null,
    recuperationBonus: 0,
    recuperationDie: classDef.recuperationDie,
    corePaths: draft.corePaths,
    powers: draft.powers,
    perks,
    weapons: draft.weapons,
    armor: draft.armor,
    artifactIds: [],
    artifactCapacity: classDef.startingArtifactCapacity,
    denerim: draft.startingDenerim - spentDenerim,
    necessities: 3,
    gear: 3,
  }
}
