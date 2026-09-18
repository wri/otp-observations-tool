// Below the 768px tablet breakpoint the main navigation gains Profile and form buttons move
// to <otp-action-bar>, which the desktop-sized specs never render.
describe('Mobile layout', () => {
  beforeEach(() => {
    cy.viewport('iphone-x');
    cy.login('ngo_manager@example.com', 'Supersecret1');
    cy.visit('/');
  });

  after(() => {
    cy.resetDB();
  });

  it('navigates and submits forms with the mobile bars', () => {
    const mainNavigation = () => cy.get('otp-header otp-navigation');

    mainNavigation().contains('a', 'Fields').click();
    cy.get('.mobile-navigation otp-navigation').contains('a', 'Producers').click();
    cy.location('pathname').should('include', '/private/fields/operators');

    cy.get('button').contains('New producer').click();
    cy.get('otp-action-bar').contains('button', 'Cancel').should('be.visible');
    cy.get('input#name_field').type('! Mobile Producer');
    cy.get('select#type_field').select('Estate');
    cy.get('otp-action-bar').contains('button', 'Create').click();
    cy.get('otp-table tbody tr:first').should('contain', '! Mobile Producer');

    mainNavigation().contains('a', 'Profile').click();
    cy.location('pathname').should('include', '/private/profile');

    // Profile has a form with an action bar; the navigation must stay usable there.
    cy.get('otp-action-bar').should('be.visible');
    mainNavigation().contains('a', 'Observations').click();
    cy.location('pathname').should('include', '/private/observations');
  });
});
