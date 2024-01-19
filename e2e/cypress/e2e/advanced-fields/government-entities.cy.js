describe('Government entities', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login('ngo_manager@example.com', 'password');
    cy.visit('/private/fields/government-entities');
  });

  after(() => {
    cy.resetDB();
  });

  it('displays a list of government entities', () => {
    cy.get('otp-table tbody tr').should('have.length.least', 2);
  });

  it('can create and update a government entity', () => {
    cy.get('otp-table tbody tr').should('have.length.least', 2);
    cy.get('a').contains('New government entity').click();
    cy.get('input#name_field').type('! New Test Entity');
    cy.get('textarea#details_field').type('Example details');
    cy.get('button').contains('Create').click();

    cy.get('otp-table tbody tr:first').find('button[aria-label=Edit]').click();
    cy.get('input#name_field').should('have.value', '! New Test Entity');
    cy.get('textarea#details_field').should('have.value', 'Example details');
    cy.get('input#name_field').clear().type('!! AA Test Entity');
    cy.get('textarea#details_field').clear().type('Example details updated');
    cy.get('button').contains('Save').click();

    cy.get('otp-table tbody tr:first').find('button[aria-label=Edit]').click();
    cy.get('input#name_field').should('have.value', '!! AA Test Entity');
    cy.get('textarea#details_field').should('have.value', 'Example details updated');
  });
});
