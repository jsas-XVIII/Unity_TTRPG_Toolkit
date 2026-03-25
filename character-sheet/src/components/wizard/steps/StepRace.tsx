import { RACES } from '../../../constants/races'
import type { Race } from '../../../types/character'
import type { WizardDraft } from '../WizardTypes'

interface Props {
  draft: WizardDraft
  onChange: (patch: Partial<WizardDraft>) => void
}

const ATTR_LABELS = ['MGT', 'AGI', 'MND', 'PRE']
const ATTR_KEYS = ['might', 'agility', 'mind', 'presence'] as const

export default function StepRace({ draft, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Choose a Race</h2>
        <p className="text-sm text-gray-400">Your race sets your baseline attributes and grants a unique Racial Power.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {RACES.map((race) => {
          const selected = draft.race === race.name
          return (
            <button
              key={race.name}
              onClick={() => onChange({ race: race.name as Race })}
              className={`text-left rounded-lg border-2 p-4 transition-colors ${
                selected
                  ? 'border-amber-500 bg-amber-950'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-500'
              }`}
            >
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-lg font-bold text-white">{race.name}</span>
                <span className="text-xs text-gray-500 italic">"{race.motto}"</span>
              </div>

              {/* Attribute baselines */}
              <div className="flex gap-3 mb-3">
                {ATTR_KEYS.map((key, i) => {
                  const val = race.baseAttributes[key]
                  return (
                    <div key={key} className="text-center">
                      <div className="text-xs text-gray-500">{ATTR_LABELS[i]}</div>
                      <div className={`text-base font-bold ${val > 0 ? 'text-amber-400' : val < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {val > 0 ? `+${val}` : val}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Racial power */}
              <div className={`rounded p-2 text-xs ${selected ? 'bg-amber-900/40' : 'bg-gray-900'}`}>
                <span className="font-semibold text-amber-300">{race.racialPowerName}: </span>
                <span className="text-gray-400">{race.racialPowerDescription}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function validateStepRace(draft: WizardDraft): string | null {
  if (!draft.race) return 'Please select a race.'
  return null
}
