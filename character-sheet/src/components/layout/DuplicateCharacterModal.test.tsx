// DuplicateCharacterModal.test.tsx — tests for the duplicate import dialog.
//
// Covers:
//   1. The modal renders the duplicate character's details
//   2. Shows the proposed copy name ("[name] - copy")
//   3. Clicking "Create Copy" calls onConfirm
//   4. Clicking "Cancel" calls onDismiss
//   5. Clicking the backdrop calls onDismiss
//   6. Clicking inside the card does NOT call onDismiss

import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DuplicateCharacterModal from './DuplicateCharacterModal'
import { baseCharacter } from '../../test/fixtures'

expect.extend(matchers)

function renderModal(overrides?: { onConfirm?: () => void; onDismiss?: () => void }) {
  const props = {
    character: baseCharacter,
    onConfirm: overrides?.onConfirm ?? vi.fn(),
    onDismiss: overrides?.onDismiss ?? vi.fn(),
  }
  render(<DuplicateCharacterModal {...props} />)
  return props
}

describe('DuplicateCharacterModal', () => {
  it('shows the character name', () => {
    renderModal()
    expect(screen.getByText(baseCharacter.name)).toBeInTheDocument()
  })

  it('shows class, race, and level', () => {
    renderModal()
    expect(
      screen.getByText(`${baseCharacter.className} · ${baseCharacter.race} · Level ${baseCharacter.level}`)
    ).toBeInTheDocument()
  })

  it('shows an "Already Saved" heading', () => {
    renderModal()
    expect(screen.getByText('Already Saved')).toBeInTheDocument()
  })

  it('shows the proposed copy name', () => {
    renderModal()
    expect(screen.getByText(`"${baseCharacter.name} - copy"`)).toBeInTheDocument()
  })

  it('calls onConfirm when "Create Copy" is clicked', async () => {
    const onConfirm = vi.fn()
    renderModal({ onConfirm })
    await userEvent.click(screen.getByRole('button', { name: /create copy/i }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onDismiss when "Cancel" is clicked', async () => {
    const onDismiss = vi.fn()
    renderModal({ onDismiss })
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('calls onDismiss when the backdrop is clicked', async () => {
    const onDismiss = vi.fn()
    renderModal({ onDismiss })
    const backdrop = screen.getByRole('button', { name: /cancel/i }).closest('.fixed') as HTMLElement
    await userEvent.click(backdrop)
    expect(onDismiss).toHaveBeenCalled()
  })

  it('does not call onDismiss when clicking inside the card', async () => {
    const onDismiss = vi.fn()
    renderModal({ onDismiss })
    await userEvent.click(screen.getByText('Already Saved'))
    expect(onDismiss).not.toHaveBeenCalled()
  })
})
