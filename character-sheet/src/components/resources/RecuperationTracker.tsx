interface Props {
  maxRecuperations: number
  recuperationDie: string
}

export default function RecuperationTracker({ maxRecuperations, recuperationDie }: Props) {
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Recuperations</h2>
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-green-400">{maxRecuperations}</span>
        <span className="text-gray-400 text-sm">× {recuperationDie} per Respite</span>
      </div>
    </div>
  )
}
