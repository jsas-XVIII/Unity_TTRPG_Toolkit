interface Props {
  onDismiss: () => void
}

export default function StorageErrorToast({ onDismiss }: Props) {
  return (
    <div className="fixed top-4 right-4 flex items-center gap-3 bg-red-900 border border-red-700 text-red-200 px-4 py-2 rounded shadow-lg z-50 text-sm">
      Storage full — delete unused content to free space.
      <button
        onClick={onDismiss}
        className="text-red-400 hover:text-red-200 transition-colors leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
