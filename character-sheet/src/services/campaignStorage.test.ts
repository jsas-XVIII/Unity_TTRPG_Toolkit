import { describe, it, expect, beforeEach } from 'vitest'
import {
  getCampaigns,
  upsertCampaign,
  deleteCampaign,
  invalidateCampaignsCache,
} from './campaignStorage'
import type { Campaign } from '../types/campaign'

const KEY = 'unity_ttrpg_campaigns'

const makeCampaign = (id: string, name = 'Campaign', ruin = 0): Campaign => ({
  id,
  name,
  ruin,
  notes: [],
})

beforeEach(() => {
  localStorage.clear()
  invalidateCampaignsCache()
})

describe('getCampaigns', () => {
  it('returns an empty array when nothing is stored', () => {
    expect(getCampaigns()).toEqual([])
  })

  it('returns stored campaigns', () => {
    localStorage.setItem(KEY, JSON.stringify([makeCampaign('c1')]))
    expect(getCampaigns()).toHaveLength(1)
  })

  it('returns an empty array when localStorage value is corrupted', () => {
    localStorage.setItem(KEY, 'not-valid-json')
    expect(getCampaigns()).toEqual([])
  })
})

describe('upsertCampaign', () => {
  it('adds a new campaign when the id does not exist', () => {
    upsertCampaign(makeCampaign('c1'))
    expect(getCampaigns()).toHaveLength(1)
  })

  it('updates an existing campaign when the id matches', () => {
    upsertCampaign(makeCampaign('c1', 'Original'))
    upsertCampaign(makeCampaign('c1', 'Updated'))
    const campaigns = getCampaigns()
    expect(campaigns).toHaveLength(1)
    expect(campaigns[0].name).toBe('Updated')
  })

  it('appends without disturbing other entries', () => {
    upsertCampaign(makeCampaign('c1'))
    upsertCampaign(makeCampaign('c2'))
    expect(getCampaigns()).toHaveLength(2)
  })

  it('persists ruin value correctly', () => {
    upsertCampaign(makeCampaign('c1', 'Test', 14))
    expect(getCampaigns()[0].ruin).toBe(14)
  })

  it('returns a new array reference after each upsert (no in-place cache mutation)', () => {
    upsertCampaign(makeCampaign('c1'))
    const before = getCampaigns()
    upsertCampaign(makeCampaign('c2'))
    const afterAdd = getCampaigns()
    expect(afterAdd).not.toBe(before)

    upsertCampaign(makeCampaign('c1', 'Updated'))
    const afterUpdate = getCampaigns()
    expect(afterUpdate).not.toBe(afterAdd)
  })
})

describe('deleteCampaign', () => {
  it('removes the campaign with the given id', () => {
    upsertCampaign(makeCampaign('c1'))
    upsertCampaign(makeCampaign('c2'))
    deleteCampaign('c1')
    const campaigns = getCampaigns()
    expect(campaigns).toHaveLength(1)
    expect(campaigns[0].id).toBe('c2')
  })

  it('is a no-op when the id does not exist', () => {
    upsertCampaign(makeCampaign('c1'))
    deleteCampaign('nonexistent')
    expect(getCampaigns()).toHaveLength(1)
  })
})
