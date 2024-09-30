describe('Observations', () => {
  beforeEach(() => {
    cy.recordNetworkActivity();
    cy.login('ngo_manager@example.com', 'Supersecret1');
    cy.visit('/');
  })

  afterEach(() => {
    cy.saveNetworkActivity('observations');
    cy.resetDB();
  });

  it('can add a new producer observation and submit it for review', () => {
    cy.get('a').contains('New observation', { timeout: 10000 }).click();
    cy.get('select#observation_type').select('Producer');
    cy.get('select#report_field').select('Rapport 13 OGF');
    cy.get('select#country_id').select('Cameroon');
    cy.selectOption('operator_id', 'CFC');
    cy.expectSelectedOption('additional_observers', ['OCEAN', 'RENOI']); // from selected report
    cy.selectOption('relevant_operators', ['LOREMA', 'SAB']);
    cy.get('select[name=subcategory_id]').select('Overharvesting');
    cy.chooseOption('Did this observation occur at a physical place?', 'NO');
    cy.get('#location_information').clear().type('Custom info about location');
    cy.get('#details_field').clear().type('Here are some custom observation details');
    // evidences
    cy.get('select#evidence_type').select('Uploaded documents');
    cy.get('[data-test-id="documents-list-selected"]').contains('No evidence').should('be.visible');
    cy.get('[data-test-id="documents-list-report"] ul li').should('have.length', 5);
    cy.get('[data-test-id="documents-list-report"] ul li').contains('li', 'Lettre').find('button').contains('Use as evidence').click();
    cy.get('[data-test-id="documents-list-report"] ul').find('li').contains('Lettre').should('not.exist');
    cy.get('[data-test-id="documents-list-selected"] ul').find('li').contains('Lettre').should('be.visible');
    cy.get('[data-test-id="documents-list-selected"] ul').find('li').contains('li', 'Lettre').contains('Already uploaded');
    // let's remove it and add it again
    // TODO: fix backend missing attachment and then add it again
    cy.get('[data-test-id="documents-list-selected"] ul li').contains('li', 'Lettre').find('button').contains('Remove').click();
    cy.get('[data-test-id="documents-list-selected"]').contains('No evidence').should('be.visible');
    //cy.get('[data-test-id="documents-list-report"] ul li').contains('li', 'Lettre').find('button').contains('Use as evidence').click();
    //cy.get('[data-test-id="documents-list-selected"] ul').find('li').contains('Lettre').should('be.visible');
    // upload a new evidence
    cy.get('otp-tabs').find('li').contains('Upload a new evidence').click();
    cy.get('select#document_type').select('Photos');
    cy.get('#evidence_title').clear().type('Evidence photo');
    cy.get('input#evidence_field').attachFile('test_document.docx');
    cy.get('[data-test-id="documents-upload-new"]').find('button').contains('Use as evidence').click();
    // verify it was added
    cy.get('[data-test-id="documents-list-selected"] ul').find('li').contains('Evidence photo').should('be.visible');
    cy.get('[data-test-id="documents-list-selected"] ul').find('li').contains('li', 'Evidence photo').contains('To upload');

    cy.chooseOption('Severity', 'between 25% - 50% beyond the authorization');

    cy.get('#action_taken').clear().type('Actions taken by producer');
    cy.get('#concern_opinion').clear().type('Here are some producer comments');
    cy.get('#pv_field').clear().type('Citation example');
    cy.get('#litigation_status').clear().type('Litigation status example');

    cy.selectOption('law_field', 'Exploitation par autorisation');
    const alert = cy.stub().as("alert");
    cy.then(() => { cy.on('window:alert', alert); });
    cy.get('button').contains('Create').click();
    cy.get("@alert").should("have.been.calledWithMatch", /The observation has been successfully created/);
    cy.then(() => alert.reset());
    // let's verify if everyting was correctly saved
    cy.get('otp-table tbody tr:first').find('button[aria-label=Edit]', { timeout: 10000 }).click();
    cy.location('pathname').should('include', '/observations/edit');
    cy.get('select#observation_type').find('option').contains('Producer').should('be.selected');
    cy.get('select#report_field').find('option').contains('Rapport 13 OGF').should('be.selected');
    cy.get('select#country_id').find('option').contains('Cameroon').should('be.selected');
    let observationId;
    cy.get('#id_field').invoke('val').then((value) => {
      observationId = value;
    });
    cy.expectSelectedOption('operator_id', 'CFC');
    cy.expectSelectedOption('additional_observers', ['OCEAN', 'RENOI']);
    cy.expectSelectedOption('relevant_operators', ['LOREMA', 'SAB']);
    cy.get('select[name=subcategory_id]').find('option').contains('Overharvesting').should('be.selected');

    cy.expectChosenOption('Did this observation occur at a physical place?', 'NO');
    cy.get('#location_information').should('have.value', 'Custom info about location');
    cy.get('#details_field').should('have.value', 'Here are some custom observation details');
    cy.get('select#evidence_type').find('option').contains('Uploaded documents').should('be.selected');
    // cy.get('[data-test-id="documents-list-selected"] ul').find('li').contains('Lettre').should('be.visible');
    cy.get('[data-test-id="documents-list-selected"] ul').find('li').contains('Evidence photo').should('be.visible');

    cy.expectChosenOption('Severity', 'between 25% - 50% beyond the authorization');

    cy.get('#action_taken').should('have.value', 'Actions taken by producer');
    cy.get('#concern_opinion').should('have.value', 'Here are some producer comments');
    cy.get('#pv_field').should('have.value', 'Citation example');
    cy.get('#litigation_status').should('have.value', 'Litigation status example');

    cy.expectSelectedOption('law_field', 'Exploitation par autorisation');

    cy.get('#last_modification_by').should('have.value', 'NGO Manager');

    cy.get('button').contains('Submit for review').click();
    cy.then(() => {
      cy.once('window:confirm', (str) => {
        expect(str).to.match(/The observation will be submitted for revision. Do you want to continue/);
        return true;
      })
    })

    cy.get('button.go-to-button').click();
    cy.then(() => cy.get('#go-to-observation-id').clear().type(observationId))
    cy.get('button').contains('Go to...').click();

    cy.contains(
      'This observation has been submitted. Once reviewed, you will be able to publish it.'
    ).should('be.visible');
  })

  it('can add a new producer directly from observation form', () => {
    cy.get('a').contains('New observation', { timeout: 10000 }).click();
    cy.get('select#observation_type').select('Producer');
    cy.get("button:contains('Add a new producer to the list')").first().click();
    cy.get('input#name_field').type('New Producer');
    cy.get('select#type_field').select('Estate');
    cy.get('button').contains('Create').click();
    cy.expectSelectedOption('operator_id', 'New Producer');

    cy.get("button:contains('Add a new producer to the list')").last().click();
    cy.get('input#name_field').type('Another New Producer');
    cy.get('select#type_field').select('Estate');
    cy.get('button').contains('Create').click();
    cy.expectSelectedOption('relevant_operators', ['Another New Producer']);
  })

  it('can add a new governance observation and submit it for review', () => {
    cy.get('a').contains('New observation', { timeout: 10000 }).click();
    cy.get('select#observation_type').select('Governance');
    cy.get('select#report_field').select('Upload a new report');
    cy.get('input#report_file').attachFile('test_document.docx');
    cy.get('#report_title').clear().type('New uploaded report');
    cy.selectDate('report_date', '2023-12-30');
    cy.selectOption('additional_observers', ['CADDE', 'CAGDF']);
    cy.selectOption('government_id', ['DGF', 'DGRAD']);
    cy.get('select[name=subcategory_id]').select('Poor control/follow-up');
    cy.get('#details_field').clear().type('Here are some custom observation details');
    cy.get('select#evidence_type').select('No evidence');
    cy.chooseOption('Severity', 'No enforcement mission required undertaken');
    cy.get('#action_taken').clear().type('Actions taken by government');
    cy.get('#concern_opinion').clear().type('Here are some comments');

    const alert = cy.stub().as("alert");
    cy.then(() => { cy.on('window:alert', alert); });
    cy.get('button').contains('Create').click();
    cy.get("@alert").should("have.been.calledWithMatch", /The observation has been successfully created/);

    // let's verify if everyting was correctly saved
    cy.get('otp-table tbody tr:first').find('button[aria-label=Edit]').click();
    cy.location('pathname').should('include', '/observations/edit');

    cy.get('select#observation_type').find('option').contains('Governance').should('be.selected');
    cy.get('select#report_field').find('option').contains('New uploaded report').should('be.selected');
    cy.expectSelectedOption('additional_observers', ['CADDE', 'CAGDF']);
    let observationId;
    cy.get('#id_field').invoke('val').then((value) => {
      observationId = value;
    });
    cy.expectSelectedOption('government_id', ['DGF', 'DGRAD']);
    cy.get('select[name=subcategory_id]').find('option').contains('Poor control/follow-up').should('be.selected');
    cy.get('#details_field').should('have.value', 'Here are some custom observation details');

    cy.get('select#evidence_type').find('option').contains('No evidence').should('be.selected');
    // let's change evidence to Evidence presented in the report
    cy.get('select#evidence_type').select('Evidence presented in the report');
    cy.get('#evidence_details').clear().type('Page number 44');

    cy.expectChosenOption('Severity', 'No enforcement mission required undertaken');
    cy.get('#action_taken').should('have.value', 'Actions taken by government');
    cy.get('#concern_opinion').should('have.value', 'Here are some comments');
    cy.get('#last_modification_by').should('have.value', 'NGO Manager');

    cy.get('button').contains('Submit for review').click();
    cy.then(() => {
      cy.once('window:confirm', (str) => {
        expect(str).to.match(/The observation will be submitted for revision. Do you want to continue/);
        return true;
      })
    })

    cy.get('button.go-to-button').click();
    cy.then(() => cy.get('#go-to-observation-id').clear().type(observationId))
    cy.get('button').contains('Go to...').click();

    cy.contains(
      'This observation has been submitted. Once reviewed, you will be able to publish it.'
    ).should('be.visible');

    // let's verify if everyting thas was changed is correctly saved
    cy.get('select#evidence_type').find('option').contains('Evidence presented in the report').should('be.selected');
    cy.get('#evidence_details').should('have.value', 'Page number 44');
  });

  it('can add a new government entity directly from observation form', () => {
    cy.get('a').contains('New observation', { timeout: 10000 }).click();
    cy.get('select#observation_type').select('Governance');
    cy.selectOption('government_id', ['DGF', 'DGRAD']);
    cy.get('button').contains('Add a new government entity to the list').click();
    cy.get('input#name_field').type('New Test Entity');
    cy.get('button').contains('Create').click();
    cy.expectSelectedOption('government_id', ['DGF', 'DGRAD', 'New Test Entity']);
  })

  describe('evidences', () => {
    it('added evidence is correctly associated with observation report', () => {
      cy.get('a').contains('New observation', { timeout: 10000 }).click();
      cy.get('select#observation_type').select('Producer');
      cy.get('select#report_field').select('Rapport 10 OGF');
      cy.get('select#evidence_type').select('Uploaded documents');
      cy.get('[data-test-id="documents-list-selected"]').contains('No evidence').should('be.visible');
      // upload a new evidence
      cy.get('otp-tabs').find('li').contains('Upload a new evidence').click();
      cy.get('select#document_type').select('Company documents');
      cy.get('#evidence_title').clear().type('Some document');
      cy.get('input#evidence_field').attachFile('test_document.docx');
      cy.get('[data-test-id="documents-upload-new"]').find('button').contains('Use as evidence').click();
      // verify it was added
      cy.get('[data-test-id="documents-list-selected"] ul').find('li').contains('Some document').should('be.visible');
      cy.get('[data-test-id="documents-list-selected"] ul').find('li').contains('li', 'Some document').contains('To upload');
      cy.get('[data-test-id="documents-list-selected"] ul').find('li').contains('li', 'Some document').contains('Company documents');
      cy.get('button').contains('Create').click();

      cy.get('a').contains('New observation').click();
      cy.get('select#observation_type').select('Producer');
      cy.get('select#report_field').select('Rapport 10 OGF');
      // let's verify if Some document is on the report document list
      cy.get('select#evidence_type').select('Uploaded documents');
      cy.get('[data-test-id="documents-list-report"] ul').find('li').contains('Some document').should('be.visible');
      cy.get('[data-test-id="documents-list-report"] ul').find('li').contains('li', 'Some document').contains('Company documents');
    });

    it('removes evidences associated with previous report when changing report', () => {
      cy.get('a').contains('New observation', { timeout: 10000 }).click();
      cy.get('select#observation_type').select('Producer');
      cy.get('select#report_field').select('Rapport 13 OGF');
      // evidences
      cy.get('select#evidence_type').select('Uploaded documents');
      cy.get('[data-test-id="documents-list-report"] ul li').contains('li', 'Lettre').find('button').contains('Use as evidence').click();
      cy.get('[data-test-id="documents-list-selected"] ul').find('li').contains('Lettre').should('be.visible');
      cy.then(() => {
        cy.once('window:confirm', (str) => {
          expect(str).to.match(/Changing the report will unlink all linked evidences from the previous report. Do you want to continue?/);
          return true;
        })
      })
      cy.get('select#report_field').select('Rapport 10 OGF');
      cy.get('[data-test-id="documents-list-selected"]').contains('No evidence').should('be.visible');
      cy.get('[data-test-id="documents-list-report"]').contains('No evidence').should('be.visible');
    });
  })
})
