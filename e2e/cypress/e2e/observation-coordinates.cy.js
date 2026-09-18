// The observation form accepts coordinates in four formats and converts them to decimal.
// Other specs always answer "NO" to the physical place question, so none of this runs.
describe('Observation coordinates', () => {
  const invalidMessage = () => cy.get('otp-observation-detail').contains('The coordinates are invalid');

  beforeEach(() => {
    cy.login('ngo_manager@example.com', 'Supersecret1');
    cy.visit('/private/observations/new');

    cy.get('select#observation_type').select('Producer');
    cy.get('select#report_field').select('Rapport 13 OGF');
    cy.get('select#country_id').select('Cameroon');
    cy.selectOption('operator_id', 'CFC');
    cy.get('select[name=subcategory_id]').select('Overharvesting');
    cy.chooseOption('Did this observation occur at a physical place?', 'YES');
  });

  it('accepts each coordinates format and flags invalid values', () => {
    // Decimal
    cy.get('select#coords_format_field').select('Decimal');
    cy.get('input#latitude_field').clear().type('4.05').blur();
    cy.get('input#longitude_field').clear().type('9.7').blur();
    invalidMessage().should('not.exist');

    // Degrees and decimal minutes
    cy.get('select#coords_format_field').select('Degrees and decimal minutes');
    cy.get('input#latitude_field').clear().type('4° 3.0′ N').blur();
    cy.get('input#longitude_field').clear().type('9° 42.0′ E').blur();
    invalidMessage().should('not.exist');

    // Sexagesimal
    cy.get('select#coords_format_field').select('Sexagesimal');
    cy.get('input#latitude_field').clear().type('4° 3′ 0″ N').blur();
    cy.get('input#longitude_field').clear().type('9° 42′ 0″ E').blur();
    invalidMessage().should('not.exist');

    // UTM needs a hemisphere and a zone as well
    cy.get('select#coords_format_field').select('UTM');
    cy.get('select#hemisphere_field').should('be.visible').select('North');
    cy.get('input#zone_field').clear().type('32');
    cy.get('input#latitude_field').clear().type('633000').blur();
    cy.get('input#longitude_field').clear().type('448000').blur();
    invalidMessage().should('not.exist');

    // Nonsense in a numeric format is reported
    cy.get('select#coords_format_field').select('Decimal');
    cy.get('input#latitude_field').clear().type('not-a-latitude').blur();
    cy.get('input#longitude_field').clear().type('9.7').blur();
    invalidMessage().should('be.visible');
  });
});
