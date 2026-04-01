# Unity TTRPG Toolkit — Implementation Plan

## Project Goal
A toolkit for the Unity Tabletop RPG (Zensara Studios / Modiphius Entertainment) featuring:
- Interactive digital character sheets
- Game Master tools (Ruin tracker, Spark Points, encounter management)
- Eventually: character data persisted to SQLite via a C# REST API

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React + Vite + TypeScript | Component model maps cleanly to character sheet zones |
| Styling | Tailwind CSS | Fast iteration, no CSS file management |
| Form state | React Hook Form | Handles many editable fields efficiently |
| Phase 1 persistence | `localStorage` | Zero backend dependency to start |
| Phase 2 persistence | SQLite via C# REST API | `Microsoft.Data.Sqlite` on the backend; `fetch()` on the frontend |
| Backend (future) | C# ASP.NET Core Minimal API | RestSharp is a client library — used if the backend calls external services |

---

## Project Structure

```
Unity_TTRPG_Toolkit/
  docs/                              (gitignored — rules reference extracted from PDF)
  character-sheet/                   (frontend application)
    src/
      types/                         TypeScript interfaces
        character.ts                 Root Character interface + all sub-types
        class.ts                     ClassDefinition interface
        equipment.ts                 Weapon, Armor, Artifact interfaces
        power.ts                     Power, PowerUpgrade interfaces
      constants/                     Static game data
        classes.ts                   All 9 class definitions
        races.ts                     All 4 race baselines
        weapons.ts                   Weapon categories + damage dice
        armor.ts                     Armor categories + AV values
        perks.ts                     General perks list
      components/
        layout/
          CharacterSheet.tsx         Root sheet container
          SheetHeader.tsx            Name, Class, Race, Level, XP, Age
        identity/
          AttributeBlock.tsx         MIGHT / AGILITY / MIND / PRESENCE
          DerivedStats.tsx           AR, DR, MR, Speed, AV, Max HP (display only)
        resources/
          HPTracker.tsx              Current/max HP + 5 Fading slots
          ResourceTracker.tsx        Primary + secondary class resource pips
          RecuperationTracker.tsx    Recuperation count + die type
        paths/
          CorePathList.tsx           3 Core Path entries
          CorePathEntry.tsx          Single path: name, description, point stepper
        powers/
          PowerList.tsx              Tier I / Tier II grid
          PowerCard.tsx              Collapsible card: action type, cost, effects, upgrades
        equipment/
          WeaponSlots.tsx
          ArmorSlot.tsx
          ArtifactList.tsx           With capacity warning when exceeded
          InventoryBlock.tsx         Denerim, Necessities, Gear
        perks/
          PerkList.tsx               Class + General perks
      hooks/
        useCharacter.ts              Character state (useReducer) + derived stat calculations
        useApi.ts                    Returns LocalStorageRepository or RestApiRepository based on env
      services/
        api.ts                       CharacterRepository interface
        localStorage.ts              Phase 1: reads/writes localStorage
        restApi.ts                   Phase 2: calls C# backend via fetch()
      utils/
        derivedStats.ts              Pure functions — AR, DR, MR, Speed, HP, AV, Recuperations, HL
  api/                               (future — C# ASP.NET Core project)
    UnityTtrpg.Api/
  PLAN.md                            (this file)
  .gitignore
```

---

## Data Model

### Character Identity
- `id` (UUID), `name`, `race`, `className`, `level`, `xp`, `age`, `notes`

### Races (4)
| Race | MIGHT | AGILITY | MIND | PRESENCE | Racial Power |
|------|-------|---------|------|----------|-------------|
| Valla | 0 | 2 | 1 | 1 | Harmony — grant Defense/skill bonus to allies once/Full Rest |
| Furian | 2 | 1 | 0 | 1 | Unbound — deal highest Attribute as bonus damage once/Full Rest (risk Red Rage on repeat) |
| Human | 1 | 1 | 1 | 1 | Tenacious — re-roll any roll once/Full Rest |
| Afflicted | 1 | 1 | 2 | 0 | Grisly Triage — heal from corpses; scavenge Recuperation once/Full Rest |

### Classes (9)
| Class | Main Attr | HP Formula | Resource | Max | Recharge Die |
|-------|-----------|-----------|---------|-----|-------------|
| Dreadnought | MIGHT | 14 + MIGHT | Fury | 6 | 1d4 |
| Driftwalker | MIND | varies | Bile + Blood (HP) | varies | varies |
| Fell Hunter | AGILITY | varies | varies | varies | varies |
| Judge | MIGHT | varies | Fervor | varies | 1d4 |
| Mystic | MIND | varies | Mana | varies | 1d6 |
| Phantom | AGILITY | varies | Guile | varies | varies |
| Priest | MIND | varies | Mana + Healing Charges | varies | varies |
| Primalist | varies | varies | Spirit + Ferocity | varies | varies |
| Sentinel | MIGHT | 12 + MIGHT | Discipline | 8–10 | 1d4 |

### Derived Stats (always computed, never stored)
| Stat | Formula |
|------|---------|
| AR (Attack Rating) | Class Main Attribute + level AR bonuses |
| DR (Defense Rating) | AGILITY + class DR bonuses |
| MR (Mental Resistance) | MIND + class MR bonuses |
| Speed | AGILITY + speed bonuses |
| AV (Armor Value) | Sum of all equipped armor AV |
| Max HP | Class HP base + MIGHT + HP Boosts from leveling |
| Max Recuperations | 2 + floor(MIGHT / 2) + class bonuses |
| HL (Half Level) | floor(Level / 2), minimum 1 |

### Other Fields
- `currentHp`, `fadingStacks` (0–5)
- `primaryResource` { name, current, max, rechargeDie }
- `secondaryResource` { name, current, max } | null
- `corePaths[]` { id, name, description, points (1–6) }
- `powers[]` { id, name, tier, actionType, cost, target, range, effectsText, upgrades[] }
- `perks[]` { id, name, description, source: 'Class' | 'General' }
- `weapons[]`, `armor[]`, `artifacts[]`, `artifactCapacity`
- `denerim`, `necessities`, `gear`

---

## UI Layout (7 Zones)

| Zone | Components | Contents |
|------|-----------|---------|
| 1. Header | `SheetHeader` | Name, Class, Race, Level, XP, Age |
| 2. Core Stats | `AttributeBlock` + `DerivedStats` | 4 attributes (editable) + AR/DR/MR/Speed/AV/HP (computed, tooltip shows formula) |
| 3. Resources | `HPTracker`, `ResourceTracker`, `RecuperationTracker` | HP + 5 Fading slots; class resource pips; recuperation count |
| 4. Core Paths | `CorePathList` | 3 paths: name, description, point stepper (1–6; budget shown) |
| 5. Powers | `PowerList` + `PowerCard` | Tier I/II grid; collapsible cards; upgrade checkboxes |
| 6. Perks | `PerkList` | Class perks + General perks |
| 7. Equipment | `WeaponSlots`, `ArmorSlot`, `ArtifactList`, `InventoryBlock` | Weapons/armor/artifacts, Denerim/Necessities/Gear |

**Global controls:** Save, New Character wizard, Export JSON, Import JSON

---

## API Abstraction

```typescript
interface CharacterRepository {
  getAll(): Promise<CharacterSummary[]>;
  getById(id: string): Promise<Character>;
  create(character: CreateCharacterDto): Promise<Character>;
  update(id: string, character: Partial<Character>): Promise<Character>;
  delete(id: string): Promise<void>;
}
```

Switch from local → remote: set `VITE_USE_API=true` in `.env.local`. No component changes.

### REST API Contract (C# backend must implement)
```
GET    /api/characters          → CharacterSummary[]
GET    /api/characters/{id}     → Character
POST   /api/characters          → Character
PUT    /api/characters/{id}     → Character
DELETE /api/characters/{id}     → 204
```

JSON: camelCase, ISO-8601 dates. C# uses `System.Text.Json` with `JsonNamingPolicy.CamelCase`.

---

## SQLite Schema (Phase 2)

```sql
CREATE TABLE characters (
  id          TEXT    PRIMARY KEY,   -- UUID
  name        TEXT    NOT NULL,
  class_name  TEXT    NOT NULL,
  race        TEXT    NOT NULL,
  level       INTEGER NOT NULL DEFAULT 1,
  xp          INTEGER NOT NULL DEFAULT 0,
  version     INTEGER NOT NULL DEFAULT 1,
  data        TEXT    NOT NULL,      -- full Character JSON blob
  created_at  TEXT    NOT NULL,      -- ISO-8601
  updated_at  TEXT    NOT NULL
);

CREATE INDEX idx_characters_class ON characters(class_name);
CREATE INDEX idx_characters_level ON characters(level);
```

JSON blob keeps schema stable as rules evolve. Scalar columns support listing/filtering without deserialising.

---

## Architecture Decisions

### Game Reference Data — JSON files (not SQLite)
Races, abilities, perks, artifacts, weapons, equipment, and powers are static rulebook content stored as JSON files in the repo (`src/data/`). The GM can add homebrew content via a GM authoring tool that generates new JSON entries.

**Why:** The data is read-only reference content — SQLite would add unnecessary complexity (migrations, sync scripts, distribution). JSON files are versioned with the repo and deployed automatically via Netlify.

### Multi-Group Isolation — Per-Instance Model (Option A)
Each GM/group runs their own Netlify instance (their own fork of the repo). Homebrew content is committed to their fork and auto-deployed. Groups are isolated by default with zero infrastructure cost.

**Future:** If multi-tenancy becomes a requirement (one hosted app, multiple groups), the path would be Supabase (Postgres + auth) — but this is out of scope for the current build.

### GM Content Authoring — In-App Tool (Option B)
The GM adds homebrew content (abilities, perks, weapons, etc.) via a form-based authoring tool built into the app. The tool generates a JSON file the GM downloads, then uploads directly to the repo via the GitLab web editor. No git knowledge or local installs required — just a GitLab account with repo access.

**Why:** Keeps the workflow accessible to non-technical GMs while avoiding the complexity of a CMS integration. Also a strong portfolio piece — demonstrates thinking about the full content authoring lifecycle, not just the player-facing UI.

---

## Implementation Phases

### Phase 1 — Interactive Character Sheet (localStorage)
**Goal:** Fully functional sheet, data persists in the browser. No backend.

Order of work:
1. Scaffold Vite + React + TypeScript project in `character-sheet/`
2. Install and configure Tailwind CSS
3. Write TypeScript interfaces (`src/types/`)
4. Write static game data constants (`src/constants/`) — all 9 classes, 4 races, equipment tables
5. Implement `src/utils/derivedStats.ts` — all pure computation functions
6. Implement `LocalStorageRepository`
7. Build `useCharacter` hook with `useReducer`
8. Build components (simplest → most complex): Header → Attributes → Derived Stats → HP → Resources → Recuperations → Core Paths → Perks → Powers → Equipment
9. Assemble `CharacterSheet.tsx` root layout
10. Build New Character wizard (step-by-step: race → attributes → class → paths → perks → powers → equipment)
11. Add JSON export/import

### Phase 2 — C# REST API + SQLite
**Goal:** Move persistence to SQLite via a local C# API.

1. Create `api/UnityTtrpg.Api/` ASP.NET Core minimal API project
2. Add `Microsoft.Data.Sqlite`
3. Implement DB initialisation (create table on startup)
4. Implement `CharacterRepository` (C#) with CRUD methods
5. Wire up 5 API routes with CORS headers
6. Set `VITE_API_BASE_URL` and `VITE_USE_API=true` in frontend `.env.local`
7. Verify JSON round-trip (TypeScript ↔ C# camelCase)

### Phase 3 — GM Tools & Polish (Future)
- Character roster / list page
- GM tools: Ruin tracker, Spark Points tracker, encounter builder
- Dice roller built into the sheet (click AR → rolls 2d10+AR)
- Print / PDF export
- Multiple campaign support
