import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
expect.extend(matchers)
import { invalidateCampaignsCache } from '../../services/campaignStorage'
import GMScreen from './GMScreen'

// DiceTrayModal has deep dependencies (dice engine, character types). Stub it so
// GMScreen tests stay focused on campaign/note/ruin behaviour.
vi.mock('../dice/DiceTrayModal', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="dice-tray-modal">
      <button onClick={onClose}>Close Dice</button>
    </div>
  ),
}))

function renderScreen(
  props: Partial<{
    onBack: () => void
    onNavigateToEncounter: () => void
    onCampaignChange: (id: string | null) => void
  }> = {}
) {
  const defaults = {
    onBack: vi.fn(),
    onNavigateToEncounter: vi.fn(),
    onCampaignChange: vi.fn(),
  }
  render(<GMScreen {...defaults} {...props} />)
  return { ...defaults, ...props }
}

beforeEach(() => {
  localStorage.clear()
  invalidateCampaignsCache()
})

// ── Empty state ─────────────────────────────────────────────────────────────

describe('GMScreen — empty state', () => {
  it('shows prompt to create or select a campaign', () => {
    renderScreen()
    expect(screen.getByText(/select a campaign or create one/i)).toBeInTheDocument()
  })

  it('renders the "+ New" button', () => {
    renderScreen()
    expect(screen.getByRole('button', { name: /\+ new/i })).toBeInTheDocument()
  })
})

// ── Create campaign ─────────────────────────────────────────────────────────

describe('GMScreen — create campaign', () => {
  it('shows inline form when "+ New" is clicked', async () => {
    renderScreen()
    await userEvent.click(screen.getByRole('button', { name: /\+ new/i }))
    expect(screen.getByPlaceholderText(/campaign name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('creates a campaign and shows it selected in the dropdown', async () => {
    renderScreen()
    await userEvent.click(screen.getByRole('button', { name: /\+ new/i }))
    await userEvent.type(screen.getByPlaceholderText(/campaign name/i), 'Dragon Heist')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    expect(screen.getByRole('option', { name: 'Dragon Heist' })).toBeInTheDocument()
  })

  it('shows the RuinWidget after a campaign is created', async () => {
    renderScreen()
    await userEvent.click(screen.getByRole('button', { name: /\+ new/i }))
    await userEvent.type(screen.getByPlaceholderText(/campaign name/i), 'Spelljammer')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    expect(screen.getByText(/ruin/i)).toBeInTheDocument()
  })

  it('calls onCampaignChange with the new campaign id', async () => {
    const onCampaignChange = vi.fn()
    renderScreen({ onCampaignChange })
    await userEvent.click(screen.getByRole('button', { name: /\+ new/i }))
    await userEvent.type(screen.getByPlaceholderText(/campaign name/i), 'Test')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    expect(onCampaignChange).toHaveBeenCalledWith(expect.stringMatching(/camp-/))
  })

  it('dismisses the inline form on Cancel', async () => {
    renderScreen()
    await userEvent.click(screen.getByRole('button', { name: /\+ new/i }))
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByPlaceholderText(/campaign name/i)).not.toBeInTheDocument()
  })
})

// ── Delete campaign ─────────────────────────────────────────────────────────

describe('GMScreen — delete campaign', () => {
  async function createCampaign(name: string) {
    await userEvent.click(screen.getByRole('button', { name: /\+ new/i }))
    await userEvent.type(screen.getByPlaceholderText(/campaign name/i), name)
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
  }

  it('shows a Delete button when a campaign is selected', async () => {
    renderScreen()
    await createCampaign('Doomed Campaign')
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('deletes the campaign and returns to the empty state', async () => {
    renderScreen()
    await createCampaign('Gone Campaign')
    await userEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(screen.getByText(/select a campaign or create one/i)).toBeInTheDocument()
  })
})

// ── Notes ───────────────────────────────────────────────────────────────────

describe('GMScreen — notes', () => {
  async function createCampaign(name = 'Campaign') {
    await userEvent.click(screen.getByRole('button', { name: /\+ new/i }))
    await userEvent.type(screen.getByPlaceholderText(/campaign name/i), name)
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
  }

  it('shows "No notes yet" when a campaign has no notes', async () => {
    renderScreen()
    await createCampaign()
    expect(screen.getByText(/no notes yet/i)).toBeInTheDocument()
  })

  it('creates a new note and shows the editor when "+ New" is clicked in the notes panel', async () => {
    renderScreen()
    await createCampaign()
    // The notes panel has its own "+ New" link
    const noteNew = screen.getAllByRole('button', { name: /\+ new/i }).at(-1)!
    await userEvent.click(noteNew)
    expect(screen.getByDisplayValue('New Note')).toBeInTheDocument()
  })

  it('shows the note editor when a note is selected', async () => {
    renderScreen()
    await createCampaign()
    const noteNew = screen.getAllByRole('button', { name: /\+ new/i }).at(-1)!
    await userEvent.click(noteNew)
    expect(screen.getByPlaceholderText(/session notes/i)).toBeInTheDocument()
  })
})

// ── Navigation ──────────────────────────────────────────────────────────────

describe('GMScreen — navigation', () => {
  it('"← Back" calls onBack', async () => {
    const onBack = vi.fn()
    renderScreen({ onBack })
    await userEvent.click(screen.getByRole('button', { name: /← back/i }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('"Encounter Builder →" calls onNavigateToEncounter', async () => {
    const onNavigateToEncounter = vi.fn()
    renderScreen({ onNavigateToEncounter })
    await userEvent.click(screen.getByRole('button', { name: /encounter builder/i }))
    expect(onNavigateToEncounter).toHaveBeenCalledOnce()
  })

  it('"Dice" button opens the dice tray modal', async () => {
    renderScreen()
    await userEvent.click(screen.getByRole('button', { name: /dice/i }))
    expect(screen.getByTestId('dice-tray-modal')).toBeInTheDocument()
  })
})
