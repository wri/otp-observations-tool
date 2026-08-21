const LETTER_OPENER_ORIGIN = 'http://localhost:3000';

describe('Password Reset', () => {
  beforeEach(() => {
    cy.recordNetworkActivity();
  })

  afterEach(() => {
    cy.saveNetworkActivity('observations');
  });

  describe('Full flow', () => {
    it('user can reset its password', function () {
      // letter_opener runs on a different port, which is a separate origin since
      // Cypress stopped injecting document.domain, so it needs cy.origin()
      cy.origin(LETTER_OPENER_ORIGIN, () => {
        cy.visit('http://localhost:3000/admin/letter_opener');
        cy.get('a').contains('Clear').click();
      });
      cy.visit('/');
      cy.get('a').contains('Reset password').click();
      cy.get('#email').type('ngo@example.com');
      const alert = cy.stub().as("alert");
      cy.on('window:alert', alert);
      cy.get('button').contains('Reset').click();
      cy.get("@alert").should("have.been.calledWithMatch", /If account exists for ngo@example.com, you will get/);
      cy.then(() => alert.reset());
      // the callback runs in the other origin, so it cannot close over anything
      // from this scope; it yields the token back instead
      cy.origin(LETTER_OPENER_ORIGIN, () => {
        cy.visit('http://localhost:3000/admin/letter_opener');
        cy.get('a[target="mail"]').contains('ngo@example.com').click();
        cy.wait(1000); // wait to load frames
        cy.get('iframe#mail').then($mailIframe =>
          cy.wrap($mailIframe.contents()).find('iframe').then($messageIframe =>
            cy.wrap($messageIframe.contents()).find('a').contains('reset_password_token=').then(tokenElement => {
              const textWithToken = tokenElement.text();
              const tokenRegex = /reset_password_token=(.*)/;
              const tokenMatch = textWithToken.match(tokenRegex);
              const token = tokenMatch && tokenMatch[1];
              // Assert that the token is extracted successfully
              expect(token).to.exist;
              return token;
            })
          )
        );
      }).then(token => {
        cy.visit(`/reset-password?reset_password_token=${token}`);
      });
      // validation errors
      cy.get('#new_password').clear().type('s');
      cy.get('button').contains('Change password').click();
      cy.contains('The field should have at least 10 characters');
      cy.contains('Password should contain at least one uppercase letter, one lowercase letter and one digit');

      cy.get('#new_password').clear().type('Secret12345');
      cy.get('#password_confirmation').clear().type('Secret12345');
      cy.get('button').contains('Change password').click();
      cy.get("@alert").should("have.been.calledWithMatch", /Your password has been successfully updated/);
      cy.then(() => alert.reset());
      // wait for the auto log-in to land on the observations page
      cy.location('pathname').should('eq', '/private/observations');
      // test log in again with new password, even after auto log-in
      cy.get('button').contains('Log out').click();
      cy.contains('Login');
      cy.get('#username').type("ngo@example.com");
      cy.get('#password').type("Secret12345");
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
        cy.get('#new_password').clear().type('Secret12345');
        cy.get('#password_confirmation').clear().type('Secret12345');
        const alert = cy.stub().as("alert");
        cy.on('window:alert', alert);
        cy.get('button').contains('Change password').click();
        cy.get("@alert").should("have.been.calledWithMatch", /reset_password_token is invalid/);
      });
    })
  })
});
