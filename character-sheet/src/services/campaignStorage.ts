import type { Campaign } from '../types/campaign'
import { makeHomebrewStore } from './homebrewStore'

export const ACTIVE_CAMPAIGN_KEY = 'unity_ttrpg_active_campaign_id'

const store = makeHomebrewStore<Campaign>('unity_ttrpg_campaigns')

export const getCampaigns = store.getAll
export const upsertCampaign = store.upsert
export const deleteCampaign = store.remove
export const invalidateCampaignsCache = store.invalidateCache
