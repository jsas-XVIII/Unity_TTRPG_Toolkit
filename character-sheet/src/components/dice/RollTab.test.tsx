import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
expect.extend(matchers)
import RollTab from './RollTab'
import { baseCharacter } from '../../test/fixtures'
import { CLASS_MAP } from '../../constants/classes'
import { computeDerivedStats } from '../../utils/derivedStats'

vi.mock('../../utils/diceAudio', () => ({
  playTick: vi.fn(),
  playSettle: vi.fn(),
}))

const classDef = CLASS_MAP[baseCharacter.className]
const derived = computeDerivedStats(baseCharacter, classDef)

function renderRollTab() {
  render(
    <RollTab
      characterId={baseCharacter.id}
      attributes={baseCharacter.attributes}
      derived={derived}
      onRoll={vi.fn()}
    />
  )
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('RollTab — interval cleanup on unmount (#6)', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('clears the tumble interval when the component unmounts mid-roll', () => {
    vi.useFakeTimers()
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')

    const { unmount } = render(
      <RollTab
        characterId={baseCharacter.id}
        attributes={baseCharacter.attributes}
        derived={derived}
        onRoll={vi.fn()}
      />
    )

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /^roll$/i }))
    })

    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
  })
})

describe('RollTab — clipboard copy macro (#15)', () => {
  it('does not throw an unhandled rejection when clipboard.writeText rejects', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('Permission denied')) },
      writable: true,
      configurable: true,
    })

    renderRollTab()

    const unhandledRejectionSpy = vi.fn()
    window.addEventListener('unhandledrejection', unhandledRejectionSpy)

    await userEvent.click(screen.getByRole('button', { name: /roll20 macro/i }))

    window.removeEventListener('unhandledrejection', unhandledRejectionSpy)
    expect(unhandledRejectionSpy).not.toHaveBeenCalled()
  })

  it('shows "Copied!" after a successful clipboard write', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    })

    renderRollTab()
    await userEvent.click(screen.getByRole('button', { name: /roll20 macro/i }))
    expect(screen.getByRole('button', { name: /copied!/i })).toBeInTheDocument()
  })
})
