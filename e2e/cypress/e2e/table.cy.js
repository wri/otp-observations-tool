// Sorting and pagination in the shared <otp-table>. The laws list has enough rows to page
// through; other specs only ever read the first page.
describe('Table sorting and pagination', () => {
  const normalize = (text) => text.replace(/\s+/g, ' ').trim();
  const rowsText = () => cy.get('otp-table tbody').invoke('text').then(normalize);
  // Retries the DOM read, unlike comparing against a value captured with .then()
  const rowsShouldDifferFrom = (previous) =>
    cy.get('otp-table tbody').should(($tbody) => expect(normalize($tbody.text())).to.not.equal(previous));
  const countryHeader = () => cy.get('otp-table th').contains('Country');

  beforeEach(() => {
    cy.login('ngo_manager@example.com', 'Supersecret1');
    cy.visit('/private/fields/laws');
    cy.get('otp-table tbody tr').should('have.length', 10);
  });

  it('sorts by a column and pages through the results', () => {
    // Sorting: ascending, then descending on a second click. Every law in the seed data has the
    // same country, so assert on what the table asks the API for rather than on the rows.
    cy.intercept('GET', /\/laws\?/).as('sortAsc');
    countryHeader().click();
    countryHeader().should('have.attr', 'aria-sort', 'asc');
    cy.get('otp-table caption').should('contain', 'sorted by Country');
    cy.wait('@sortAsc').its('request.url').should('include', 'sort=country.name');

    cy.intercept('GET', /\/laws\?/).as('sortDesc');
    countryHeader().click();
    countryHeader().should('have.attr', 'aria-sort', 'desc');
    cy.wait('@sortDesc').its('request.url').should('include', 'sort=-country.name');

    // Page size
    cy.get('otp-table .per-page select').select('20');
    cy.get('otp-table tbody tr').should('have.length', 20);
    cy.get('otp-table .paginator li.-active').should('contain', '1');

    // Next page, then a page button, then back
    rowsText().then((page1) => {
      cy.get('otp-table').contains('button', 'Next').click();
      cy.get('otp-table .paginator li.-active').should('contain', '2');
      rowsShouldDifferFrom(page1);

      cy.get('otp-table .paginator button[aria-label="Page 3"]').click();
      cy.get('otp-table .paginator li.-active').should('contain', '3');

      cy.get('otp-table').contains('button', 'Previous').click();
      cy.get('otp-table .paginator li.-active').should('contain', '2');

      // Changing the page size returns to the first page
      cy.get('otp-table .per-page select').select('10');
      cy.get('otp-table tbody tr').should('have.length', 10);
      cy.get('otp-table .paginator li.-active').should('contain', '1');
      rowsShouldDifferFrom(page1); // the first 10 of those rows, not all 20
    });
  });
});
