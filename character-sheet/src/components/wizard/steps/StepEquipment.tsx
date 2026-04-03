import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Weapon, ArmorItem } from '../../../types/equipment'
import type { WizardDraft } from '../WizardTypes'
import { WEAPON_TEMPLATES } from '../../../constants/weapons'
import { ARMOR_TEMPLATES } from '../../../constants/armor'
import { CLASS_MAP } from '../../../constants/classes'
import { REMOVE_BTN } from '../../../styles/classes'

interface Props {
  draft: WizardDraft
  onChange: (patch: Partial<WizardDraft>) => void
}

function spent(weapons: Weapon[], armor: ArmorItem[]): number {
  return [...weapons.map((w) => w.cost), ...armor.map((a) => a.cost)].reduce((s, c) => s + c, 0)
}

export default function StepEquipment({ draft, onChange }: Props) {
  const [weaponCatIdx, setWeaponCatIdx] = useState(0)
  const [armorIdx, setArmorIdx] = useState(0)

  const classDef = draft.className ? CLASS_MAP[draft.className] : null
  const selectedPath = classDef?.classPaths?.find((p) => p.id === draft.classPath)
  const effectiveWeaponComp = classDef
    ? [...classDef.weaponCompetencies, ...(selectedPath?.additionalWeaponCompetencies ?? [])]
    : []
  const effectiveArmorComp = classDef
    ? [...classDef.armorCompetencies, ...(selectedPath?.additionalArmorCompetencies ?? [])]
    : []

  const total = draft.startingDenerim
  const used = spent(draft.weapons, draft.armor)
  const remaining = total - used

  // Filter weapon templates to class competencies for quick suggestion
  const competentWeapons = classDef
    ? WEAPON_TEMPLATES.filter((t) => effectiveWeaponComp.includes(t.category))
    : WEAPON_TEMPLATES

  function addWeapon() {
    const template = WEAPON_TEMPLATES[weaponCatIdx]
    if (template.cost > remaining) return
    onChange({
      weapons: [
        ...draft.weapons,
        {
          id: uuidv4(),
          name: template.examples[0],
          category: template.category,
          damageDie: template.damageDie,
          cost: template.cost,
          notes: '',
        },
      ],
    })
  }

  function removeWeapon(id: string) {
    onChange({ weapons: draft.weapons.filter((w) => w.id !== id) })
  }

  function addArmor() {
    const template = ARMOR_TEMPLATES[armorIdx]
    if (template.cost > remaining) return
    onChange({
      armor: [
        ...draft.armor,
        {
          id: uuidv4(),
          name: template.examples[0],
          category: template.category,
          quality: template.quality,
          av: template.av,
          cost: template.cost,
          notes: '',
        },
      ],
    })
  }

  function removeArmor(id: string) {
    onChange({ armor: draft.armor.filter((a) => a.id !== id) })
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Starting Equipment</h2>
        <p className="text-sm text-gray-400">
          Spend your starting Denerim on weapons and armor. Without competency you suffer Hindrance
          on attacks or defense.
        </p>
      </div>

      {/* Budget */}
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg ${remaining < 0 ? 'bg-red-950 border border-red-800' : 'bg-gray-800'}`}
      >
        <span className="text-sm text-gray-400">Denerim budget:</span>
        <span className={`text-2xl font-bold ${remaining < 0 ? 'text-red-400' : 'text-amber-400'}`}>
          {remaining}
        </span>
        <span className="text-xs text-gray-500">
          / {total} (spent {used})
        </span>
      </div>

      {classDef && (
        <div className="bg-gray-800 rounded-lg px-4 py-2 text-xs text-gray-500">
          <span className="text-gray-400 font-semibold">
            {classDef.name}
            {selectedPath ? ` (${selectedPath.name})` : ''} competencies —{' '}
          </span>
          Weapons: {effectiveWeaponComp.join(', ')} · Armor: {effectiveArmorComp.join(', ')}
        </div>
      )}

      {/* Weapons */}
      <div>
        <p className="text-sm font-semibold text-gray-300 mb-2">Weapons</p>
        {draft.weapons.map((w) => (
          <div key={w.id} className="flex items-center gap-2 bg-gray-800 rounded px-3 py-2 mb-1">
            <div className="flex-1 text-sm">
              <span className="text-white font-semibold">{w.name}</span>
              <span className="ml-2 text-gray-500">
                {w.category} · {w.damageDie} · {w.cost}D
              </span>
            </div>
            <button className={REMOVE_BTN} onClick={() => removeWeapon(w.id)}>
              ✕
            </button>
          </div>
        ))}

        {competentWeapons.length > 0 && (
          <p className="text-xs text-gray-600 mb-1">
            Your competent weapon types are highlighted first.
          </p>
        )}

        <div className="flex gap-2">
          <select
            className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-gray-300"
            value={weaponCatIdx}
            onChange={(e) => setWeaponCatIdx(Number(e.target.value))}
          >
            {WEAPON_TEMPLATES.map((t, i) => {
              const isCompetent = effectiveWeaponComp.includes(t.category)
              return (
                <option key={i} value={i}>
                  {isCompetent ? '★ ' : ''}
                  {t.category} ({t.damageDie}) — {t.cost}D
                </option>
              )
            })}
          </select>
          <button
            className={`px-3 py-1 rounded text-sm ${WEAPON_TEMPLATES[weaponCatIdx]?.cost > remaining ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
            onClick={addWeapon}
            disabled={WEAPON_TEMPLATES[weaponCatIdx]?.cost > remaining}
          >
            Buy
          </button>
        </div>
      </div>

      {/* Armor */}
      <div>
        <p className="text-sm font-semibold text-gray-300 mb-2">Armor</p>
        {draft.armor.map((a) => (
          <div key={a.id} className="flex items-center gap-2 bg-gray-800 rounded px-3 py-2 mb-1">
            <div className="flex-1 text-sm">
              <span className="text-white font-semibold">{a.name}</span>
              <span className="ml-2 text-gray-500">
                {a.quality} {a.category} · +{a.av} AV · {a.cost}D
              </span>
            </div>
            <button className={REMOVE_BTN} onClick={() => removeArmor(a.id)}>
              ✕
            </button>
          </div>
        ))}

        <div className="flex gap-2">
          <select
            className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-gray-300"
            value={armorIdx}
            onChange={(e) => setArmorIdx(Number(e.target.value))}
          >
            {ARMOR_TEMPLATES.map((t, i) => {
              const isCompetent = effectiveArmorComp.includes(t.category)
              return (
                <option key={i} value={i}>
                  {isCompetent ? '★ ' : ''}
                  {t.quality} {t.category} (+{t.av} AV) — {t.cost}D
                </option>
              )
            })}
          </select>
          <button
            className={`px-3 py-1 rounded text-sm ${ARMOR_TEMPLATES[armorIdx]?.cost > remaining ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
            onClick={addArmor}
            disabled={ARMOR_TEMPLATES[armorIdx]?.cost > remaining}
          >
            Buy
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-600">
        Artifacts and miscellaneous gear can be added from the character sheet after creation.
        Necessities (3) and Gear (3) are granted automatically.
      </p>
    </div>
  )
}
