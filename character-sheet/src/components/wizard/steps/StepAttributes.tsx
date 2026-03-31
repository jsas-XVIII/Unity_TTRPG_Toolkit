import { RACE_MAP } from '../../../constants/races'
import type { Attributes } from '../../../types/character'
import { ARRAY_MODIFIERS, type WizardDraft, type ArrayChoice } from '../WizardTypes'

interface Props {
  draft: WizardDraft
  onChange: (patch: Partial<WizardDraft>) => void
}

const ATTR_KEYS: (keyof Attributes)[] = ['might', 'agility', 'mind', 'presence']
const ATTR_LABELS: Record<keyof Attributes, string> = {
  might: 'MIGHT',
  agility: 'AGILITY',
  mind: 'MIND',
  presence: 'PRESENCE',
}
const ATTR_DESC: Record<keyof Attributes, string> = {
  might: 'Strength, HP, Recuperations',
  agility: 'Speed, DR, reflexes',
  mind: 'MR, intelligence',
  presence: 'Social, charisma',
}

export default function StepAttributes({ draft, onChange }: Props) {
  const racial = draft.race ? RACE_MAP[draft.race].baseAttributes : null
  const modifiers = ARRAY_MODIFIERS[draft.arrayChoice]

  // Pool of unassigned modifiers (as value occurrences)
  const assigned = Object.values(draft.attrAssignments).filter((v) => v !== null) as number[]
  const pool = [...modifiers]
  for (const a of assigned) {
    const idx = pool.indexOf(a)
    if (idx !== -1) pool.splice(idx, 1)
  }

  function assignModifier(attr: keyof Attributes, mod: number | null) {
    const newAssignments = { ...draft.attrAssignments, [attr]: mod }
    onChange({ attrAssignments: newAssignments })
  }

  function switchArray(choice: ArrayChoice) {
    onChange({
      arrayChoice: choice,
      attrAssignments: { might: null, agility: null, mind: null, presence: null },
    })
  }

  function getFinal(attr: keyof Attributes): number | null {
    if (!racial) return null
    const mod = draft.attrAssignments[attr]
    if (mod === null) return null
    return racial[attr] + mod
  }

  // Available options for a given attribute's dropdown:
  // include the currently assigned value + the pool
  function optionsFor(attr: keyof Attributes): number[] {
    const current = draft.attrAssignments[attr]
    const opts = [...pool]
    if (current !== null) opts.unshift(current)
    // deduplicate while preserving order
    return opts.filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => b - a)
  }

  const allAssigned = ATTR_KEYS.every((k) => draft.attrAssignments[k] !== null)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Distribute Attributes</h2>
        <p className="text-sm text-gray-400">
          Choose an array and assign each modifier to one attribute. No attribute may exceed +3 at
          character creation.
        </p>
      </div>

      {/* Array choice */}
      <div>
        <p className="text-sm font-semibold text-gray-300 mb-2">Choose an array</p>
        <div className="flex gap-3">
          {(['balanced', 'focused'] as ArrayChoice[]).map((choice) => (
            <button
              key={choice}
              onClick={() => switchArray(choice)}
              className={`flex-1 py-3 rounded-lg border-2 text-center transition-colors ${
                draft.arrayChoice === choice
                  ? 'border-amber-500 bg-amber-950'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-500'
              }`}
            >
              <div className="text-sm font-semibold text-white capitalize mb-1">{choice}</div>
              <div className="text-amber-400 font-mono text-sm">
                {ARRAY_MODIFIERS[choice].map((m, i) => (
                  <span key={i} className="mr-1">
                    {m > 0 ? `+${m}` : m}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modifier pool remaining */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Unassigned modifiers:</span>
        {pool.length === 0 ? (
          <span className="text-xs text-green-400">All assigned ✓</span>
        ) : (
          pool.map((m, i) => (
            <span
              key={i}
              className={`text-sm font-bold px-2 py-0.5 rounded ${m > 0 ? 'bg-amber-900 text-amber-300' : m < 0 ? 'bg-red-900 text-red-300' : 'bg-gray-700 text-gray-400'}`}
            >
              {m > 0 ? `+${m}` : m}
            </span>
          ))
        )}
      </div>

      {/* Attribute assignment rows */}
      <div className="space-y-2">
        {ATTR_KEYS.map((attr) => {
          const racialVal = racial ? racial[attr] : 0
          const finalVal = getFinal(attr)
          const current = draft.attrAssignments[attr]
          const opts = optionsFor(attr)

          return (
            <div
              key={attr}
              className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 bg-gray-800 rounded-lg px-4 py-3"
            >
              <div>
                <div className="text-sm font-bold text-white">{ATTR_LABELS[attr]}</div>
                <div className="text-xs text-gray-500">{ATTR_DESC[attr]}</div>
              </div>

              <div className="text-center">
                <div className="text-xs text-gray-500 mb-0.5">Racial</div>
                <div
                  className={`text-base font-bold ${racialVal > 0 ? 'text-amber-400' : racialVal < 0 ? 'text-red-400' : 'text-gray-400'}`}
                >
                  {racialVal > 0 ? `+${racialVal}` : racialVal}
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs text-gray-500 mb-0.5">Modifier</div>
                <select
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-amber-500"
                  value={current ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : Number(e.target.value)
                    assignModifier(attr, val)
                  }}
                >
                  <option value="">—</option>
                  {opts.map((m, i) => (
                    <option key={i} value={m}>
                      {m > 0 ? `+${m}` : m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center min-w-[2.5rem]">
                <div className="text-xs text-gray-500 mb-0.5">Final</div>
                <div
                  className={`text-xl font-bold ${
                    finalVal === null
                      ? 'text-gray-600'
                      : finalVal > 0
                        ? 'text-amber-400'
                        : finalVal < 0
                          ? 'text-red-400'
                          : 'text-white'
                  }`}
                >
                  {finalVal === null ? '?' : finalVal > 0 ? `+${finalVal}` : finalVal}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {allAssigned && (
        <p className="text-xs text-green-400">
          All attributes assigned. No attribute may exceed +3 — check with your GM if needed.
        </p>
      )}
    </div>
  )
}
