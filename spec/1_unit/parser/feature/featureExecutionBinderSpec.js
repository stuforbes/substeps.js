'use strict';

describe('featureExecutionBinder', function(){

  var _;
  var executionFactory;
  var featureExecutionBinder;

  beforeEach(function(){
    _ = jasmine.createSpyObj('_', ['find']);
    executionFactory = jasmine.createSpyObj('executionFactory', ['featureExecutor', 'stepExecutor', 'stepContainerExecutor']);
    featureExecutionBinder = require('../../../../lib/parser/feature/featureExecutionBinder')(executionFactory, _).create();

    _.find.andCallFake(function(list, fn){
      for(var i in list){
        if(fn(list[i])){
          return list[i];
        }
      }
    });
  });

  it('should attach executors to each background step in each feature', function(){

    var feature1 = { background: { steps: [{text: 'Given a background step'}, {text: 'When a background step'}, {text: 'Then a background step'}] } }
    var feature2 = { background: { steps: [{text: 'Given a background step'}, {text: 'When a background step'}, {text: 'Then a background step'}] } }

    featureExecutionBinder.bindExecutionTo([feature1, feature2]);

    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature1.background.steps[0]);
    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature1.background.steps[1]);
    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature1.background.steps[2]);
    expect(executionFactory.stepContainerExecutor).toHaveBeenCalledWith(feature1.background);
    expect(executionFactory.featureExecutor).toHaveBeenCalledWith(feature1);

    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature2.background.steps[0]);
    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature2.background.steps[1]);
    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature2.background.steps[2]);
    expect(executionFactory.stepContainerExecutor).toHaveBeenCalledWith(feature2.background);
    expect(executionFactory.featureExecutor).toHaveBeenCalledWith(feature2);
  });

  it('should attach executors to each scenario step in each feature', function(){

    var feature1 = { scenarios: [{ steps: [{text: 'Given a scenario step'}, {text: 'When a scenario step'}, {text: 'Then a scenario step'}] }] };
    var feature2 = { scenarios: [{ steps: [{text: 'Given a scenario step'}, {text: 'When a scenario step'}, {text: 'Then a scenario step'}] }] };

    featureExecutionBinder.bindExecutionTo([feature1, feature2]);

    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature1.scenarios[0].steps[0]);
    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature1.scenarios[0].steps[1]);
    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature1.scenarios[0].steps[2]);
    expect(executionFactory.stepContainerExecutor).toHaveBeenCalledWith(feature1.scenarios[0]);
    expect(executionFactory.featureExecutor).toHaveBeenCalledWith(feature1);

    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature2.scenarios[0].steps[0]);
    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature2.scenarios[0].steps[1]);
    expect(executionFactory.stepExecutor).toHaveBeenCalledWith(feature2.scenarios[0].steps[2]);
    expect(executionFactory.stepContainerExecutor).toHaveBeenCalledWith(feature2.scenarios[0]);
    expect(executionFactory.featureExecutor).toHaveBeenCalledWith(feature2);
  });

});
