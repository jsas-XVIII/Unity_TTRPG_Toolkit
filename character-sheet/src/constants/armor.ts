import type { ArmorCategory, ArmorQuality } from '../types/equipment'

export interface ArmorTemplate {
  category: ArmorCategory
  quality: ArmorQuality
  av: number
  cost: number
  examples: string[]
}

export const ARMOR_TEMPLATES: ArmorTemplate[] = [
  { category: 'Light',  quality: 'Basic',         av: 1, cost: 60,   examples: ['Leather', 'Patchwork', 'Hide', 'Chain Shirt'] },
  { category: 'Heavy',  quality: 'Basic',         av: 2, cost: 80,   examples: ['Platemail', 'Splint Mail', 'Chainmail'] },
  { category: 'Shield', quality: 'Basic',         av: 1, cost: 20,   examples: ['Buckler', 'Kite Shield', 'Tower Shield'] },
  { category: 'Light',  quality: 'Reinforced',    av: 2, cost: 600,  examples: ['Reinforced Leather', 'Reinforced Patchwork', 'Reinforced Hide'] },
  { category: 'Heavy',  quality: 'Reinforced',    av: 3, cost: 900,  examples: ['Reinforced Platemail', 'Reinforced Splint Mail', 'Reinforced Chainmail'] },
  { category: 'Light',  quality: 'Mastercrafted', av: 3, cost: 1500, examples: ['Mastercrafted Leather', 'Mastercrafted Hide'] },
  { category: 'Heavy',  quality: 'Mastercrafted', av: 4, cost: 2000, examples: ['Mastercrafted Platemail', 'Mastercrafted Chainmail'] },
]
