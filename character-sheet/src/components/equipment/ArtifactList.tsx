interface Props {
  artifactIds: string[]
  artifactCapacity: number
}

export default function ArtifactList({ artifactIds, artifactCapacity }: Props) {
  const overCapacity = artifactIds.length > artifactCapacity

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <p className="text-xs text-gray-500 uppercase">Artifacts</p>
        <span
          className={`text-xs px-1.5 rounded ${overCapacity ? 'bg-red-900 text-red-300' : 'bg-gray-800 text-gray-500'}`}
        >
          {artifactIds.length}/{artifactCapacity} equipped {overCapacity && '⚠ Hindrance!'}
        </span>
      </div>
      {artifactIds.length === 0 ? (
        <p className="text-xs text-gray-700 italic">No artifacts equipped.</p>
      ) : (
        artifactIds.map((id) => (
          <div key={id} className="bg-gray-800 rounded px-3 py-2 mb-1">
            <span className="text-xs text-gray-400 font-mono">{id}</span>
          </div>
        ))
      )}
    </div>
  )
}
