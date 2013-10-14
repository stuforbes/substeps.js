'use strict';

describe('substepsExecutionBinder', function(){

  var executionFactory;
  var _;

  var substepExecutionBinder;

  beforeEach(function(){
    executionFactory = jasmine.createSpyObj('executionFactory', ['stepExecutor']);
    _ = require('underscore');
    substepExecutionBinder = require('../../../../lib/parser/substeps/substepsExecutionBinder')(executionFactory, _).create();
  });

  it('should attach step executors to steps in a definition', function(){
    var stepDefinition = {steps: [{text: 'step 1'}, {text: 'step 2'}, {text: 'step 3'}]};

    substepExecutionBinder.bindExecutionTo([stepDefinition]);

    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(stepDefinition.steps[0]);
    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(stepDefinition.steps[1]);
    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(stepDefinition.steps[2]);
  });
});
