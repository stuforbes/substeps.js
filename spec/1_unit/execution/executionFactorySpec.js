'use strict';

describe('executionFactory', function () {

  var _;
  var output;

  var executionFactory;

  beforeEach(function () {
    _ = jasmine.createSpyObj('_', ['find', 'reduce']);
    output = jasmine.createSpyObj('output', ['ascend', 'descend', 'printSuccess', 'printMissingDefinition', 'printFailure']);
    executionFactory = require('../../../lib/execution/executionFactory')(output);
  });

  describe('featureExecutor', function () {
    it('should execute each scenario', function () {

      var feature = { scenarios: [
        { execute: jasmine.createSpy() },
        {execute: jasmine.createSpy()},
        { execute: jasmine.createSpy() }
      ] };

      executionFactory.featureExecutor(feature)();

      expect(feature.scenarios[0].execute).toHaveBeenCalled();
      expect(feature.scenarios[1].execute).toHaveBeenCalled();
      expect(feature.scenarios[2].execute).toHaveBeenCalled();
    });

    it('should call the background executor once for each scenario execution', function () {
      var feature = { background: {execute: jasmine.createSpy()}, scenarios: [
        { execute: jasmine.createSpy() },
        {execute: jasmine.createSpy()},
        { execute: jasmine.createSpy() }
      ] };

      executionFactory.featureExecutor(feature)();

      expect(feature.background.execute).toHaveBeenCalled();
      expect(feature.background.execute.callCount).toBe(3);
    });
  });

  describe('stepContainerExecutor', function () {
    it('should output the step text, and traverse the hierarchy correctly', function () {
      var stepContainer = {prefix: 'A prefix', text: 'some text', steps: []};

      executionFactory.stepContainerExecutor(stepContainer)();

      expect(output.printSuccess).toHaveBeenCalledWith('A prefix some text');
      expect(output.descend).toHaveBeenCalled();
      expect(output.ascend).toHaveBeenCalled();
    });

    it('should call each of the inner steps executors', function () {
      var stepContainer = {steps: [{execute: jasmine.createSpy()}, {execute: jasmine.createSpy()}, {execute: jasmine.createSpy()}]};

      executionFactory.stepContainerExecutor(stepContainer)();

      expect(stepContainer.steps[0].execute).toHaveBeenCalled();
      expect(stepContainer.steps[1].execute).toHaveBeenCalled();
      expect(stepContainer.steps[2].execute).toHaveBeenCalled();
    });
  });

  describe('stepExecutor', function () {
//    it('should locate the correct definition to call', function () {
//
//      _.reduce.andReturn([]);
//
//      var step = {text: 'Step 3'};
//      var definitions = [{text: 'Step 1', executor: jasmine.createSpy()}, {text: 'Step 2', executor: jasmine.createSpy()}, {text: 'Step 3', executor: jasmine.createSpy()}, {text: 'Step 4', executor: jasmine.createSpy()}]
//      _.find.andReturn(definitions[2]);
//
//      executionFactory.stepExecutor(step)();
//
//      expect(definitions[0].executor).not.toHaveBeenCalled();
//      expect(definitions[1].executor).not.toHaveBeenCalled();
//      expect(definitions[2].executor).toHaveBeenCalled();
//      expect(definitions[3].executor).not.toHaveBeenCalled();
//    });

    it('should call the execute methods of all substeps when executing a step with status of substeps-target', function () {

      var step = {text: 'Step 3', status: 'substeps-target', definition: {steps: [{execute: jasmine.createSpy()}, {execute: jasmine.createSpy()}]}};

      executionFactory.stepExecutor(step)();

      expect(output.printSuccess).toHaveBeenCalledWith('Step 3');
      expect(step.definition.steps[0].execute).toHaveBeenCalled();
      expect(step.definition.steps[1].execute).toHaveBeenCalled();
    });

    it('should output a warning if the step could not be located', function () {

      var step = {text: 'Step 3', status: 'missing-target'};

      executionFactory.stepExecutor(step)();

      expect(output.printMissingDefinition).toHaveBeenCalledWith(step.text);
    });

//    it('should populate the params and values when looking up the definition', function(){
//
//      var step = {text: 'Step 3 with \'First\' and \'Second\''};
//      var definitions = [{text: 'Step 1', executor: jasmine.createSpy()}, {text: 'Step 2', executor: jasmine.createSpy()}, {text: 'Step 3 with \'<param1>\' and \'<param2>\'', parameters: ['param1', 'param2'], pattern: 'Step 3 with \'([^"]*)\' and \'([^"]*)\'', executor: jasmine.createSpy()}, {text: 'Step 4', executor: jasmine.createSpy()}]
//      _.find.andReturn(definitions[2]);
//
//      _.reduce.andCallFake(function(values, iterator){
//        var arr = [];
//        for(var i in values){
//          arr = iterator(arr, values[i], i);
//        }
//        return arr;
//      });
//
//
//      executionFactory.stepExecutor(step, definitions)();
//
//      expect(definitions[2].executor).toHaveBeenCalledWith([{name: 'param1', value: 'First'}, {name: 'param2', value: 'Second'}]);
//    });

    it('should report a problem if the status cannot be determined', function(){
      var step = {text: 'Step 3', status: 'unknown-target'};

      executionFactory.stepExecutor(step)();

      expect(output.printFailure).toHaveBeenCalledWith('Unknown status (unknown-target) for step Step 3');
    });

    it('should report a problem if the step has a status of substeps-target but no definition', function(){
      var step = {text: 'Step 3', status: 'substeps-target'};

      executionFactory.stepExecutor(step)();

      expect(output.printFailure).toHaveBeenCalledWith('Step 3 - No definition associated to step');
    });

    it('should report a problem if the step has a status of substeps-target but no definition steps', function(){
      var step = {text: 'Step 3', status: 'substeps-target', definition: {}};

      executionFactory.stepExecutor(step)();

      expect(output.printFailure).toHaveBeenCalledWith('Step 3 - No definition associated to step');
    });
  });
});
