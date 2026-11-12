// A half-filled new observation is autosaved every 10s to the outbox (IndexedDB) and can be
// resumed from the observations list. Nothing else exercises the draft restore paths.
describe('Observation draft', () => {
  const AUTOSAVE_INTERVAL = 10000;

  // Every entry of the outbox store, read straight from IndexedDB
  const outboxEntries = () => cy.window().then((win) => new Cypress.Promise((resolve, reject) => {
    const request = win.indexedDB.open('otp-observations-tool');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('outbox')) {
        db.close();
        resolve([]);
        return;
      }
      const all = db.transaction('outbox', 'readonly').objectStore('outbox').getAll();
      all.onerror = () => reject(all.error);
      all.onsuccess = () => { db.close(); resolve(all.result); };
    };
  }));

  const clearOutbox = () => cy.window().then((win) => new Cypress.Promise((resolve) => {
    const request = win.indexedDB.deleteDatabase('otp-observations-tool');
    request.onsuccess = resolve;
    request.onerror = resolve;
    request.onblocked = resolve;
  }));

  beforeEach(() => {
    cy.login('ngo_manager@example.com', 'Supersecret1');
    cy.visit('/private/observations');
    clearOutbox();
    // Only the autosave interval is stubbed, so the form itself behaves normally.
    cy.clock(null, ['setInterval']);
    cy.visit('/private/observations/new');
  });

  afterEach(() => {
    clearOutbox();
  });

  it('autosaves a draft and restores it from the list', () => {
    cy.get('select#observation_type').select('Producer');
    cy.get('select#report_field').select('Rapport 13 OGF');
    cy.get('select#country_id').select('Cameroon');
    cy.selectOption('operator_id', 'CFC');
    cy.get('select[name=subcategory_id]').select('Overharvesting');
    cy.chooseOption('Did this observation occur at a physical place?', 'NO');
    cy.get('#location_information').clear().type('Draft location info');
    cy.get('#details_field').clear().type('Draft details');

    // Let the autosave interval fire
    cy.tick(AUTOSAVE_INTERVAL + 100);
    outboxEntries().should((entries) => {
      expect(entries).to.have.length(1);
      expect(entries[0].status).to.equal('draft');
      expect(entries[0].draft.details).to.equal('Draft details');
    });

    // Leaving and coming back lists the draft, which can be continued
    cy.visit('/private/observations');
    cy.get('.outbox .outbox-entry').should('have.length', 1).contains('button', 'Continue').click();
    cy.location('pathname').should('include', '/private/observations/new');

    cy.get('select#observation_type').find('option').contains('Producer').should('be.selected');
    cy.get('select#country_id').find('option').contains('Cameroon').should('be.selected');
    cy.expectSelectedOption('operator_id', 'CFC');
    cy.get('select[name=subcategory_id]').find('option').contains('Overharvesting').should('be.selected');
    cy.get('#location_information').should('have.value', 'Draft location info');
    cy.get('#details_field').should('have.value', 'Draft details');

    // "New observation" starts from an empty form; an empty form is never saved, so the
    // draft is neither overwritten nor joined by an empty one
    cy.visit('/private/observations');
    cy.get('a').contains('New observation').click();
    cy.location('pathname').should('include', '/private/observations/new');
    // Nothing is restored, so the form stops at the first question
    cy.get('select#observation_type').should('exist');
    cy.get('#details_field').should('not.exist');
    cy.tick(AUTOSAVE_INTERVAL + 100);
    outboxEntries().should((entries) => {
      expect(entries).to.have.length(1);
      expect(entries[0].draft.details).to.equal('Draft details');
    });

    cy.visit('/private/observations');
    cy.get('.outbox .outbox-entry').contains('button', 'Continue').click();
    cy.get('#details_field').should('have.value', 'Draft details');

    // Deleting the draft from the list removes it from the device
    cy.visit('/private/observations');
    cy.get('.outbox .outbox-entry').contains('button', 'Delete').click();
    cy.confirmDialog(/Delete this observation from this device/);
    cy.get('.outbox').should('not.exist');
    outboxEntries().should('have.length', 0);
  });
});
