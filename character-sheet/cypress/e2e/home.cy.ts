// home.cy.ts — E2E tests for the HomeScreen landing page.
//
// Covers:
//   1. App title and subtitle are visible
//   2. All four option cards render
//   3. Gamemaster card is enabled
//   4. "New Character" navigates to the character creation wizard
//   5. "Existing Character" navigates to the character roster

describe('Home Screen', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('/')
  })

  it('shows the app title and subtitle', () => {
    cy.contains('Unity TTRPG Toolkit').should('be.visible')
    cy.contains('Character sheets and GM tools for Unity RPG').should('be.visible')
  })

  it('shows all four option cards', () => {
    cy.contains('New Character').should('be.visible')
    cy.contains('Existing Character').should('be.visible')
    cy.contains('Import Character').should('be.visible')
    cy.contains('Gamemaster').should('be.visible')
  })

  it('Gamemaster card is enabled', () => {
    cy.contains('button', 'Gamemaster').should('be.enabled')
  })

  it('clicking "New Character" opens the character creation wizard at step 1', () => {
    cy.contains('New Character').click()
    cy.get('[data-testid="wizard-step-label"]').should('contain', 'Step 1')
    cy.contains('Character Concept').should('be.visible')
  })

  it('clicking "Existing Character" opens the character roster', () => {
    cy.contains('Existing Character').click()
    cy.contains('Your Characters').should('be.visible')
  })
})
