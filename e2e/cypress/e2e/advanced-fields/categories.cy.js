describe('Categories', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login('ngo_manager@example.com', 'Supersecret1');
    cy.visit('/private/fields/categories');
  });

  it('displays a list of categories', () => {
    cy.get('otp-table tbody tr').should('have.length.least', 2);
  });
});
