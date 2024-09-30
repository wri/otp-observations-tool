describe('Report Library', () => {
  beforeEach(() => {
    cy.login('ngo_manager@example.com', 'Supersecret1');
    cy.visit('/private/my-otp/reports');
  })

  it('displays a list of reports', () => {
    cy.get('otp-table tbody tr').should('have.length.least', 1);
  });

  describe('Modifying data', () => {
    afterEach(() => {
      cy.resetDB();
    });

    it('can create a new report', function () {
      cy.get('button').contains('New report').click();

      // testing validations
      cy.get('button').contains('Create').click();
      cy.contains('Please enter the name');
      cy.contains('The file is not valid');
      cy.contains('Please enter the publication date');

      cy.get('#report_title').clear().type('!! New uploaded report');
      cy.get('input#report_file').attachFile('test_document.docx');
      cy.selectDate('report_date', '2023-12-30');
      cy.selectOption('additional_observers', ['AGRECO', 'FODER']);
      cy.get('button').contains('Create').click();

      cy.get('otp-table tbody tr:first').find('button[aria-label=Edit]').click();
      cy.get('#report_title').should('have.value', '!! New uploaded report');
      cy.get('a').contains('Download file').should('be.visible');
      cy.get('input#report_date').should('have.value', '30/12/2023');
      cy.expectSelectedOption('additional_observers', ['AGRECO', 'FODER']);
    });

    it('can edit a report', function () {
      cy.get('otp-table tbody tr:first').find('button[aria-label=Edit]').click();
      cy.get('#report_title').clear().type('!! Edited report');
      cy.selectDate('report_date', '2023-12-30');
      cy.selectOption('additional_observers', ['ECODEV', 'OCEAN']);
      cy.get('button').contains('Save').click();

      cy.get('otp-table tbody tr:first').find('button[aria-label=Edit]').click();
      cy.get('#report_title').should('have.value', '!! Edited report');
      cy.get('a').contains('Download file').should('be.visible');
      cy.get('input#report_date').should('have.value', '30/12/2023');
      cy.expectSelectedOption('additional_observers', ['ECODEV', 'OCEAN']);
    });
  })
});
