const { nanoid } = require('nanoid')

describe('User', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/');
  })

  context('Public user', () => {
    it('can log in and out', function () {
      cy.login('ngomanager@example.com', 'secret');
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
      cy.get('#observer_id').select('Greenpeace');
      cy.get('#country_id').select('Congo');
      cy.get('#locale_field').select('English');
      cy.get('#email').type(`testngomanager+${nanoid(6)}@example.com`);
      cy.get('#password').type('supersecret');
      cy.get('#password_confirmation').type('supersecret');
      cy.get('#has_rights').check();

      cy.then(() => {
        cy.once('window:alert', (str) => {
          expect(str).to.match(/The request has been sent! We'll get back to you soon/)
        });
      });
      cy.get('button').contains('Register').click();
    });
  });

  context('Logged in User', () => {
    beforeEach(() => {
      cy.login('ngomanager@example.com', 'secret');
      cy.visit('http://localhost:4200/private/profile');
    });

    describe('updating user profile', function () {
      it('can update some profile info without current password', function () {
        /* cy.get('a').contains('Profile', { timeout: 10000 }).click(); */
        cy.get('#name').clear().type('NGO Manager Test');
        cy.get('#email_field').clear().type('ngomanger@example.com');
        cy.get('#locale_field').select('English');

        cy.then(() => {
          cy.once('window:alert', (str) => {
            expect(str).to.match(/Your profile has been sucessfully updated/);
          });
        });
        cy.get('button').contains('Save').click();
      });

      it('can update user email and password', function () {
        cy.get('#current_password').should('not.exist');
        cy.get('#locale_field').select('English');
        cy.get('#email_field').clear().type('ngomanagertest@example.com');
        cy.get('#current_password').should('exist');
        cy.get('#current_password').clear().type('secret');
        cy.then(() => {
          cy.once('window:alert', (str) => {
            expect(str).to.match(/Your profile has been sucessfully updated/);
          });
        });
        cy.get('button').contains('Save').click();
        cy.get('#email_field').should('not.exist'); // trick wait for page reload

        cy.get('#email_field').should('have.value', 'ngomanagertest@example.com');
        cy.get('#current_password').should('not.exist');
        cy.get('#new_password').clear().type('secret12345');
        cy.get('#password_confirmation').clear().type('secret12345');
        cy.get('#current_password').clear().type('secret');
        cy.then(() => {
          cy.once('window:alert', (str) => {
            expect(str).to.match(/Your profile has been sucessfully updated/);
          });
        });
        cy.get('button').contains('Save').click();
        cy.get('#email_field').should('not.exist'); // trick wait for page reload

        // update password and email back
        cy.get('#email_field').clear().type('ngomanager@example.com');
        cy.get('#new_password').clear().type('secret');
        cy.get('#password_confirmation').clear().type('secret');
        cy.get('#current_password').clear().type('secret12345');
        cy.then(() => {
          cy.once('window:alert', (str) => {
            expect(str).to.match(/Your profile has been sucessfully updated/);
          });
        });
        cy.get('button').contains('Save').click();
      })
    })
  });
});
