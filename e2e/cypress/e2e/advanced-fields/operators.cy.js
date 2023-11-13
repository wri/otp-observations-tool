describe('Operators/Producers', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/');
    cy.login('ngomanager@example.com', 'secret');
    cy.visit('http://localhost:4200/private/fields/operators');
  });

  it('displays a list of producers', () => {
    cy.get('otp-table tbody tr').should('have.length.least', 2);
  });

  it('can create and update a producer', () => {
    cy.get('otp-table tbody tr').should('have.length.least', 2);
    cy.get('button').contains('New producer').click();
    cy.get('input#name_field').type('! New Producer');
    cy.get('select#type_field').select('Estate');
    cy.get('input#concession_field').type('Concession example');
    cy.get('textarea#details_field').type('Example details');
    cy.get('textarea#address_field').type('Example address');
    cy.get('input#website_field').type('http://example.com');
    cy.get('input#logo_field').attachFile('acme-logo.png');
    cy.get('img.logo').should('be.visible');
    cy.get('button').contains('Create').click();

    // checking update
    cy.get('otp-table tbody tr:first').find('button[aria-label=Edit]').click();
    cy.get('input#name_field').should('have.value', '! New Producer');
    cy.get('select#type_field').find('option').contains('Estate').should('be.selected');
    cy.get('input#concession_field').should('have.value', 'Concession example');
    cy.get('textarea#details_field').should('have.value', 'Example details');
    cy.get('textarea#address_field').should('have.value', 'Example address');
    cy.get('input#website_field').should('have.value', 'http://example.com');
    // updating
    cy.get('input#name_field').clear().type('!! New Producer updated');
    cy.get('textarea#details_field').clear().type('Example details updated');
    cy.get('select#type_field').select('Artisanal');
    cy.get('input#concession_field').clear().type('Concession example updated');
    cy.get('textarea#details_field').clear().type('Example details updated');
    cy.get('textarea#address_field').clear().type('Example address updated');
    cy.get('input#website_field').clear().type('http://example.com/updated');
    cy.get('button').contains('Save').click();

    cy.get('otp-table tbody tr:first').find('button[aria-label=Edit]').click();

    // check updated
    cy.get('input#name_field').should('have.value', '!! New Producer updated');
    cy.get('select#type_field').find('option').contains('Artisanal').should('be.selected');
    cy.get('input#concession_field').should('have.value', 'Concession example updated');
    cy.get('textarea#details_field').should('have.value', 'Example details updated');
    cy.get('textarea#address_field').should('have.value', 'Example address updated');
    cy.get('input#website_field').should('have.value', 'http://example.com/updated');
  });
});
