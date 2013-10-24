'use strict';

describe('stepLoader integration', function(){

  module.exports = GLOBAL.stepRequire = function(module){
    return require(__dirname+'/'+module);
  };

  var stepRegistry,
      async,
      fs,
      vm;

  var stepLoader;

  beforeEach(function(){
    stepRegistry = require('../../../lib/step/stepRegistry')(require('underscore'));
    async = require('asyncjs');
    fs = require('fs');
    vm = require('vm');

    stepLoader = require('../../../lib/step/stepLoader')(stepRegistry, async, fs, vm);
  });

  it('should load all steps within a step definition block', function(){

    var onCompleteCalled = false;

    stepLoader.loadStepImplementationsAndProcessors([{path: 'data/steps/steps.js'}], function(error, stepModel){
      expect(error).not.toBeDefined();
      expect(stepModel).toBeDefined();

      var steps = stepModel.steps;
      expect(steps.length).toBe(3);
      expect(steps[0].text).toBe('This is the first step');
      expect(steps[1].text).toBe('This is the second step');
      expect(steps[2].text).toBe('This is the third step');

      onCompleteCalled = true;
    });

    waitsFor(function() { return onCompleteCalled; });
  });

  it('should report an error if there are 2 steps with the same name', function(){
    var onCompleteCalled = false;

    stepLoader.loadStepImplementationsAndProcessors([{path: 'data/steps/duplicateSteps.js'}], function(error, stepModel){
      expect(error).toBeDefined();
      expect(stepModel).not.toBeDefined();

      expect(error).toBe('Substeps could not execute - there are 2 steps with the text \'This is the second step\'');

      onCompleteCalled = true;
    });

    waitsFor(function() { return onCompleteCalled; });
  });

  it('should store all processors in the step registry', function(){
    var onCompleteCalled = false;

    stepLoader.loadStepImplementationsAndProcessors([{path: 'data/steps/processors.js'}], function(error, stepModel){
      expect(error).not.toBeDefined();
      expect(stepModel).toBeDefined();

      var processors = stepModel.processors;
      expect(processors.beforeAllFeatures.length).toBe(1);
      expect(processors.beforeEveryFeature.length).toBe(2);
      expect(processors.beforeEveryScenario.length).toBe(3);
      expect(processors.afterAllFeatures.length).toBe(1);
      expect(processors.afterEveryFeature.length).toBe(2);
      expect(processors.afterEveryScenario.length).toBe(3);

      onCompleteCalled = true;
    });

    waitsFor(function() { return onCompleteCalled; });
  });
});
