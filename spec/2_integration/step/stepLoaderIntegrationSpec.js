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

    stepLoader.loadStepImplementations([{path: 'data/steps/steps.js'}], function(error, steps){
      expect(error).not.toBeDefined();
      expect(steps).toBeDefined();

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

    stepLoader.loadStepImplementations([{path: 'data/steps/duplicateSteps.js'}], function(error, steps){
      expect(error).toBeDefined();
      expect(steps).not.toBeDefined();

      expect(error).toBe('Substeps could not execute - there are 2 steps with the text \'This is the second step\'');

      onCompleteCalled = true;
    });

    waitsFor(function() { return onCompleteCalled; });
  });
});
