import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { INITIAL_DRAFT, STEPS, type WizardDraft } from './WizardTypes'
import { RACE_MAP } from '../../constants/races'
import { CLASS_MAP } from '../../constants/classes'
import type { Character, Perk } from '../../types/character'
import type { Attributes } from '../../types/character'

import StepName from './steps/StepName'
import StepRace from './steps/StepRace'
import StepAttributes from './steps/StepAttributes'
import StepClass from './steps/StepClass'
import StepCorePaths from './steps/StepCorePaths'
import StepPerk from './steps/StepPerk'
import StepPowers from './steps/StepPowers'
import StepEquipment from './steps/StepEquipment'
import StepReview from './steps/StepReview'
import {
  validateStepName,
  validateStepRace,
  validateStepAttributes,
  validateStepClass,
  validateStepCorePaths,
  validateStepPerk,
  validateStepPowers,
  validateStepEquipment,
} from './stepValidators'

interface Props {
  onComplete: (character: Character) => void
  onCancel: () => void
}

const VALIDATORS = [
  validateStepName,
  validateStepRace,
  validateStepAttributes,
  validateStepClass,
  validateStepCorePaths,
  validateStepPerk,
  validateStepPowers,
  validateStepEquipment,
  () => null, // review
]

function buildCharacter(draft: WizardDraft): Character {
  const raceDef = RACE_MAP[draft.race!]
  const classDef = CLASS_MAP[draft.className!]

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
    level: 1,
    xp: 0,
    age: draft.age,
    notes: '',
    attributes,
    arBonus: 0,
    drBonus: 0,
    currentHp: maxHp,
    fadingStacks: 0,
    primaryResource: {
      name: classDef.primaryResourceName,
      current: classDef.primaryResourceMax,
      max: classDef.primaryResourceMax,
      rechargeDie: classDef.primaryResourceRechargeDie,
    },
    secondaryResource:
      classDef.secondaryResourceName && classDef.secondaryResourceMax
        ? { name: classDef.secondaryResourceName, current: 0, max: classDef.secondaryResourceMax }
        : null,
    recuperationBonus: 0,
    recuperationDie: classDef.recuperationDie,
    corePaths: draft.corePaths,
    powers: draft.powers,
    perks,
    weapons: draft.weapons,
    armor: draft.armor,
    artifacts: [],
    artifactCapacity: classDef.startingArtifactCapacity,
    denerim: draft.startingDenerim - spentDenerim,
    necessities: 3,
    gear: 3,
  }
}

export default function CharacterWizard({ onComplete, onCancel }: Props) {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<WizardDraft>(INITIAL_DRAFT)
  const [error, setError] = useState<string | null>(null)

  function patch(changes: Partial<WizardDraft>) {
    setDraft((prev) => ({ ...prev, ...changes }))
    setError(null)
  }

  function goNext() {
    const err = VALIDATORS[step](draft)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    if (step < STEPS.length - 1) setStep((s) => s + 1)
    else onComplete(buildCharacter(draft))
  }

  function goBack() {
    setError(null)
    if (step > 0) setStep((s) => s - 1)
    else onCancel()
  }

  const isLast = step === STEPS.length - 1

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Progress header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span data-testid="wizard-step-label" className="text-sm font-semibold text-gray-300">
              New Character — Step {step + 1} of {STEPS.length}
            </span>
            <span className="text-sm text-amber-400 font-semibold">{STEPS[step]}</span>
          </div>
          {/* Step pills */}
          <div className="flex gap-1 mb-3">
            {STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => {
                  // Only allow jumping back to already-validated steps
                  if (i < step) {
                    setStep(i)
                    setError(null)
                  }
                }}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  i < step
                    ? 'bg-amber-500 cursor-pointer'
                    : i === step
                      ? 'bg-amber-700'
                      : 'bg-gray-700 cursor-default'
                }`}
                title={s}
              />
            ))}
          </div>
          <div className="text-xs text-gray-600 flex justify-between">
            {STEPS.map((s, i) => (
              <span key={s} className={i === step ? 'text-amber-400' : ''}>
                {i === step ? s : ''}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          {step === 0 && <StepName draft={draft} onChange={patch} />}
          {step === 1 && <StepRace draft={draft} onChange={patch} />}
          {step === 2 && <StepAttributes draft={draft} onChange={patch} />}
          {step === 3 && <StepClass draft={draft} onChange={patch} />}
          {step === 4 && <StepCorePaths draft={draft} onChange={patch} />}
          {step === 5 && <StepPerk draft={draft} onChange={patch} />}
          {step === 6 && <StepPowers draft={draft} onChange={patch} />}
          {step === 7 && <StepEquipment draft={draft} onChange={patch} />}
          {step === 8 && <StepReview draft={draft} />}
        </div>
      </div>

      {/* Navigation footer */}
      <div className="bg-gray-900 border-t border-gray-800 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            data-testid="wizard-back"
            onClick={goBack}
            className="px-5 py-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm"
          >
            {step === 0 ? 'Cancel' : '← Back'}
          </button>

          {error && <span data-testid="wizard-error" className="flex-1 text-sm text-red-400">{error}</span>}
          {!error && <span className="flex-1" />}

          <button
            data-testid="wizard-next"
            onClick={goNext}
            className="px-6 py-2 rounded bg-amber-700 hover:bg-amber-600 text-white font-semibold text-sm"
          >
            {isLast ? 'Create Character' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
