describe('Subcategories', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login('ngo_manager@example.com', 'Supersecret1');
    cy.visit('/private/fields/subcategories');
  });

  it('displays a list of subcategories', () => {
    cy.get('otp-table tbody tr').should('have.length.least', 2);
  });
});
