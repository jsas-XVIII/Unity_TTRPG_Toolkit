import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EncounterTracker from './EncounterTracker'
import type { SavedEncounter } from '../../../types/encounter'

// Shambler (m-028): HP 18, DL 1, Standard — lowest-DL compendium entry; used as a stable fixture.
const SHAMBLER_ID = 'm-028'
const SHAMBLER_HP = 18

function makeEncounter(count: number): SavedEncounter {
  return {
    id: 'enc-test',
    name: 'Test Encounter',
    entries: [{ monsterId: SHAMBLER_ID, count }],
  }
}

function renderTracker(encounter: SavedEncounter, onEnd = vi.fn()) {
  render(<EncounterTracker encounter={encounter} onEnd={onEnd} />)
  return { onEnd }
}

beforeEach(() => {
  localStorage.clear()
})

describe('EncounterTracker — combatant expansion', () => {
  it('creates one combatant for a count-1 entry, with no number suffix', () => {
    renderTracker(makeEncounter(1))
    expect(screen.getByRole('button', { name: /^shambler$/i })).toBeInTheDocument()
  })

  it('expands a count-2 entry into two individually labeled combatants', () => {
    renderTracker(makeEncounter(2))
    expect(screen.getByRole('button', { name: /^shambler 1$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^shambler 2$/i })).toBeInTheDocument()
  })
})

describe('EncounterTracker — HP tracking', () => {
  it('initialises HP from monster data', () => {
    renderTracker(makeEncounter(1))
    expect(screen.getByDisplayValue(String(SHAMBLER_HP))).toBeInTheDocument()
    expect(screen.getByText(`/ ${SHAMBLER_HP}`)).toBeInTheDocument()
  })

  it('−1 button decrements current HP by 1', async () => {
    renderTracker(makeEncounter(1))
    await userEvent.click(screen.getByRole('button', { name: /^−1$/ }))
    expect(screen.getByDisplayValue(String(SHAMBLER_HP - 1))).toBeInTheDocument()
  })

  it('−5 button decrements current HP by 5', async () => {
    renderTracker(makeEncounter(1))
    await userEvent.click(screen.getByRole('button', { name: /^−5$/ }))
    expect(screen.getByDisplayValue(String(SHAMBLER_HP - 5))).toBeInTheDocument()
  })

  it('+1 button does not exceed max HP', async () => {
    renderTracker(makeEncounter(1))
    await userEvent.click(screen.getByRole('button', { name: /^\+1$/ }))
    // HP is already at max; value should remain unchanged
    expect(screen.getByDisplayValue(String(SHAMBLER_HP))).toBeInTheDocument()
    expect(screen.queryByDisplayValue(String(SHAMBLER_HP + 1))).not.toBeInTheDocument()
  })

  it('HP is clamped at 0 when −1 is clicked from 0', async () => {
    renderTracker(makeEncounter(1))
    // fireEvent.change is used here because userEvent.clear on a controlled number input
    // fires onChange with '', which hits the isNaN guard and leaves HP unchanged.
    fireEvent.change(screen.getByDisplayValue(String(SHAMBLER_HP)), { target: { value: '0' } })
    await userEvent.click(screen.getByRole('button', { name: /^−1$/ }))
    expect(screen.getByDisplayValue('0')).toBeInTheDocument()
  })
})

describe('EncounterTracker — defeated', () => {
  it('marks the combatant as defeated when the Defeated checkbox is checked', async () => {
    renderTracker(makeEncounter(1))
    const checkbox = screen.getByRole('checkbox', { name: /defeated/i })
    await userEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('shows "All enemies defeated!" when all combatants are defeated', async () => {
    renderTracker(makeEncounter(1))
    await userEvent.click(screen.getByRole('checkbox', { name: /defeated/i }))
    expect(screen.getByText(/all enemies defeated/i)).toBeInTheDocument()
  })
})

describe('EncounterTracker — navigation', () => {
  it('calls onEnd when End Encounter is clicked', async () => {
    const { onEnd } = renderTracker(makeEncounter(1))
    await userEvent.click(screen.getByRole('button', { name: /end encounter/i }))
    expect(onEnd).toHaveBeenCalled()
  })
})

describe('EncounterTracker — per-combatant turn feature removed (#8)', () => {
  it('does not render a Next Turn button', () => {
    renderTracker(makeEncounter(3))
    expect(screen.queryByRole('button', { name: /next turn/i })).not.toBeInTheDocument()
  })

  it('does not show an "Active:" combatant indicator', () => {
    renderTracker(makeEncounter(3))
    expect(screen.queryByText(/active:/i)).not.toBeInTheDocument()
  })
})
