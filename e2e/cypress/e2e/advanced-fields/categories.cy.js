describe('Categories', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/');
    cy.login('ngomanager@example.com', 'secret');
    cy.visit('http://localhost:4200/private/fields/categories');
  });

  it('displays a list of categories', () => {
    cy.get('otp-table tbody tr').should('have.length.least', 2);
  });
});
