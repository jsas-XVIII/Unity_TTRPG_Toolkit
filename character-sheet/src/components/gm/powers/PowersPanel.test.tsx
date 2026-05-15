import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PowersPanel from './PowersPanel'
import { HomebrewProvider } from '../../../context/HomebrewProvider'

// "Armour Pierce" is the first Dreadnought power displayed (baseline pool, default class on mount).
const FIRST_POWER_NAME = 'Armour Pierce'

function renderPanel(onBack = vi.fn()) {
  render(
    <HomebrewProvider>
      <PowersPanel onBack={onBack} />
    </HomebrewProvider>
  )
  return { onBack }
}

beforeEach(() => {
  localStorage.clear()
})

describe('PowersPanel — list', () => {
  it('renders View and Edit buttons for each power row', () => {
    renderPanel()
    const viewButtons = screen.getAllByRole('button', { name: /^view$/i })
    const editButtons = screen.getAllByRole('button', { name: /^edit$/i })
    expect(viewButtons.length).toBeGreaterThan(0)
    expect(editButtons).toHaveLength(viewButtons.length)
  })

  it('does not have a row-level clickable button for the power name', () => {
    renderPanel()
    // The power name itself should not be a button
    expect(screen.queryByRole('button', { name: FIRST_POWER_NAME })).not.toBeInTheDocument()
  })
})

describe('PowersPanel — View flow', () => {
  it('clicking View opens the form in view mode with "View: {name}" title', async () => {
    renderPanel()
    const viewButtons = screen.getAllByRole('button', { name: /^view$/i })
    await userEvent.click(viewButtons[0])
    expect(
      screen.getByRole('heading', { name: new RegExp(`view: ${FIRST_POWER_NAME}`, 'i') })
    ).toBeInTheDocument()
  })

  it('view mode shows "← Back" and no Save button', async () => {
    renderPanel()
    await userEvent.click(screen.getAllByRole('button', { name: /^view$/i })[0])
    expect(screen.getByRole('button', { name: /← back/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument()
  })

  it('"← Back" returns to the power list', async () => {
    renderPanel()
    await userEvent.click(screen.getAllByRole('button', { name: /^view$/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /← back/i }))
    expect(screen.getByRole('button', { name: /\+ new power/i })).toBeInTheDocument()
  })
})

describe('PowersPanel — Edit flow', () => {
  it('clicking Edit opens the form in edit mode with "Edit: {name}" title', async () => {
    renderPanel()
    const editButtons = screen.getAllByRole('button', { name: /^edit$/i })
    await userEvent.click(editButtons[0])
    expect(
      screen.getByRole('heading', { name: new RegExp(`edit: ${FIRST_POWER_NAME}`, 'i') })
    ).toBeInTheDocument()
  })

  it('edit mode shows "← Cancel" and Save button', async () => {
    renderPanel()
    await userEvent.click(screen.getAllByRole('button', { name: /^edit$/i })[0])
    expect(screen.getByRole('button', { name: /← cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('"← Cancel" returns to the power list', async () => {
    renderPanel()
    await userEvent.click(screen.getAllByRole('button', { name: /^edit$/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /← cancel/i }))
    expect(screen.getByRole('button', { name: /\+ new power/i })).toBeInTheDocument()
  })
})

describe('PowersPanel — New Power flow', () => {
  it('clicking "+ New Power" opens form with "New Power" title', async () => {
    renderPanel()
    await userEvent.click(screen.getByRole('button', { name: /\+ new power/i }))
    expect(screen.getByRole('heading', { name: /new power/i })).toBeInTheDocument()
  })

  it('new power form shows "← Cancel" and Save button', async () => {
    renderPanel()
    await userEvent.click(screen.getByRole('button', { name: /\+ new power/i }))
    expect(screen.getByRole('button', { name: /← cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })
})

describe('PowersPanel — Back button', () => {
  it('"← Back" on the list calls onBack', async () => {
    const { onBack } = renderPanel()
    await userEvent.click(screen.getByRole('button', { name: /← back/i }))
    expect(onBack).toHaveBeenCalledOnce()
  })
})

describe('PowersPanel — Save flow', () => {
  it('renders a newly-saved homebrew power in the list', async () => {
    renderPanel()
    const newName = 'Test Homebrew Power'

    await userEvent.click(screen.getByRole('button', { name: /\+ new power/i }))
    await userEvent.type(screen.getByPlaceholderText('Power name'), newName)
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))

    // Form closed, list returned
    expect(screen.getByRole('button', { name: /\+ new power/i })).toBeInTheDocument()
    // New power appears in the list
    expect(screen.getByText(newName)).toBeInTheDocument()
  })
})
