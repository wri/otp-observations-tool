describe('User', () => {
  beforeEach(() => {
    cy.visit('/');
  })

  context('Public user', () => {
    describe('can log in', function () {
      // the API namespaces its cookies per app, see api-interceptor.ts
      const AUTH_COOKIE = 'observations-tool_otp_auth_token';
      const CSRF_COOKIE = 'observations-tool_XSRF-TOKEN';
      const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;

      const submitLogin = () => {
        cy.get('#username').type('ngo_manager@example.com');
        cy.get('#password').type('Supersecret1');
        cy.get('button').contains('Login').click();
        cy.get('button').contains('Log out').should('exist');
      };

      it('keeps the session for 30 days when remember me ticked', function () {
        cy.get('#rememberMe').check();
        submitLogin();

        [AUTH_COOKIE, CSRF_COOKIE].forEach(name => {
          cy.getCookie(name).should(cookie => {
            const expectedExpiry = Math.floor(Date.now() / 1000) + THIRTY_DAYS_IN_SECONDS;
            // an hour of slack so the assertion does not depend on how long the login took
            expect(cookie.expiry, `${name} expiry`).to.be.closeTo(expectedExpiry, 60 * 60);
          });
        });
      });

      it('keeps the session until the browser closes when remember me not ticked', function () {
        cy.get('#rememberMe').should('not.be.checked');
        submitLogin();

        [AUTH_COOKIE, CSRF_COOKIE].forEach(name => {
          // no expiry at all means the browser drops the cookie on close
          cy.getCookie(name).should(cookie => {
            expect(cookie.expiry, `${name} expiry`).to.be.undefined;
          });
        });
      });
    });

    it('shows a notice when the account has just been unlocked', function () {
      // the API sends the user here after they visit the unlock link in the email
      cy.visit('/?message=user_unlocked');

      cy.contains('Your account has been unlocked. You can log in again.');
      cy.get('#username').should('exist');
      // the param is dropped, so the notice does not come back on reload
      cy.location('search').should('eq', '');
    });

    it('can create account', function () {
      cy.get('button').contains('Register').click();

      cy.get('#first_name').should('exist');
      cy.get('button').contains('Register').click();

      // testing validations
      cy.contains('Please enter your first name');
      cy.contains('Please enter your last name');
      cy.contains('Please select an organization');
      cy.contains('Please select a country');
      cy.contains('Please select a language');
      cy.contains('Email is required');
      cy.contains('Please enter a password');
      cy.contains('Please confirm your password');
      cy.contains('Please tick the box');

      cy.get('#password').type('one');
      cy.contains('The field should have at least 10 characters');
      cy.contains('Password should contain at least one uppercase letter, one lowercase letter and one digit');

      cy.get('#first_name').type('James');
      cy.get('#last_name').type('Watson');
      cy.get('#observer_id').select('OGF');
      cy.get('#country_id').select('Congo');
      cy.get('#locale_field').select('English');
      cy.get('#email').type(`testngomanager@example.com`);
      cy.get('#password').clear().type('GreatPassword6');
      cy.get('#password_confirmation').type('GreatPassword6');
      cy.get('#has_rights').check();

      const alert = cy.stub().as("alert");
      cy.then(() => { cy.on('window:alert', alert); });
      cy.get('button').contains('Register').click();
      cy.get("@alert").should("have.been.calledWithMatch", /The request has been sent! We'll get back to you soon/);
      cy.resetDB();
    });
  });

  context('Logged in User', () => {
    beforeEach(() => {
      cy.login('ngo_manager@example.com', 'Supersecret1');
      cy.visit('/private/profile');
    });

    describe('updating user profile', function () {
      it('can update some profile info without current password', function () {
        /* cy.get('a').contains('Profile', { timeout: 10000 }).click(); */
        cy.get('#first_name').clear().type('NGO Manager');
        cy.get('#last_name').clear().type('Test');
        cy.get('#email_field').clear().type('ngo_manager@example.com');
        cy.get('#locale_field').select('English');

        const alert = cy.stub().as("alert");
        cy.on('window:alert', alert);
        cy.get('button').contains('Save').click(); //.then(() => {
        cy.get("@alert").should("have.been.calledWithMatch", /Your profile has been sucessfully updated/);
        cy.resetDB();
      });

      it('can update user email and password', function () {
        cy.get('#current_password').should('not.exist');
        cy.get('#locale_field').select('English');
        cy.get('#email_field').clear().type('ngo_managertest@example.com');
        cy.get('#current_password').should('exist');
        cy.get('#current_password').clear().type('Supersecret1');
        const alert = cy.stub().as("alert");
        cy.on('window:alert', alert);
        cy.get('button').contains('Save').click();
        cy.get("@alert").should("have.been.calledWithMatch", /Your profile has been sucessfully updated/);
        cy.then(() => alert.reset());
        cy.get('#email_field').should('not.exist'); // trick wait for page reload

        cy.get('#email_field').should('have.value', 'ngo_managertest@example.com');
        cy.get('#current_password').should('not.exist');
        cy.get('#new_password').clear().type('Secret12345');
        cy.get('#password_confirmation').clear().type('Secret12345');
        cy.get('#current_password').clear().type('Supersecret1');
        cy.get('button').contains('Save').click();
        cy.get("@alert").should("have.been.calledWithMatch", /Your profile has been sucessfully updated/);
        cy.resetDB();
      })
    })
  });
});
