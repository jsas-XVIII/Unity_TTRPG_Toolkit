// Shared Tailwind className constants.
// Use these instead of repeating the same string across components.

/** Standard section card wrapper */
export const CARD = 'bg-gray-900 rounded-lg p-4'

/** Section heading inside a card */
export const SECTION_HEADING = 'text-xs font-bold text-gray-400 uppercase tracking-widest mb-3'

/** Inline ✕ remove/delete button */
export const REMOVE_BTN = 'text-gray-600 hover:text-red-400 text-xs'

// [JSas | 2026-05-25] Added: shared form-input/label tokens — replaces per-file inputCls/labelCls duplicates
/** Standard text input / select inside an editor form */
export const FORM_INPUT =
  'w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-amber-500'

/** Label above a form input */
export const FORM_LABEL = 'block text-xs text-gray-400 mb-1'

/** Text input in amber-warning state (DL-range out of bounds) */
export const FORM_INPUT_WARN =
  'w-full bg-gray-800 border border-amber-500 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-amber-400'

/** Label in amber-warning state */
export const FORM_LABEL_WARN = 'block text-xs text-amber-400 mb-1'
