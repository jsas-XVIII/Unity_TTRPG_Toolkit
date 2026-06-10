# Unity TTRPG Toolkit — Roadmap

For architecture decisions, tech stack, and detailed feature notes see `PLAN.md`.

---

## Refactor Score: 13 / 34 *(reset 2026-06-09 — test coverage refactor cycle)*

Score accumulates each standard feature session (Fibonacci effort value added per session). Resets to 0 after any refactor cycle (skills 08–12).

| Threshold | Action |
|-----------|--------|
| Below 20 | No action needed |
| 20–33 | Consider a refactor pass soon |
| 34+ | Refactor recommended before new features |

---

## Shipped

| Feature | Branch | Completed |
|---------|--------|-----------|
| Netlify security headers + CSP | — | 2026-05-05 |
| Dep cleanup + un-ignore docs/rules/ | — | 2026-04-29 |
| localStorage quota handling | — | 2026-04-29 |
| Lightweight homebrew/power lookup memoization | — | 2026-05-05 |
| Repo migration cache | — | 2026-05-05 |
| HomebrewContext refactor | — | 2026-05-05 |
| Import-pack resilience | — | 2026-05-06 |
| Dice Rolling — Character Sheet | Dice_Rolling_Feature | 2026-05-14 |
| GM Powers & Perks editor + Export/Import Content Pack | GM_Powers_Perks_Tool / ExportImport_Content_Pack | — |
| Monster Creation UI (36 monsters, templates) | GM_Tools_Monster_Creation | — |
| Artifact System (23 artifacts, GM editor) | Artifact_System | 2026-05-19 |
| Replace official content with demo text (all 9 classes) | Official_Content_Removal | 2026-05-19 |
| Encounter Builder (saved encounters, live HP + initiative tracker) | Development | 2026-06-09 |
| GM Screen (campaign management, notes, Ruin tracker, dice roller) | GM_Screen | 2026-06-10 |

---

## Upcoming Features

| Feature | Notes |
|---------|-------|
| Story Progression Bonuses — Homebrew | GM-defined out-of-band bonuses distributed via content pack |

---

## Public Repo Blockers

~~1. Live GitLab PAT in tracked `settings.local.json` — rotate token, then untrack~~ ✓
~~2. Official copyrighted JSON content — replace with demo data + UUID-gated import~~ ✓

No remaining blockers — repo is ready to go public.

---

## Refactor / Quality Backlog

| Item | Priority |
|------|----------|
| ~~Test coverage: derivedStats, full wizard E2E, stepValidators depth~~ | ✓ 2026-06-09 |
| ~~Powers JSON update — replace official names/effectsText (9 classes)~~ | ✓ 2026-05-19 |
