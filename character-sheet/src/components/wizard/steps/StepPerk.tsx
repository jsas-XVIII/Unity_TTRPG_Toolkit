import { CLASS_MAP } from '../../../constants/classes'
import { getPowersByClass } from '../../../data/powersData'
import PowerReferenceCard from '../../powers/PowerReferenceCard'
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

  const { baseline: baselinePowers } = draft.className
    ? getPowersByClass(draft.className)
    : { baseline: [] }

  return (
    <div className="space-y-6">
      {classDef.classPaths && (
        <div className="space-y-3">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Class Path</h2>
            <p className="text-sm text-gray-400">
              Choose your {classDef.name}'s path. This shapes your resources and baseline power.
            </p>
          </div>

          <div className="space-y-3">
            {classDef.classPaths.map((path) => {
              const selected = draft.classPath === path.id
              const extraArmor = path.additionalArmorCompetencies ?? []
              const extraWeapons = path.additionalWeaponCompetencies ?? []
              const pathPower = baselinePowers.find((p) => p.restrictToClassPath === path.id)

              return (
                // Outer div — provides the selection border; not a button so PowerReferenceCard
                // can render as a full interactive card inside without nesting issues.
                <div
                  key={path.id}
                  onClick={() => onChange({ classPath: path.id })}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onChange({ classPath: path.id })}
                  className={`rounded-lg border-2 transition-colors cursor-pointer ${
                    selected
                      ? 'border-amber-500 bg-amber-950'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                  }`}
                >
                  {/* Selectable header area */}
                  <div className="p-4">
                    {/* Radio + name */}
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${selected ? 'border-amber-500 bg-amber-500' : 'border-gray-500'}`}
                      />
                      <span className="text-base font-bold text-white">{path.name}</span>
                    </div>

                    {/* Flavour */}
                    <p className="text-sm text-gray-400 ml-7 mb-3">{path.description}</p>

                    {/* Grants summary */}
                    <div className="ml-7 space-y-1">
                      {path.primaryResourceMax !== undefined && (
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs bg-gray-700 text-amber-300 px-2 py-0.5 rounded">
                            {path.primaryResourceMax} {classDef.primaryResourceName}
                          </span>
                          {path.primaryResourceRechargeDie && (
                            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                              Recharge {path.primaryResourceRechargeDie}
                            </span>
                          )}
                          {path.secondaryResourceMax !== undefined &&
                            classDef.secondaryResourceName && (
                              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                                {path.secondaryResourceMax} {classDef.secondaryResourceName}
                              </span>
                            )}
                        </div>
                      )}
                      {(extraArmor.length > 0 || extraWeapons.length > 0) && (
                        <div className="flex flex-wrap gap-2">
                          {extraArmor.map((c) => (
                            <span
                              key={c}
                              className="text-xs bg-gray-700 text-blue-300 px-2 py-0.5 rounded"
                            >
                              {c} Armour
                            </span>
                          ))}
                          {extraWeapons.map((c) => (
                            <span
                              key={c}
                              className="text-xs bg-gray-700 text-blue-300 px-2 py-0.5 rounded"
                            >
                              {c} Weapons
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Baseline power card — sits outside the button area to avoid nesting */}
                  {pathPower && (
                    <div className="px-4 pb-4 ml-7" onClick={(e) => e.stopPropagation()}>
                      <PowerReferenceCard power={pathPower} className={draft.className!} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Class Perk</h2>
          <p className="text-sm text-gray-400">
            Choose <strong className="text-white">1</strong> of your {classDef.name}'s starting
            perks. These are mostly non-combat bonuses that reinforce your class identity.
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
      </div>

      <p className="text-xs text-gray-600">
        Additional General Perks become available as you level up.
      </p>
    </div>
  )
}
