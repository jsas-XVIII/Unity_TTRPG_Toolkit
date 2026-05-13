export type ArtifactCategory =
  | 'Light Melee'
  | 'Medium Melee'
  | 'Heavy Melee'
  | 'Thrown Ranged'
  | 'Light Ranged'
  | 'Heavy Ranged'
  | 'Shield'
  | 'Light Armour'
  | 'Heavy Armour'
  | 'Accessory'

export type ArtifactEffectKind =
  | 'Passive'
  | 'Standard'
  | 'Quick'
  | 'Reaction'
  | 'Set Bonus'
  | 'Passage'

export interface ArtifactEffect {
  name: string
  kind: ArtifactEffectKind
  description: string
}

export interface ArtifactUpgrade {
  id: string
  name: string
  description: string
}

export interface ArtifactDefinition {
  id: string
  name: string
  category: ArtifactCategory
  subtype: string
  description: string
  effects: ArtifactEffect[]
  upgrades?: ArtifactUpgrade[]
  setId?: string
}

// Stored on the Character — references an artifact by ID and tracks only mutable state.
// Full artifact data is resolved at render time from artifacts.json.
export interface CharacterArtifact {
  id: string
  purchasedUpgradeIds: string[]
}
