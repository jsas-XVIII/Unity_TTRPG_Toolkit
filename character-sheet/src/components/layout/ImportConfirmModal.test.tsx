// ImportConfirmModal.test.tsx — tests for the post-import confirmation dialog.
//
// Covers:
//   1. The modal renders the imported character's details
//   2. Clicking "Switch to [name]" calls onConfirm
//   3. Clicking "Stay Here" calls onDismiss
//   4. Clicking the backdrop calls onDismiss
//   5. Clicking inside the card does NOT call onDismiss (event propagation guard)

import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ImportConfirmModal from './ImportConfirmModal'
import { baseCharacter } from '../../test/fixtures'

expect.extend(matchers)

function renderModal(overrides?: { onConfirm?: () => void; onDismiss?: () => void }) {
  const props = {
    character: baseCharacter,
    onConfirm: overrides?.onConfirm ?? vi.fn(),
    onDismiss: overrides?.onDismiss ?? vi.fn(),
  }
  render(<ImportConfirmModal {...props} />)
  return props
}

describe('ImportConfirmModal', () => {
  it('shows the imported character name', () => {
    renderModal()
    expect(screen.getByText(baseCharacter.name)).toBeInTheDocument()
  })

  it('shows class, race, and level', () => {
    renderModal()
    expect(
      screen.getByText(
        `${baseCharacter.className} · ${baseCharacter.race} · Level ${baseCharacter.level}`
      )
    ).toBeInTheDocument()
  })

  it('shows an "Import Successful" heading', () => {
    renderModal()
    expect(screen.getByText(/import successful/i)).toBeInTheDocument()
  })

  it('calls onConfirm when the switch button is clicked', async () => {
    const onConfirm = vi.fn()
    renderModal({ onConfirm })
    await userEvent.click(screen.getByRole('button', { name: /switch to/i }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onDismiss when "Stay Here" is clicked', async () => {
    const onDismiss = vi.fn()
    renderModal({ onDismiss })
    await userEvent.click(screen.getByRole('button', { name: /stay here/i }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('calls onDismiss when the backdrop is clicked', async () => {
    const onDismiss = vi.fn()
    renderModal({ onDismiss })
    // The backdrop is the outermost div — click it directly
    const backdrop = screen
      .getByRole('button', { name: /stay here/i })
      .closest('.fixed') as HTMLElement
    await userEvent.click(backdrop)
    // onDismiss may be called more than once (backdrop + bubbled click from child); just assert it fired
    expect(onDismiss).toHaveBeenCalled()
  })

  it('does not call onDismiss when clicking inside the card', async () => {
    const onDismiss = vi.fn()
    renderModal({ onDismiss })
    // Click the heading text — inside the card, not the backdrop
    await userEvent.click(screen.getByText(/import successful/i))
    expect(onDismiss).not.toHaveBeenCalled()
  })
})
