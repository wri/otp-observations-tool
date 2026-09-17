// The My OTP > Organization profile page: no other spec opens it.
describe('Organization profile', () => {
  beforeEach(() => {
    cy.login('ngo_manager@example.com', 'Supersecret1');
    cy.visit('/private/my-otp/profile');
  });

  after(() => {
    cy.resetDB();
  });

  it('edits, saves and discards the organization profile', () => {
    cy.get('input#name').should('have.value', 'OGF');

    cy.get('input#name').clear().type('! OGF updated');
    cy.get('textarea#address').clear().type('1 Example street, Kinshasa');
    cy.selectOption('countries', 'Cameroon');
    cy.get('input#contact_general_name').clear().type('Contact Person');
    cy.get('input#contact_general_email').clear().type('contact@example.com');
    cy.get('input#contact_general_phone').clear().type('+243 000 000 000');
    cy.get('input#contact_inquiries_email').clear().type('inquiries@example.com');
    cy.get('input#public_info').check();

    const alert = cy.stub().as('alert');
    cy.then(() => cy.on('window:alert', alert));
    cy.get('button').contains('Save').click();
    cy.get('@alert').should('have.been.calledWithMatch', /profile has been suc?cessfully updated/i);
    cy.then(() => alert.reset());

    // reload to confirm it reached the API
    cy.visit('/private/my-otp/profile');
    cy.get('input#name').should('have.value', '! OGF updated');
    cy.get('textarea#address').should('have.value', '1 Example street, Kinshasa');
    cy.expectSelectedOption('countries', 'Cameroon');
    cy.get('input#contact_general_name').should('have.value', 'Contact Person');
    cy.get('input#contact_general_email').should('have.value', 'contact@example.com');
    cy.get('input#contact_inquiries_email').should('have.value', 'inquiries@example.com');
    cy.get('input#public_info').should('be.checked');

    // discarding reloads the saved values instead of keeping the edits
    cy.get('input#name').clear().type('! Not saved');
    cy.get('button').contains('Discard changes').click();
    cy.get('input#name').should('have.value', '! OGF updated');
  });
});
