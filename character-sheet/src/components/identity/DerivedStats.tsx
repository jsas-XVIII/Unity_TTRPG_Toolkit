import type { DerivedStats } from '../../utils/derivedStats'
import { CARD, SECTION_HEADING } from '../../styles/classes'

interface Props {
  derived: DerivedStats
}

const STATS: { key: keyof DerivedStats; label: string; tooltip: string }[] = [
  { key: 'ar', label: 'AR', tooltip: 'Attack Rating = Main Attribute + level bonuses' },
  { key: 'dr', label: 'DR', tooltip: 'Defense Rating = AGILITY + class bonuses' },
  { key: 'mr', label: 'MR', tooltip: 'Mental Resistance = MIND' },
  { key: 'speed', label: 'Speed', tooltip: 'Speed = AGILITY' },
  { key: 'av', label: 'AV', tooltip: 'Armor Value = sum of all equipped armor' },
  { key: 'maxHp', label: 'Max HP', tooltip: 'Max HP = Class base + MIGHT' },
  {
    key: 'maxRecuperations',
    label: 'Recups',
    tooltip: 'Max Recuperations = 2 + floor(MIGHT/2) + class bonuses',
  },
  { key: 'hl', label: 'HL', tooltip: 'Half Level = floor(Level / 2), minimum 1' },
]

export default function DerivedStats({ derived }: Props) {
  return (
    <div className={CARD}>
      <h2 className={SECTION_HEADING}>Derived Stats</h2>
      <div className="grid grid-cols-4 gap-2">
        {STATS.map(({ key, label, tooltip }) => (
          <div
            key={key}
            className="flex flex-col items-center bg-gray-800 rounded p-2"
            title={tooltip}
          >
            <span className="text-xs text-gray-400">{label}</span>
            <span className="text-lg font-bold text-amber-400">{derived[key]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
