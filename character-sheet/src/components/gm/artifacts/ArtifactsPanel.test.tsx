import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ArtifactsPanel from './ArtifactsPanel'
import { HomebrewProvider } from '../../../context/HomebrewProvider'

// "Traveler's Keepsake" is the first official artifact (art-001).
const FIRST_ARTIFACT_NAME = "Traveler's Keepsake"

function renderPanel(onBack = vi.fn()) {
  render(
    <HomebrewProvider>
      <ArtifactsPanel onBack={onBack} />
    </HomebrewProvider>
  )
  return { onBack }
}

beforeEach(() => {
  localStorage.clear()
})

describe('ArtifactsPanel — list', () => {
  it('renders View and Edit buttons for each artifact row', () => {
    renderPanel()
    const viewButtons = screen.getAllByRole('button', { name: /^view$/i })
    const editButtons = screen.getAllByRole('button', { name: /^edit$/i })
    expect(viewButtons.length).toBeGreaterThan(0)
    expect(editButtons).toHaveLength(viewButtons.length)
  })

  it('does not have a row-level clickable button for the artifact name', () => {
    renderPanel()
    expect(screen.queryByRole('button', { name: FIRST_ARTIFACT_NAME })).not.toBeInTheDocument()
  })
})

describe('ArtifactsPanel — View flow', () => {
  it('clicking View opens the form in view mode with "View: {name}" title', async () => {
    renderPanel()
    const viewButtons = screen.getAllByRole('button', { name: /^view$/i })
    await userEvent.click(viewButtons[0])
    expect(
      screen.getByRole('heading', { name: new RegExp(`view: ${FIRST_ARTIFACT_NAME}`, 'i') })
    ).toBeInTheDocument()
  })

  it('view mode shows "← Back" and no Save button', async () => {
    renderPanel()
    await userEvent.click(screen.getAllByRole('button', { name: /^view$/i })[0])
    expect(screen.getByRole('button', { name: /← back/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument()
  })

  it('"← Back" returns to the artifact list', async () => {
    renderPanel()
    await userEvent.click(screen.getAllByRole('button', { name: /^view$/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /← back/i }))
    expect(screen.getByRole('button', { name: /\+ new artifact/i })).toBeInTheDocument()
  })
})

describe('ArtifactsPanel — Edit flow', () => {
  it('clicking Edit opens the form in edit mode with "Edit: {name}" title', async () => {
    renderPanel()
    const editButtons = screen.getAllByRole('button', { name: /^edit$/i })
    await userEvent.click(editButtons[0])
    expect(
      screen.getByRole('heading', { name: new RegExp(`edit: ${FIRST_ARTIFACT_NAME}`, 'i') })
    ).toBeInTheDocument()
  })

  it('edit mode shows "← Cancel" and Save button', async () => {
    renderPanel()
    await userEvent.click(screen.getAllByRole('button', { name: /^edit$/i })[0])
    expect(screen.getByRole('button', { name: /← cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('"← Cancel" returns to the artifact list', async () => {
    renderPanel()
    await userEvent.click(screen.getAllByRole('button', { name: /^edit$/i })[0])
    await userEvent.click(screen.getByRole('button', { name: /← cancel/i }))
    expect(screen.getByRole('button', { name: /\+ new artifact/i })).toBeInTheDocument()
  })
})

describe('ArtifactsPanel — New Artifact flow', () => {
  it('clicking "+ New Artifact" opens form with "New Artifact" title', async () => {
    renderPanel()
    await userEvent.click(screen.getByRole('button', { name: /\+ new artifact/i }))
    expect(screen.getByRole('heading', { name: /new artifact/i })).toBeInTheDocument()
  })

  it('new artifact form shows "← Cancel" and Save button', async () => {
    renderPanel()
    await userEvent.click(screen.getByRole('button', { name: /\+ new artifact/i }))
    expect(screen.getByRole('button', { name: /← cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })
})

describe('ArtifactsPanel — Back button', () => {
  it('"← Back" on the list calls onBack', async () => {
    const { onBack } = renderPanel()
    await userEvent.click(screen.getByRole('button', { name: /← back/i }))
    expect(onBack).toHaveBeenCalledOnce()
  })
})

describe('ArtifactsPanel — Save flow', () => {
  it('renders a newly-saved homebrew artifact in the list', async () => {
    renderPanel()
    const newName = 'Test Homebrew Artifact'

    await userEvent.click(screen.getByRole('button', { name: /\+ new artifact/i }))
    await userEvent.type(screen.getByPlaceholderText('Artifact name'), newName)
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))

    // Form closed, list returned
    expect(screen.getByRole('button', { name: /\+ new artifact/i })).toBeInTheDocument()
    // New artifact appears in the list
    expect(screen.getByText(newName)).toBeInTheDocument()
  })
})
