import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PerksPanel from './PerksPanel'
import { HomebrewProvider } from '../../../context/HomebrewContext'

// "Combat Specialist" is the first official perk (gp-001).
const FIRST_PERK_NAME = 'Combat Specialist'

function renderPanel(onBack = vi.fn()) {
  render(
    <HomebrewProvider>
      <PerksPanel onBack={onBack} />
    </HomebrewProvider>
  )
  return { onBack }
}

beforeEach(() => {
  localStorage.clear()
})

describe('PerksPanel — list', () => {
  it('renders View and Edit buttons for each perk row', () => {
    renderPanel()
    const viewButtons = screen.getAllByRole('button', { name: /^view$/i })
    const editButtons = screen.getAllByRole('button', { name: /^edit$/i })
    expect(viewButtons.length).toBeGreaterThan(0)
    expect(editButtons).toHaveLength(viewButtons.length)
  })

  it('does not have a row-level clickable button for the perk name', () => {
    renderPanel()
    expect(screen.queryByRole('button', { name: FIRST_PERK_NAME })).not.toBeInTheDocument()
  })
})

describe('PerksPanel — View flow', () => {
  it('clicking View opens the form in view mode with "View: {name}" title', async () => {
    renderPanel()
    const viewButtons = screen.getAllByRole('button', { name: /^view$/i })
    await userEvent.click(viewButtons[0])
    expect(
      screen.getByRole('heading', { name: new RegExp(`view: ${FIRST_PERK_NAME}`, 'i') })
    ).toBeInTheDocument()
  })

  it('view mode shows "← Back" and no Save button', async () => {
    renderPanel()
    await userEvent.click(screen.getAllByRole('button', { name: /^view$/i })[0])
    expect(screen.getByRole('button', { name: /← back/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument()
  })

  it('"← Back" returns to the perk list', async () => {
    renderPanel()
    await userEvent.click(screen.getAllByRole('button', { name: /^view$/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /← back/i }))
    expect(screen.getByRole('button', { name: /\+ new perk/i })).toBeInTheDocument()
  })
})

describe('PerksPanel — Edit flow', () => {
  it('clicking Edit opens the form in edit mode with "Edit: {name}" title', async () => {
    renderPanel()
    const editButtons = screen.getAllByRole('button', { name: /^edit$/i })
    await userEvent.click(editButtons[0])
    expect(
      screen.getByRole('heading', { name: new RegExp(`edit: ${FIRST_PERK_NAME}`, 'i') })
    ).toBeInTheDocument()
  })

  it('edit mode shows "← Cancel" and Save button', async () => {
    renderPanel()
    await userEvent.click(screen.getAllByRole('button', { name: /^edit$/i })[0])
    expect(screen.getByRole('button', { name: /← cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('"← Cancel" returns to the perk list', async () => {
    renderPanel()
    await userEvent.click(screen.getAllByRole('button', { name: /^edit$/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /← cancel/i }))
    expect(screen.getByRole('button', { name: /\+ new perk/i })).toBeInTheDocument()
  })
})

describe('PerksPanel — New Perk flow', () => {
  it('clicking "+ New Perk" opens form with "New Perk" title', async () => {
    renderPanel()
    await userEvent.click(screen.getByRole('button', { name: /\+ new perk/i }))
    expect(screen.getByRole('heading', { name: /new perk/i })).toBeInTheDocument()
  })

  it('new perk form shows "← Cancel" and Save button', async () => {
    renderPanel()
    await userEvent.click(screen.getByRole('button', { name: /\+ new perk/i }))
    expect(screen.getByRole('button', { name: /← cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })
})

describe('PerksPanel — Back button', () => {
  it('"← Back" on the list calls onBack', async () => {
    const { onBack } = renderPanel()
    await userEvent.click(screen.getByRole('button', { name: /← back/i }))
    expect(onBack).toHaveBeenCalledOnce()
  })
})
