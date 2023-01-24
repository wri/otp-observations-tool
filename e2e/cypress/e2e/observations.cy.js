describe('Observations', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/');
    cy.login('tsubik+ngomanager@gmail.com', 'secret');
    cy.reload();
  })

  it('can add a new producer observation and submit it for review', () => {
    cy.get('a').contains('New observation').click();
    cy.get('select#observation_type').select('Producer');
    cy.get('select#report_field').select('2013 Rapport 1 OGF');
    cy.selectOption('operator_id', 'BONI');
    cy.selectOption('additional_observers', ['AOE', 'CED']);
    cy.selectOption('relevant_operators', ['CFT', 'ENRA']);
    cy.get('select[name=subcategory_id]').select('Overharvesting');
    cy.chooseOption('Did this observation occur at a physical place?', 'NO');
    cy.get('#location_information').clear().type('Custom info about location');
    cy.get('#details_field').clear().type('Here are some custom observation details');
    cy.get('select#evidence_type').select('Company documents');

    cy.get('#evidence_title').clear().type('Evidence number 1');
    cy.get('input#evidence_field').attachFile('test_document.docx');
    cy.get('button').contains('Add to list').click();
    cy.get('#evidence_title').clear().type('Evidence number 2');
    cy.get('input#evidence_field').attachFile('test_document.docx');
    cy.get('button').contains('Add to list').click();

    cy.get('ul.documents-list').find('li').contains('Evidence number 1');
    cy.get('ul.documents-list').find('li').contains('Evidence number 2');

    cy.chooseOption('Severity', 'between 25% - 50% beyond the authorization');

    cy.get('#action_taken').clear().type('Actions taken by producer');
    cy.get('#concern_opinion').clear().type('Here are some producer comments');
    cy.get('#pv_field').clear().type('Citation example');
    cy.get('#litigation_status').clear().type('Litigation status example');

    cy.selectOption('law_field', 'Dépassement de volume');
    cy.get('button').contains('Create').click();
    cy.then(() => {
      cy.once('window:alert', (str) => {
        expect(str).to.match(/The observation has been successfully created/);
      });
    });

    // let's verify if everyting was correctly saved
    cy.get('otp-table tbody tr:first').find('button[aria-label=Edit]').click();
    cy.location('pathname').should('include', '/observations/edit');

    cy.get('select#observation_type').find('option').contains('Producer').should('be.selected');
    cy.get('select#report_field').find('option').contains('2013 Rapport 1 OGF').should('be.selected');
    let observationId;
    cy.get('#id_field').invoke('val').then((value) => {
      observationId = value;
    });
    cy.expectSelectedOption('operator_id', 'BONI');
    cy.expectSelectedOption('additional_observers', ['AOE', 'CED']);
    cy.expectSelectedOption('relevant_operators', ['CFT', 'ENRA']);
    cy.get('select[name=subcategory_id]').find('option').contains('Overharvesting').should('be.selected');

    cy.expectChosenOption('Did this observation occur at a physical place?', 'NO');
    cy.get('#location_information').should('have.value', 'Custom info about location');
    cy.get('#details_field').should('have.value', 'Here are some custom observation details');
    cy.get('select#evidence_type').find('option').contains('Company documents').should('be.selected');

    cy.get('ul.documents-list').find('li').contains('Evidence number 1').should('be.visible');
    cy.get('ul.documents-list').find('li').contains('Evidence number 2').should('be.visible');

    cy.expectChosenOption('Severity', 'between 25% - 50% beyond the authorization');

    cy.get('#action_taken').should('have.value', 'Actions taken by producer');
    cy.get('#concern_opinion').should('have.value', 'Here are some producer comments');
    cy.get('#pv_field').should('have.value', 'Citation example');
    cy.get('#litigation_status').should('have.value', 'Litigation status example');

    cy.expectSelectedOption('law_field', 'Dépassement de volume');

    cy.get('#last_modification_by').should('have.value', 'Tomasz Operator');

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

  it('can add a new governance observation and submit it for review', () => {
    cy.get('a').contains('New observation').click();
    cy.get('select#observation_type').select('Governance');
    cy.get('select#report_field').select('2013 Rapport 1 OGF');
    cy.selectOption('government_id', ['DGF', 'DGRAD']);
    cy.get('select[name=subcategory_id]').select('Poor control/follow-up');
    cy.selectOption('additional_observers', ['AOE', 'CED']);
    cy.selectOption('relevant_operators', ['CFT', 'ENRA']);
    cy.get('#details_field').clear().type('Here are some custom observation details');

    cy.get('select#evidence_type').select('Company documents');
    cy.get('#evidence_title').clear().type('Evidence number 1');
    cy.get('input#evidence_field').attachFile('test_document.docx');
    cy.get('button').contains('Add to list').click();
    cy.get('#evidence_title').clear().type('Evidence number 2');
    cy.get('input#evidence_field').attachFile('test_document.docx');
    cy.get('button').contains('Add to list').click();
    cy.get('ul.documents-list').find('li').contains('Evidence number 1');
    cy.get('ul.documents-list').find('li').contains('Evidence number 2');

    cy.chooseOption('Severity', 'No enforcement mission required undertaken');
    cy.get('#action_taken').clear().type('Actions taken by government');
    cy.get('#concern_opinion').clear().type('Here are some comments');
    cy.get('button').contains('Create').click();
    cy.then(() => {
      cy.once('window:alert', (str) => {
        expect(str).to.match(/The observation has been successfully created/);
      });
    });

    // let's verify if everyting was correctly saved
    cy.get('.filter select[aria-label=Type]').select('Governance');
    cy.get('otp-table tbody tr:first').find('button[aria-label=Edit]').click();
    cy.location('pathname').should('include', '/observations/edit');

    cy.get('select#observation_type').find('option').contains('Governance').should('be.selected');
    cy.get('select#report_field').find('option').contains('2013 Rapport 1 OGF').should('be.selected');
    let observationId;
    cy.get('#id_field').invoke('val').then((value) => {
      observationId = value;
    });
    cy.expectSelectedOption('government_id', ['DGF', 'DGRAD']);
    cy.get('select[name=subcategory_id]').find('option').contains('Poor control/follow-up').should('be.selected');
    cy.expectSelectedOption('additional_observers', ['AOE', 'CED']);
    cy.expectSelectedOption('relevant_operators', ['CFT', 'ENRA']);
    cy.get('#details_field').should('have.value', 'Here are some custom observation details');

    cy.get('select#evidence_type').find('option').contains('Company documents').should('be.selected');
    cy.get('ul.documents-list').find('li').contains('Evidence number 1').should('be.visible');
    cy.get('ul.documents-list').find('li').contains('Evidence number 2').should('be.visible');

    cy.expectChosenOption('Severity', 'No enforcement mission required undertaken');
    cy.get('#action_taken').should('have.value', 'Actions taken by government');
    cy.get('#concern_opinion').should('have.value', 'Here are some comments');
    cy.get('#last_modification_by').should('have.value', 'Tomasz Operator');

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
  });
})
