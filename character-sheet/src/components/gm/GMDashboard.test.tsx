import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
expect.extend(matchers)
import GMDashboard from './GMDashboard'

function renderDashboard(onBack = vi.fn()) {
  render(<GMDashboard onBack={onBack} />)
  return { onBack }
}

beforeEach(() => {
  localStorage.clear()
})

describe('GMDashboard — navigation', () => {
  it('renders the "← Back" button in the header', () => {
    renderDashboard()
    expect(screen.getByRole('button', { name: /← back/i })).toBeInTheDocument()
  })

  it('clicking "← Back" calls onBack', async () => {
    const { onBack } = renderDashboard()
    await userEvent.click(screen.getByRole('button', { name: /← back/i }))
    expect(onBack).toHaveBeenCalledOnce()
  })
})

describe('GMDashboard — tool cards', () => {
  it('renders the Monster Compendium card', () => {
    renderDashboard()
    expect(screen.getByRole('button', { name: /monster compendium/i })).toBeInTheDocument()
  })

  it('renders the Powers Editor card', () => {
    renderDashboard()
    expect(screen.getByRole('button', { name: /powers editor/i })).toBeInTheDocument()
  })

  it('renders the Perks Editor card', () => {
    renderDashboard()
    expect(screen.getByRole('button', { name: /perks editor/i })).toBeInTheDocument()
  })
})
