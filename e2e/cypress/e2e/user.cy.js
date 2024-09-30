describe('User', () => {
  beforeEach(() => {
    cy.visit('/');
  })

  context('Public user', () => {
    it('can log in and out', function () {
      cy.login('ngo_manager@example.com', 'Supersecret1');
      cy.visit('/');
      cy.get('button').contains('Log out').click();
      cy.get('button').contains('Login').should('exist')
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
