import { useState } from 'react'

interface Props {
  triggerLabel: string
  promptText: string
  confirmLabel: string
  onConfirm: () => void
  triggerClassName?: string
  promptClassName?: string
}

// Two-step confirm button: shows trigger label on first click, then a prompt + confirm + cancel row.
// [JSas | 2026-05-25] Added: extracted reusable confirm-step pattern from GM editor forms
export default function ConfirmButton({
  triggerLabel,
  promptText,
  confirmLabel,
  onConfirm,
  triggerClassName = '',
  promptClassName = 'text-xs text-gray-400',
}: Props) {
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <>
        <span className={promptClassName}>{promptText}</span>
        <button
          type="button"
          onClick={() => {
            onConfirm()
            setConfirming(false)
          }}
          className="text-xs px-3 py-1.5 rounded bg-red-800 hover:bg-red-700 text-white transition-colors"
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Cancel
        </button>
      </>
    )
  }

  return (
    <button type="button" onClick={() => setConfirming(true)} className={triggerClassName}>
      {triggerLabel}
    </button>
  )
}
