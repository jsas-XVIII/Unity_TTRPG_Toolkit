import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PowerEditorForm from './PowerEditorForm'
import type { HomebrewPower } from '../../../services/powersStorage'

const BASE_POWER: HomebrewPower = {
  id: 'furious-charge',
  name: 'Furious Charge',
  className: 'Dreadnought',
  tier: 1,
  actionType: 'Standard',
  cost: '2 Fury',
  target: 'Single',
  range: 'Nearby',
  effectsText: 'Charge a Nearby enemy.',
  upgrades: [
    { id: 'upg-1', name: 'Juggernaut', description: 'Gain +MIGHT to AV.', purchased: false },
  ],
}

function renderForm(overrides: Partial<React.ComponentProps<typeof PowerEditorForm>> = {}) {
  const props = {
    initial: BASE_POWER,
    isOfficial: true,
    isOverridden: false,
    readOnly: false,
    onSave: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  }
  render(<PowerEditorForm {...props} />)
  return props
}

beforeEach(() => {
  localStorage.clear()
})

describe('PowerEditorForm — edit mode', () => {
  it('shows "Edit: {name}" title', () => {
    renderForm()
    expect(screen.getByRole('heading', { name: /edit: furious charge/i })).toBeInTheDocument()
  })

  it('shows "← Cancel" on the back button', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /← cancel/i })).toBeInTheDocument()
  })

  it('renders the Save button', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('shows "+ Add Action" button', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /\+ add action/i })).toBeInTheDocument()
  })

  it('shows "+ Add Upgrade" button', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /\+ add upgrade/i })).toBeInTheDocument()
  })

  it('shows upgrade remove buttons', () => {
    renderForm()
    expect(screen.getAllByRole('button', { name: '✕' }).length).toBeGreaterThan(0)
  })

  it('name input is not readOnly', () => {
    renderForm({ isOfficial: false, isOverridden: false })
    const input = screen.getByPlaceholderText(/power name/i) as HTMLInputElement
    expect(input.readOnly).toBe(false)
  })

  it('"← Cancel" calls onCancel', async () => {
    const { onCancel } = renderForm()
    await userEvent.click(screen.getByRole('button', { name: /← cancel/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('shows "New Power" title for a brand-new homebrew power', () => {
    renderForm({ isOfficial: false, isOverridden: false })
    expect(screen.getByRole('heading', { name: /new power/i })).toBeInTheDocument()
  })
})

describe('PowerEditorForm — view mode', () => {
  it('shows "View: {name}" title', () => {
    renderForm({ readOnly: true })
    expect(screen.getByRole('heading', { name: /view: furious charge/i })).toBeInTheDocument()
  })

  it('shows "← Back" on the back button', () => {
    renderForm({ readOnly: true })
    expect(screen.getByRole('button', { name: /← back/i })).toBeInTheDocument()
  })

  it('does not render the Save button', () => {
    renderForm({ readOnly: true })
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument()
  })

  it('does not show "+ Add Action" button', () => {
    renderForm({ readOnly: true })
    expect(screen.queryByRole('button', { name: /\+ add action/i })).not.toBeInTheDocument()
  })

  it('does not show "+ Add Upgrade" button', () => {
    renderForm({ readOnly: true })
    expect(screen.queryByRole('button', { name: /\+ add upgrade/i })).not.toBeInTheDocument()
  })

  it('does not show upgrade remove buttons', () => {
    renderForm({ readOnly: true })
    expect(screen.queryAllByRole('button', { name: '✕' })).toHaveLength(0)
  })

  it('name input is readOnly', () => {
    renderForm({ readOnly: true, isOfficial: false, isOverridden: true })
    const input = screen.getByPlaceholderText(/power name/i) as HTMLInputElement
    expect(input.readOnly).toBe(true)
  })

  it('"← Back" calls onCancel', async () => {
    const { onCancel } = renderForm({ readOnly: true })
    await userEvent.click(screen.getByRole('button', { name: /← back/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('additional action type remove buttons are hidden', () => {
    renderForm({
      readOnly: true,
      initial: { ...BASE_POWER, additionalActionTypes: ['Quick'] },
    })
    expect(screen.queryAllByRole('button', { name: '✕' })).toHaveLength(0)
  })
})
