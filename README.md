# Unity TTRPG Toolkit

Digital tools for the **Unity Tabletop RPG** (Zensara Studios / Modiphius Entertainment).

**Live app:** https://regal-pony-f39711.netlify.app/

---

## Overview

A browser-based character sheet and GM toolkit for the Unity TTRPG system. Built with React + TypeScript, deployed via Netlify.

---

## Features

### Opening Screen

- **New Character** — Step-by-step character creation wizard
- **Existing Character** — Load a saved character from the current browser session
- **Import Character** — Load a character from an exported JSON file
- **Gamemaster** *(Coming Soon)* — Ruin tracking, Spark Points, encounter management, and homebrew content tools

### Character Wizard

Guides the user through the full 8-step character creation process:

1. Choose a class (Dreadnought, Driftwalker, Fell Hunter, Judge, Mystic, Phantom, Priest, Primalist, Sentinel)
2. Choose a class path where applicable (e.g. Chaplain / War Priest for Priest)
3. Set attributes, select baseline powers, and pick Tier I / Tier II powers within the starting token budget

### Character Sheet

The main view after creation or loading. Organized into zones:

| Zone | Contents |
|------|----------|
| Header | Name, class, race, level, XP, age |
| Core Stats | 4 attributes + computed AR / DR / MR / Speed / AV / HP |
| Resources | Current HP + Fading stacks, class resource pips, recuperation |
| Core Paths | Up to 3 paths with point steppers (1–6 per path) |
| Powers | All selected powers organized by tier, with token counter |
| Perks | Class and general perks |
| Equipment | Weapons, armor, artifacts (with capacity), inventory |
| Notes | Free-text field for campaign notes and background |

Characters can be saved to the browser, exported to JSON, or imported from a JSON file.

---

## Powers & Token System

Powers are organized into tiers. The token counter at the top of the Powers window tracks spending against the level-based budget.

### Token counter display

- `Tier I Tokens: w/x` — used vs. available at current level
- `Tier II Tokens: y/z` — used vs. available at current level
- Color coding: green (under cap), yellow (1 token remaining or at cap), red (over cap)
- At Level 5+: `Free Tier II: n/2` tracks the two free Tier II powers granted by the rules
- A warning appears at Level 5+ until both free Tier II powers have been designated

### Auto-detection of free Tier II powers

When a Tier II power is added at Level 5+ and free slots remain, it is automatically tagged as a free grant and does not consume a token from the regular budget.

### Token budget by level

| Level | T1 Tokens | T2 Tokens |
|-------|-----------|-----------|
| 1     | 3         | 0         |
| 2     | 4         | 0         |
| 3     | 4         | 0         |
| 4     | 5         | 0         |
| 5     | 6         | 0         |
| 6     | 6         | 1         |
| 7     | 7         | 2         |
| 8     | 8         | 2         |
| 9     | 8         | 3         |
| 10    | 9         | 4         |

---

## Tech Stack

| | |
|-|-|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| Forms | React Hook Form |
| Unit tests | Vitest + Testing Library |
| E2E tests | Cypress |
| CI/CD | GitLab CI → Netlify |

---

## Local Development

```bash
cd character-sheet
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # type-check + production build
npm run test:unit  # run unit tests
npm run cy:open    # open Cypress test runner
npm run lint       # ESLint
```

---

## CI Pipeline

All merge requests and pushes to `main` / `develop` run:

1. **validate** — commit message linting, ESLint, TypeScript type-check, `npm audit`
2. **test** — unit tests (Vitest), E2E tests (Cypress / Chrome)
3. **build** — production build artifact (kept for 1 week)

Commit messages must follow the format: `type(scope): description`
Allowed types: `feat`, `fix`, `test`, `chore`, `docs`, `refactor`, `style`, `perf`, `ci`

---

## Game Reference

Rules are extracted from the Unity Core Rules PDF into `docs/rules/`:

| File | Contents |
|------|----------|
| `00_index.md` | Master index + key concepts |
| `01_world_lore.md` | Setting, factions, races, locations |
| `02_character_creation.md` | 8-step creation, races, attributes, perks, core paths |
| `03_classes.md` | All 9 classes — traits, resources, features, token tables |
| `04_core_rules.md` | Core roll, difficulty, Spark Points, Ruin, resting |
| `05_combat_rules.md` | Combat sequence, actions, range, attacking, status effects |
| `06_colossal_combat.md` | Titan Rigs, success ladder, piloting |
| `07_equipment.md` | Weapons, armor, gear, artifacts |
| `08_foes_fiends.md` | Monster creation, encounter design |
| `09_gm_guide.md` | GM philosophy, Ruin usage, leveling, combat advice |
