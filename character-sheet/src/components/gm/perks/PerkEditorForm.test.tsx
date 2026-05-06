import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PerkEditorForm from './PerkEditorForm'
import type { Perk } from '../../../types/character'

const BASE_PERK: Perk = {
  id: 'gp-001',
  name: 'Combat Specialist',
  description: '+1 to Class Resource recharge rolls.',
  source: 'General',
}

function renderForm(overrides: Partial<React.ComponentProps<typeof PerkEditorForm>> = {}) {
  const props = {
    initial: BASE_PERK,
    isOfficial: true,
    isOverridden: false,
    readOnly: false,
    onSave: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  }
  render(<PerkEditorForm {...props} />)
  return props
}

beforeEach(() => {
  localStorage.clear()
})

describe('PerkEditorForm — edit mode', () => {
  it('shows "Edit: {name}" title', () => {
    renderForm()
    expect(screen.getByRole('heading', { name: /edit: combat specialist/i })).toBeInTheDocument()
  })

  it('shows "← Cancel" on the back button', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /← cancel/i })).toBeInTheDocument()
  })

  it('renders the Save button', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('name and description inputs are not readOnly', () => {
    renderForm({ isOfficial: false, isOverridden: false })
    const nameInput = screen.getByPlaceholderText(/perk name/i) as HTMLInputElement
    const descInput = screen.getByPlaceholderText(/perk description/i) as HTMLTextAreaElement
    expect(nameInput.readOnly).toBe(false)
    expect(descInput.readOnly).toBe(false)
  })

  it('"← Cancel" calls onCancel', async () => {
    const { onCancel } = renderForm()
    await userEvent.click(screen.getByRole('button', { name: /← cancel/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('shows "New Perk" title for a brand-new homebrew perk', () => {
    renderForm({ isOfficial: false, isOverridden: false })
    expect(screen.getByRole('heading', { name: /new perk/i })).toBeInTheDocument()
  })

  it('shows "Official" badge for an unoverridden official perk', () => {
    renderForm()
    expect(screen.getByText(/official/i)).toBeInTheDocument()
  })

  it('shows "Save as Override" label when editing an official perk', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /save as override/i })).toBeInTheDocument()
  })
})

describe('PerkEditorForm — view mode', () => {
  it('shows "View: {name}" title', () => {
    renderForm({ readOnly: true })
    expect(screen.getByRole('heading', { name: /view: combat specialist/i })).toBeInTheDocument()
  })

  it('shows "← Back" on the back button', () => {
    renderForm({ readOnly: true })
    expect(screen.getByRole('button', { name: /← back/i })).toBeInTheDocument()
  })

  it('does not render the Save button', () => {
    renderForm({ readOnly: true })
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument()
  })

  it('name and description inputs are readOnly', () => {
    renderForm({ readOnly: true })
    const nameInput = screen.getByPlaceholderText(/perk name/i) as HTMLInputElement
    const descInput = screen.getByPlaceholderText(/perk description/i) as HTMLTextAreaElement
    expect(nameInput.readOnly).toBe(true)
    expect(descInput.readOnly).toBe(true)
  })

  it('"← Back" calls onCancel', async () => {
    const { onCancel } = renderForm({ readOnly: true })
    await userEvent.click(screen.getByRole('button', { name: /← back/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
