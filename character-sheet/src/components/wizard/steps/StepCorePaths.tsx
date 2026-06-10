import { v4 as uuidv4 } from 'uuid'
import type { CorePath } from '../../../types/character'
import type { WizardDraft } from '../WizardTypes'

interface Props {
  draft: WizardDraft
  onChange: (patch: Partial<WizardDraft>) => void
}

const SAMPLE_PATHS = [
  'Bookworm (Deciphering, Language, Knowledge)',
  "Inventor's Household (Technology, Repair, Craftsmanship)",
  'Life of the Party (Performance, Charm)',
  'Fierce Competitor (Athletics, Endurance)',
  'Mixologist (Alchemy, Botany, Medicine)',
  'Pilot (Navigation, Technology)',
  'Son/Daughter of the North (Climbing, Navigation, Fishing)',
  'Street Urchin (Pickpocketing, Bluffing, Stealth)',
  'Wild Child (Animal Husbandry, Foraging, Hunting)',
]

const MAX_PATHS = 3
const TOTAL_POINTS = 5
const MAX_PER_PATH = 3
const MIN_PER_PATH = 1

export default function StepCorePaths({ draft, onChange }: Props) {
  const paths = draft.corePaths
  const usedPoints = paths.reduce((s, p) => s + p.points, 0)
  const remaining = TOTAL_POINTS - usedPoints

  function addPath() {
    if (paths.length >= MAX_PATHS) return
    const newPaths = [...paths, { id: uuidv4(), name: '', description: '', points: 1 }]
    onChange({ corePaths: newPaths })
  }

  function updatePath(id: string, patch: Partial<CorePath>) {
    onChange({ corePaths: paths.map((p) => (p.id === id ? { ...p, ...patch } : p)) })
  }

  function removePath(id: string) {
    onChange({ corePaths: paths.filter((p) => p.id !== id) })
  }

  function setPoints(id: string, delta: number) {
    const path = paths.find((p) => p.id === id)!
    const next = path.points + delta
    if (next < MIN_PER_PATH || next > MAX_PER_PATH) return
    if (delta > 0 && remaining < 1) return
    updatePath(id, { points: next })
  }

  const valid =
    paths.length === MAX_PATHS && usedPoints === TOTAL_POINTS && paths.every((p) => p.name.trim())

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Core Paths</h2>
        <p className="text-sm text-gray-400">
          Choose <strong className="text-white">3 Core Paths</strong> — your character's background
          skills. Distribute <strong className="text-white">5 points</strong> across them (min 1,
          max 3 per path at Level 1).
        </p>
      </div>

      {/* Points budget */}
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${remaining === 0 ? 'bg-green-950 border border-green-800' : 'bg-gray-800'}`}
      >
        <span className="text-sm text-gray-400">Points remaining:</span>
        <span
          className={`text-xl font-bold ${remaining === 0 ? 'text-green-400' : remaining > 0 ? 'text-amber-400' : 'text-red-400'}`}
        >
          {remaining}
        </span>
        <span className="text-xs text-gray-600">/ {TOTAL_POINTS}</span>
        {paths.length < MAX_PATHS && (
          <span className="ml-auto text-xs text-gray-500">
            {paths.length}/{MAX_PATHS} paths
          </span>
        )}
      </div>

      {/* Path entries */}
      <div className="space-y-3">
        {paths.map((path, index) => (
          <div key={path.id} className="bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              {/* Point stepper */}
              <div className="flex flex-col items-center gap-1">
                <button
                  data-testid={`path-add-point-${index}`}
                  className="w-7 h-7 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm disabled:opacity-30"
                  onClick={() => setPoints(path.id, 1)}
                  disabled={path.points >= MAX_PER_PATH || remaining < 1}
                >
                  +
                </button>
                <span className="text-xl font-bold text-amber-400 w-7 text-center">
                  {path.points}
                </span>
                <button
                  className="w-7 h-7 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm disabled:opacity-30"
                  onClick={() => setPoints(path.id, -1)}
                  disabled={path.points <= MIN_PER_PATH}
                >
                  −
                </button>
              </div>

              {/* Name */}
              <input
                data-testid={`path-name-${index}`}
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-white font-semibold focus:outline-none focus:border-amber-500"
                value={path.name}
                onChange={(e) => updatePath(path.id, { name: e.target.value })}
                placeholder="Path name (e.g. Street Urchin)"
                list={`sample-paths-${path.id}`}
              />
              <datalist id={`sample-paths-${path.id}`}>
                {SAMPLE_PATHS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>

              <button
                className="text-gray-600 hover:text-red-400"
                onClick={() => removePath(path.id)}
                title="Remove"
              >
                ✕
              </button>
            </div>

            <textarea
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-amber-500 resize-none"
              rows={2}
              value={path.description}
              onChange={(e) => updatePath(path.id, { description: e.target.value })}
              placeholder="Describe the skills covered (e.g. Pickpocketing, Bluffing, Stealth, Intuition)"
            />
          </div>
        ))}
      </div>

      {paths.length < MAX_PATHS && (
        <button
          data-testid="add-core-path"
          onClick={addPath}
          className="w-full py-2 rounded-lg border-2 border-dashed border-gray-600 text-gray-500 hover:border-gray-400 hover:text-gray-300 text-sm transition-colors"
        >
          + Add Core Path ({paths.length}/{MAX_PATHS})
        </button>
      )}

      {!valid && paths.length === MAX_PATHS && usedPoints !== TOTAL_POINTS && (
        <p className="text-xs text-amber-400">
          You must use all {TOTAL_POINTS} points. Currently using {usedPoints}.
        </p>
      )}
    </div>
  )
}
