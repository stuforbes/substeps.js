'use strict';

describe('featureExecutionBinder', function(){

  var _;
  var executionFactory;
  var featureExecutionBinder;

  beforeEach(function(){
    _ = require('underscore');
    executionFactory = jasmine.createSpyObj('executionFactory', ['featureExecutor', 'backgroundExecutor', 'scenarioExecutor', 'substepExecutor', 'stepExecutor']);
    featureExecutionBinder = require('../../../../lib/parser/feature/featureExecutionBinder')(executionFactory, _).create();
  });

  it('should attach a feature executor to the feature', function(){
    var feature1 = { feature: 'Feature 1' };
    var feature2 = { feature: 'Feature 2' };

    featureExecutionBinder.bindExecutionTo([feature1, feature2]);

    expect(executionFactory.featureExecutor).toHaveBeenCalledWith(feature1);
    expect(executionFactory.featureExecutor).toHaveBeenCalledWith(feature2);
  });

  it('should attach a background executor to a background in the feature', function(){
    var feature1 = { feature: 'Feature 1', background: {steps: [{text: 'step 1'}]} };
    var feature2 = { feature: 'Feature 2', background: {steps: [{text: 'step 2'}]} };

    featureExecutionBinder.bindExecutionTo([feature1, feature2]);

    expect(executionFactory.backgroundExecutor).toHaveBeenCalledWith(feature1.background);
    expect(executionFactory.backgroundExecutor).toHaveBeenCalledWith(feature2.background);
  });

  it('should attach substep executors to substeps under a background', function(){
    var feature1 = { feature: 'Feature 1', background: {steps: [{text: 'step 1', definition: {pattern: 'substep 1', steps: []}}, {text: 'step 2', definition: {pattern: 'substep 2', steps: []}}]} };
    var feature2 = { feature: 'Feature 2', background: {steps: [{text: 'step 3', definition: {pattern: 'substep 3', steps: []}}, {text: 'step 4', definition: {pattern: 'substep 4', steps: []}}]} };

    featureExecutionBinder.bindExecutionTo([feature1, feature2]);

    expect(executionFactory.substepExecutor).toHaveBeenCalledWith(feature1.background.steps[0]);
    expect(executionFactory.substepExecutor).toHaveBeenCalledWith(feature1.background.steps[1]);
    expect(executionFactory.substepExecutor).toHaveBeenCalledWith(feature2.background.steps[0]);
    expect(executionFactory.substepExecutor).toHaveBeenCalledWith(feature2.background.steps[1]);
  });

  it('should attach substep executors to nested substeps under a background', function(){
    var feature1 = { feature: 'Feature 1', background: {steps: [{text: 'step 1', definition: {pattern: 'substep 1', steps: [{text: 'substep11', definition: {pattern: 'substep 11', steps: []}}, {text: 'substep12', definition: {pattern: 'substep 12', steps: []}}]}}]} };
    var feature2 = { feature: 'Feature 2', background: {steps: [{text: 'step 3', definition: {pattern: 'substep 3', steps: [{text: 'substep21', definition: {pattern: 'substep 21', steps: []}}, {text: 'substep22', definition: {pattern: 'substep 22', steps: []}}]}}]} };

    featureExecutionBinder.bindExecutionTo([feature1, feature2]);

    expect(executionFactory.substepExecutor).toHaveBeenCalledWith(feature1.background.steps[0].definition.steps[0]);
    expect(executionFactory.substepExecutor).toHaveBeenCalledWith(feature1.background.steps[0].definition.steps[1]);
    expect(executionFactory.substepExecutor).toHaveBeenCalledWith(feature2.background.steps[0].definition.steps[0]);
    expect(executionFactory.substepExecutor).toHaveBeenCalledWith(feature2.background.steps[0].definition.steps[1]);
  });

  it('should attach step executors to step implementations under a background', function(){
    var feature1 = { feature: 'Feature 1', background: {steps: [{text: 'step 1', status: 'step-impl-target'}, {text: 'step 2', status: 'step-impl-target'}]}};
    var feature2 = { feature: 'Feature 2', background: {steps: [{text: 'step 3', status: 'step-impl-target'}, {text: 'step 4', status: 'step-impl-target'}]} };

    featureExecutionBinder.bindExecutionTo([feature1, feature2]);

    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature1.background.steps[0]);
    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature1.background.steps[1]);
    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature2.background.steps[0]);
    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature2.background.steps[1]);
  });

  it('should attach step executors to nested step implementations under a background', function(){
    var feature1 = { feature: 'Feature 1', background: {steps: [{text: 'step 1', definition: {pattern: 'substep 1', steps: [{status: 'step-impl-target'}, {status: 'step-impl-target'}]}}]} };
    var feature2 = { feature: 'Feature 2', background: {steps: [{text: 'step 3', definition: {pattern: 'substep 3', steps: [{status: 'step-impl-target'}, {status: 'step-impl-target'}]}}]} };

    featureExecutionBinder.bindExecutionTo([feature1, feature2]);

    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature1.background.steps[0].definition.steps[0]);
    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature1.background.steps[0].definition.steps[1]);
    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature2.background.steps[0].definition.steps[0]);
    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature2.background.steps[0].definition.steps[1]);
  });

  it('should attach a scenario executor to a scenario in the feature', function(){
    var feature1 = { feature: 'Feature 1', scenarios: [{text: 'scenario1', steps: []}, {text: 'scenario2', steps: []}]};
    var feature2 = { feature: 'Feature 2', scenarios: [{text: 'scenario3', steps: []}, {text: 'scenario4', steps: []}]};

    featureExecutionBinder.bindExecutionTo([feature1, feature2]);

    expect(executionFactory.scenarioExecutor).toHaveBeenCalledWith(feature1.scenarios[0]);
    expect(executionFactory.scenarioExecutor).toHaveBeenCalledWith(feature1.scenarios[1]);
    expect(executionFactory.scenarioExecutor).toHaveBeenCalledWith(feature2.scenarios[0]);
    expect(executionFactory.scenarioExecutor).toHaveBeenCalledWith(feature2.scenarios[1]);
  });

  it('should attach substep executors to substeps under a scenario', function(){
    var feature1 = { feature: 'Feature 1', scenarios: [{steps: [{text: 'step 1', definition: {pattern: 'substep 1', steps: []}}, {text: 'step 2', definition: {pattern: 'substep 2', steps: []}}]}] };
    var feature2 = { feature: 'Feature 2', scenarios: [{steps: [{text: 'step 3', definition: {pattern: 'substep 3', steps: []}}, {text: 'step 4', definition: {pattern: 'substep 4', steps: []}}]}] };

    featureExecutionBinder.bindExecutionTo([feature1, feature2]);

    expect(executionFactory.substepExecutor).toHaveBeenCalledWith(feature1.scenarios[0].steps[0]);
    expect(executionFactory.substepExecutor).toHaveBeenCalledWith(feature1.scenarios[0].steps[1]);
    expect(executionFactory.substepExecutor).toHaveBeenCalledWith(feature2.scenarios[0].steps[0]);
    expect(executionFactory.substepExecutor).toHaveBeenCalledWith(feature2.scenarios[0].steps[1]);
  });

  it('should attach substep executors to nested substeps under a scenario', function(){
    var feature1 = { feature: 'Feature 1', scenarios: [{steps: [{text: 'step 1', definition: {pattern: 'substep 1', steps: [{text: 'substep11', definition: {pattern: 'substep 11', steps: []}}, {text: 'substep12', definition: {pattern: 'substep 12', steps: []}}]}}]}] };
    var feature2 = { feature: 'Feature 2', scenarios: [{steps: [{text: 'step 3', definition: {pattern: 'substep 3', steps: [{text: 'substep21', definition: {pattern: 'substep 21', steps: []}}, {text: 'substep22', definition: {pattern: 'substep 22', steps: []}}]}}]}] };

    featureExecutionBinder.bindExecutionTo([feature1, feature2]);

    expect(executionFactory.substepExecutor).toHaveBeenCalledWith(feature1.scenarios[0].steps[0].definition.steps[0]);
    expect(executionFactory.substepExecutor).toHaveBeenCalledWith(feature1.scenarios[0].steps[0].definition.steps[1]);
    expect(executionFactory.substepExecutor).toHaveBeenCalledWith(feature2.scenarios[0].steps[0].definition.steps[0]);
    expect(executionFactory.substepExecutor).toHaveBeenCalledWith(feature2.scenarios[0].steps[0].definition.steps[1]);
  });

  it('should attach step executors to step implementations under a scenario', function(){
    var feature1 = { feature: 'Feature 1', scenarios: [{steps: [{text: 'step 1', status: 'step-impl-target'}, {text: 'step 2', status: 'step-impl-target'}]}] };
    var feature2 = { feature: 'Feature 2', scenarios: [{steps: [{text: 'step 3', status: 'step-impl-target'}, {text: 'step 4', status: 'step-impl-target'}]}] };

    featureExecutionBinder.bindExecutionTo([feature1, feature2]);

    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature1.scenarios[0].steps[0]);
    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature1.scenarios[0].steps[1]);
    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature2.scenarios[0].steps[0]);
    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature2.scenarios[0].steps[1]);
  });

  it('should attach step executors to nested step implementations under a scenario', function(){
    var feature1 = { feature: 'Feature 1', scenarios: [{steps: [{text: 'step 1', definition: {pattern: 'substep 1', steps: [{status: 'step-impl-target'}, {status: 'step-impl-target'}]}}]}] };
    var feature2 = { feature: 'Feature 2', scenarios: [{steps: [{text: 'step 3', definition: {pattern: 'substep 3', steps: [{status: 'step-impl-target'}, {status: 'step-impl-target'}]}}]}] };

    featureExecutionBinder.bindExecutionTo([feature1, feature2]);

    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature1.scenarios[0].steps[0].definition.steps[0]);
    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature1.scenarios[0].steps[0].definition.steps[1]);
    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature2.scenarios[0].steps[0].definition.steps[0]);
    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature2.scenarios[0].steps[0].definition.steps[1]);
  });
});
