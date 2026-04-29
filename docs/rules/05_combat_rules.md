# Chapter V: Combat Rules

## Combat Overview

Unity's combat is **team-based** with **simultaneous turns**. A round consists of:
1. One team takes their turn (all members act together in any order)
2. Other team takes their turn
3. Round ends; new round begins

A combat round lasts approximately **10 seconds** of in-game time.

---

## Combat Sequence

### First Strike — Who Goes First?

**Priority order:**
1. **Narrative dictates it** — If one side clearly has the element of surprise (ambush, sneak attack), that side goes first. No roll required.
2. **Narrative unclear** — GM's team goes first by default, but players may attempt a Speed Check for First Strike.

### Speed Checks (for First Strike)
- Players roll: **2d10 + SPEED** (SPEED = AGILITY + bonuses)
- Compare to the enemy group's Speed value (GM may use highest or average)
- **Success (meet or exceed):** Player goes first alongside others who succeeded
- **Failure (below TN):** Player goes after GM's turn

Players who win First Strike may **forfeit** the advantage and choose not to go first.

---

## Types of Actions

On your turn you may use each action type **once per round**. (Reactions can be used on the GM's turn.)

| Action Type | Description |
|-------------|-------------|
| **STANDARD** | Basic Attacks, most powers, moderate-effort tasks in combat |
| **MOVEMENT** | Move up to 1 range band (Nearby distance) |
| **QUICK** | Fast actions: switch weapons, quaff a potion, throw something to an ally |
| **FREE** | No limit; completely free actions |
| **REACTION** | Triggered by a condition; usable on GM's turn; once per round total |
| **MAINTAIN** | Keep an ongoing power active; reduce max Class Resource pool by activation cost |
| **OVERDRIVE** | Very powerful; once per Full Rest; rechargeable via Adrenaline Rush |
| **ULTIMATE** | Most powerful; once per Full Rest; NOT rechargeable via Adrenaline Rush |

**Rushing:** Combine Standard + Movement actions to move 2 range bands (Far distance).

You may forfeit your entire turn if desired.

---

## Range Bands

Unity uses range bands instead of grid squares:

| Band | Distance | Notes |
|------|----------|-------|
| **Adjacent** | Within 2.5m | Within reach or a quick step |
| **Nearby** | 2.5m–8m | 1 Movement action to reach |
| **Far** | 8m–16m | 2 Movement actions (or Rush) to reach |
| **Very Far** | 16m–24m | 3 Movement actions to reach |

**Basic Ranged Attacks:** Up to Far distance. Thrown weapons: up to Nearby only.
**Ranged Attacks while Adjacent to enemy:** Subject to Hindrance (powers exempt).

---

## Provoked Attacks

Moving past or away from an **Adjacent enemy** triggers a Provoked Attack:
- Each Adjacent enemy you pass through or disengage from makes one Basic Melee Attack on you
- No limit on how many Provoked Attacks enemies make per round (as long as provoked)
- Players can also make Provoked Attacks on enemies moving past them
- Provoked Attacks are **not mandatory** — PCs or GM can choose to hold them

---

## Attacking

### Basic Attack Roll
```
2d10 + Attack Rating (AR) vs. enemy's Defense Rating (DR)
```
- Meet or exceed DR → Hit
- Below DR → Miss (or Force, see below)

### Basic Melee Attack
| Result | Outcome |
|--------|---------|
| **Success** | Target suffers full Basic Melee damage |
| **Failure** | Choose: **Miss** (nothing) OR **Force** (half damage, no modifiers; enemy immediately retaliates with auto-hit for Basic Attack damage) |

### Basic Ranged Attack
| Result | Outcome |
|--------|---------|
| **Success** | Target suffers full Basic Ranged damage |
| **Failure** | Choose: **Miss** OR **Force** (half damage, no modifiers; lose Movement action next round; first attack against you is automatic hit) |

### Dealing Damage
On a successful hit: roll weapon damage die + MAIN Attribute + any bonuses
- **Melee Light:** 1d6 | **Melee Medium:** 1d8 | **Melee Heavy:** 1d12 or 2d6
- **Ranged Thrown Light:** 1d4 | **Ranged Light:** 1d6 | **Ranged Heavy:** 1d8

### Multiple Targets
Roll Basic Attack once for all targets. Single result checked vs. each target's DR. Roll damage once — all hit targets suffer that damage (after AV/Resistance reduction).

### Mental Resistance (MR) Attacks
Some powers target MR instead of DR. Still roll 2d10 + AR, but the TN is the target's MR value instead. Player rolls 2d10 + MR (instead of DR) when defending against MR attacks.

### Massive Hits & Adrenaline Rush
Triggered by rolling **two 10s** on an Attack roll:
- **Massive Hit:** Triple base damage die on single target (1d12 → 3d12), or max damage on AoE (1d12 → always 12)
- **Adrenaline Rush:** Instantly restore one spent Overdrive power (use it again without Full Rest)
- **Must choose one** (unless the **Thrill of Battle** perk is taken, which grants both)

---

## Defending

### Defense Roll
```
2d10 + Defense Rating (DR) vs. attacker's Attack Rating (AR)
```
- Meet or exceed AR → Dodge/evade
- Below AR → Hit; suffer damage

For MR attacks: roll 2d10 + Mental Resistance (MR) instead.

For Area of Effect (AoE) attacks: roll Defense vs. the AoE's AR.

### Armor & Resistances
- **Armor Value (AV):** Reduces all **Physical** damage by AV amount per hit
  - Example: AV 2 means every Physical hit deals 2 less damage
- **Resistances:** Reduce specific elemental/damage types by their value
  - Elemental types: Fire, Frost, Electric, Arcane, Divine, Corrosive
- **True Damage:** Pierces all AV, Resistances, and absorption shields — always deals full value
- AV/Resistance can go negative → additional damage taken (e.g., Fire Resistance −4 = +4 Fire damage taken)

### Reaction Powers
Used while defending: declare Reaction after being hit, spend Class Resource, apply effect.
- Example: Phantom's **Tumble** — spend 1 Guile, reduce incoming damage by 3
- Reactions limited to **once per round**

---

## Recharging Resources

**Trigger:** Roll **any doubles** (matching dice) on an Attack or Defense roll → roll Class Recharge Die to restore that many Class Resource points.

| Class | Recharge Die (examples) |
|-------|------------------------|
| Mystic | 1d6 |
| Judge | 1d4 |
| Dreadnought | 1d4 |
| Sentinel | 1d4 |

Specific recharge die per class listed in each class section.

**With Benefit:** Any 2 matching dice out of 3 triggers Recharge.
**With Hindrance:** Doubles do NOT trigger Recharge.

---

## Contesting

Used when two characters directly oppose each other:
```
Contesting character: 2d10 + [Attribute] vs. TN = 10 + [Target's same Attribute]
```

Contest triggers when:
- Target is larger than Medium-sized OR Elite (for certain powers)
- Narrative calls for direct opposition (two characters grabbing the same item)

**With optional GM dice rolling:** GM rolls 2d10 + Contested Attribute for NPC to set the TN instead.

---

## Defining a Round (Power Duration)

"Rounds" as power duration means **number of team turns** the effect is active:
- A 2-round damaging effect = 2 ticks of damage (one per turn affected target acts)
- A 2-round buff = 2 consecutive uses of the effect

**Common sense applies:** If a target is Stunned and skips their turn, a damage-over-time effect still ticks when that turn would have occurred.

---

## Incapacitation & Death

### Going Down
When HP drops to 0: character is **Incapacitated** and gains 1 stack of **Fading**.
- Can no longer take actions
- If the blow would push HP to negative equal to or more than **max HP** → instant death

### Death Rolls
Each round while Incapacitated, roll 2d10:

| Roll | Result |
|------|--------|
| 2 | Gain 3 stacks of Fading |
| 3–7 | Gain 2 stacks of Fading |
| 8–12 | Gain 1 stack of Fading |
| 13–17 | Stable for now; no change |
| 18–19 | Second wind — get up with HP = current Level; first attack gains bonus = stacks of Fading |
| 20 | Second wind — get up with HP = current Level; first attack gains bonus = double stacks of Fading |

**5 or more stacks of Fading → Death.**

Fading stacks do NOT reset until battle ends or an ally Stabilizes you. If Incapacitated again with existing stacks, you may die immediately.

Further attacks on an Incapacitated character deal damage into the negatives. Reaching −(max HP) = death.

### Stabilizing Allies
- Requires **Standard action** + be Adjacent to downed ally
- Causes **Provoked Attacks** if adjacent to enemies
- Roll 2d10:

| Roll | Result |
|------|--------|
| 2–13 | Remove 1 Fading stack; ally continues Death rolls |
| 14–18 | Stable; remove 3 Fading; ally gets up with HP = current Level |
| 19–20 | Fully stable; all Fading removed; ally gets up with HP = 2× current Level |

### Healing Incapacitated Allies
Healing must exceed the **Stabilization Threshold** to revive:
- Threshold = current Level + current Fading stacks
- If healing exceeds threshold: ally stands up with excess HP
- If healing meets threshold exactly: ally remains Incapacitated but all Fading removed
- If healing is below threshold: subtract healing from Fading stacks

---

## Status Effects

| Status | Effect |
|--------|--------|
| **Benefit** | Roll 3d10, take 2 highest; doubles on any 2 of 3 dice can Recharge |
| **Hindrance** | Roll 3d10, take 2 lowest; no Recharge even on doubles; attackers gain Benefit vs. Hindered target |
| **Staggered** | Must use Standard OR Movement action to remove Stagger (forced choice) |
| **Rooted** | Cannot move; other actions normal. Teleport abilities break Root |
| **Poisoned** | Take XdY True damage at start of each turn for X rounds; roll 2d10+MIGHT vs. TN at end of turn to end early |
| **Diseased** | Reduce X Attribute by Y; further −1 per 24 hours untreated; contagious diseases require nearby allies to roll MIGHT checks on Full Rest |
| **Stunned** | Lose turn for X rounds; cannot act or move; all attacks against stunned target auto-hit |
| **Confused** | After each action, roll 2d10+MIND; below effect's TN = action targets wrong target (GM picks) |

Many conditions (blinded, deafened, numbed, etc.) are simplified to **Hindrance** for the relevant rolls.

---

## Other Actions in Combat

Players are encouraged to use the environment creatively:
- Flip a table for cover
- Swing from a rope
- Cut a rope suspending a heavy object above enemies
- Slide down a slope for attack momentum

**GM adjudicates:** Makes a call on required roll, TN, and possible failure consequences. Attack roll result can also serve as a check for whether the environmental action beats the enemy's reaction time.
