describe('User', () => {
  beforeEach(() => {
    cy.visit('/');
  })

  context('Public user', () => {
    it('can log in and out', function () {
      cy.login('ngo_manager@example.com', 'password');
      cy.get('button').contains('Log out').click();
      cy.get('button').contains('Login').should('exist')
    });

    it('can create account', function () {
      cy.get('button').contains('Register').click();

      cy.get('#name').should('exist');
      cy.get('button').contains('Register').click();

      // testing validations
      cy.contains('Please enter your name');
      cy.contains('Please select an organization');
      cy.contains('Please select a country');
      cy.contains('Please select a language');
      cy.contains('Email is required');
      cy.contains('Please enter a password');
      cy.contains('Please confirm your password');
      cy.contains('Please tick the box');

      cy.get('#name').type('James Watson');
      cy.get('#observer_id').select('OGF');
      cy.get('#country_id').select('Congo');
      cy.get('#locale_field').select('English');
      cy.get('#email').type(`testngomanager@example.com`);
      cy.get('#password').type('supersecret');
      cy.get('#password_confirmation').type('supersecret');
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
      cy.login('ngo_manager@example.com', 'password');
      cy.visit('/private/profile');
    });

    describe('updating user profile', function () {
      it('can update some profile info without current password', function () {
        /* cy.get('a').contains('Profile', { timeout: 10000 }).click(); */
        cy.get('#name').clear().type('NGO Manager Test');
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
        cy.get('#current_password').clear().type('password');
        const alert = cy.stub().as("alert");
        cy.on('window:alert', alert);
        cy.get('button').contains('Save').click();
        cy.get("@alert").should("have.been.calledWithMatch", /Your profile has been sucessfully updated/);
        cy.then(() => alert.reset());
        cy.get('#email_field').should('not.exist'); // trick wait for page reload

        cy.get('#email_field').should('have.value', 'ngo_managertest@example.com');
        cy.get('#current_password').should('not.exist');
        cy.get('#new_password').clear().type('secret12345');
        cy.get('#password_confirmation').clear().type('secret12345');
        cy.get('#current_password').clear().type('password');
        cy.get('button').contains('Save').click();
        cy.get("@alert").should("have.been.calledWithMatch", /Your profile has been sucessfully updated/);
        cy.resetDB();
      })
    })
  });
});
