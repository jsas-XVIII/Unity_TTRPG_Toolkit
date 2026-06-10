describe('Character Creation Wizard', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.contains('New Character').click()
  })

  it('loads the app and shows the wizard on step 1', () => {
    cy.get('[data-testid="wizard-step-label"]').should('contain', 'Step 1 of 9')
    cy.contains('Character Concept').should('be.visible')
  })

  it('shows validation error when proceeding without a name', () => {
    cy.get('[data-testid="wizard-next"]').click()
    cy.get('[data-testid="wizard-error"]').should('contain', 'Character name is required.')
  })

  it('fills in step 1 and advances to step 2', () => {
    cy.get('[data-testid="input-name"]').type('Aldric Voss')
    cy.get('[data-testid="wizard-next"]').click()
    cy.get('[data-testid="wizard-step-label"]').should('contain', 'Step 2 of 9')
    cy.contains('Choose a Race').should('be.visible')
  })

  it('shows validation error when proceeding without selecting a race', () => {
    cy.get('[data-testid="input-name"]').type('Aldric Voss')
    cy.get('[data-testid="wizard-next"]').click()
    cy.get('[data-testid="wizard-next"]').click()
    cy.get('[data-testid="wizard-error"]').should('contain', 'Please select a race.')
  })

  it('can navigate back from step 2 to step 1', () => {
    cy.get('[data-testid="input-name"]').type('Test Character')
    cy.get('[data-testid="wizard-next"]').click()
    cy.get('[data-testid="wizard-back"]').click()
    cy.get('[data-testid="wizard-step-label"]').should('contain', 'Step 1 of 9')
  })

  it('selects a race and advances to step 3', () => {
    cy.get('[data-testid="input-name"]').type('Aldric Voss')
    cy.get('[data-testid="wizard-next"]').click()

    cy.get('[data-testid="race-valla"]').click()

    cy.get('[data-testid="wizard-next"]').click()
    cy.get('[data-testid="wizard-step-label"]').should('contain', 'Step 3 of 9')
    cy.contains('Attributes').should('be.visible')
  })

  it('completes full character creation and lands on the character sheet', () => {
    // Step 1 — Name
    cy.get('[data-testid="input-name"]').type('Aldric Voss')
    cy.get('[data-testid="wizard-next"]').click()

    // Step 2 — Race
    cy.get('[data-testid="race-valla"]').click()
    cy.get('[data-testid="wizard-next"]').click()

    // Step 3 — Attributes (balanced array: +1, +1, 0, -1)
    cy.get('[data-testid="attr-select-might"]').select('1')
    cy.get('[data-testid="attr-select-agility"]').select('1')
    cy.get('[data-testid="attr-select-mind"]').select('0')
    cy.get('[data-testid="attr-select-presence"]').select('-1')
    cy.get('[data-testid="wizard-next"]').click()

    // Step 4 — Class (Dreadnought — no class path required)
    cy.get('[data-testid="class-dreadnought"]').click()
    cy.get('[data-testid="wizard-next"]').click()

    // Step 5 — Core Paths (3 paths, 5 points: 2+2+1)
    cy.get('[data-testid="add-core-path"]').click()
    cy.get('[data-testid="path-name-0"]').type('Combat')
    cy.get('[data-testid="path-add-point-0"]').click()

    cy.get('[data-testid="add-core-path"]').click()
    cy.get('[data-testid="path-name-1"]').type('Survival')
    cy.get('[data-testid="path-add-point-1"]').click()

    cy.get('[data-testid="add-core-path"]').click()
    cy.get('[data-testid="path-name-2"]').type('Lore')
    cy.get('[data-testid="wizard-next"]').click()

    // Step 6 — Perk
    cy.get('[data-testid="perk-dreadnought-perk-1"]').click()
    cy.get('[data-testid="wizard-next"]').click()

    // Step 7 — Powers (skip — optional)
    cy.get('[data-testid="wizard-next"]').click()

    // Step 8 — Equipment (skip — optional)
    cy.get('[data-testid="wizard-next"]').click()

    // Step 9 — Review → Create Character
    cy.get('[data-testid="wizard-next"]').click()

    // Assertions — character sheet loads with the correct character
    // (wizard completion navigates to the sheet, not the roster)
    cy.get('[data-testid="character-name"]').should('have.value', 'Aldric Voss')
  })

  it('Cancel button is shown on step 1', () => {
    cy.get('[data-testid="wizard-back"]').should('contain', 'Cancel')
  })

  it('starting denerim defaults to 150 and can be switched to 250', () => {
    cy.get('[data-testid="denerim-150"]').should('have.class', 'border-amber-500')
    cy.get('[data-testid="denerim-250"]').click()
    cy.get('[data-testid="denerim-250"]').should('have.class', 'border-amber-500')
    cy.get('[data-testid="denerim-150"]').should('not.have.class', 'border-amber-500')
  })
})
