describe('Password Reset', () => {
  beforeEach(() => {
    cy.recordNetworkActivity();
  })

  afterEach(() => {
    cy.saveNetworkActivity('observations');
  });

  describe('Full flow', () => {
    it('user can reset its password', function () {
      cy.visit('http://localhost:3000/admin/letter_opener');
      cy.get('a').contains('Clear').click();
      cy.visit('/');
      cy.get('a').contains('Reset password').click();
      cy.get('#email').type('ngo@example.com');
      const alert = cy.stub().as("alert");
      cy.on('window:alert', alert);
      cy.get('button').contains('Reset').click();
      cy.get("@alert").should("have.been.calledWithMatch", /If account exists for ngo@example.com, you will get/);
      cy.then(() => alert.reset());
      cy.visit('http://localhost:3000/admin/letter_opener');
      cy.get('a[target="mail"]').contains('ngo@example.com').click();
      let token;
      cy.wait(1000); // wait to load frames
      cy.get('iframe#mail').then($mailIframe => {
        cy.wrap($mailIframe.contents()).find('iframe').then($messageIframe => {
          cy.wrap($messageIframe.contents()).find('a').contains('reset_password_token=').then(tokenElement => {
            const textWithToken = tokenElement.text();
            const tokenRegex = /reset_password_token=(.*)/;
            const tokenMatch = textWithToken.match(tokenRegex);
            token = tokenMatch && tokenMatch[1];
            // Assert that the token is extracted successfully
            expect(token).to.exist;
          });
        });
      });
      cy.then(() => cy.visit(`/reset-password?reset_password_token=${token}`));
      cy.get('#new_password').clear().type('secret12345');
      cy.get('#password_confirmation').clear().type('secret12345');
      cy.get('button').contains('Change password').click();
      cy.get("@alert").should("have.been.calledWithMatch", /Your password has been successfully updated/);
      cy.then(() => alert.reset());
      // test log in again with new password, even after auto log-in
      cy.get('button').contains('Log out').click();
      cy.contains('Login');
      cy.get('#username').type("ngo@example.com");
      cy.get('#password').type("secret12345");
      cy.get('button').contains('Login').click();
      cy.get('button').contains('Log out').should('exist');
      cy.resetDB();
    });
  })

  describe('Reset password form', () => {
    beforeEach(() => {
      cy.visit('/');
    })

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
  })
});
