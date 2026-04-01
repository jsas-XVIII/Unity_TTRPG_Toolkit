// CharacterSheet.test.tsx — component tests for the Import JSON button.
//
// These tests verify the UI behaviour of the import feature:
//   1. The "Import JSON" button is visible on the sheet
//   2. Selecting a file calls onImport with the correct File object
//   3. The file input resets after selection (so the same file can be re-imported)
//
// We don't test persistence here — that's covered in localStorage.test.ts.
// We don't test FileReader or JSON.parse here — that's in App.tsx and tested via the
// localStorage tests. This file only tests what CharacterSheet is responsible for:
// rendering the button and wiring the file input correctly.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
expect.extend(matchers)
import CharacterSheet from './CharacterSheet'
import { baseCharacter } from '../../test/fixtures'

// Mock props — replace callbacks with vitest spy functions so we can assert they were called
function renderSheet(overrides?: { onImport?: (file: File) => void }) {
  const props = {
    initial: baseCharacter,
    onSave: vi.fn(),
    onExport: vi.fn(),
    onImport: overrides?.onImport ?? vi.fn(),
    onNewCharacter: vi.fn(),
  }
  render(<CharacterSheet {...props} />)
  return props
}

describe('Import JSON button', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the Import JSON button on the sheet', () => {
    renderSheet()
    expect(screen.getByRole('button', { name: /import json/i })).toBeInTheDocument()
  })

  it('calls onImport with the selected File when a file is chosen', () => {
    const onImport = vi.fn()
    renderSheet({ onImport })

    const file = new File([JSON.stringify(baseCharacter)], 'aldric.json', {
      type: 'application/json',
    })

    // The file input is hidden — fire a change event on it directly
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    expect(onImport).toHaveBeenCalledOnce()
    expect(onImport).toHaveBeenCalledWith(file)
  })

  it('does not call onImport if the file picker is dismissed with no file', () => {
    const onImport = vi.fn()
    renderSheet({ onImport })

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    // Simulate cancelling the picker — files list is empty
    fireEvent.change(input, { target: { files: [] } })

    expect(onImport).not.toHaveBeenCalled()
  })

  it('resets the input value after a file is selected so the same file can be re-imported', () => {
    renderSheet()

    const file = new File([JSON.stringify(baseCharacter)], 'aldric.json', {
      type: 'application/json',
    })

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    // After the change handler runs, value should be cleared
    expect(input.value).toBe('')
  })
})
