import { useState } from 'react'
import type {
  ArtifactDefinition,
  ArtifactCategory,
  ArtifactEffect,
  ArtifactEffectKind,
  ArtifactUpgrade,
} from '../../../types/artifact'
import { uid } from '../../../utils/idGenerator'
import { FORM_INPUT, FORM_LABEL } from '../../../styles/classes'
import ConfirmButton from '../../ui/ConfirmButton'

interface Props {
  initial: ArtifactDefinition
  isOfficial: boolean
  isOverridden: boolean
  readOnly?: boolean
  onSave: (artifact: ArtifactDefinition) => void
  onReset?: () => void
  onDelete?: () => void
  onCancel: () => void
}

const CATEGORIES: ArtifactCategory[] = [
  'Light Melee',
  'Medium Melee',
  'Heavy Melee',
  'Thrown Ranged',
  'Light Ranged',
  'Heavy Ranged',
  'Shield',
  'Light Armour',
  'Heavy Armour',
  'Accessory',
]

const EFFECT_KINDS: ArtifactEffectKind[] = [
  'Passive',
  'Standard',
  'Quick',
  'Reaction',
  'Set Bonus',
  'Passage',
  'Movement',
]

function blankEffect(): ArtifactEffect {
  return { name: '', kind: 'Passive', description: '' }
}

function blankUpgrade(): ArtifactUpgrade {
  return { id: `hb-upg-${uid()}`, name: '', description: '' }
}

// Create/edit/view form for a GM artifact definition including effects and upgrades.
// [JSas | 2026-05-25] Modified: replaced local inputCls/labelCls with FORM_INPUT/FORM_LABEL; swapped inline confirm state for ConfirmButton
export default function ArtifactEditorForm({
  initial,
  isOfficial,
  isOverridden,
  readOnly = false,
  onSave,
  onReset,
  onDelete,
  onCancel,
}: Props) {
  const [name, setName] = useState(initial.name)
  const [category, setCategory] = useState<ArtifactCategory>(initial.category)
  const [subtype, setSubtype] = useState(initial.subtype)
  const [description, setDescription] = useState(initial.description)
  const [setId, setSetId] = useState(initial.setId ?? '')
  const [effects, setEffects] = useState<ArtifactEffect[]>(
    initial.effects.length > 0 ? initial.effects : [blankEffect()]
  )
  const [upgrades, setUpgrades] = useState<ArtifactUpgrade[]>(initial.upgrades ?? [])
  const isNew = !isOfficial && !isOverridden

  function updateEffect(i: number, field: keyof ArtifactEffect, value: string) {
    setEffects((prev) => prev.map((e, idx) => (idx === i ? { ...e, [field]: value } : e)))
  }

  function removeEffect(i: number) {
    setEffects((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateUpgrade(i: number, field: keyof ArtifactUpgrade, value: string) {
    setUpgrades((prev) => prev.map((u, idx) => (idx === i ? { ...u, [field]: value } : u)))
  }

  function removeUpgrade(i: number) {
    setUpgrades((prev) => prev.filter((_, idx) => idx !== i))
  }

  function handleSave() {
    if (!name.trim()) return
    const artifact: ArtifactDefinition = {
      ...initial,
      name: name.trim(),
      category,
      subtype: subtype.trim(),
      description: description.trim(),
      effects: effects.filter((e) => e.name.trim()),
      upgrades:
        upgrades.filter((u) => u.name.trim()).length > 0
          ? upgrades.filter((u) => u.name.trim())
          : undefined,
    }
    if (setId.trim()) artifact.setId = setId.trim()
    else delete artifact.setId
    onSave(artifact)
  }

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
          {isNew ? 'New Artifact' : readOnly ? `View: ${initial.name}` : `Edit: ${initial.name}`}
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
        {/* Basic info */}
        <section className="bg-gray-900 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={FORM_LABEL}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                readOnly={readOnly}
                className={FORM_INPUT}
                placeholder="Artifact name"
              />
            </div>
            <div>
              <label className={FORM_LABEL}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ArtifactCategory)}
                disabled={readOnly}
                className={FORM_INPUT}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={FORM_LABEL}>Subtype</label>
              <input
                type="text"
                value={subtype}
                onChange={(e) => setSubtype(e.target.value)}
                readOnly={readOnly}
                className={FORM_INPUT}
                placeholder="e.g. Dagger, Amulet"
              />
            </div>
            <div className="col-span-2">
              <label className={FORM_LABEL}>Flavor Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                readOnly={readOnly}
                rows={2}
                className={`${FORM_INPUT} resize-none`}
                placeholder="Short flavor text"
              />
            </div>
            <div>
              <label className={FORM_LABEL}>Set ID (optional)</label>
              <input
                type="text"
                value={setId}
                onChange={(e) => setSetId(e.target.value)}
                readOnly={readOnly}
                className={FORM_INPUT}
                placeholder="e.g. bosley"
              />
            </div>
          </div>
        </section>

        {/* Effects */}
        <section className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-300">Effects</h2>
            {!readOnly && (
              <button
                type="button"
                onClick={() => setEffects((prev) => [...prev, blankEffect()])}
                className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
              >
                + Add Effect
              </button>
            )}
          </div>
          <div className="space-y-4">
            {effects.map((effect, i) => (
              <div key={i} className="border border-gray-800 rounded p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={FORM_LABEL}>Name</label>
                    <input
                      type="text"
                      value={effect.name}
                      onChange={(e) => updateEffect(i, 'name', e.target.value)}
                      readOnly={readOnly}
                      className={FORM_INPUT}
                      placeholder="Effect name"
                    />
                  </div>
                  <div>
                    <label className={FORM_LABEL}>Kind</label>
                    <select
                      value={effect.kind}
                      onChange={(e) => updateEffect(i, 'kind', e.target.value)}
                      disabled={readOnly}
                      className={FORM_INPUT}
                    >
                      {EFFECT_KINDS.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className={FORM_LABEL}>Description</label>
                    <textarea
                      value={effect.description}
                      onChange={(e) => updateEffect(i, 'description', e.target.value)}
                      readOnly={readOnly}
                      rows={3}
                      className={`${FORM_INPUT} resize-none`}
                      placeholder="Effect description"
                    />
                  </div>
                </div>
                {!readOnly && effects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEffect(i)}
                    className="text-xs text-red-500 hover:text-red-400 transition-colors"
                  >
                    Remove effect
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Upgrades */}
        <section className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-300">Upgrades</h2>
            {!readOnly && (
              <button
                type="button"
                onClick={() => setUpgrades((prev) => [...prev, blankUpgrade()])}
                className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
              >
                + Add Upgrade
              </button>
            )}
          </div>
          {upgrades.length === 0 ? (
            <p className="text-xs text-gray-600 italic">No upgrades.</p>
          ) : (
            <div className="space-y-4">
              {upgrades.map((upgrade, i) => (
                <div key={upgrade.id} className="border border-gray-800 rounded p-3 space-y-2">
                  <div>
                    <label className={FORM_LABEL}>Name</label>
                    <input
                      type="text"
                      value={upgrade.name}
                      onChange={(e) => updateUpgrade(i, 'name', e.target.value)}
                      readOnly={readOnly}
                      className={FORM_INPUT}
                      placeholder="Upgrade name"
                    />
                  </div>
                  <div>
                    <label className={FORM_LABEL}>Description</label>
                    <textarea
                      value={upgrade.description}
                      onChange={(e) => updateUpgrade(i, 'description', e.target.value)}
                      readOnly={readOnly}
                      rows={3}
                      className={`${FORM_INPUT} resize-none`}
                      placeholder="Upgrade description"
                    />
                  </div>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => removeUpgrade(i)}
                      className="text-xs text-red-500 hover:text-red-400 transition-colors"
                    >
                      Remove upgrade
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Actions */}
        {!readOnly && (
          <div className="flex items-center gap-3">
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
                promptText="Delete this artifact?"
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
