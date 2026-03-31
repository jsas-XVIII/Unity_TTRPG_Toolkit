describe('Character Creation Wizard', () => {
  beforeEach(() => {
    cy.visit('/')
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
