import { useState } from 'react'
import type { Power, CharacterPower } from '../../../types/character'
import type { WizardDraft } from '../WizardTypes'
import { getPowersByClass } from '../../../data/powersData'
import PowerReferenceCard from '../../powers/PowerReferenceCard'

interface Props {
  draft: WizardDraft
  onChange: (patch: Partial<WizardDraft>) => void
}

const TARGET_POWERS = 3

export default function StepPowers({ draft, onChange }: Props) {
  const [preview, setPreview] = useState<Power | null>(null)
  const powers = draft.powers
  const count = powers.length

  const className = draft.className
  const { tier1: classTier1 } = className ? getPowersByClass(className) : { tier1: [] }
  const selectedIds = new Set(powers.map((p) => p.id))

  function selectPower(source: Power) {
    if (count >= TARGET_POWERS) return
    const cp: CharacterPower = { id: source.id, purchasedUpgradeIds: [] }
    onChange({ powers: [...powers, cp] })
  }

  function removePower(id: string) {
    onChange({ powers: powers.filter((p) => p.id !== id) })
  }

  const previewSelected = preview ? selectedIds.has(preview.id) : false

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Tier I Powers</h2>
        <p className="text-sm text-gray-400">
          At Level 1 you start with <strong className="text-white">3 Tier I Powers</strong> (no
          upgrades yet). Select from your {className ?? 'class'} power list below.
        </p>
      </div>

      {/* Counter */}
      <div
        className={`flex items-center gap-3 px-4 py-2 rounded-lg ${count >= TARGET_POWERS ? 'bg-green-950 border border-green-800' : 'bg-gray-800'}`}
      >
        <span className="text-sm text-gray-400">Powers selected:</span>
        <span
          className={`text-xl font-bold ${count >= TARGET_POWERS ? 'text-green-400' : 'text-amber-400'}`}
        >
          {count}
        </span>
        <span className="text-gray-600">/ {TARGET_POWERS}</span>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p className="text-xs text-gray-600">
          Upgrades can be purchased from the character sheet after creation.
        </p>
      </div>

      {!className ? (
        <p className="text-sm text-gray-500">Select a class in an earlier step to see powers.</p>
      ) : (
        <div className="flex gap-4 items-start">
          {/* Power list */}
          <div className="w-48 shrink-0 bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 py-2 border-b border-gray-700">
              {className}
            </p>
            <div className="overflow-y-auto max-h-[28rem]">
              {classTier1.map((p) => {
                const selected = selectedIds.has(p.id)
                return (
                  <button
                    key={p.id}
                    onClick={() => setPreview(p)}
                    className={`w-full text-left px-3 py-2 text-xs border-b border-gray-750 flex items-center gap-2 transition-colors
                      ${preview?.id === p.id ? 'bg-gray-700' : selected ? 'bg-gray-850' : 'hover:bg-gray-700'}
                      ${selected ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`shrink-0 w-3 h-3 rounded-full border flex items-center justify-center
                        ${selected ? 'bg-amber-500 border-amber-500' : 'border-gray-500'}`}
                    >
                      {selected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </span>
                    <span className={selected ? 'text-amber-300 font-semibold' : 'text-gray-300'}>
                      {p.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Preview + action button */}
          <div className="flex-1 flex flex-col items-center justify-start pt-1 gap-3">
            {preview ? (
              <>
                <PowerReferenceCard power={preview} className={className} />
                {previewSelected ? (
                  <button
                    className="px-4 py-1.5 rounded border border-red-700 text-red-400 hover:bg-red-950 text-sm font-semibold transition-colors"
                    onClick={() => removePower(preview.id)}
                  >
                    Remove Power
                  </button>
                ) : (
                  <button
                    disabled={count >= TARGET_POWERS}
                    className="px-4 py-1.5 rounded bg-amber-700 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
                    onClick={() => selectPower(preview)}
                  >
                    Select Power
                  </button>
                )}
              </>
            ) : (
              <p className="text-xs text-gray-600 mt-8">Click a power to preview it</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
