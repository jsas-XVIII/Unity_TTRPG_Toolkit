// PowerList.test.tsx — component tests for the token counter feature.
//
// Covers:
//   1. tokenColor helper — red/yellow/green class applied to the counter spans
//   2. Tier I used token count (free_lv5 powers excluded; upgrades counted)
//   3. Tier II used token count (free_lv5 powers excluded; upgrades counted)
//   4. freeTier2Count — only source='free_lv5' Tier II powers counted
//   5. showTier2Warning / canUseFreeSlot — level 5+ with fewer than 2 free Tier II
//   6. Token display reflects the correct budget for the character's level

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
import type { CharacterPower } from '../../types/character'
import PowerList from './PowerList'

expect.extend(matchers)

// Known Dreadnought power IDs from powers.json
const T1_ID_1 = 'furious-charge'
const T1_ID_2 = 'brace-for-impact'
const T1_ID_3 = 'bring-it-on'
const T2_ID_1 = 'crushing-blow'
const T2_ID_2 = 'living-shield'

function mkPower(
  id: string,
  source?: CharacterPower['source'],
  purchasedUpgradeIds: string[] = []
): CharacterPower {
  return { id, purchasedUpgradeIds, source }
}

function renderList(powers: CharacterPower[], level: number) {
  const dispatch = vi.fn()
  render(
    <PowerList
      powers={powers}
      className="Dreadnought"
      classPath={null}
      level={level}
      dispatch={dispatch}
    />
  )
  return { dispatch }
}

/**
 * Returns the colored counter <span> that is the direct child of the outer label
 * <span> whose text content starts with `labelPrefix`.
 *
 * The rendered HTML looks like:
 *   <span class="text-xs text-gray-500">
 *     Tier I Tokens: <span class="text-yellow-400">3/6</span>
 *   </span>
 *
 * getByText with `{ selector: 'span' }` matches the outer span by its full text
 * (including child text), then we grab the first child <span> for the color class.
 */
function getCounterSpan(labelPrefix: string): HTMLElement {
  const outer = screen.getByText(new RegExp(`^${labelPrefix}`), { selector: 'span' })
  const child = outer.querySelector('span')
  if (!child) throw new Error(`No child <span> found inside "${labelPrefix}" counter`)
  return child as HTMLElement
}

// ---------------------------------------------------------------------------
// tokenColor via rendered Tier I counter
// Color rules: under max → yellow, at max → green, over max → red
// ---------------------------------------------------------------------------

describe('tokenColor — Tier I counter color classes', () => {
  it('applies text-yellow-400 when used is under total', () => {
    // level 1 budget is tier1=3; 1 purchased T1 power → 1/3 → yellow
    renderList([mkPower(T1_ID_1)], 1)
    const counter = getCounterSpan('Tier I Tokens')
    expect(counter.className).toMatch(/text-yellow-400/)
  })

  it('applies text-yellow-400 when used is one below total', () => {
    // level 1 budget tier1=3; 2 purchased T1 powers → 2/3 → yellow
    renderList([mkPower(T1_ID_1), mkPower(T1_ID_2)], 1)
    const counter = getCounterSpan('Tier I Tokens')
    expect(counter.className).toMatch(/text-yellow-400/)
  })

  it('applies text-green-400 when used equals total exactly', () => {
    // level 1 budget tier1=3; 3 T1 powers → 3/3 → green
    renderList([mkPower(T1_ID_1), mkPower(T1_ID_2), mkPower(T1_ID_3)], 1)
    const counter = getCounterSpan('Tier I Tokens')
    expect(counter.className).toMatch(/text-green-400/)
  })
})

// ---------------------------------------------------------------------------
// tokenColor — red case via Tier II counter (easiest path to > budget scenario)
// ---------------------------------------------------------------------------

describe('tokenColor — Tier II counter color classes', () => {
  it('applies text-red-400 when used exceeds total', () => {
    // level 6 budget tier2=1; 2 purchased Tier II powers → 2/1 → red
    renderList([mkPower(T2_ID_1), mkPower(T2_ID_2)], 6)
    const counter = getCounterSpan('Tier II Tokens')
    expect(counter.className).toMatch(/text-red-400/)
  })

  it('applies text-green-400 when used equals total exactly', () => {
    // level 6 budget tier2=1; 1 T2 purchased → 1/1 → green
    renderList([mkPower(T2_ID_1)], 6)
    const counter = getCounterSpan('Tier II Tokens')
    expect(counter.className).toMatch(/text-green-400/)
  })

  it('applies text-green-400 when total is 0 and used is 0', () => {
    // level 1 tier2 budget=0, used=0 → 0===0 → green
    renderList([], 1)
    const counter = getCounterSpan('Tier II Tokens')
    expect(counter.className).toMatch(/text-green-400/)
  })
})

// ---------------------------------------------------------------------------
// Token used counts — free_lv5 exclusion
// ---------------------------------------------------------------------------

describe('tier1Used — free_lv5 powers do not spend tokens', () => {
  it('counts only purchased Tier I powers, not free_lv5', () => {
    // level 5 budget tier1=6; 2 T1 purchased + 1 T1 free_lv5 → tier1Used=2 → "2/6"
    renderList(
      [mkPower(T1_ID_1, 'purchased'), mkPower(T1_ID_2, 'purchased'), mkPower(T1_ID_3, 'free_lv5')],
      5
    )
    const counter = getCounterSpan('Tier I Tokens')
    expect(counter.textContent).toBe('2/6')
  })

  it('counts powers with no source field as purchased', () => {
    // source undefined → treated as purchased → tier1Used=1 → "1/6"
    renderList([mkPower(T1_ID_1)], 5)
    const counter = getCounterSpan('Tier I Tokens')
    expect(counter.textContent).toBe('1/6')
  })
})

describe('tier2Used — free_lv5 powers do not spend tokens', () => {
  it('does not count free_lv5 Tier II powers toward the used total', () => {
    // level 7 budget tier2=2; 1 T2 purchased + 1 T2 free_lv5 → tier2Used=1 → "1/2"
    renderList([mkPower(T2_ID_1, 'purchased'), mkPower(T2_ID_2, 'free_lv5')], 7)
    const counter = getCounterSpan('Tier II Tokens')
    expect(counter.textContent).toBe('1/2')
  })

  it('counts both T2 powers when both are purchased', () => {
    // level 7 budget tier2=2; 2 T2 purchased → tier2Used=2 → "2/2"
    renderList([mkPower(T2_ID_1, 'purchased'), mkPower(T2_ID_2, 'purchased')], 7)
    const counter = getCounterSpan('Tier II Tokens')
    expect(counter.textContent).toBe('2/2')
  })
})

// ---------------------------------------------------------------------------
// Upgrades count as tokens (1 upgrade = 1 token of the same tier)
// ---------------------------------------------------------------------------

describe('tier1Used — purchased upgrades count as tokens', () => {
  it('counts 1 power + 1 upgrade as 2 tokens', () => {
    // level 4 budget tier1=5; 1 T1 power with 1 upgrade → 2/5
    renderList([mkPower(T1_ID_1, 'purchased', ['upgrade-a'])], 4)
    const counter = getCounterSpan('Tier I Tokens')
    expect(counter.textContent).toBe('2/5')
  })

  it('counts 1 power + 2 upgrades as 3 tokens', () => {
    // level 4 budget tier1=5; 1 T1 power with 2 upgrades → 3/5
    renderList([mkPower(T1_ID_1, 'purchased', ['upgrade-a', 'upgrade-b'])], 4)
    const counter = getCounterSpan('Tier I Tokens')
    expect(counter.textContent).toBe('3/5')
  })

  it('counts upgrades across multiple powers', () => {
    // level 4 budget tier1=5; 2 T1 powers each with 1 upgrade → 4/5
    renderList(
      [mkPower(T1_ID_1, 'purchased', ['upgrade-a']), mkPower(T1_ID_2, 'purchased', ['upgrade-b'])],
      4
    )
    const counter = getCounterSpan('Tier I Tokens')
    expect(counter.textContent).toBe('4/5')
  })
})

describe('tier2Used — purchased upgrades on free_lv5 powers still cost tokens', () => {
  it('counts upgrades on a free_lv5 power even though the power itself was free', () => {
    // level 7 budget tier2=2; 1 T2 free_lv5 with 1 upgrade → tier2Used=0+1=1 → "1/2"
    renderList([mkPower(T2_ID_1, 'free_lv5', ['upgrade-a'])], 7)
    const counter = getCounterSpan('Tier II Tokens')
    expect(counter.textContent).toBe('1/2')
  })

  it('counts upgrades on both purchased and free_lv5 Tier II powers', () => {
    // level 7 budget tier2=2; 1 purchased T2 with 1 upgrade + 1 free_lv5 T2 with 1 upgrade
    // → tier2Used = (1+1) + (0+1) = 3 → "3/2" → red
    renderList(
      [mkPower(T2_ID_1, 'purchased', ['upgrade-a']), mkPower(T2_ID_2, 'free_lv5', ['upgrade-b'])],
      7
    )
    const counter = getCounterSpan('Tier II Tokens')
    expect(counter.textContent).toBe('3/2')
    expect(counter.className).toMatch(/text-red-400/)
  })
})

// ---------------------------------------------------------------------------
// freeTier2Count and Free Tier II display
// ---------------------------------------------------------------------------

describe('freeTier2Count — Free Tier II counter', () => {
  it('does not show Free Tier II counter below level 5', () => {
    renderList([], 4)
    expect(
      screen.queryByText(/^Free Tier II:/, { selector: 'span' })
    ).not.toBeInTheDocument()
  })

  it('shows Free Tier II counter at level 5', () => {
    renderList([], 5)
    expect(screen.getByText(/^Free Tier II:/, { selector: 'span' })).toBeInTheDocument()
  })

  it('shows 0/2 when no free powers designated', () => {
    renderList([mkPower(T2_ID_1, 'purchased')], 5)
    const counter = getCounterSpan('Free Tier II:')
    expect(counter.textContent).toMatch(/0\/2/)
  })

  it('shows 1/2 when one free_lv5 T2 power is designated', () => {
    renderList([mkPower(T2_ID_1, 'free_lv5')], 5)
    const counter = getCounterSpan('Free Tier II:')
    expect(counter.textContent).toMatch(/1\/2/)
  })

  it('shows 2/2 with green color when both slots are filled', () => {
    renderList([mkPower(T2_ID_1, 'free_lv5'), mkPower(T2_ID_2, 'free_lv5')], 5)
    const counter = getCounterSpan('Free Tier II:')
    expect(counter.textContent).toBe('2/2')
    expect(counter.className).toMatch(/text-green-400/)
  })

  it('shows yellow color when fewer than 2 slots are filled', () => {
    renderList([mkPower(T2_ID_1, 'free_lv5')], 5)
    const counter = getCounterSpan('Free Tier II:')
    expect(counter.className).toMatch(/text-yellow-400/)
  })
})

// ---------------------------------------------------------------------------
// showTier2Warning
// ---------------------------------------------------------------------------

describe('showTier2Warning — level 5+ warning message', () => {
  it('does not show warning below level 5', () => {
    renderList([], 4)
    expect(
      screen.queryByText(/Level 5 grants 2 free Tier II powers/i)
    ).not.toBeInTheDocument()
  })

  it('shows warning at level 5 with 0 free Tier II powers designated', () => {
    renderList([], 5)
    expect(screen.getByText(/Level 5 grants 2 free Tier II powers/i)).toBeInTheDocument()
  })

  it('shows warning at level 5 with only 1 free Tier II power designated', () => {
    renderList([mkPower(T2_ID_1, 'free_lv5')], 5)
    expect(screen.getByText(/Level 5 grants 2 free Tier II powers/i)).toBeInTheDocument()
  })

  it('does not show warning at level 5 when both free Tier II slots are filled', () => {
    renderList([mkPower(T2_ID_1, 'free_lv5'), mkPower(T2_ID_2, 'free_lv5')], 5)
    expect(
      screen.queryByText(/Level 5 grants 2 free Tier II powers/i)
    ).not.toBeInTheDocument()
  })

  it('shows warning at level 10 if free Tier II slots are not yet filled', () => {
    renderList([], 10)
    expect(screen.getByText(/Level 5 grants 2 free Tier II powers/i)).toBeInTheDocument()
  })

  it('does not show warning at level 10 when both free Tier II slots are filled', () => {
    renderList([mkPower(T2_ID_1, 'free_lv5'), mkPower(T2_ID_2, 'free_lv5')], 10)
    expect(
      screen.queryByText(/Level 5 grants 2 free Tier II powers/i)
    ).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Token budget display per level
// ---------------------------------------------------------------------------

describe('token counter display — budget reflects character level', () => {
  it('shows Tier I budget of 3 at level 1 with 0 used', () => {
    renderList([], 1)
    expect(getCounterSpan('Tier I Tokens').textContent).toBe('0/3')
  })

  it('shows Tier I budget of 9 at level 10 with 0 used', () => {
    renderList([], 10)
    expect(getCounterSpan('Tier I Tokens').textContent).toBe('0/9')
  })

  it('shows Tier II budget of 0 at level 1 with 0 used', () => {
    renderList([], 1)
    expect(getCounterSpan('Tier II Tokens').textContent).toBe('0/0')
  })

  it('shows Tier II budget of 4 at level 10 with 0 used', () => {
    renderList([], 10)
    expect(getCounterSpan('Tier II Tokens').textContent).toBe('0/4')
  })
})
