// InfoTooltip.tsx — A small "?" button that reveals an explanatory tooltip on hover.
// Used in the Advancement Table to explain how column values are calculated.
// The tooltip appears after a 2-second hover delay and hides immediately on mouse-out.

import { useState, useRef } from 'react'

interface Props {
  text: string
}

export default function InfoTooltip({ text }: Props) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleMouseEnter() {
    timerRef.current = setTimeout(() => setVisible(true), 500)
  }

  function handleMouseLeave() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
  }

  return (
    <span
      className="relative inline-block align-middle ml-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gray-600 text-gray-300 text-[9px] font-bold cursor-default select-none hover:bg-gray-500 leading-none">
        ?
      </span>
      <span
        className={`pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-64 whitespace-normal break-words bg-gray-700 border border-gray-600 text-gray-200 text-xs rounded p-2 transition-opacity z-50 shadow-lg ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {text}
      </span>
    </span>
  )
}
