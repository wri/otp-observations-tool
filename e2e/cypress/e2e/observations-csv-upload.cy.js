// The importer itself is the API's concern; this spec stubs POST /imports and covers
// how the observations list and <otp-upload-file> handle each kind of response.
describe('Observations CSV upload', () => {
  // The app appends ?app=...&locale=... to API calls, which a `**/imports` glob would not match.
  const importsUrl = /\/imports(\?|$)/;

  // One entry per CSV line; an empty `errors` object means the line was imported.
  const importedLine = { attributes: {}, errors: {} };

  const selectCsv = (input = 'input[type=file][accept=".csv"]') => {
    cy.get(input).first().selectFile('cypress/fixtures/observations.csv', { force: true });
  };

  beforeEach(() => {
    cy.login('ngo_manager@example.com', 'Supersecret1');
    cy.visit('/private/observations');
  });

  // Nothing should reach the API, but if a stub ever stops matching, the real importer writes rows.
  after(() => {
    cy.resetDB();
  });

  it('handles each kind of import response', () => {
    // Instructions
    cy.get('button.upload-csv').click();
    cy.get('otp-modal').contains('CSV upload instructions').should('be.visible');
    cy.get('otp-modal').contains('a', 'Download CSV example').should('have.attr', 'href', 'assets/csv-example.csv');
    cy.get('otp-modal .close-button').filter(':visible').click();

    // Success
    cy.intercept('POST', importsUrl, { delay: 500, body: { 1: importedLine, 2: importedLine } }).as('success');
    selectCsv();
    cy.get('otp-upload-file').contains('Uploading and verifying...').should('be.visible');
    cy.wait('@success');
    cy.get('otp-upload-file').contains('Success! You imported 2 Observations').should('be.visible');
    cy.get('otp-upload-file').contains('button', 'Done').click();
    cy.get('otp-upload-file').should('not.exist');

    // Line errors, then a successful re-upload from the error screen
    cy.intercept('POST', importsUrl, {
      body: {
        1: importedLine,
        2: { attributes: {}, errors: { record: { country: ['must exist'] } } },
      },
    }).as('lineErrors');
    selectCsv();
    cy.wait('@lineErrors');
    cy.get('otp-upload-file').contains('Error importing data from CSV file').should('be.visible');
    cy.get('otp-upload-file .error li').should('have.length', 1).and('contain', 'Line 2: (record) country: must exist');
    cy.get('otp-upload-file').contains('button', 'Done').should('not.exist');

    cy.intercept('POST', importsUrl, { body: { 1: importedLine } }).as('reupload');
    selectCsv('otp-upload-file input[type=file]');
    cy.wait('@reupload');
    cy.get('otp-upload-file').contains('Success! You imported 1 Observations').should('be.visible');
    cy.get('otp-upload-file .error').should('not.exist');
    cy.get('otp-upload-file').contains('button', 'Done').first().click();
    cy.get('otp-upload-file').should('not.exist');

    // Empty response
    cy.intercept('POST', importsUrl, { body: {} }).as('empty');
    selectCsv();
    cy.wait('@empty');
    cy.get('otp-upload-file .error li').should('contain', 'Line 1: (file) invalid file');
    cy.get('otp-upload-file').contains('button', 'Cancel').click();
    cy.get('otp-upload-file').should('not.exist');

    // Request failure
    const alert = cy.stub().as('alert');
    cy.on('window:alert', alert);
    cy.intercept('POST', importsUrl, { statusCode: 500, body: {} }).as('failure');
    selectCsv();
    cy.wait('@failure');
    cy.get('@alert').should('have.been.calledWith', 'Error importing data from CSV file');
    cy.get('otp-upload-file').should('not.exist');
    cy.get('otp-table').should('be.visible');
  });
});
