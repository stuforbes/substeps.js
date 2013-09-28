'use strict';

describe('featureExecutionBinder', function(){

  var _;
  var featureExecutionBinder;

  beforeEach(function(){
    _ = jasmine.createSpyObj('_', ['find']);
    featureExecutionBinder = require('../../../../lib/parser/feature/featureExecutionBinder')(_).create();

    _.find.andCallFake(function(list, fn){
      for(var i in list){
        if(fn(list[i])){
          return list[i];
        }
      }
    });
  });

  it('should attach executors to each background step in each feature', function(){

    var feature1 = { background: { steps: [{step: 'Given a background step'}, {step: 'When a background step'}, {step: 'Then a background step'}] } }
    var feature2 = { background: { steps: [{step: 'Given a background step'}, {step: 'When a background step'}, {step: 'Then a background step'}] } }

    var stepDefinitions = [ //
      {text: 'Given a background step', executor: jasmine.createSpy(), executionCount: 0}, //
      {text: 'When a background step', executor: jasmine.createSpy(), executionCount: 0}, //
      {text: 'Then a background step', executor: jasmine.createSpy(), executionCount: 0} //
    ];
    stepDefinitions[0].executor.andCallFake(function(){ stepDefinitions[0].executionCount++ });
    stepDefinitions[1].executor.andCallFake(function(){ stepDefinitions[1].executionCount++ });
    stepDefinitions[2].executor.andCallFake(function(){ stepDefinitions[2].executionCount++ });

    featureExecutionBinder.bindExecutionTo([feature1, feature2], stepDefinitions);

    feature1.background.executor();
    feature2.background.executor();

    expect(stepDefinitions[0].executionCount).toBe(2);
    expect(stepDefinitions[1].executionCount).toBe(2);
    expect(stepDefinitions[2].executionCount).toBe(2);
  });

  it('should attach executors to each scenario step in each feature', function(){

    var feature1 = { scenarios: [{ steps: [{step: 'Given a scenario step'}, {step: 'When a scenario step'}, {step: 'Then a scenario step'}] }] };
    var feature2 = { scenarios: [{ steps: [{step: 'Given a scenario step'}, {step: 'When a scenario step'}, {step: 'Then a scenario step'}] }] };

    var stepDefinitions = [ //
      {text: 'Given a scenario step', executor: jasmine.createSpy(), executionCount: 0}, //
      {text: 'When a scenario step', executor: jasmine.createSpy(), executionCount: 0}, //
      {text: 'Then a scenario step', executor: jasmine.createSpy(), executionCount: 0} //
    ];
    stepDefinitions[0].executor.andCallFake(function(){ stepDefinitions[0].executionCount++ });
    stepDefinitions[1].executor.andCallFake(function(){ stepDefinitions[1].executionCount++ });
    stepDefinitions[2].executor.andCallFake(function(){ stepDefinitions[2].executionCount++ });

    featureExecutionBinder.bindExecutionTo([feature1, feature2], stepDefinitions);

    feature1.scenarios[0].executor();
    feature2.scenarios[0].executor();

    expect(stepDefinitions[0].executionCount).toBe(2);
    expect(stepDefinitions[1].executionCount).toBe(2);
    expect(stepDefinitions[2].executionCount).toBe(2);
  });

});
