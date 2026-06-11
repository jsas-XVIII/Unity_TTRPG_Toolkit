// HomeScreen.test.tsx — tests for the initial landing screen.
//
// Covers:
//   1. All five option cards render
//   2. Clicking "New Character" fires the correct callback
//   3. Clicking "Existing Character" fires the correct callback
//   4. Selecting a file via "Import Character" calls onImport with the File object
//   5. The file input resets after selection so the same file can be re-imported
//   6. Clicking "Gamemaster" fires the onGM callback
//   7. Selecting a content pack file shows success confirmation with counts
//   8. Empty content pack shows no-content warning
//   9. Invalid content pack file shows error message
//  10. "Import another" resets back to the card

import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomeScreen from './HomeScreen'
import { baseCharacter } from '../../test/fixtures'
import { parseContentPack } from '../../services/contentPackService'
import { HomebrewProvider } from '../../context/HomebrewProvider'
import { invalidatePerksCache } from '../../services/perksStorage'
import { invalidatePowerCache } from '../../services/powersStorage'

vi.mock('../../services/contentPackService', () => ({
  parseContentPack: vi.fn(),
}))

const mockParseContentPack = vi.mocked(parseContentPack)

expect.extend(matchers)

beforeEach(() => {
  localStorage.clear()
  invalidatePowerCache()
  invalidatePerksCache()
  mockParseContentPack.mockReset()
})

function renderHome(overrides?: Partial<React.ComponentProps<typeof HomeScreen>>) {
  const props = {
    onNewCharacter: vi.fn(),
    onExistingCharacter: vi.fn(),
    onImport: vi.fn(),
    onGM: vi.fn(),
    ...overrides,
  }
  render(
    <HomebrewProvider>
      <HomeScreen {...props} />
    </HomebrewProvider>
  )
  return props
}

describe('HomeScreen', () => {
  it('renders all five option cards', () => {
    renderHome()
    expect(screen.getByRole('button', { name: /new character/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /existing character/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /import character/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /import content pack/i })).toBeInTheDocument()
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

  describe('Clear homebrew — hasHomebrew includes perks (#10)', () => {
    it('shows "Clear all homebrew" when only homebrew perks exist (no powers or artifacts)', async () => {
      localStorage.setItem(
        'unity_ttrpg_homebrew_perks',
        JSON.stringify([{ id: 'perk-1', name: 'Test Perk', tier: 1, description: 'A perk.' }])
      )
      renderHome()
      expect(await screen.findByText(/clear all homebrew/i)).toBeInTheDocument()
    })

    it('does not show "Clear all homebrew" when all homebrew stores are empty', () => {
      renderHome()
      expect(screen.queryByText(/clear all homebrew/i)).not.toBeInTheDocument()
    })
  })

  describe('Import Content Pack', () => {
    function triggerContentPackFile(json: string) {
      const file = new File([json], 'unity-content-pack.json', { type: 'application/json' })
      const input = screen.getByTestId('content-pack-input') as HTMLInputElement
      fireEvent.change(input, { target: { files: [file] } })
    }

    // Helper: create a parsed-pack stub of the desired length. The HomeScreen counts the
    // arrays, so we just need enough placeholder entries to hit the target counts.
    function stubPack(powersCount: number, perksCount: number, artifactsCount = 0) {
      mockParseContentPack.mockReturnValue({
        powers: Array.from({ length: powersCount }, (_, i) => ({ id: `p${i}` })) as never,
        perks: Array.from({ length: perksCount }, (_, i) => ({ id: `k${i}` })) as never,
        artifacts: Array.from({ length: artifactsCount }, (_, i) => ({ id: `a${i}` })) as never,
      })
    }

    it('shows success confirmation with counts after a valid import', async () => {
      stubPack(3, 1)
      renderHome()
      triggerContentPackFile('{}')
      await waitFor(() =>
        expect(screen.getByText(/imported 3 powers, 1 perk/i)).toBeInTheDocument()
      )
    })

    it('shows singular form for a single power or perk', async () => {
      stubPack(1, 0)
      renderHome()
      triggerContentPackFile('{}')
      await waitFor(() => expect(screen.getByText(/imported 1 power\./i)).toBeInTheDocument())
    })

    it('shows no-content warning when both counts are zero', async () => {
      stubPack(0, 0)
      renderHome()
      triggerContentPackFile('{}')
      await waitFor(() =>
        expect(screen.getByText(/import successful — no content found/i)).toBeInTheDocument()
      )
    })

    it('shows "Import failed." (not "Invalid file.") when parsing throws (#5)', async () => {
      mockParseContentPack.mockImplementation(() => {
        throw new Error('bad json')
      })
      renderHome()
      triggerContentPackFile('not-json')
      await waitFor(() => expect(screen.getByText(/import failed/i)).toBeInTheDocument())
      expect(screen.queryByText(/invalid file/i)).not.toBeInTheDocument()
    })

    it('"Import another" resets back to the card', async () => {
      stubPack(2, 0)
      renderHome()
      triggerContentPackFile('{}')
      await waitFor(() => expect(screen.getByText(/import another/i)).toBeInTheDocument())
      await userEvent.click(screen.getByText(/import another/i))
      expect(screen.getByRole('button', { name: /import content pack/i })).toBeInTheDocument()
    })
  })
})
