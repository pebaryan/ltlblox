/// <reference types="cypress" />

describe('Ltlblox E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/', { timeout: 30000 });
  });

  describe('Initial Load', () => {
    it('should load the application successfully', () => {
      cy.contains('h3', 'LTL Constructor', { timeout: 10000 }).should('be.visible');
    });

    it('should display the default formula', () => {
      cy.get('code').should('contain', '◇');
      cy.get('code').should('contain', 'q');
    });

    it('should display the 3D canvas', () => {
      cy.get('th-canvas').should('exist');
    });

    it('should display the trace editor', () => {
      cy.contains(/Trace Editor|Step/i).should('be.visible');
    });

    it('should display playback controls', () => {
      cy.contains('button', /Play|Next/i).should('be.visible');
    });

    it('should display available variables', () => {
      cy.contains('button', 'p').should('be.visible');
      cy.contains('button', 'q').should('be.visible');
      cy.contains('button', 'r').should('be.visible');
    });
  });

  describe('Formula Construction', () => {
    it('should reset formula to proposition', () => {
      cy.contains('button', 'RESET TO P').click();
      cy.get('code').should('contain', 'p');
    });

    it('should wrap formula with Always operator', () => {
      cy.contains('button', '□').click();
      cy.get('code').invoke('text').should('match', /□\(/);
    });

    it('should wrap formula with Eventually operator', () => {
      cy.contains('button', '◇').click();
      cy.get('code').invoke('text').should('match', /◇\(/);
    });

    it('should wrap formula with Next operator', () => {
      cy.contains('button', '○').click();
      cy.get('code').invoke('text').should('match', /○\(/);
    });

    it('should wrap formula with Not operator', () => {
      cy.contains('button', '¬').click();
      cy.get('code').invoke('text').should('match', /¬\(/);
    });

    it('should add AND operator', () => {
      cy.contains('button', '∧').click();
      cy.on('window:prompt', () => false);
      cy.get('code').invoke('text').should('match', /∧/);
    });

    it('should add OR operator', () => {
      cy.contains('button', '∨').click();
      cy.on('window:prompt', () => false);
      cy.get('code').invoke('text').should('match', /∨/);
    });

    it('should add UNTIL operator', () => {
      cy.contains('button', '𝒰').click();
      cy.on('window:prompt', () => false);
      cy.get('code').invoke('text').should('match', /𝒰/);
    });
  });

  describe('Variable Selection', () => {
    it('should allow selecting a variable', () => {
      cy.contains('button', 'q').click();
      cy.get('code').should('contain', '◇(q)');
    });

    it('should update formula when variable changes', () => {
      cy.contains('button', 'p').click();
      cy.get('code').should('contain', '◇(p)');
    });
  });

  describe('Time Playback', () => {
    it('should show current time step as 0 initially', () => {
      cy.contains('0').should('be.visible');
    });

    it('should increment time with Next button', () => {
      cy.contains('button', /Next|▶|>/i).click();
      cy.contains('1').should('be.visible');
    });

    it('should use slider to change time', () => {
      cy.get('input[type="range"]').invoke('val', '2').trigger('input');
      cy.contains('2').should('be.visible');
    });
  });

  describe('Trace Editing', () => {
    it('should display trace values as toggle buttons', () => {
      cy.contains('button', /true|false/i).should('have.length.at.least', 4);
    });
  });

  describe('3D Visualization', () => {
    it('should render lego blocks in the scene', () => {
      cy.get('app-lego-block').should('have.length.at.least', 1);
    });

    it('should have multiple blocks for nested formulas', () => {
      cy.contains('button', '□').click();
      cy.get('app-lego-block').should('have.length.at.least', 2);
    });

    it('should display orbit controls', () => {
      cy.get('th-orbitControls').should('exist');
    });

    it('should display grid helper', () => {
      cy.get('th-gridHelper').should('exist');
    });
  });

  describe('Edge Cases', () => {
    it('should handle last time step gracefully', () => {
      cy.get('input[type="range"]').invoke('val', '3').trigger('input');
      cy.contains('3').should('be.visible');
    });

    it('should handle formula with single proposition', () => {
      cy.contains('button', 'RESET TO P').click();
      cy.get('code').should('contain', 'p');
      cy.get('app-lego-block').should('have.length', 1);
    });

    it('should handle deeply nested formulas', () => {
      cy.contains('button', '□').click();
      cy.contains('button', '◇').click();
      cy.contains('button', '□').click();
      cy.get('app-lego-block').should('have.length', 3);
    });
  });
});
