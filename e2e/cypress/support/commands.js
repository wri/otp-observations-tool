import 'cypress-file-upload';

Cypress.Commands.add('login', (username, password) => {
  cy.contains('Login')
  cy.get('#username').type(username);
  cy.get('#password').type(password);
  cy.get('button').contains('Login').click();
  cy.wait(1000);
  cy.contains('Log out');
});
