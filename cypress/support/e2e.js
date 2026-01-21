// Cypress support file
beforeEach(() => {
  cy.request('/').then((response) => {
    expect(response.status).to.be.oneOf([200, 304]);
  });
  cy.visit('/');
});
