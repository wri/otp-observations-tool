import 'cypress-file-upload';
import '@neuralegion/cypress-har-generator/commands';

Cypress.Commands.add('login', (username, password) => {
  cy.session(
    [username, password],
    () => {
      cy.visit('/');
      cy.contains('Login');
      cy.get('#username').type(username);
      cy.get('#password').type(password);
      cy.get('button').contains('Login').click();
      cy.wait(1000);
      cy.contains('Log out');
    },
    {
      cacheAcrossSpecs: true
    }
  );
});

Cypress.Commands.add('selectDate', (selector, date) => {
  // .flatpickr-calendar
  // .flatpickr-day
  cy.get(`#${selector}`).click();

  // date in format YYYY-MM-DD
  const [year, month, day] = date.split('-');
  cy.get('.flatpickr-calendar .numInput.cur-year').clear().type(year);
  cy.get('.flatpickr-calendar .flatpickr-monthDropdown-months').select(Number(month) - 1); // flatpickr uses 0-indexed months
  cy.get('.flatpickr-calendar .flatpickr-day:not(.prevMonthDay)').contains(day).click();
});

Cypress.Commands.add('selectOption', (selector, option) => {
  const options = [].concat(option);
  const toggleOption = (optionText) => {
    cy.get(`ss-multiselect-dropdown[name=${selector}]`)
      .find("li.dropdown-item")
      .contains(optionText, { matchCase: false })
      .click();
  };

  cy.get(`ss-multiselect-dropdown[name=${selector}]`)
    .find("button.dropdown-toggle")
    .click()
    .then(($btn) => {
      const selectedOptions = $btn.text();
      if (selectedOptions !== 'Select') {
        selectedOptions.split(',').map((o) => o.trim()).forEach(toggleOption); // to unselect all
      }
    })

  options.forEach(toggleOption);
  cy.get(`ss-multiselect-dropdown[name=${selector}]`).click();
});

Cypress.Commands.add('expectSelectedOption', (selector, option) => {
  const options = [].concat(option);

  options.forEach((option) => {
    cy.get(`ss-multiselect-dropdown[name=${selector}]`)
    .find("button.dropdown-toggle")
    .contains(option)
    .should('exist');
  })
})

Cypress.Commands.add('chooseOption', (question, option) => {
  cy.get(".form-group")
    .contains(question, { matchCase: false })
    .parent('.form-group')
    .find("label")
    .contains(option, { matchCase: false })
    .click();
});

Cypress.Commands.add('expectChosenOption', (question, option) => {
  cy.get(".form-group")
    .contains(question, { matchCase: false })
    .parent('.form-group')
    .find("label")
    .contains(option, { matchCase: false })
    .parent() // TODO: not sure if ok
    .find('input[type=radio]')
    .should('be.checked');
});

Cypress.Commands.add('resetDB', () => {
  const apiPath = Cypress.env('API_PATH') || '../../otp-api';
  cy.exec(`cd ${apiPath}; RAILS_ENV=e2e bin/rails e2e:db_reset`);
});

Cypress.Commands.add('recordNetworkActivity', () => {
  const recordHar = Cypress.env('RECORD_HAR');
  if (recordHar) {
    cy.recordHar();
  }
});

Cypress.Commands.add('saveNetworkActivity', (filename) => {
  function sanitizeFilename(filename) {
    return filename.replace(/ /g, '_').replace(/[^a-zA-Z0-9-_]/g, '');
  }

  const recordHar = Cypress.env('RECORD_HAR');
  const state = Cypress.mocha.getRunner().suite.ctx.currentTest.state;
  if (recordHar && state !== 'passed') {
    cy.saveHar({ fileName: sanitizeFilename(`${filename} ${Cypress.currentTest.title}`) });
  }
});

