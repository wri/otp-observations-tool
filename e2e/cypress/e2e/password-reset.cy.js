describe('Password Reset', () => {
  beforeEach(() => {
    cy.visit('/');
  })

  describe('Forgot password form', () => {
    it('user can ask for password reset', function () {
      cy.get('a').contains('Reset password').click();
      cy.get('#email').type('ngo@example.com');
      const alert = cy.stub().as("alert");
      cy.on('window:alert', alert);
      cy.get('button').contains('Reset').click();
      cy.get("@alert").should("have.been.calledWithMatch", /If account exists for ngo@example.com, you will get/);
    });
  })

  describe('Reset password form', () => {
    describe('errors', () => {
      it('shows error with invalid token', function () {
        cy.visit('/reset-password?reset_password_token=invalid');
        cy.get('#new_password').clear().type('secret12345');
        cy.get('#password_confirmation').clear().type('secret12345');
        const alert = cy.stub().as("alert");
        cy.on('window:alert', alert);
        cy.get('button').contains('Change password').click();
        cy.get("@alert").should("have.been.calledWithMatch", /reset_password_token is invalid/);
      });
    })

    // TODO: test success case with valid token
  })
});
