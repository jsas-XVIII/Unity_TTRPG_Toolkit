import type { Monster } from '../../../types/monster'
import { resolveTraits, resolvePowers } from '../../../data/monstersData'

interface Props {
  monster: Monster
  onBack: () => void
  onEdit?: () => void
}

function dlColor(dl: number): string {
  if (dl <= 3) return 'bg-green-900 text-green-300'
  if (dl <= 6) return 'bg-yellow-900 text-yellow-300'
  if (dl <= 8) return 'bg-orange-900 text-orange-300'
  return 'bg-red-900 text-red-300'
}

export default function MonsterCard({ monster, onBack, onEdit }: Props) {
  const traits = resolveTraits(monster)
  const powers = resolvePowers(monster)
  const isElite = monster.type === 'Elite'

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
        >
          ← Back to Compendium
        </button>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-xs px-3 py-1.5 rounded border border-gray-700 text-gray-400 hover:border-amber-600 hover:text-amber-400 transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {/* Header */}
      <div
        className={`rounded-t-lg px-5 py-4 flex items-center justify-between ${isElite ? 'bg-purple-900' : 'bg-red-900'}`}
      >
        <div>
          <h1 className="text-2xl font-bold text-white">{monster.name}</h1>
          <p className="text-sm text-gray-300 mt-0.5">
            {monster.size} · {monster.faction ?? 'Unknown Faction'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${dlColor(monster.dangerLevel)}`}
          >
            DL {monster.dangerLevel}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${isElite ? 'bg-purple-700 text-purple-200' : 'bg-red-800 text-red-200'}`}
          >
            {monster.type}
          </span>
          <span className="text-xs text-gray-400">{monster.xp} XP</span>
        </div>
      </div>

      {/* Image */}
      {monster.imageUrl && (
        <a href={monster.imageUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={monster.imageUrl}
            alt={monster.name}
            className="w-full object-cover max-h-64 cursor-pointer hover:opacity-90 transition-opacity"
            title="Click to open full image (for Roll20)"
          />
        </a>
      )}

      {/* Core Stats */}
      <div className="bg-gray-800 px-5 py-4 grid grid-cols-4 gap-3 text-center">
        {[
          { label: 'HP', value: monster.hp },
          { label: 'AR', value: monster.ar },
          { label: 'DR', value: monster.dr },
          { label: 'MR', value: monster.mr },
          { label: 'AV', value: monster.av },
          { label: 'SPD', value: monster.spd },
          { label: 'DMG', value: `+${monster.dmg}` },
          { label: 'Die', value: monster.damageDie },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-900 rounded p-2">
            <p className="text-xs text-gray-500 uppercase">{label}</p>
            <p className="text-lg font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Traits */}
      {traits.length > 0 && (
        <div className="bg-gray-900 px-5 py-4 mt-1">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Traits</h2>
          <div className="space-y-3">
            {traits.map((t) => (
              <div key={t.id}>
                <p className="text-sm font-semibold text-amber-300">{t.name}</p>
                <p className="text-sm text-gray-400 mt-0.5">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Powers */}
      {powers.length > 0 && (
        <div className="bg-gray-900 px-5 py-4 mt-1">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Powers</h2>
          <div className="space-y-3">
            {powers.map((p) => (
              <div key={p.id} className="border-l-2 border-gray-700 pl-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">{p.name}</p>
                  {p.ruinCost != null && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-900 text-red-300">
                      {p.ruinCost} Ruin
                    </span>
                  )}
                  {p.recharge != null && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">
                      {p.recharge}rd recharge
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-0.5">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {monster.notes && (
        <div className="bg-gray-900 px-5 py-4 mt-1 rounded-b-lg">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notes</h2>
          <p className="text-sm text-gray-400">{monster.notes}</p>
        </div>
      )}
    </div>
  )
}
