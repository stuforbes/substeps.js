'use strict';

describe('substepsTree', function(){

  var _;
  var substepsTree;

  var firstDefinition, secondDefinition, thirdDefinition, stepDefinition

  beforeEach(function(){
    _ = require('underscore');
    substepsTree = require('../../../../lib/parser/substeps/substepsTree')(_).create();

    firstDefinition = {text: 'Given something', pattern: 'Given something', steps: [], fakeExecutor: jasmine.createSpy('given step executor')};
    secondDefinition = {text: 'When something', pattern: 'When something', steps: [], fakeExecutor: jasmine.createSpy('when step executor')};
    thirdDefinition = {text: 'Then something', pattern: 'Then something', steps: [], fakeExecutor: jasmine.createSpy('then step executor')};

    stepDefinition = {text: 'Step Definition', pattern: 'Step Definition', steps: [
      {text: 'Given something'}, {text: 'When something'}, {text: 'Then something'}
    ]};
  });

  it('should update the status of each step in a definition, and bind the target definition to it', function(){

    substepsTree.createSubstepsTreeFrom([firstDefinition, secondDefinition, thirdDefinition, stepDefinition]);

    expect(stepDefinition.steps[0].status).toBe('substeps-target');
    expect(stepDefinition.steps[1].status).toBe('substeps-target');
    expect(stepDefinition.steps[2].status).toBe('substeps-target');

    expect(stepDefinition.steps[0].definition).toBe(firstDefinition);
    expect(stepDefinition.steps[1].definition).toBe(secondDefinition);
    expect(stepDefinition.steps[2].definition).toBe(thirdDefinition);
  });

  it('should update the status of each step in a definition, and bind the target definition to it, even when the definition is defined later', function(){
    substepsTree.createSubstepsTreeFrom([stepDefinition, firstDefinition, secondDefinition, thirdDefinition]);

    expect(stepDefinition.steps[0].status).toBe('substeps-target');
    expect(stepDefinition.steps[1].status).toBe('substeps-target');
    expect(stepDefinition.steps[2].status).toBe('substeps-target');

    expect(stepDefinition.steps[0].definition).toBe(firstDefinition);
    expect(stepDefinition.steps[1].definition).toBe(secondDefinition);
    expect(stepDefinition.steps[2].definition).toBe(thirdDefinition);
  });

  it('should update the status of each step in each definition, updating parameter values in parameterised substeps', function(){
    // redefine variables
    firstDefinition = {text: 'Given a \'<parameter>\' something', pattern: 'Given a ([^"]*) something', steps: [], fakeExecutor: jasmine.createSpy('given step executor')};
    secondDefinition = {text: 'When a \'<parameter>\' something', pattern: 'When a ([^"]*) something', steps: [], fakeExecutor: jasmine.createSpy('when step executor')};
    thirdDefinition = {text: 'Then a \'<parameter>\' something', pattern: 'Then a ([^"]*) something', steps: [], fakeExecutor: jasmine.createSpy('then step executor')};

    stepDefinition = {text: 'Step Definition', steps: [
      {text: 'Given a \'first\' something'}, {text: 'When a \'second\' something'}, {text: 'Then a \'third\' something'}
    ]};

    substepsTree.createSubstepsTreeFrom([firstDefinition, secondDefinition, thirdDefinition, stepDefinition]);

    expect(stepDefinition.steps[0].status).toBe('substeps-target');
    expect(stepDefinition.steps[1].status).toBe('substeps-target');
    expect(stepDefinition.steps[2].status).toBe('substeps-target');

    expect(stepDefinition.steps[0].definition).toBe(firstDefinition);
    expect(stepDefinition.steps[1].definition).toBe(secondDefinition);
    expect(stepDefinition.steps[2].definition).toBe(thirdDefinition);
  });

  it('should leave the status of any steps in a definition as missing-target, if no suitable definition can be located', function(){
    // redefine variable
    stepDefinition = {text: 'Step Definition', pattern: 'Step Definition', steps: [
      {text: 'Given something', status: 'missing-target'}, {text: 'When an \'unknown\' something', status: 'missing-target'}, {text: 'Then something', status: 'missing-target'}
    ]};

    substepsTree.createSubstepsTreeFrom([firstDefinition, secondDefinition, thirdDefinition, stepDefinition]);

    expect(stepDefinition.steps[0].status).toBe('substeps-target');
    expect(stepDefinition.steps[1].status).toBe('missing-target');
    expect(stepDefinition.steps[2].status).toBe('substeps-target');

    expect(stepDefinition.steps[0].definition).toBe(firstDefinition);
    expect(stepDefinition.steps[1].definition).not.toBeDefined();
    expect(stepDefinition.steps[2].definition).toBe(thirdDefinition);
  });
});