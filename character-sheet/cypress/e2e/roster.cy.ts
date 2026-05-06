export {}
// roster.cy.ts — E2E tests for the CharacterRoster screen.
//
// Covers:
//   1. Empty state when no characters are saved
//   2. "Create your first character" navigates back to home
//   3. Back button navigates back to home
//   4. Saved characters appear as cards with class, race, and level
//   5. Clicking a character card loads its sheet
//   6. Delete button shows an inline confirmation
//   7. Confirming delete removes the character from the list
//   8. Cancelling delete keeps the character in the list

const STORAGE_KEY = 'unity_ttrpg_characters'

const aldricVoss = {
  id: 'test-uuid-1234',
  name: 'Aldric Voss',
  race: 'Human',
  className: 'Dreadnought',
  level: 1,
  xp: 0,
  age: '28',
  notes: '',
  attributes: { might: 3, agility: 1, mind: 1, presence: 1 },
  arBonus: 0,
  drBonus: 0,
  currentHp: 17,
  fadingStacks: 0,
  primaryResource: { name: 'Fury', current: 0, max: 6, rechargeDie: '1d4' },
  secondaryResource: null,
  recuperationBonus: 0,
  recuperationDie: '1d6',
  corePaths: [],
  powers: [],
  perks: [],
  weapons: [],
  armor: [],
  artifacts: [],
  artifactCapacity: 2,
  denerim: 0,
  necessities: 0,
  gear: 0,
}

describe('Character Roster — empty state', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.clear()
      },
    })
    cy.contains('Existing Character').click()
  })

  it('shows an empty state message', () => {
    cy.contains('No characters saved yet.').should('be.visible')
  })

  it('"Create your first character" navigates back to the home screen', () => {
    cy.contains('Create your first character').click()
    cy.contains('Unity TTRPG Toolkit').should('be.visible')
  })

  it('the Back button navigates to the home screen', () => {
    cy.contains('← Back').click()
    cy.contains('Unity TTRPG Toolkit').should('be.visible')
  })
})

describe('Character Roster — with saved characters', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.clear()
        win.localStorage.setItem(STORAGE_KEY, JSON.stringify([aldricVoss]))
      },
    })
    cy.contains('Existing Character').click()
  })

  it('shows a card for each saved character with class, race, and level', () => {
    cy.contains('Aldric Voss').should('be.visible')
    cy.contains('Dreadnought · Human · Level 1').should('be.visible')
  })

  it('clicking a character card loads its sheet', () => {
    cy.contains('button', 'Aldric Voss').click()
    cy.contains('Save').should('be.visible')
    cy.contains('Import JSON').should('be.visible')
  })

  it('clicking Delete shows an inline confirmation', () => {
    cy.contains('button', 'Delete').click()
    cy.contains('This cannot be undone.').should('be.visible')
  })

  it('confirming delete removes the character from the list', () => {
    cy.contains('button', 'Delete').click()
    cy.contains('This cannot be undone.').parent().contains('button', 'Delete').click()
    cy.contains('Aldric Voss').should('not.exist')
    cy.contains('No characters saved yet.').should('be.visible')
  })

  it('cancelling delete keeps the character in the list', () => {
    cy.contains('button', 'Delete').click()
    cy.contains('button', 'Cancel').click()
    cy.contains('Aldric Voss').should('be.visible')
    cy.contains('This cannot be undone.').should('not.exist')
  })
})
