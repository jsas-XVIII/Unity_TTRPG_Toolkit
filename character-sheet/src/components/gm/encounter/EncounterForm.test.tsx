import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EncounterForm from './EncounterForm'
import type { SavedEncounter } from '../../../types/encounter'

function renderForm(initial?: SavedEncounter) {
  const handlers = {
    onSave: vi.fn(),
    onRunNow: vi.fn(),
    onCancel: vi.fn(),
  }
  render(<EncounterForm initial={initial} {...handlers} />)
  return handlers
}

beforeEach(() => {
  localStorage.clear()
})

describe('EncounterForm — initial state', () => {
  it('disables Save when name and entries are empty', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled()
  })

  it('disables Run Now when name and entries are empty', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /^run now$/i })).toBeDisabled()
  })

  it('shows the "New Encounter" heading for a new form', () => {
    renderForm()
    expect(screen.getByRole('heading', { name: /new encounter/i })).toBeInTheDocument()
  })
})

describe('EncounterForm — validation', () => {
  it('keeps Save disabled when name is filled but no monsters added', async () => {
    renderForm()
    await userEvent.type(screen.getByPlaceholderText(/ambush at the crossroads/i), 'My Encounter')
    expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled()
  })

  it('enables Save and Run Now after name is entered and a monster is added', async () => {
    renderForm()
    await userEvent.type(screen.getByPlaceholderText(/ambush at the crossroads/i), 'My Encounter')
    // Monster picker renders all monsters sorted by DL; first Add button is for the lowest-DL monster
    const addButtons = screen.getAllByRole('button', { name: /\+ add/i })
    await userEvent.click(addButtons[0])
    expect(screen.getByRole('button', { name: /^save$/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /^run now$/i })).toBeEnabled()
  })
})

describe('EncounterForm — actions', () => {
  it('calls onCancel when the Cancel button is clicked', async () => {
    const { onCancel } = renderForm()
    // There are two Cancel buttons (header ← Cancel and footer Cancel); clicking either is valid
    await userEvent.click(screen.getAllByRole('button', { name: /cancel/i })[0])
    expect(onCancel).toHaveBeenCalled()
  })

  it('calls onSave with an encounter when Save is clicked after filling the form', async () => {
    const { onSave } = renderForm()
    await userEvent.type(screen.getByPlaceholderText(/ambush at the crossroads/i), 'My Encounter')
    const addButtons = screen.getAllByRole('button', { name: /\+ add/i })
    await userEvent.click(addButtons[0])
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'My Encounter',
        entries: expect.arrayContaining([expect.objectContaining({ count: 1 })]),
      })
    )
  })
})

describe('EncounterForm — edit mode', () => {
  it('shows "Edit: {name}" heading when editing an existing encounter', () => {
    const existing: SavedEncounter = {
      id: 'e1',
      name: 'Cave Raid',
      entries: [{ monsterId: 'm-028', count: 1 }],
    }
    renderForm(existing)
    expect(screen.getByRole('heading', { name: /edit: cave raid/i })).toBeInTheDocument()
  })

  it('preserves the existing encounter id on save', async () => {
    const existing: SavedEncounter = {
      id: 'existing-id',
      name: 'Cave Raid',
      entries: [{ monsterId: 'm-028', count: 1 }],
    }
    const { onSave } = renderForm(existing)
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ id: 'existing-id' }))
  })
})
