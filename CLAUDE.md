# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Workflow Conventions

### Testing & Linting Gate
After making code changes, always run tests AND lint together as a single gate before declaring work complete. Don't wait to be asked — treat lint as part of the test cycle.

### Failing Tests — Research Before Fixing
When a test is failing, do NOT automatically fix it. First research what the test asserts, what the code does, and why they diverge. Present findings — including your own assessment of whether the test or the code is the problem and why — then wait for confirmation before writing any changes.

Exception: if the user explicitly says "write a failing test, then implement" (TDD), the failing test is expected — proceed directly to implementation without stopping to discuss.

### Error Handling at Storage Boundaries
If a write function mutates in-memory state (a cache, an array) before calling the storage operation, wrap the storage call in `try/catch` and reset the in-memory state on failure so it stays consistent with what's actually persisted. Pure functions and reads don't need this.

### Before Implementing Options
When presenting multiple options (A/B/C), wait for explicit user selection and echo back which option you're implementing before writing code.

### Custom Commands
When creating new slash commands or modifying `.claude/` config, remind the user that Claude Code must be restarted for changes to take effect.

### Netlify Security Headers — Testing

Headers in `netlify.toml` only apply when Netlify serves the files. The Vite dev server ignores them. To verify:

1. Merge branch → Development → Main (Netlify deploys only on Main changes to reduce build usage)
2. Wait for the Netlify deploy to complete
3. Open the live URL in the browser → DevTools → Network tab → click any request → **Response Headers**
   - Expected: `content-security-policy`, `x-frame-options`, `x-content-type-options`, `referrer-policy`, `strict-transport-security`
4. Alternatively: `curl -I <live-url>`

If the CSP blocks resources (console errors about blocked scripts/styles), relax the relevant directive in `netlify.toml` and redeploy.

---

## Shell Environment

Windows/PowerShell environment. Do NOT use `&&` to chain commands — use `;` or separate commands.

---

## Commands

All commands run from the `character-sheet/` directory.

```bash
npm run dev          # dev server at http://localhost:5173
npm run build        # tsc type-check + production build
npm run lint         # ESLint
npm run typecheck    # type-check only (no emit)
npm run test:unit    # Vitest unit tests (non-interactive)
npm run cy:open      # open Cypress test runner (interactive)
npm run test:e2e     # start dev server + run Cypress headless
```

Run a single unit test file:
```bash
npx vitest run src/data/advancementData.test.ts
```

### Cypress Test Conventions
For form inputs bound to state, use `data-testid` selectors with `.should('have.value', ...)` rather than `cy.contains()`, which only matches rendered text nodes.

---

## Commit message format

Required by CI: `type(scope): description`

Allowed types: `feat`, `fix`, `test`, `chore`, `docs`, `refactor`, `style`, `perf`, `ci`

---

## Architecture

### Top-level layout

```
character-sheet/src/
  App.tsx           — root: owns view state ('home'|'roster'|'wizard'|'sheet'|'gm') + import flow
  types/            — shared TypeScript interfaces (character.ts primary; monster.ts for GM tools)
  constants/        — static class/race/armor/weapon/perk definitions (ClassDefinition, etc.)
  data/             — powers.json + powersData.ts, advancementData.ts, monsters.json, monster-abilities.json, monstersData.ts
  hooks/            — useCharacter (reducer + derived stats), useApi (persistence abstraction)
  services/         — localStorage.ts (CharacterRepository), monsterStorage.ts (homebrew abilities)
  utils/            — derivedStats.ts (pure formulas), importCharacter.ts (migration + dedup)
  components/
    layout/         — HomeScreen, CharacterRoster, CharacterSheet (top-level sheet container)
    wizard/         — CharacterWizard + 8 Step* components + buildCharacter.ts
    powers/         — PowerCard, PowerList, PowerReferenceCard, PowerEffectsText
    advancement/    — level-up UI (AdvancementTable)
    equipment/      — weapons, armor, artifact editors
    identity/       — name, race, class, level display/edit
    paths/          — Core Paths stepper
    perks/          — perk picker
    resources/      — HP, class resource pips
    ui/             — reusable primitives (buttons, modals, etc.)
    gm/             — GMDashboard; monsters/ (MonsterRoster, MonsterCard, MonsterForm)
```

### State management

`useCharacter` (`hooks/useCharacter.ts`) is the central state hook for an open character sheet. It uses `useReducer` with a typed `Action` union. Components never mutate character data directly — they call `dispatch(action)`. `DerivedStats` (AR, DR, MR, Speed, AV, maxHp, etc.) are computed fresh every render via `computeDerivedStats` in `utils/derivedStats.ts`; they are never stored on `Character`.

### Power system

Powers are defined in `data/powers.json`, keyed by `ClassName`, then by pool (`baseline`, `tier1`, `tier2`, `lv3`, `lv8`, `lv10`). The `Character` object stores only `CharacterPower[]` — a list of `{ id, purchasedUpgradeIds, source? }` references. Full power data is resolved at render time via `getPowerById()` / `getPowersByClass()` in `data/powersData.ts`.

- **baseline / lv3 / lv8 / lv10** — fixed class feature powers, not user-selectable. Never appear in `character.powers`; upgrade selections live in `character.featureUpgrades` (a `Record<powerId, upgradeId[]>`).
- **tier1 / tier2** — user-selectable, token-budgeted. Stored in `character.powers`.
- `source: 'free_lv5'` on a `CharacterPower` marks a Tier II power granted for free at Level 5 (does not count against the token budget).

Token budgets by level are in `data/powersData.ts → TOKEN_BUDGET_BY_LEVEL`.

### Class definitions

All nine classes are defined in `constants/classes.ts` as `ClassDefinition[]`, exported as `CLASS_MAP` (keyed by `ClassName`). Each definition includes `mainAttribute`, `hpBase`, resource names/maxes, competencies, and optional `classPaths` (e.g. Priest has `chaplain` and `warpriest`). `ClassPathOption` can override `primaryResourceMax`, `primaryResourceRechargeDie`, and `secondaryResourceMax` for path-specific values.

### Persistence

`services/api.ts` defines the `CharacterRepository` interface (`getAll`, `getById`, `create`, `update`, `delete`). `services/localStorage.ts` implements it, storing all characters as a JSON array under `localStorage["unity_ttrpg_characters"]`. Every character passes through `migrateCharacter()` (in `utils/importCharacter.ts`) on load to handle schema migrations forward-compatibly.

`useApi()` returns the active repository. To add a new backend, implement `CharacterRepository` and swap the return in `hooks/useApi.ts` — no component code changes needed.

### Advancement / leveling

`data/advancementData.ts` contains:
- `ADVANCEMENT_ROWS` — per-level table of which bonuses apply (HP boost, token, AR/DR, etc.)
- `CLASS_AR_DR_PATTERN` — maps each class to `balanced | aggressive | glass-cannon`
- `applyLevelUp(character, classDef)` — applies all automatic bonuses and returns a `checklist` of manual choices to surface in the UI

### GM Tools — Monster System

**Data layer:**
- `types/monster.ts` — `Monster`, `MonsterAbility`, `MonsterAbilityKind` types
- `data/monsters.json` — built-in/official compendium monsters (currently 4 entries; more to be added)
- `data/monster-abilities.json` — flat ability library; monsters reference by `traitIds`/`powerIds` arrays
- `data/monstersData.ts` — `getAllMonsters`, `getMonsterById`, `getAllAbilities`, `resolveTraits`, `resolvePowers`, filter helpers
- `services/monsterStorage.ts` — homebrew ability persistence under `localStorage["unity_ttrpg_monsters_abilities"]`

**Components (`components/gm/monsters/`):**
- `MonsterRoster` — list with faction/type filters, sorted by DL; merges static compendium + homebrew
- `MonsterCard` — full stat block (header, stats grid, traits, powers, optional image)
- `MonsterForm` — create/edit form with DL-range validation

**DL range validation in MonsterForm:**
`DL_RANGES` (indexed by DL 1–10, sourced from Chapter VIII Monster Creation Table) stores `[min, max]` tuples per stat. Out-of-range fields get amber styling + a "suggested: X–Y" hint. Saving with out-of-range stats shows a confirmation step. "Apply baseline" fills all stats with DL minimums. The `dlColor()` helper uses if/else ranges (not numeric Record keys — ESLint naming-convention violation).

### GM Tools — Content Layering Model

All GM-managed game content (powers, perks, monsters) follows a two-layer model:

- **Official layer** — static JSON files checked into the repo (`powers.json`, `perks.json`, `monsters.json`, `monster-abilities.json`). Always present, never mutated at runtime.
- **Homebrew layer** — stored in localStorage. Handles both *overrides* (homebrew entry with the same ID as an official entry shadows it) and *additions* (homebrew entry with a new ID appended alongside official entries). Resolution is identical for both: homebrew wins on ID match, otherwise official is used, then homebrew-only entries are appended.

**Sharing homebrew content:** The GM exports a single `unity-content-pack.json` (all homebrew powers + perks) and sends it to players. Players import it via the HomeScreen, which writes it into their localStorage. Import replaces the player's homebrew library wholesale — the GM's exported pack is authoritative, so entries the GM deleted disappear from the player's storage too.

**localStorage keys:**
- `unity_ttrpg_homebrew_powers` — `Power[]` (overrides + additions; class + tier baked into each entry)
- `unity_ttrpg_homebrew_perks` — `Perk[]` (overrides + additions)
- `unity_ttrpg_monsters_abilities` — `MonsterAbility[]` (existing; homebrew abilities only)

### GM Tools — Planned: HomebrewContext Refactor (dedicated branch)

The GM panels currently write directly to localStorage and call a `refresh()` function (from `hooks/useDataRefresh.ts`) to force a re-render. This works but is a workaround — React has no visibility into the mutations.

The proper fix is a `HomebrewContext` that holds powers, perks, and monster abilities in React state. Writes go through context setters; panels read from context and re-render automatically. This also enables undo/redo and real-time sync as future features.

**Do this on its own dedicated branch** — it touches every GM panel, their tests, and the service layer. Do not fold it into a feature or other refactor branch.

When ready: replace `useDataRefresh()` calls one panel at a time. Each panel can be migrated independently since the context and the localStorage services can coexist during the transition.

---

### GM Tools — Powers & Perks

**Shipped** (`GM_Powers_Perks_Tool` + `ExportImport_Content_Pack` branches).

- `data/perks.json` + `data/perksData.ts` — static perks (gp-001…gp-012), `getAllPerks`/`getPerkById`/`isOfficialPerk` with homebrew merge
- `services/powersStorage.ts` + `services/perksStorage.ts` — CRUD for both homebrew stores
- `data/powersData.ts` — homebrew merged into `getPowersByClass` / `getPowerById`
- `components/gm/powers/PowersPanel` + `PowerEditorForm` — class tabs, tier filter, search; View/Edit per row
- `components/gm/perks/PerksPanel` + `PerkEditorForm` — flat list; same View/Edit/readOnly pattern
- Export Content Pack button (GM side) + Import Content Pack card (HomeScreen, player side)

**UI conventions (all GM editor panels):**
- List rows: static div + **View** (gray border) + **Edit** (amber border) — no clickable row
- View mode: "View: {name}" title, "← Back" button, all inputs readOnly/disabled, action bar hidden
- Edit mode: "Edit: {name}" title, "← Cancel" button, Save/Reset/Delete visible
- Cancel/Back button style: `border border-gray-700 text-gray-400 hover:border-gray-500`

**Upcoming improvements:** See `PLAN.md` for sequenced perf, security, and hygiene phases.

### Game reference docs

Rules extracted from the Unity Core Rules PDF live in `docs/rules/`. Key files:
- `02_character_creation.md` — attributes, creation steps, perks, core paths
- `03_classes.md` — all 9 classes, token tables, class features
- `04_core_rules.md` — core mechanics
- `08_foes_fiends.md` — monster stat table by DL, encounter guidelines, ability rules
