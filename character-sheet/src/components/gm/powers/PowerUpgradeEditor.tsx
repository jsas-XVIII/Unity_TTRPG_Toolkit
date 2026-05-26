import type { PowerUpgrade } from '../../../types/character'
import { uid } from '../../../utils/idGenerator'
import { FORM_INPUT } from '../../../styles/classes'

interface Props {
  upgrades: PowerUpgrade[]
  readOnly: boolean
  onChange: (upgrades: PowerUpgrade[]) => void
}

// Inline list editor for power upgrades; supports add, edit, and remove within the power form.
// [JSas | 2026-05-25] Modified: replaced local inputCls with FORM_INPUT shared constant
export default function PowerUpgradeEditor({ upgrades, readOnly, onChange }: Props) {
  function addUpgrade() {
    onChange([...upgrades, { id: `upg-${uid()}`, name: '', description: '', purchased: false }])
  }

  function updateUpgrade(idx: number, field: 'name' | 'description', value: string) {
    onChange(upgrades.map((u, i) => (i === idx ? { ...u, [field]: value } : u)))
  }

  function removeUpgrade(idx: number) {
    onChange(upgrades.filter((_, i) => i !== idx))
  }

  return (
    <section className="bg-gray-900 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Upgrades</h2>
        {!readOnly && (
          <button
            type="button"
            onClick={addUpgrade}
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            + Add Upgrade
          </button>
        )}
      </div>

      {upgrades.length === 0 && <p className="text-xs text-gray-600 italic">No upgrades.</p>}

      <div className="space-y-3">
        {upgrades.map((u, i) => (
          <div key={u.id} className="border border-gray-800 rounded p-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={u.name}
                onChange={(e) => updateUpgrade(i, 'name', e.target.value)}
                readOnly={readOnly}
                className={`${FORM_INPUT} flex-1`}
                placeholder="Upgrade name"
              />
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeUpgrade(i)}
                  className="text-xs text-gray-500 hover:text-red-400 px-2 py-1 transition-colors shrink-0"
                >
                  ✕
                </button>
              )}
            </div>
            <textarea
              value={u.description}
              onChange={(e) => updateUpgrade(i, 'description', e.target.value)}
              readOnly={readOnly}
              rows={2}
              className={`${FORM_INPUT} resize-none`}
              placeholder="Upgrade description"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
