import type { WizardDraft } from '../WizardTypes'

interface Props {
  draft: WizardDraft
  onChange: (patch: Partial<WizardDraft>) => void
}

export default function StepName({ draft, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Character Concept</h2>
        <p className="text-sm text-gray-400">
          Give your character a name and a few details before you begin.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-1">
          Character Name <span className="text-red-500">*</span>
        </label>
        <input
          data-testid="input-name"
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
          value={draft.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. Aldric Voss"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-1">Age</label>
        <input
          data-testid="input-age"
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
          value={draft.age}
          onChange={(e) => onChange({ age: e.target.value })}
          placeholder="e.g. 28"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Starting Denerim</label>
        <p className="text-xs text-gray-500 mb-2">
          Set by the GM — difficult starts leave little room for extras.
        </p>
        <div className="flex gap-3">
          {([150, 250] as const).map((amount) => (
            <button
              key={amount}
              data-testid={`denerim-${amount}`}
              onClick={() => onChange({ startingDenerim: amount })}
              className={`flex-1 py-3 rounded-lg border-2 text-center transition-colors ${
                draft.startingDenerim === amount
                  ? 'border-amber-500 bg-amber-950 text-amber-300'
                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'
              }`}
            >
              <div className="text-2xl font-bold">{amount}</div>
              <div className="text-xs mt-0.5">
                {amount === 150 ? 'Difficult start' : 'Relaxed start'}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
