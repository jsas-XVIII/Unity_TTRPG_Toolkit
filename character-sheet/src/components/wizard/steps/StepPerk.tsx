import { CLASS_MAP } from '../../../constants/classes'
import type { WizardDraft } from '../WizardTypes'

interface Props {
  draft: WizardDraft
  onChange: (patch: Partial<WizardDraft>) => void
}

export default function StepPerk({ draft, onChange }: Props) {
  const classDef = draft.className ? CLASS_MAP[draft.className] : null

  if (!classDef) {
    return <p className="text-gray-400">Go back and select a class first.</p>
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Class Perk</h2>
        <p className="text-sm text-gray-400">
          Choose <strong className="text-white">1</strong> of your {classDef.name}'s starting perks.
          These are mostly non-combat bonuses that reinforce your class identity.
        </p>
      </div>

      <div className="space-y-3">
        {classDef.classPerks.map((perk) => {
          const selected = draft.selectedPerkId === perk.id
          return (
            <button
              key={perk.id}
              onClick={() => onChange({ selectedPerkId: perk.id })}
              className={`w-full text-left rounded-lg border-2 p-4 transition-colors ${
                selected
                  ? 'border-amber-500 bg-amber-950'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${selected ? 'border-amber-500 bg-amber-500' : 'border-gray-500'}`}
                />
                <span className="text-base font-bold text-white">{perk.name}</span>
              </div>
              <p className="text-sm text-gray-400 ml-7">{perk.description}</p>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-gray-600">
        Additional General Perks become available as you level up.
      </p>
    </div>
  )
}
