import { useState } from 'react'
import type { Power, PowerUpgrade, ActionType, ClassName } from '../../../types/character'
import type { HomebrewPower } from '../../../services/powersStorage'
import { CLASS_NAMES } from '../../../data/powersData'
import PowerUpgradeEditor from './PowerUpgradeEditor'
import { FORM_INPUT, FORM_LABEL } from '../../../styles/classes'
import ConfirmButton from '../../ui/ConfirmButton'

interface Props {
  initial: HomebrewPower
  isOfficial: boolean
  isOverridden: boolean
  readOnly?: boolean
  onSave: (power: HomebrewPower) => void
  onReset?: () => void
  onDelete?: () => void
  onCancel: () => void
}

const ACTION_TYPES: ActionType[] = [
  'Standard',
  'Quick',
  'Movement',
  'Free',
  'Reaction',
  'Maintain',
  'Overdrive',
  'Ultimate',
  'Passive',
]

const TIERS: Array<{ value: Power['tier']; label: string }> = [
  { value: 'baseline', label: 'Baseline' },
  { value: 1, label: 'Tier I' },
  { value: 2, label: 'Tier II' },
  { value: 'lv3', label: 'Level 3' },
  { value: 'lv8', label: 'Level 8' },
  { value: 'lv10', label: 'Level 10' },
]

const RANGES = ['Self', 'Adjacent', 'Nearby', 'Far', 'Very Far', 'See Effects', 'Special']

// Create/edit/view form for a GM power definition including action type, cost, range, and upgrades.
// [JSas | 2026-05-25] Modified: replaced local inputCls/labelCls with FORM_INPUT/FORM_LABEL; swapped inline confirm state for ConfirmButton
export default function PowerEditorForm({
  initial,
  isOfficial,
  isOverridden,
  readOnly = false,
  onSave,
  onReset,
  onDelete,
  onCancel,
}: Props) {
  const isNew = !isOfficial && !isOverridden

  const [className, setClassName] = useState<ClassName>(initial.className)
  const [tier, setTier] = useState<Power['tier']>(initial.tier)
  const [name, setName] = useState(initial.name)
  const [actionType, setActionType] = useState<ActionType>(initial.actionType)
  const [additionalActionTypes, setAdditionalActionTypes] = useState<ActionType[]>(
    initial.additionalActionTypes ?? []
  )
  const [cost, setCost] = useState(initial.cost)
  const [target, setTarget] = useState(initial.target)
  const [range, setRange] = useState(initial.range)
  const [effectsText, setEffectsText] = useState(initial.effectsText)
  const [upgrades, setUpgrades] = useState<PowerUpgrade[]>(initial.upgrades)
  function handleSave() {
    if (!name.trim()) return
    onSave({
      ...initial,
      className,
      tier,
      name: name.trim(),
      actionType,
      additionalActionTypes: additionalActionTypes.length > 0 ? additionalActionTypes : undefined,
      cost: cost.trim(),
      target: target.trim(),
      range: range.trim(),
      effectsText: effectsText.trim(),
      upgrades,
    })
  }

  const tierLabel = TIERS.find((t) => t.value === initial.tier)?.label ?? String(initial.tier)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs px-3 py-1.5 rounded border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors"
        >
          ← {readOnly ? 'Back' : 'Cancel'}
        </button>
        <h1 className="text-xl font-bold text-gray-100">
          {isNew ? 'New Power' : readOnly ? `View: ${initial.name}` : `Edit: ${initial.name}`}
        </h1>
        {isOfficial && !isOverridden && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900 text-blue-300">
            Official
          </span>
        )}
        {isOverridden && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900 text-amber-300">
            Overridden
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Identity */}
        <section className="bg-gray-900 rounded-lg p-4 space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Identity</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={FORM_LABEL}>Class</label>
              {isOfficial || readOnly ? (
                <p className="text-sm text-gray-300 px-3 py-1.5 bg-gray-800 rounded border border-gray-700">
                  {initial.className}
                </p>
              ) : (
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value as ClassName)}
                  className={FORM_INPUT}
                >
                  {CLASS_NAMES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className={FORM_LABEL}>Tier</label>
              {isOfficial || readOnly ? (
                <p className="text-sm text-gray-300 px-3 py-1.5 bg-gray-800 rounded border border-gray-700">
                  {tierLabel}
                </p>
              ) : (
                <select
                  value={String(tier)}
                  onChange={(e) => {
                    const v = e.target.value
                    setTier(v === '1' ? 1 : v === '2' ? 2 : (v as Power['tier']))
                  }}
                  className={FORM_INPUT}
                >
                  {TIERS.map((t) => (
                    <option key={String(t.value)} value={String(t.value)}>
                      {t.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div>
            <label className={FORM_LABEL}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={readOnly}
              className={FORM_INPUT}
              placeholder="Power name"
            />
          </div>
        </section>

        {/* Mechanics */}
        <section className="bg-gray-900 rounded-lg p-4 space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mechanics</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={FORM_LABEL.replace('mb-1', '')}>Action Type</label>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => setAdditionalActionTypes((prev) => [...prev, 'Standard'])}
                    className="text-xs px-3 py-1.5 rounded border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors"
                  >
                    + Add Action
                  </button>
                )}
              </div>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value as ActionType)}
                disabled={readOnly}
                className={FORM_INPUT}
              >
                {ACTION_TYPES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              {additionalActionTypes.map((at, i) => (
                <div key={i} className="flex items-center gap-1.5 mt-1.5">
                  <select
                    value={at}
                    onChange={(e) =>
                      setAdditionalActionTypes((prev) =>
                        prev.map((v, idx) => (idx === i ? (e.target.value as ActionType) : v))
                      )
                    }
                    disabled={readOnly}
                    className={`${FORM_INPUT} flex-1`}
                  >
                    {ACTION_TYPES.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() =>
                        setAdditionalActionTypes((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      className="text-xs text-gray-500 hover:text-red-400 px-2 py-1 transition-colors shrink-0"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div>
              <label className={FORM_LABEL}>Cost</label>
              <input
                type="text"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                readOnly={readOnly}
                className={FORM_INPUT}
                placeholder="e.g. 2 Fury"
              />
            </div>
            <div>
              <label className={FORM_LABEL}>Target</label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                readOnly={readOnly}
                className={FORM_INPUT}
                placeholder="e.g. Single"
              />
            </div>
            <div>
              <label className={FORM_LABEL}>Range</label>
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                disabled={readOnly}
                className={FORM_INPUT}
              >
                {RANGES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={FORM_LABEL}>Effects Text</label>
            <textarea
              value={effectsText}
              onChange={(e) => setEffectsText(e.target.value)}
              readOnly={readOnly}
              rows={5}
              className={`${FORM_INPUT} resize-none`}
              placeholder="Describe what the power does..."
            />
          </div>
        </section>

        <PowerUpgradeEditor upgrades={upgrades} readOnly={readOnly} onChange={setUpgrades} />

        {/* Actions */}
        {!readOnly && (
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleSave}
              disabled={!name.trim()}
              className="px-4 py-2 rounded bg-amber-700 hover:bg-amber-600 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              {isOfficial && !isOverridden ? 'Save as Override' : 'Save'}
            </button>

            {isOverridden && onReset && (
              <ConfirmButton
                triggerLabel="Reset to Default"
                promptText="Reset to official?"
                confirmLabel="Confirm Reset"
                onConfirm={onReset}
                triggerClassName="text-xs px-3 py-1.5 rounded border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors"
              />
            )}

            {!isOfficial && onDelete && (
              <ConfirmButton
                triggerLabel="Delete"
                promptText="Delete this power?"
                confirmLabel="Confirm Delete"
                onConfirm={onDelete}
                triggerClassName="text-xs px-3 py-1.5 rounded border border-red-900 text-red-400 hover:border-red-700 hover:text-red-300 transition-colors ml-auto"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
