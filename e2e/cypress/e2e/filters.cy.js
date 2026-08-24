// The options of the Type/Status style filters are built from translations and assigned
// asynchronously, so an empty select is a real regression rather than a missing seed.
//
// Row counts come from the fixtures: OGF (ngo_manager's observer) has 44 observations,
// 3 of them producer ones and 5 under "Poor tax and fine collection".
describe('Table filters', () => {
  const PAGE_SIZE = 10;
  const openFilters = () => cy.get('otp-filters button.add-filter').click();
  const applyFilters = () => cy.get('otp-modal').find('button').contains('Done').click();
  const optionTexts = ($options) => [...$options].map(option => option.textContent.trim());

  beforeEach(() => {
    cy.login('ngo_manager@example.com', 'Supersecret1');
  });

  describe('Observations', () => {
    beforeEach(() => {
      cy.visit('/private/observations');
    });

    it('lists the options of the filters built from translations', () => {
      openFilters();

      cy.get('#filter-modal-observation-type option').should(($options) => {
        expect(optionTexts($options)).to.deep.equal(['Not filtering', 'Governance', 'Producer']);
      });

      cy.get('#filter-modal-validation-status option').should(($options) => {
        expect(optionTexts($options)).to.deep.equal([
          'Not filtering',
          'Created',
          'Ready for QC',
          'QC in progress',
          'Needs revision',
          'Ready for publication',
          'Published (no comments)',
          'Published (not modified)',
          'Published (modified)'
        ]);
      });
    });

    it('fetches the options of the filters that come from the API', () => {
      openFilters();

      cy.get('#filter-modal-category-id option').should('have.length.at.least', 5);
      cy.get('#filter-modal-category-id').should('contain', 'Transparency').and('contain', 'Timber processing');

      // Country is scoped to the observer, and OGF only covers the one
      cy.get('#filter-modal-country-id option').should(($options) => {
        expect(optionTexts($options)).to.deep.equal(['Not filtering', 'Democratic Republic of the Congo']);
      });
    });

    it('narrows the table by Type', () => {
      // OGF is seeded with 44 observations, so the first page is full
      cy.get('otp-table tbody tr').should('have.length', PAGE_SIZE);

      openFilters();
      cy.get('#filter-modal-observation-type').select('Producer');
      applyFilters();
      // Only 3 of them are producer ones
      cy.get('otp-table tbody tr').should('have.length', 3);

      openFilters();
      cy.get('#filter-modal-observation-type').select('Governance');
      applyFilters();
      cy.get('otp-table tbody tr').should('have.length', PAGE_SIZE);
    });

    it('narrows the table by Subcategory', () => {
      cy.get('otp-table tbody tr').should('have.length', PAGE_SIZE);

      openFilters();
      cy.get('#filter-modal-subcategory').select('Poor tax and fine collection');
      applyFilters();

      // 5 of the seeded observations carry that subcategory
      cy.get('otp-table tbody tr').should('have.length', 5);
    });

    it('keeps showing an applied filter once the modal is closed', () => {
      openFilters();
      cy.get('#filter-modal-observation-type').select('Governance');
      applyFilters();

      cy.get('otp-filters select[aria-label=Type]').should('have.value', 'government');
      cy.get('otp-filters select[aria-label=Type] option:selected').should('have.text', 'Governance');
    });

    it('restores an applied filter, and its label, after a reload', () => {
      cy.intercept('GET', '**/observations?*category-id*').as('categoryFiltered');

      openFilters();
      cy.get('#filter-modal-category-id').select('Transparency');
      applyFilters();
      cy.get('otp-filters select[aria-label=Category] option:selected').should('have.text', 'Transparency');

      // The state is only saved once the filtered query comes back
      cy.wait('@categoryFiltered');
      cy.reload();

      // The options of an API-backed filter are only fetched once something displays
      // them, which a restored value has to trigger or the select renders blank
      cy.get('otp-filters select[aria-label=Category] option:selected').should('have.text', 'Transparency');
    });

    it('drops the filter again when it is reset', () => {
      openFilters();
      cy.get('#filter-modal-observation-type').select('Governance');
      applyFilters();
      cy.get('otp-filters select[aria-label=Type]').should('exist');

      openFilters();
      cy.get('otp-modal').find('button').contains('Reset filters').click();
      cy.get('otp-filters select[aria-label=Type]').should('not.exist');
    });
  });

  describe('Advanced fields', () => {
    // These filters are required and default to "operator", so they show up next to the
    // button straight away — with no options there is nothing for the select to display
    it('shows the default value of the required Type filter', () => {
      ['categories', 'subcategories'].forEach((page) => {
        cy.visit(`/private/fields/${page}`);
        cy.get('otp-filters select[aria-label=Type] option:selected').should('have.text', 'Producer');
      });
    });

    it('lists the options of the Complete filter on the laws', () => {
      cy.visit('/private/fields/laws');
      openFilters();

      cy.get('#filter-modal-complete option').should(($options) => {
        expect(optionTexts($options)).to.deep.equal(['Not filtering', 'Complete', 'Incomplete']);
      });
    });
  });
});
