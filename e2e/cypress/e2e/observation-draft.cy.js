// A half-filled new observation is autosaved to localStorage every 10s and can be resumed
// from the observations list. Nothing else exercises the draft restore paths.
describe('Observation draft', () => {
  const AUTOSAVE_INTERVAL = 10000;

  const draftValue = () => cy.getAllLocalStorage().then((storage) => {
    const origin = storage[Cypress.config('baseUrl')] || {};
    const key = Object.keys(origin).find((name) => name.startsWith('draftObservation-'));
    return key ? origin[key] : 'NO DRAFT';
  });

  beforeEach(() => {
    cy.login('ngo_manager@example.com', 'Supersecret1');
    // Only the autosave interval is stubbed, so the form itself behaves normally.
    cy.clock(null, ['setInterval']);
    cy.visit('/private/observations/new');
  });

  afterEach(() => {
    cy.clearLocalStorage();
  });

  it('autosaves a draft and restores it from the list', () => {
    cy.get('select#observation_type').select('Producer');
    cy.get('select#report_field').select('Rapport 13 OGF');
    cy.get('select#country_id').select('Cameroon');
    cy.selectOption('operator_id', 'CFC');
    cy.get('select[name=subcategory_id]').select('Overharvesting');
    cy.chooseOption('Did this observation occur at a physical place?', 'NO');
    cy.get('#location_information').clear().type('Draft location info');
    cy.get('#details_field').clear().type('Draft details');

    // Let the autosave interval fire
    cy.tick(AUTOSAVE_INTERVAL + 100);
    draftValue().should('include', 'Draft details');

    // Leaving and coming back offers to continue the draft. The menu only opens on CSS :hover,
    // which Cypress cannot trigger, hence the forced clicks.
    cy.visit('/private/observations');
    cy.get('.draft').contains('button', 'Continue draft').click({ force: true });
    cy.location('pathname').should('include', '/private/observations/new');

    cy.get('select#observation_type').find('option').contains('Producer').should('be.selected');
    cy.get('select#country_id').find('option').contains('Cameroon').should('be.selected');
    cy.expectSelectedOption('operator_id', 'CFC');
    cy.get('select[name=subcategory_id]').find('option').contains('Overharvesting').should('be.selected');
    cy.get('#location_information').should('have.value', 'Draft location info');
    cy.get('#details_field').should('have.value', 'Draft details');

    // "Create new" starts from an empty form, and its autosave must not wipe the saved draft
    cy.visit('/private/observations');
    cy.get('.draft').contains('button', 'Create new').click({ force: true });
    // Nothing is restored, so the form stops at the first question
    cy.get('select#observation_type').should('exist');
    cy.get('#details_field').should('not.exist');
    cy.tick(AUTOSAVE_INTERVAL + 100);
    draftValue().should('include', 'Draft details');

    cy.visit('/private/observations');
    cy.get('.draft').contains('button', 'Continue draft').click({ force: true });
    cy.get('#details_field').should('have.value', 'Draft details');
  });
});
