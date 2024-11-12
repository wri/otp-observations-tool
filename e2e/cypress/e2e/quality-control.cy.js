describe('Observations - Quality Control', () => {
  beforeEach(() => {
    cy.recordNetworkActivity();
  })

  afterEach(() => {
    cy.saveNetworkActivity('observations-quality-control');
    cy.resetDB();
  });

  it('full review cycle', () => {
    cy.login('ngo_manager@example.com', 'Supersecret1');
    cy.visit('/');
    // create an observation
    cy.get('a').contains('New observation', { timeout: 10000 }).click();
    cy.get('select#observation_type').select('Producer');
    cy.get('select#report_field').select('Rapport 13 OGF');
    cy.get('select#country_id').select('Cameroon');
    cy.selectOption('operator_id', 'CFC');
    cy.get('select[name=subcategory_id]').select('Overharvesting');
    cy.chooseOption('Did this observation occur at a physical place?', 'NO');
    cy.get('#location_information').clear().type('Custom info about location');
    cy.get('#details_field').clear().type('Here are some custom observation details');
    // evidences
    cy.get('select#evidence_type').select('No evidence');
    cy.chooseOption('Severity', 'between 25% - 50% beyond the authorization');
    cy.get('#action_taken').clear().type('Actions taken by producer');
    cy.get('#concern_opinion').clear().type('Here are some producer comments');
    cy.get('#pv_field').clear().type('Citation example');
    cy.get('#litigation_status').clear().type('Litigation status example');
    cy.selectOption('law_field', 'Exploitation par autorisation');
    cy.get('button').contains('Submit for review').click();

    // first observation should be in Ready for QC1 state
    cy.get('otp-table tbody tr:first').contains('Ready for QC1');
    // end of creating observation

    // log out and log in as reviewer
    cy.get('button').contains('Log out').click();
    cy.login('ngo_reviewer@example.com', 'Supersecret1');
    cy.visit('/');
    cy.get('select[data-test-id="observer-context-select"]').select('OGF');

    // review the observation
    cy.get('otp-table tbody tr:first').contains('Ready for QC1'); // .find('button[aria-label=Edit]').click();
    cy.get('otp-table tbody tr:first').find('button[aria-label=Info]').click();

    cy.contains('This observation is ready for quality control.');
    cy.get('button').contains('Start QC').click();
    cy.contains('Please review this observation and either accept it or reject it with making a comment for a monitor.');
    cy.get('button').contains('Reject').click();
    cy.get('#explain_qc_rejection').clear().type('This is the reason of putting this observation to Rejected state');
    cy.get('button').contains('Submit Rejection').click();
    cy.get('otp-table tbody tr:first').contains('Rejected');

    // make "edits" and resubmit
    cy.get('button').contains('Log out').click();
    cy.login('ngo_manager@example.com', 'Supersecret1');
    cy.visit('/');

    cy.get('otp-table tbody tr:first').contains('Rejected');
    cy.get('otp-table tbody tr:first').find('button[aria-label=Info]').click();

    cy.contains('The observation has been reviewed and received some comments');
    cy.contains('This is the reason of putting this observation to Rejected state');
    cy.get('button').contains('Submit for review').click();
    cy.get('otp-table tbody tr:first').contains('Ready for QC1');  // back in qc1 state

    cy.get('button').contains('Log out').click();
    cy.login('ngo_reviewer@example.com', 'Supersecret1');
    cy.visit('/');

    // review the observation again
    cy.get('select[data-test-id="observer-context-select"]').select('OGF');
    cy.get('otp-table tbody tr:first').contains('Ready for QC1');
    cy.get('otp-table tbody tr:first').find('button[aria-label=Info]').click();

    cy.contains('This observation is ready for quality control.');
    cy.get('button').contains('Start QC').click();
    cy.contains('Please review this observation and either accept it or reject it with making a comment for a monitor.');
    cy.get('button').contains('Accept').click();

    cy.get('otp-table tbody tr:first').contains('Ready for QC2'); // now ready for qc2
    cy.get('otp-table tbody tr:first').find('button[aria-label=Info]').click();
    cy.contains('This observation has been submitted.');

    // now the admin will do a QC2, it is also possible to do it in the obs tool
    cy.get('button').contains('Log out').click();
    cy.login('admin@example.com', 'Supersecret1');
    cy.visit('/');

    cy.get('select[data-test-id="observer-context-select"]').select('OGF');
    cy.get('otp-table tbody tr:first').contains('Ready for QC2'); // now ready for qc2
    cy.get('otp-table tbody tr:first').find('button[aria-label=Info]').click();

    cy.get('button').contains('Start QC').click();
    cy.contains('Please review this observation and either accept it or reject it with making a comment for a monitor.');
    cy.get('button').contains('Reject').click();
    cy.get('#explain_qc_rejection').clear().type('This is the reason of putting this observation to Needs revision state');
    cy.get('button').contains('Submit Rejection').click();
    cy.get('otp-table tbody tr:first').contains('Needs revision');

    // back to manager and resubmit
    cy.get('button').contains('Log out').click();
    cy.login('ngo_manager@example.com', 'Supersecret1');
    cy.visit('/');

    cy.get('otp-table tbody tr:first').contains('Needs revision');
    cy.get('otp-table tbody tr:first').find('button[aria-label=Info]').click();

    cy.contains('The observation has been reviewed and received some comments');
    cy.contains('This is the reason of putting this observation to Needs revision state');
    cy.get('button').contains('Amend').click();
    cy.get('button').contains('Submit for review').click();

    cy.get('otp-table tbody tr:first').contains('Ready for QC2'); // now ready for qc2

    // let's review it again
    cy.get('button').contains('Log out').click();
    cy.login('admin@example.com', 'Supersecret1');
    cy.visit('/');

    cy.get('select[data-test-id="observer-context-select"]').select('OGF');
    cy.get('otp-table tbody tr:first').contains('Ready for QC2'); // now ready for qc2
    cy.get('otp-table tbody tr:first').find('button[aria-label=Info]').click();

    cy.get('button').contains('Start QC').click();
    cy.contains('Please review this observation and either accept it or reject it with making a comment for a monitor.');
    cy.get('button').contains('Accept').click();

    cy.location('pathname').should('eq', '/private/observations')
    cy.get('otp-table tbody tr:first').contains('Ready for publication'); // now ready for qc2
    cy.get('otp-table tbody tr:first').find('button[aria-label=Info]').click();
    cy.contains('The observation has been reviewed and is now ready to publish.');

    // log in as ngo manager and publish the observation
    cy.get('button').contains('Log out').click();
    cy.login('ngo_manager@example.com', 'Supersecret1');
    cy.visit('/');

    cy.get('otp-table tbody tr:first').contains('Ready for publication'); // now ready for qc2
    cy.get('otp-table tbody tr:first').find('button[aria-label=Info]').click();
    cy.get('button').contains('Publish').click();
    cy.get('otp-table tbody tr:first').contains('Published (no comments)');
  })
})
