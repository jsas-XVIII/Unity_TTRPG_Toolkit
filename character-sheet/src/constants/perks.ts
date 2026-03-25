import type { Perk } from '../types/character'

export const GENERAL_PERKS: Omit<Perk, 'id'>[] = [
  { name: 'Combat Specialist',    source: 'General', description: '+1 to Class Resource recharge rolls (+2 at Level 5).' },
  { name: 'Indomitable',         source: 'General', description: 'Death rolls use 3d10 (choose best 2); second wind HP is doubled.' },
  { name: 'Weapons Master',      source: 'General', description: '+1 damage with chosen weapon class; stackable and repeatable for other competencies.' },
  { name: 'Jack of All Trades',  source: 'General', description: '+1 to any non-highest Attribute; stackable.' },
  { name: 'Burst of Speed',      source: 'General', description: 'Once per Full Rest: Movement action covers 2 range bands, immune to Provoked Attacks that round.' },
  { name: 'Resilient',           source: 'General', description: 'Max HP always increased by Level + 5.' },
  { name: 'Opportunist',         source: 'General', description: 'Successful Provoked Attacks deal extra HL damage.' },
  { name: "My Brother's Keeper", source: 'General', description: 'No Provoked Attacks when stabilizing allies; stabilize rolls can Recharge; success grants Benefit on next action.' },
  { name: 'Thrill of Battle',    source: 'General', description: 'Double 10s grant both Massive Hit and Adrenaline Rush (instead of choosing).' },
  { name: 'Seize the Initiative', source: 'General', description: 'Benefit + HL bonus on all Speed checks.' },
  { name: 'Mastery',             source: 'General', description: 'Once per Full Rest: reduce next power\'s Class Resource cost by 2.' },
  { name: 'Snakeblood',          source: 'General', description: 'Improved resistance to Poison and Disease effects.' },
]
