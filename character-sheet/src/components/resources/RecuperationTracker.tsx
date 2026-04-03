import { CARD, SECTION_HEADING } from '../../styles/classes'

interface Props {
  maxRecuperations: number
  recuperationDie: string
}

export default function RecuperationTracker({ maxRecuperations, recuperationDie }: Props) {
  return (
    <div className={CARD}>
      <h2 className={SECTION_HEADING}>Recuperations</h2>
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-green-400">{maxRecuperations}</span>
        <span className="text-gray-400 text-sm">× {recuperationDie} per Respite</span>
      </div>
    </div>
  )
}
