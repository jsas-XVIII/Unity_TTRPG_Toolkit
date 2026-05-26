import type { ReactNode } from 'react'

interface Props {
  onClose: () => void
  children: ReactNode
  className?: string
}

// Reusable backdrop + card shell for all modals. Clicking the backdrop calls onClose.
// [JSas | 2026-05-25] Added: extracted shared modal wrapper to eliminate duplicated overlay markup
export default function Modal({ onClose, children, className = '' }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className={`bg-gray-900 rounded-xl w-full shadow-xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
