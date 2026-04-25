// HomeScreen.test.tsx — tests for the initial landing screen.
//
// Covers:
//   1. All four option cards render
//   2. Clicking "New Character" fires the correct callback
//   3. Clicking "Existing Character" fires the correct callback
//   4. Selecting a file via "Import Character" calls onImport with the File object
//   5. The file input resets after selection so the same file can be re-imported
//   6. Clicking "Gamemaster" fires the onGM callback

import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomeScreen from './HomeScreen'
import { baseCharacter } from '../../test/fixtures'

expect.extend(matchers)

function renderHome(overrides?: Partial<React.ComponentProps<typeof HomeScreen>>) {
  const props = {
    onNewCharacter: vi.fn(),
    onExistingCharacter: vi.fn(),
    onImport: vi.fn(),
    onGM: vi.fn(),
    ...overrides,
  }
  render(<HomeScreen {...props} />)
  return props
}

describe('HomeScreen', () => {
  it('renders all four option cards', () => {
    renderHome()
    expect(screen.getByRole('button', { name: /new character/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /existing character/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /import character/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /gamemaster/i })).toBeInTheDocument()
  })

  it('calls onNewCharacter when "New Character" is clicked', async () => {
    const { onNewCharacter } = renderHome()
    await userEvent.click(screen.getByRole('button', { name: /new character/i }))
    expect(onNewCharacter).toHaveBeenCalledOnce()
  })

  it('calls onExistingCharacter when "Existing Character" is clicked', async () => {
    const { onExistingCharacter } = renderHome()
    await userEvent.click(screen.getByRole('button', { name: /existing character/i }))
    expect(onExistingCharacter).toHaveBeenCalledOnce()
  })

  it('calls onImport with the selected File when a file is chosen', () => {
    const onImport = vi.fn()
    renderHome({ onImport })

    const file = new File([JSON.stringify(baseCharacter)], 'aldric.json', {
      type: 'application/json',
    })

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    expect(onImport).toHaveBeenCalledOnce()
    expect(onImport).toHaveBeenCalledWith(file)
  })

  it('does not call onImport if the file picker is dismissed with no file', () => {
    const onImport = vi.fn()
    renderHome({ onImport })

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [] } })

    expect(onImport).not.toHaveBeenCalled()
  })

  it('resets the input value after selection so the same file can be re-imported', () => {
    renderHome()

    const file = new File([JSON.stringify(baseCharacter)], 'aldric.json', {
      type: 'application/json',
    })

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    expect(input.value).toBe('')
  })

  it('calls onGM when "Gamemaster" is clicked', async () => {
    const { onGM } = renderHome()
    await userEvent.click(screen.getByRole('button', { name: /gamemaster/i }))
    expect(onGM).toHaveBeenCalledOnce()
  })
})
