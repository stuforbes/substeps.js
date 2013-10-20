'use strict';

describe('substepsTree', function(){

  var _;
  var stepRegistry;
  var substepsTree;

  var firstDefinition, secondDefinition, thirdDefinition, stepDefinition;
  var firstStep, secondStep, thirdStep;

  beforeEach(function(){
    _ = {};
    _.str = require('underscore.string');
    stepRegistry = jasmine.createSpyObj('definitionRegistry', ['registerDefinition', 'registerStep', 'locateForText']);
    substepsTree = require('../../../../lib/parser/substeps/substepsTree')(stepRegistry).create();

    firstDefinition = {text: 'Given something', pattern: 'Given something', steps: [], fakeExecutor: jasmine.createSpy('given step executor')};
    secondDefinition = {text: 'When something', pattern: 'When something', steps: [], fakeExecutor: jasmine.createSpy('when step executor')};
    thirdDefinition = {text: 'Then something', pattern: 'Then something', steps: [], fakeExecutor: jasmine.createSpy('then step executor')};
    firstStep = {text: 'Given a step', pattern: 'Given a step'};
    secondStep = {text: 'When a step', pattern: 'When a step'};
    thirdStep = {text: 'Then a step', pattern: 'Then a step'};

    stepRegistry.locateForText.andCallFake(function(text){
      if(_.str.startsWith(text, 'Given') && _.str.endsWith(text, 'something')) return {type: 'substep', value: firstDefinition};
      else if (_.str.startsWith(text, 'When') && _.str.endsWith(text, 'something')) return {type: 'substep', value: secondDefinition};
      else if (_.str.startsWith(text, 'Then') && _.str.endsWith(text, 'something')) return {type: 'substep', value: thirdDefinition};
      else if(_.str.startsWith(text, 'Given') && _.str.endsWith(text, 'step')) return {type: 'step-impl', value: firstStep};
      else if (_.str.startsWith(text, 'When') && _.str.endsWith(text, 'step')) return {type: 'step-impl', value: secondStep};
      else if (_.str.startsWith(text, 'Then') && _.str.endsWith(text, 'step')) return {type: 'step-impl', value: thirdStep};
      return undefined;
    });

    stepDefinition = {text: 'Step Definition', pattern: 'Step Definition', steps: [
      {text: 'Given something'}, {text: 'When something'}, {text: 'Then something'},
      {text: 'Given a step'}, {text: 'When a step'}, {text: 'Then a step'}
    ]};
  });

  it('should update the status of each substep step in a definition to substeps-target, and bind the target definition to it', function(){

    substepsTree.createSubstepsTreeFrom([firstDefinition, secondDefinition, thirdDefinition, stepDefinition], []);

    expect(stepDefinition.steps[0].status).toBe('substeps-target');
    expect(stepDefinition.steps[1].status).toBe('substeps-target');
    expect(stepDefinition.steps[2].status).toBe('substeps-target');

    expect(stepDefinition.steps[0].definition).toBe(firstDefinition);
    expect(stepDefinition.steps[1].definition).toBe(secondDefinition);
    expect(stepDefinition.steps[2].definition).toBe(thirdDefinition);

    expect(stepRegistry.registerDefinition).toHaveBeenCalledWith(firstDefinition);
    expect(stepRegistry.registerDefinition).toHaveBeenCalledWith(secondDefinition);
    expect(stepRegistry.registerDefinition).toHaveBeenCalledWith(thirdDefinition);
    expect(stepRegistry.registerDefinition).toHaveBeenCalledWith(stepDefinition);
  });

  it('should update the status of each substep step in a definition to substeps-target, and bind the target definition to it, even when the definition is defined later', function(){
    substepsTree.createSubstepsTreeFrom([stepDefinition, firstDefinition, secondDefinition, thirdDefinition], []);

    expect(stepDefinition.steps[0].status).toBe('substeps-target');
    expect(stepDefinition.steps[1].status).toBe('substeps-target');
    expect(stepDefinition.steps[2].status).toBe('substeps-target');

    expect(stepDefinition.steps[0].definition).toBe(firstDefinition);
    expect(stepDefinition.steps[1].definition).toBe(secondDefinition);
    expect(stepDefinition.steps[2].definition).toBe(thirdDefinition);

    expect(stepRegistry.registerDefinition).toHaveBeenCalledWith(firstDefinition);
    expect(stepRegistry.registerDefinition).toHaveBeenCalledWith(secondDefinition);
    expect(stepRegistry.registerDefinition).toHaveBeenCalledWith(thirdDefinition);
    expect(stepRegistry.registerDefinition).toHaveBeenCalledWith(stepDefinition);
  });

  it('should update the status of each subtep step in each definition to substeps-target, updating parameter values in parameterised substeps', function(){
    // redefine variables
    firstDefinition = {text: 'Given a \'<parameter>\' something', pattern: 'Given a \'([^"]*)\' something', steps: [], fakeExecutor: jasmine.createSpy('given step executor')};
    secondDefinition = {text: 'When a \'<parameter>\' something', pattern: 'When a \'([^"]*)\' something', steps: [], fakeExecutor: jasmine.createSpy('when step executor')};
    thirdDefinition = {text: 'Then a \'<parameter>\' something', pattern: 'Then a \'([^"]*)\' something', steps: [], fakeExecutor: jasmine.createSpy('then step executor')};

    stepDefinition = {text: 'Step Definition', steps: [
      {text: 'Given a \'first\' something'}, {text: 'When a \'second\' something'}, {text: 'Then a \'third\' something'}
    ]};

    substepsTree.createSubstepsTreeFrom([firstDefinition, secondDefinition, thirdDefinition, stepDefinition], []);

    expect(stepDefinition.steps[0].status).toBe('substeps-target');
    expect(stepDefinition.steps[1].status).toBe('substeps-target');
    expect(stepDefinition.steps[2].status).toBe('substeps-target');

    expect(stepDefinition.steps[0].definition).toBe(firstDefinition);
    expect(stepDefinition.steps[1].definition).toBe(secondDefinition);
    expect(stepDefinition.steps[2].definition).toBe(thirdDefinition);

    expect(stepRegistry.registerDefinition).toHaveBeenCalledWith(firstDefinition);
    expect(stepRegistry.registerDefinition).toHaveBeenCalledWith(secondDefinition);
    expect(stepRegistry.registerDefinition).toHaveBeenCalledWith(thirdDefinition);
    expect(stepRegistry.registerDefinition).toHaveBeenCalledWith(stepDefinition);
  });

  it('should leave the status of any steps in a definition as missing-target, if no suitable definition can be located', function(){
    // redefine variable
    stepDefinition = {text: 'Step Definition', pattern: 'Step Definition', steps: [
      {text: 'Given something', status: 'missing-target'}, {text: 'unknown-When an \'unknown\' something', status: 'missing-target'}, {text: 'Then something', status: 'missing-target'}
    ]};

    substepsTree.createSubstepsTreeFrom([firstDefinition, secondDefinition, thirdDefinition, stepDefinition], []);

    expect(stepDefinition.steps[0].status).toBe('substeps-target');
    expect(stepDefinition.steps[1].status).toBe('missing-target');
    expect(stepDefinition.steps[2].status).toBe('substeps-target');

    expect(stepDefinition.steps[0].definition).toBe(firstDefinition);
    expect(stepDefinition.steps[1].definition).not.toBeDefined();
    expect(stepDefinition.steps[2].definition).toBe(thirdDefinition);
  });

  it('should update the status of each step-impl step in a definition to substeps-target, and bind the target step impl to it', function(){

    substepsTree.createSubstepsTreeFrom([stepDefinition], [firstStep, secondStep, thirdStep]);

    expect(stepDefinition.steps[3].status).toBe('step-impl-target');
    expect(stepDefinition.steps[4].status).toBe('step-impl-target');
    expect(stepDefinition.steps[5].status).toBe('step-impl-target');

    expect(stepDefinition.steps[3].stepImpl).toBe(firstStep);
    expect(stepDefinition.steps[4].stepImpl).toBe(secondStep);
    expect(stepDefinition.steps[5].stepImpl).toBe(thirdStep);
  });

  it('should update the status of each step in a definition to step-impl-target, updating parameter values in parameterised substeps', function(){

    stepDefinition = {text: 'Step Definition', steps: [
      {text: 'Given a \'first\' step'}, {text: 'When a \'second\' step'}, {text: 'Then a \'third\' step'}
    ]};

    firstStep = {text: 'Given a \'<param>\' step', pattern: 'Given a \'([^"]*)\' step'};
    secondStep = {text: 'Given a \'<param>\' step', pattern: 'When a \'([^"]*)\' step'};
    thirdStep = {text: 'Given a \'<param>\' step', pattern: 'Then a \'([^"]*)\' step'};
    substepsTree.createSubstepsTreeFrom([stepDefinition], [firstStep, secondStep, thirdStep]);

    expect(stepDefinition.steps[0].status).toBe('step-impl-target');
    expect(stepDefinition.steps[1].status).toBe('step-impl-target');
    expect(stepDefinition.steps[2].status).toBe('step-impl-target');

    expect(stepDefinition.steps[0].stepImpl).toBe(firstStep);
    expect(stepDefinition.steps[1].stepImpl).toBe(secondStep);
    expect(stepDefinition.steps[2].stepImpl).toBe(thirdStep);
  });
});