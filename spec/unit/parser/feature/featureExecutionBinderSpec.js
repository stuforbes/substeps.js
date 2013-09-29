'use strict';

describe('featureExecutionBinder', function(){

  var _;
  var output;
  var featureExecutionBinder;

  beforeEach(function(){
    _ = jasmine.createSpyObj('_', ['find']);
    output = jasmine.createSpyObj('consoleoutput', ['descend', 'ascend', 'printSuccess', 'printMissingDefinition', 'printFailure']);
    featureExecutionBinder = require('../../../../lib/parser/feature/featureExecutionBinder')(output, _).create();

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

    var feature1 = { scenarios: [{ steps: [{text: 'Given a scenario step'}, {text: 'When a scenario step'}, {text: 'Then a scenario step'}] }] };
    var feature2 = { scenarios: [{ steps: [{text: 'Given a scenario step'}, {text: 'When a scenario step'}, {text: 'Then a scenario step'}] }] };

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
