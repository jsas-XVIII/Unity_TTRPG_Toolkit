import { CLASSES } from '../../../constants/classes'
import type { ClassName } from '../../../types/character'
import type { WizardDraft } from '../WizardTypes'

interface Props {
  draft: WizardDraft
  onChange: (patch: Partial<WizardDraft>) => void
}

const ATTR_LABEL: Record<string, string> = {
  might: 'MIGHT',
  agility: 'AGILITY',
  mind: 'MIND',
  presence: 'PRESENCE',
}

export default function StepClass({ draft, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Choose a Class</h2>
        <p className="text-sm text-gray-400">
          Your class defines your role, resources, competencies, and powers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CLASSES.map((cls) => {
          const selected = draft.className === cls.name
          return (
            <button
              key={cls.name}
              onClick={() =>
                onChange({
                  className: cls.name as ClassName,
                  classPath: null,
                  selectedPerkId: null,
                })
              }
              className={`text-left rounded-lg border-2 p-4 transition-colors ${
                selected
                  ? 'border-amber-500 bg-amber-950'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-500'
              }`}
            >
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-base font-bold text-white">{cls.name}</span>
                <span className="text-xs text-amber-400 font-semibold">
                  {ATTR_LABEL[cls.mainAttribute]}
                </span>
              </div>

              <p className="text-xs text-gray-400 mb-3 italic">{cls.description}</p>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <span className="text-gray-500">HP Base</span>
                <span className="text-gray-300">{cls.hpBase} + MIGHT</span>
                <span className="text-gray-500">Resource</span>
                <span className="text-gray-300">
                  {cls.primaryResourceName} [{cls.primaryResourceMax}]
                </span>
                <span className="text-gray-500">Recharge</span>
                <span className="text-gray-300">{cls.primaryResourceRechargeDie}</span>
                {cls.secondaryResourceName && (
                  <>
                    <span className="text-gray-500">Secondary</span>
                    <span className="text-blue-400">{cls.secondaryResourceName}</span>
                  </>
                )}
                <span className="text-gray-500">Weapons</span>
                <span className="text-gray-300">{cls.weaponCompetencies.join(', ')}</span>
                <span className="text-gray-500">Armor</span>
                <span className="text-gray-300">{cls.armorCompetencies.join(', ')}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
