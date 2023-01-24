describe('Laws', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/');
    cy.login('tsubik+ngomanager@gmail.com', 'secret');
    cy.visit('http://localhost:4200/private/fields/laws');
  });

  it('displays a list of laws', () => {
    cy.get('otp-table tbody tr').should('have.length.least', 2);
  });

  it('can create and update a law', () => {
    cy.get('otp-table tbody tr').should('have.length.least', 2);
    cy.get('button').contains('New legal reference').click();
    cy.get('select#subcategory').select('Abandonment of timber');
    cy.get('textarea#law_field').clear().type('! Illegality example');
    cy.get('textarea#infraction').clear().type('Infraction example');
    cy.get('textarea#sanctions').clear().type('Sanctions example');
    cy.get('input#min_fine').clear().type('100');
    cy.get('input#max_fine').clear().type('1000');
    cy.get('input#currency').clear().type('USD');
    cy.get('textarea#penal_servitude').clear().type('Penal servitude example');
    cy.get('textarea#other_penalties').clear().type('Other penalties example');
    cy.get('textarea#apv').clear().type('VPA example');
    cy.get('button').contains('Create').click();

    // checking created
    cy.get('otp-table tbody tr:first').find('button[aria-label=Edit]').click();
    cy.get('select#subcategory').find('option').contains('Abandonment of timber').should('be.selected');
    cy.get('textarea#law_field').should('have.value', '! Illegality example');
    cy.get('textarea#infraction').should('have.value', 'Infraction example');
    cy.get('textarea#sanctions').should('have.value', 'Sanctions example');
    cy.get('input#min_fine').should('have.value', '100');
    cy.get('input#max_fine').should('have.value', '1000');
    cy.get('input#currency').should('have.value', 'USD');
    cy.get('textarea#penal_servitude').should('have.value', 'Penal servitude example');
    cy.get('textarea#other_penalties').should('have.value', 'Other penalties example');
    cy.get('textarea#apv').should('have.value', 'VPA example');

    // updating
    cy.get('select#subcategory').select('Export duty unpaid');
    cy.get('textarea#law_field').clear().type('! Illegality example updated');
    cy.get('textarea#infraction').clear().type('Infraction example updated');
    cy.get('textarea#sanctions').clear().type('Sanctions example updated');
    cy.get('input#min_fine').clear().type('1000');
    cy.get('input#max_fine').clear().type('10000');
    cy.get('input#currency').clear().type('EUR');
    cy.get('textarea#penal_servitude').clear().type('Penal servitude example updated');
    cy.get('textarea#other_penalties').clear().type('Other penalties example updated');
    cy.get('textarea#apv').clear().type('VPA example updated');
    cy.get('button').contains('Save').click();

    // checking update
    cy.get('otp-table tbody tr:first').find('button[aria-label=Edit]').click();
    cy.get('select#subcategory').find('option').contains('Export duty unpaid').should('be.selected');
    cy.get('textarea#law_field').should('have.value', '! Illegality example updated');
    cy.get('textarea#infraction').should('have.value', 'Infraction example updated');
    cy.get('textarea#sanctions').should('have.value', 'Sanctions example updated');
    cy.get('input#min_fine').should('have.value', '1000');
    cy.get('input#max_fine').should('have.value', '10000');
    cy.get('input#currency').should('have.value', 'EUR');
    cy.get('textarea#penal_servitude').should('have.value', 'Penal servitude example updated');
    cy.get('textarea#other_penalties').should('have.value', 'Other penalties example updated');
    cy.get('textarea#apv').should('have.value', 'VPA example updated');
  });
});
