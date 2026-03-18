describe('shipments', () => {
  beforeEach(() => {
    cy.visit('/admin');
    cy.get('[id="_username"]').type('sylius');
    cy.get('[id="_password"]').type('sylius');
    cy.get('.primary').click();
  });
  // Remove .only and implement others test cases!
  it.only('ship a ready shipment', () => {
    // Click in shipments in side menu
    cy.clickInFirst('a[href="/admin/shipments/"]');
    // Type in value input to search for specify shipment
    cy.get('.ui > .sylius-filters > .sylius-filters__field > .field > #criteria_state').select('ready');
    // Click in filter blue button
    cy.get('*[class^="ui blue labeled icon button"]').click();
    // Click in Ship of the first shipment listed
    cy.clickInFirst('*[class^="ui labeled icon teal button"]');

    // Assert that shipment has been shipped
    cy.get('body').should('contain', 'Shipment has been successfully shipped.');
  });
  it('test case 2', () => {
    // Implement your test case 2 code here
  });
  it('test case 3', () => {
    // Implement your test case 3 code here
  });

  // Implement the remaining test cases in a similar manner
});
