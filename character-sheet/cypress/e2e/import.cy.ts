// import.cy.ts — E2E tests for the JSON import flow.
//
// Covers:
//   Home screen import (direct-to-sheet):
//     1. Importing a new character loads the sheet immediately
//     2. Importing a character whose id is already saved shows DuplicateCharacterModal
//     3. Cancelling the duplicate modal stays on the home screen
//     4. Confirming "Create Copy" loads the sheet with " - copy" in the name
//
//   Character sheet import (shows ImportConfirmModal):
//     5. Importing a new character from the sheet shows the "Import Successful" modal
//     6. "Stay Here" dismisses the modal without changing the active character
//     7. "Switch to" loads the imported character on the sheet

const STORAGE_KEY = 'unity_ttrpg_characters'

function visitClean() {
  cy.visit('/', {
    onBeforeLoad(win) {
      win.localStorage.clear()
    },
  })
}

function visitWithCharacter(id: string, name: string, extra: object = {}) {
  const character = {
    id,
    name,
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
    ...extra,
  }
  cy.visit('/', {
    onBeforeLoad(win) {
      win.localStorage.clear()
      win.localStorage.setItem(STORAGE_KEY, JSON.stringify([character]))
    },
  })
}

// Selects a file on the hidden <input type="file"> using force to bypass visibility
function uploadFile(fixture: string) {
  cy.get('input[type="file"]').selectFile(`cypress/fixtures/${fixture}`, { force: true })
}

describe('Import from the home screen', () => {
  it('imports a new character and loads its sheet directly', () => {
    visitClean()
    uploadFile('aldric_voss.json')
    cy.contains('Import JSON').should('be.visible')
    cy.contains('Save').should('be.visible')
  })

  it('shows the "Already Saved" modal when the character id already exists', () => {
    visitWithCharacter('test-uuid-1234', 'Aldric Voss')
    uploadFile('aldric_voss.json')
    cy.contains('Already Saved').should('be.visible')
    cy.contains('"Aldric Voss - copy"').should('be.visible')
  })

  it('cancelling the duplicate modal stays on the home screen', () => {
    visitWithCharacter('test-uuid-1234', 'Aldric Voss')
    uploadFile('aldric_voss.json')
    cy.contains('Cancel').click()
    cy.contains('Already Saved').should('not.exist')
    cy.contains('Unity TTRPG Toolkit').should('be.visible')
  })

  it('confirming "Create Copy" loads the sheet with " - copy" appended to the name', () => {
    visitWithCharacter('test-uuid-1234', 'Aldric Voss')
    uploadFile('aldric_voss.json')
    cy.contains('Create Copy').click()
    cy.contains('Aldric Voss - copy').should('be.visible')
    cy.contains('Import JSON').should('be.visible')
  })
})

describe('Import from the character sheet', () => {
  // Get onto a sheet by importing aldric_voss from home before each test
  beforeEach(() => {
    visitClean()
    uploadFile('aldric_voss.json')
    cy.contains('Import JSON').should('be.visible')
  })

  it('shows the "Import Successful" modal when importing a new character', () => {
    uploadFile('lyra_ashveil.json')
    cy.contains('Import Successful').should('be.visible')
    cy.contains('Lyra Ashveil').should('be.visible')
  })

  it('"Stay Here" dismisses the modal and keeps the current character active', () => {
    uploadFile('lyra_ashveil.json')
    cy.contains('Stay Here').click()
    cy.contains('Import Successful').should('not.exist')
    cy.contains('Import JSON').should('be.visible')
  })

  it('"Switch to" loads the imported character on the sheet', () => {
    uploadFile('lyra_ashveil.json')
    cy.contains('Switch to Lyra Ashveil').click()
    cy.contains('Lyra Ashveil').should('be.visible')
    cy.contains('Import Successful').should('not.exist')
  })
})
