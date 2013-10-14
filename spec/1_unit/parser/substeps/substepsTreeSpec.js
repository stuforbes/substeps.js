'use strict';

describe('substepsTree', function(){

  var definitionRegistry;
  var substepsTree;

  var firstDefinition, secondDefinition, thirdDefinition, stepDefinition;

  beforeEach(function(){
    definitionRegistry = jasmine.createSpyObj('definitionRegistry', ['register', 'locateForText']);
    substepsTree = require('../../../../lib/parser/substeps/substepsTree')(definitionRegistry).create();

    firstDefinition = {text: 'Given something', pattern: 'Given something', steps: [], fakeExecutor: jasmine.createSpy('given step executor')};
    secondDefinition = {text: 'When something', pattern: 'When something', steps: [], fakeExecutor: jasmine.createSpy('when step executor')};
    thirdDefinition = {text: 'Then something', pattern: 'Then something', steps: [], fakeExecutor: jasmine.createSpy('then step executor')};

    definitionRegistry.locateForText.andCallFake(function(text){
      if(text.substring(0, 5) === 'Given') return firstDefinition;
      else if (text.substring(0, 4) === 'When') return secondDefinition;
      else if (text.substring(0, 4) === 'Then') return thirdDefinition;
      return undefined;
    });

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

    expect(definitionRegistry.register).toHaveBeenCalledWith(firstDefinition);
    expect(definitionRegistry.register).toHaveBeenCalledWith(secondDefinition);
    expect(definitionRegistry.register).toHaveBeenCalledWith(thirdDefinition);
    expect(definitionRegistry.register).toHaveBeenCalledWith(stepDefinition);
  });

  it('should update the status of each step in a definition, and bind the target definition to it, even when the definition is defined later', function(){
    substepsTree.createSubstepsTreeFrom([stepDefinition, firstDefinition, secondDefinition, thirdDefinition]);

    expect(stepDefinition.steps[0].status).toBe('substeps-target');
    expect(stepDefinition.steps[1].status).toBe('substeps-target');
    expect(stepDefinition.steps[2].status).toBe('substeps-target');

    expect(stepDefinition.steps[0].definition).toBe(firstDefinition);
    expect(stepDefinition.steps[1].definition).toBe(secondDefinition);
    expect(stepDefinition.steps[2].definition).toBe(thirdDefinition);

    expect(definitionRegistry.register).toHaveBeenCalledWith(firstDefinition);
    expect(definitionRegistry.register).toHaveBeenCalledWith(secondDefinition);
    expect(definitionRegistry.register).toHaveBeenCalledWith(thirdDefinition);
    expect(definitionRegistry.register).toHaveBeenCalledWith(stepDefinition);
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

    expect(definitionRegistry.register).toHaveBeenCalledWith(firstDefinition);
    expect(definitionRegistry.register).toHaveBeenCalledWith(secondDefinition);
    expect(definitionRegistry.register).toHaveBeenCalledWith(thirdDefinition);
    expect(definitionRegistry.register).toHaveBeenCalledWith(stepDefinition);
  });

  it('should leave the status of any steps in a definition as missing-target, if no suitable definition can be located', function(){
    // redefine variable
    stepDefinition = {text: 'Step Definition', pattern: 'Step Definition', steps: [
      {text: 'Given something', status: 'missing-target'}, {text: 'unknown-When an \'unknown\' something', status: 'missing-target'}, {text: 'Then something', status: 'missing-target'}
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