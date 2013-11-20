'use strict';

describe('executionFactory', function () {

  var stepRegistry;
  var tagManager;
  var callbackIterator;
  var stepParameterLocator;
  var output;
  var _;

  var feature1;
  var feature2;
  var feature3;

  var executionFactory;

  beforeEach(function () {
    _ = require('underscore');
    stepRegistry = jasmine.createSpyObj('stepRegistry', ['fireProcessEvent']);
    tagManager = jasmine.createSpyObj('tagManager', ['isApplicable']);
    callbackIterator = jasmine.createSpyObj('callbackIterator', ['iterateOver']);
    stepParameterLocator = jasmine.createSpyObj('stepParameterLocator', ['locateForStep']);
    output = jasmine.createSpyObj('output', ['ascend', 'descend', 'printSuccess', 'printMissingDefinition', 'printFailure']);

    executionFactory = require('../../../lib/execution/executionFactory')(stepRegistry, callbackIterator, stepParameterLocator, output, _);
  });

  beforeEach(function(){
    feature1 = {tags: ['feature-1'], execute: jasmine.createSpy(), scenarios: [{execute: jasmine.createSpy()}, {tags: ['scenario-2'], execute: jasmine.createSpy()}, {text: 'A scenario', execute: jasmine.createSpy(), steps: [{execute: jasmine.createSpy()}, {execute: jasmine.createSpy()}]}]};
    feature2 = {execute: jasmine.createSpy(), background: {execute: jasmine.createSpy(), steps: [{execute: jasmine.createSpy()}, {execute: jasmine.createSpy()}]}, scenarios: [{execute: jasmine.createSpy()}, {execute: jasmine.createSpy()}]};
    feature3 = {execute: jasmine.createSpy()};

    // by default, the tagManager will approve features/scenarios
    tagManager.isApplicable.andReturn(true);
  });

  describe('featureSetExecutor', function(){
    it('should execute each feature', function(){

      prepareProcessor([withTypeAndCallbackResult('beforeAllFeatures', null), withTypeAndCallbackResult('beforeEveryFeature', null)]);

      executionFactory.featureSetExecutor([feature1, feature2, feature3])(tagManager);

      expect(stepRegistry.fireProcessEvent).toHaveBeenCalledWith('beforeAllFeatures', {}, jasmine.any(Function));

      expect(feature1.execute).toHaveBeenCalledWith(tagManager);
      expect(feature2.execute).toHaveBeenCalledWith(tagManager);
      expect(feature3.execute).toHaveBeenCalledWith(tagManager);
    });

    it('should not execute a feature if the tag manager reports it as not applicable', function(){

      prepareProcessor([withTypeAndCallbackResult('beforeAllFeatures', null), withTypeAndCallbackResult('beforeEveryFeature', null)]);

      tagManager.isApplicable.andCallFake(function(tags){
        return !(tags && tags.length === 1 && tags[0] === 'feature-1');
      });

      executionFactory.featureSetExecutor([feature1, feature2, feature3])(tagManager);

      expect(feature1.execute).not.toHaveBeenCalled();
      expect(feature2.execute).toHaveBeenCalled();
      expect(feature3.execute).toHaveBeenCalled();
    });

    it('should execute the beforeAllFeatures processors before processing any features', function(){

      prepareProcessor([withTypeAndCallbackResult('beforeAllFeatures', null)]);

      executionFactory.featureSetExecutor([feature1, feature2, feature3])(tagManager);

      expect(stepRegistry.fireProcessEvent).toHaveBeenCalledWith('beforeAllFeatures', {}, jasmine.any(Function));
    });

    it('should not execute any features if a beforeAllFeatures processor fails', function(){

      prepareProcessor([withTypeAndCallbackResult('beforeAllFeatures', 'some error')]);

      executionFactory.featureSetExecutor([feature1, feature2, feature3])(tagManager);

      expect(stepRegistry.fireProcessEvent).toHaveBeenCalledWith('beforeAllFeatures', {}, jasmine.any(Function));

      expect(feature1.execute).not.toHaveBeenCalled();
      expect(feature2.execute).not.toHaveBeenCalled();
      expect(feature3.execute).not.toHaveBeenCalled();
    });

    it('should execute the afterAllFeatures processors after processing features', function(){

      prepareProcessor([withTypeAndCallbackResult('beforeAllFeatures', null), withTypeAndCallbackResult('beforeEveryFeature', null)]);

      executionFactory.featureSetExecutor([feature1, feature2, feature3])(tagManager);

      expect(stepRegistry.fireProcessEvent).toHaveBeenCalledWith('afterAllFeatures', {});
    });

    it('should execute the beforeEveryFeature processors before processing a feature', function(){

      var beforeEveryFeatureExecutionCount = 0;

      var beforeAllFeatures = {processType: 'beforeAllFeatures', callbackHandler: function(callback){ callback(null); }};
      var beforeEveryFeature = {processType: 'beforeEveryFeature', callbackHandler: function(callback){
        beforeEveryFeatureExecutionCount++;
        callback(null);
      }};
      prepareProcessor([beforeAllFeatures, beforeEveryFeature]);

      executionFactory.featureSetExecutor([feature1, feature2, feature3])(tagManager);

      expect(stepRegistry.fireProcessEvent).toHaveBeenCalledWith('beforeEveryFeature', {}, jasmine.any(Function));
      expect(beforeEveryFeatureExecutionCount).toBe(3);
      expect(feature1.execute).toHaveBeenCalledWith(tagManager);
      expect(feature2.execute).toHaveBeenCalledWith(tagManager);
      expect(feature3.execute).toHaveBeenCalledWith(tagManager);
    });

    it('should not execute a feature if one of its beforeEveryFeature processors fails', function(){
      var beforeEveryFeatureExecutionCount = 0;

      var beforeAllFeatures = {processType: 'beforeAllFeatures', callbackHandler: function(callback){ callback(null); }};
      var beforeEveryFeature = {processType: 'beforeEveryFeature', callbackHandler: function(callback){
        beforeEveryFeatureExecutionCount++;
        if(beforeEveryFeatureExecutionCount === 2){
          callback('an error occurred');
        } else{
          callback(null);
        }
      }};
      prepareProcessor([beforeAllFeatures, beforeEveryFeature]);

      executionFactory.featureSetExecutor([feature1, feature2, feature3])(tagManager);

      expect(stepRegistry.fireProcessEvent).toHaveBeenCalledWith('beforeEveryFeature', {}, jasmine.any(Function));
      expect(beforeEveryFeatureExecutionCount).toBe(3);
      expect(feature1.execute).toHaveBeenCalled();
      expect(feature2.execute).not.toHaveBeenCalled();
      expect(feature3.execute).toHaveBeenCalled();
    });

    it('should execute the afterEveryFeature processors after processing a feature', function(){

      var afterEveryFeatureExecutionCount = 0;

      var beforeAllFeatures = withTypeAndCallbackResult('beforeAllFeatures', null);
      var beforeEveryFeature = withTypeAndCallbackResult('beforeEveryFeature', null);
      var afterEveryFeature = {processType: 'afterEveryFeature', callbackHandler: function(callback){ afterEveryFeatureExecutionCount++; }};
      prepareProcessor([beforeAllFeatures, beforeEveryFeature, afterEveryFeature]);

      executionFactory.featureSetExecutor([feature1, feature2, feature3])(tagManager);

      expect(stepRegistry.fireProcessEvent).toHaveBeenCalledWith('afterEveryFeature', {});
      expect(afterEveryFeatureExecutionCount).toBe(3);
    });
  });

  describe('featureExecutor', function(){
    it('should execute each scenario', function(){

      prepareProcessor([withTypeAndCallbackResult('beforeEveryScenario', null)]);

      executionFactory.featureExecutor(feature1)(tagManager);

      expect(feature1.scenarios[0].execute).toHaveBeenCalled();
      expect(feature1.scenarios[1].execute).toHaveBeenCalled();
      expect(feature1.scenarios[2].execute).toHaveBeenCalled();
    });

    it('should not execute a scenario if the tag manager reports it is not applicable', function(){

      prepareProcessor([withTypeAndCallbackResult('beforeEveryScenario', null)]);

      tagManager.isApplicable.andCallFake(function(tags){
        return !(tags && tags.length === 1 && tags[0] === 'scenario-2');
      });

      executionFactory.featureExecutor(feature1)(tagManager);

      expect(feature1.scenarios[0].execute).toHaveBeenCalled();
      expect(feature1.scenarios[1].execute).not.toHaveBeenCalled();
    });

    it('should execute the background before each scenario', function(){

      prepareProcessor([withTypeAndCallbackResult('beforeEveryScenario', null)]);

      executionFactory.featureExecutor(feature2)(tagManager);

      expect(feature2.background.execute).toHaveBeenCalled();
      expect(feature2.background.execute.callCount).toBe(2);
    });

    it('should execute the beforeEveryScenario processors before each scenario', function(){

      var beforeEveryScenarioCallCount = 0;
      prepareProcessor([{processType: 'beforeEveryScenario', callbackHandler: function(callback) { beforeEveryScenarioCallCount++; callback(null); }}]);

      executionFactory.featureExecutor(feature2)(tagManager);

      expect(stepRegistry.fireProcessEvent).toHaveBeenCalledWith('beforeEveryScenario',{}, jasmine.any(Function));
      expect(beforeEveryScenarioCallCount).toBe(2);
    });

    it('should not execute the scenarios if a beforeEveryScenario processor fails', function(){

      prepareProcessor([withTypeAndCallbackResult('beforeEveryScenario', 'an-error')]);

      executionFactory.featureExecutor(feature2)(tagManager);

      expect(feature2.background.execute).not.toHaveBeenCalled();
      expect(feature2.scenarios[0].execute).not.toHaveBeenCalled();
      expect(feature2.scenarios[1].execute).not.toHaveBeenCalled();
    });

    it('should execute the afterEveryScenario processors after each scenario', function(){

      var afterEveryScenarioCallCount = 0;
      prepareProcessor([withTypeAndCallbackResult('beforeEveryScenario', null), {processType: 'afterEveryScenario', callbackHandler: function() { afterEveryScenarioCallCount++; }}]);

      executionFactory.featureExecutor(feature2)(tagManager);

      expect(stepRegistry.fireProcessEvent).toHaveBeenCalledWith('afterEveryScenario',{});
      expect(afterEveryScenarioCallCount).toBe(2);
    });
  });

  describe('backgroundExecutor', function(){
    it('should print the text \'Background:\' to the output, then descend to the next level', function(){

      executionFactory.backgroundExecutor(feature2.background)();

      expect(output.printSuccess).toHaveBeenCalledWith('Background:');
      expect(output.descend).toHaveBeenCalled();
      expect(output.ascend).toHaveBeenCalled();
    });

    it('should execute each step in the background through an iterated callback', function(){
      executionFactory.backgroundExecutor(feature2.background)();

      expect(callbackIterator.iterateOver).toHaveBeenCalledWith(feature2.background.steps, jasmine.any(Function));
    });

    it('should provide a callback to the callback iterator that will execute a step', function(){

      var iteratedCallback = null;
      callbackIterator.iterateOver.andCallFake(function(arr, callback){ iteratedCallback = callback; });

      executionFactory.backgroundExecutor(feature2.background)();

      expect(iteratedCallback).not.toBe(null);

      var step = {execute: jasmine.createSpy()};

      iteratedCallback(step);

      expect(step.execute).toHaveBeenCalled();

    });
  });

  describe('scenarioExecutor', function(){

    it('should print the text \'Scenario:\', plus the scenario text to the output, then descend to the next level', function(){

      executionFactory.scenarioExecutor(feature1.scenarios[2])();

      expect(output.printSuccess).toHaveBeenCalledWith('Scenario: A scenario');
      expect(output.descend).toHaveBeenCalled();
      expect(output.ascend).toHaveBeenCalled();
    });

    it('should execute each step in the scenario through an iterated callback', function(){
      executionFactory.scenarioExecutor(feature1.scenarios[2])();

      expect(callbackIterator.iterateOver).toHaveBeenCalledWith(feature1.scenarios[2].steps, jasmine.any(Function));
    });

    it('should provide a callback to the callback iterator that will execute a step', function(){

      var iteratedCallback = null;
      callbackIterator.iterateOver.andCallFake(function(arr, callback){ iteratedCallback = callback; });

      executionFactory.scenarioExecutor(feature1.scenarios[2])(tagManager);

      expect(iteratedCallback).not.toBe(null);

      var step = {execute: jasmine.createSpy()};

      iteratedCallback(step);

      expect(step.execute).toHaveBeenCalled();
    });
  });

  describe('substepExecutor', function(){
    it('should print the substep text to the output, and descend to the next level', function(){

      executionFactory.substepExecutor({text: 'A substep', definition: {steps: []}})([], jasmine.createSpy('callback'));

      expect(output.printSuccess).toHaveBeenCalledWith('A substep');
      expect(output.descend).toHaveBeenCalled();
      expect(output.ascend).toHaveBeenCalled();
    });

    it('should call the execute method of each child step', function(){

      var iteratedCallback = null;
      callbackIterator.iterateOver.andCallFake(function(arr, callback){ iteratedCallback = callback; });

      executionFactory.substepExecutor({text: 'A substep', definition: {steps: []}})([], jasmine.createSpy('callback'));

      expect(iteratedCallback).not.toBe(null);

      var step = {execute: jasmine.createSpy()};

      iteratedCallback(step);

      expect(step.execute).toHaveBeenCalled();
    });

    it('should print a failure message if the step doesn\'t have a corresponding definition', function(){

      executionFactory.substepExecutor({text: 'A substep'})([], jasmine.createSpy('callback'));

      expect(output.printFailure).toHaveBeenCalledWith('A substep - No definition associated to step');
    });

    it('should print a failure message if the step has a corresponding definition which doesn\'t have child steps', function(){

      executionFactory.substepExecutor({text: 'A substep', definition: {}})([], jasmine.createSpy('callback'));

      expect(output.printFailure).toHaveBeenCalledWith('A substep - No definition associated to step');
    });

    it('should print the composed substep text to the output if the substep has parameters', function(){

      var substep = {text: 'A parameterised substep with \'<key1>\' and \'<key2>\'', definition: {steps: []}};
      var params = [{name: 'key1', value: 'parameter-1'}, {name: 'key2', value: 'parameter-2'}];

      executionFactory.substepExecutor(substep)(params, jasmine.createSpy('callback'));

      expect(output.printSuccess).toHaveBeenCalledWith('A parameterised substep with \'parameter-1\' and \'parameter-2\'');
    });

    it('should pass applicable parameters from the substep down to child steps during execution', function(){

      var step = {text: 'A step with \'<key2>\' and \'<key3>\'', parameters: ['key2', 'key3'], execute: jasmine.createSpy()};
      var substep = {text: 'A substep with \'<key1>\', \'<key2>\' and \'<key3>\'', definition: {steps: [step]}};

      var substepParams = [{name: 'key1', value: 'parameter1'}, {name: 'key2', value: 'parameter2'}, {name: 'key3', value: 'parameter3'}];
      var stepParams = [{name: 'key2', value: 'parameter2'}, {name: 'key3', value: 'parameter3'}];

      var iteratedCallback = null;
      callbackIterator.iterateOver.andCallFake(function(arr, callback){ iteratedCallback = callback; });

      stepParameterLocator.locateForStep.andReturn(stepParams);

      executionFactory.substepExecutor(substep)(substepParams, jasmine.createSpy());

      expect(iteratedCallback).not.toBeNull();
      iteratedCallback(step, jasmine.createSpy());

      expect(stepParameterLocator.locateForStep).toHaveBeenCalledWith(step, substepParams);
      expect(step.execute).toHaveBeenCalledWith(stepParams, jasmine.any(Function));
    });
  });

  describe('step executor', function(){

    it('should print a missing step message if there is no definition or step impl associated with the step', function(){

      var step = {text: 'Missing step', status: 'missing-target'};

      executionFactory.stepExecutor(step)([], jasmine.createSpy());

      expect(output.printMissingDefinition).toHaveBeenCalledWith('Missing step');
    });

    it('should print a failure if the step status is missing', function(){

      var step = {text: 'No status'};

      executionFactory.stepExecutor(step)([], jasmine.createSpy());

      expect(output.printFailure).toHaveBeenCalledWith('No status for step \'No status\'');
    });

    it('should print a failure if the step status is not recognised', function(){

      var step = {text: 'Invalid status', status: 'unknown-status'};

      executionFactory.stepExecutor(step)([], jasmine.createSpy());

      expect(output.printFailure).toHaveBeenCalledWith('Unknown status (unknown-status) for step \'Invalid status\'');
    });

    it('should call the execute method of the step impl', function(){

      var callback = jasmine.createSpy();
      var step = {text: 'A step impl', status: 'step-impl-target', stepImpl: {pattern: 'A step impl', execute: {apply: jasmine.createSpy()}}};

      executionFactory.stepExecutor(step)([], callback);

      expect(step.stepImpl.execute.apply).toHaveBeenCalledWith(jasmine.any(Object), [callback]);
      expect(output.printSuccess).toHaveBeenCalledWith('A step impl');
    });

    it('should pass required parameters to the execute method of the step impl', function(){

      var callback = jasmine.createSpy();
      var step = {text: 'A step with \'<key1>\' and \'<key2>\'', status: 'step-impl-target', parameters: ['key1', 'key2'], stepImpl: {pattern: 'A step with \'([^\']*)\' and \'([^\']*)\'', execute: {apply: callback}}};

      executionFactory.stepExecutor(step)([{name: 'key1', value: 'param-1'}, {name: 'key2', value: 'param-2'}], callback);

      expect(step.stepImpl.execute.apply).toHaveBeenCalledWith(jasmine.any(Object), ['param-1', 'param-2', callback]);
      expect(output.printSuccess).toHaveBeenCalledWith('A step with \'param-1\' and \'param-2\'');
    });

    it('should report failure if the step is missing a step impl', function(){

      var callback = jasmine.createSpy();
      var step = {text: 'A step impl', status: 'step-impl-target'};

      executionFactory.stepExecutor(step)([], callback);

      expect(output.printFailure).toHaveBeenCalledWith('A step impl - No step implementation associated to step');

    });

    it('should report failure if the step impl throws an exception during execution', function(){

      var callback = jasmine.createSpy();
      var step = {text: 'A step impl', status: 'step-impl-target', stepImpl: {execute: jasmine.createSpy()}};
      step.stepImpl.execute.andThrow('Step execution failed');

      executionFactory.stepExecutor(step)([], callback);

      expect(output.printFailure).toHaveBeenCalledWith('A step impl');

    });
  });

  var prepareProcessor = function(processTypesAndCallbackHandlers){
    stepRegistry.fireProcessEvent.andCallFake(function(type, executionState, callback){
      processTypesAndCallbackHandlers.forEach(function(processTypeAndCallbackHandler){
        if(processTypeAndCallbackHandler.processType === type){
          processTypeAndCallbackHandler.callbackHandler(callback);
        }
      });
    });
  };

  var withTypeAndCallbackResult = function(type, result){
    return {processType: type, callbackHandler: function(callback){ callback(result); }};
  };
});
