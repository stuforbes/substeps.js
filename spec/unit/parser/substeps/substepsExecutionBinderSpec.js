'use strict';

describe('substepsExecutionBinder', function(){

  var output;
  var executionFactory;

  var substepExecutionBinder;

  beforeEach(function(){
    executionFactory = jasmine.createSpyObj('executionFactory', ['stepContainerExecutor']);
    output = jasmine.createSpyObj('consoleoutput', ['printMissingDefinition']);
    substepExecutionBinder = require('../../../../lib/parser/substeps/substepsExecutionBinder')(executionFactory, output).create();
  });

  it('should attach executors to each step in each definition', function(){

    var firstDefinition = {text: 'Given something', steps: []};
    var secondDefinition = {text: 'When something', steps: []};
    var thirdDefinition = {text: 'Then something', steps: []};

    var stepDefinition = {text: 'Step Definition', steps: [
      {text: 'Given something'}, {text: 'When something'}, {text: 'Then something'}
    ]};

    substepExecutionBinder.bindExecutionTo([firstDefinition, secondDefinition, thirdDefinition, stepDefinition]);

    expect(stepDefinition.steps[0].executor).toBeDefined();
    expect(stepDefinition.steps[1].executor).toBeDefined();
    expect(stepDefinition.steps[2].executor).toBeDefined();

    expect(executionFactory.stepContainerExecutor).toHaveBeenCalledWith(stepDefinition)
  });

  it('should attach executors to each step in each definition, even when the source definitions are defined later', function(){

    var firstDefinition = {text: 'Given something', steps: []};
    var secondDefinition = {text: 'When something', steps: []};
    var thirdDefinition = {text: 'Then something', steps: []};

    var stepDefinition = {text: 'Step Definition', steps: [
      {text: 'Given something'}, {text: 'When something'}, {text: 'Then something'}
    ]};

    substepExecutionBinder.bindExecutionTo([stepDefinition, firstDefinition, secondDefinition, thirdDefinition]);

    expect(stepDefinition.steps[0].executor).toBeDefined();
    expect(stepDefinition.steps[1].executor).toBeDefined();
    expect(stepDefinition.steps[2].executor).toBeDefined();

    expect(executionFactory.stepContainerExecutor).toHaveBeenCalledWith(stepDefinition)
  });
});
