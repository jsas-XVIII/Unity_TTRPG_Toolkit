export interface CampaignNote {
  id: string
  title: string
  content: string
}

export interface Campaign {
  id: string
  name: string
  // Ruin is a GM resource that accumulates from resting and player actions and is spent
  // on monster powers and narrative events. Stored per-campaign and carried between sessions.
  ruin: number
  notes: CampaignNote[]
}
