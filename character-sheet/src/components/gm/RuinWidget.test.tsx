import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
expect.extend(matchers)
import RuinWidget from './RuinWidget'
import type { Campaign } from '../../types/campaign'

function makeCampaign(ruin = 0): Campaign {
  return { id: 'c1', name: 'Test Campaign', ruin, notes: [] }
}

function renderWidget(ruin = 0, onUpdate = vi.fn()) {
  render(<RuinWidget campaign={makeCampaign(ruin)} onUpdate={onUpdate} />)
  return { onUpdate }
}

describe('RuinWidget — display', () => {
  it('shows the current Ruin value', () => {
    renderWidget(12)
    expect(screen.getByText('12')).toBeInTheDocument()
  })
})

describe('RuinWidget — quick-add buttons', () => {
  it('+1 calls onUpdate with ruin incremented by 1', async () => {
    const { onUpdate } = renderWidget(5)
    await userEvent.click(screen.getByRole('button', { name: '+1' }))
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ ruin: 6 }))
  })

  it('+3 calls onUpdate with ruin incremented by 3', async () => {
    const { onUpdate } = renderWidget(5)
    await userEvent.click(screen.getByRole('button', { name: '+3' }))
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ ruin: 8 }))
  })

  it('+7 calls onUpdate with ruin incremented by 7', async () => {
    const { onUpdate } = renderWidget(5)
    await userEvent.click(screen.getByRole('button', { name: '+7' }))
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ ruin: 12 }))
  })
})

describe('RuinWidget — spend flow', () => {
  it('clicking Spend reveals the amount input and Spend/Cancel buttons', async () => {
    renderWidget(10)
    await userEvent.click(screen.getByRole('button', { name: /spend/i }))
    expect(screen.getByRole('spinbutton')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('confirming spend calls onUpdate with ruin decremented', async () => {
    const { onUpdate } = renderWidget(10)
    await userEvent.click(screen.getByRole('button', { name: /spend/i }))
    // default amount is 1
    await userEvent.click(screen.getByRole('button', { name: 'Spend' }))
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ ruin: 9 }))
  })

  it('spend cannot reduce ruin below 0', async () => {
    const { onUpdate } = renderWidget(2)
    await userEvent.click(screen.getByRole('button', { name: /spend/i }))
    const input = screen.getByRole('spinbutton')
    await userEvent.clear(input)
    await userEvent.type(input, '99')
    await userEvent.click(screen.getByRole('button', { name: 'Spend' }))
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ ruin: 0 }))
  })

  it('Cancel dismisses the spend input', async () => {
    renderWidget(10)
    await userEvent.click(screen.getByRole('button', { name: /spend/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
  })
})
