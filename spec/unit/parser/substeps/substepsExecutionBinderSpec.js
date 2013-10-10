'use strict';

describe('substepsExecutionBinder', function(){

  var output;
  var executionFactory;
  var _;

  var substepExecutionBinder;

  var firstDefinition, secondDefinition, thirdDefinition, stepDefinition;

  beforeEach(function(){
    executionFactory = jasmine.createSpyObj('executionFactory', ['stepContainerExecutor']);
    output = jasmine.createSpyObj('consoleoutput', ['printMissingDefinition']);
    _ = require('underscore');
    substepExecutionBinder = require('../../../../lib/parser/substeps/substepsExecutionBinder')(executionFactory, output, _).create();

    executionFactory.stepContainerExecutor.andCallFake(function(definition){
      if(definition.text.indexOf('Step Definition') == 0){
        return function(){
          definition.steps.forEach(function(step){ step.executor(); });
        }
      } else{
        return definition.fakeExecutor;
      }
    });

    firstDefinition = {text: 'Given something', pattern: 'Given something', steps: [], fakeExecutor: jasmine.createSpy('given step executor')};
    secondDefinition = {text: 'When something', pattern: 'When something', steps: [], fakeExecutor: jasmine.createSpy('when step executor')};
    thirdDefinition = {text: 'Then something', pattern: 'Then something', steps: [], fakeExecutor: jasmine.createSpy('then step executor')};

    stepDefinition = {text: 'Step Definition', pattern: 'Step Definition', steps: [
      {text: 'Given something'}, {text: 'When something'}, {text: 'Then something'}
    ]};
  });

  it('should attach executors to each step in each definition', function(){

    substepExecutionBinder.bindExecutionTo([firstDefinition, secondDefinition, thirdDefinition, stepDefinition]);
    stepDefinition.executor();

    expect(firstDefinition.fakeExecutor).toHaveBeenCalled();
    expect(secondDefinition.fakeExecutor).toHaveBeenCalled();
    expect(thirdDefinition.fakeExecutor).toHaveBeenCalled();
  });

  it('should attach executors to each step in each definition, even when the source definitions are defined later', function(){

    substepExecutionBinder.bindExecutionTo([stepDefinition, firstDefinition, secondDefinition, thirdDefinition]);
    stepDefinition.executor();

    expect(firstDefinition.fakeExecutor).toHaveBeenCalled();
    expect(secondDefinition.fakeExecutor).toHaveBeenCalled();
    expect(thirdDefinition.fakeExecutor).toHaveBeenCalled();
  });

  it('should attach executors to each step in each definition, updating parameter values in parameterised substeps', function(){

    // redefine variables
    firstDefinition = {text: 'Given a \'<parameter>\' something', pattern: 'Given a ([^"]*) something', steps: [], fakeExecutor: jasmine.createSpy('given step executor')};
    secondDefinition = {text: 'When a \'<parameter>\' something', pattern: 'When a ([^"]*) something', steps: [], fakeExecutor: jasmine.createSpy('when step executor')};
    thirdDefinition = {text: 'Then a \'<parameter>\' something', pattern: 'Then a ([^"]*) something', steps: [], fakeExecutor: jasmine.createSpy('then step executor')};

    stepDefinition = {text: 'Step Definition', steps: [
      {text: 'Given a \'first\' something'}, {text: 'When a \'second\' something'}, {text: 'Then a \'third\' something'}
    ]};

    substepExecutionBinder.bindExecutionTo([firstDefinition, secondDefinition, thirdDefinition, stepDefinition]);
    stepDefinition.executor();

    expect(firstDefinition.fakeExecutor).toHaveBeenCalled();
    expect(secondDefinition.fakeExecutor).toHaveBeenCalled();
    expect(thirdDefinition.fakeExecutor).toHaveBeenCalled();
  });


});
