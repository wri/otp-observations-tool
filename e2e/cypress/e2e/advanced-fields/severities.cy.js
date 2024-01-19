describe('Severities', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login('ngo_manager@example.com', 'password');
    cy.visit('/private/fields/severities');
  });

  it('displays a list of severities', () => {
    cy.get('otp-table tbody tr').should('have.length.least', 2);
  });
});
