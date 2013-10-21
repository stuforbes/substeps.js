'use strict';

describe('featureStepToDefinitionBinder', function(){

  var definitionRegistry;
  var featureStepToDefinitionBinder;

  beforeEach(function(){
    definitionRegistry = jasmine.createSpyObj('definitionRegistry', ['locateForText']);
    featureStepToDefinitionBinder = require('../../../../lib/parser/feature/featureStepToDefinitionBinder')(definitionRegistry).create();
  });

  it('should attach definitions to each background step in each feature', function(){

    var feature1 = { background: { steps: [{text: 'Given a background step', status: 'missing-target'}, {text: 'When a background step', status: 'missing-target'}, {text: 'Then a background step', status: 'missing-target'}] } };
    var feature2 = { background: { steps: [{text: 'Given a background step', status: 'missing-target'}, {text: 'When a background step', status: 'missing-target'}, {text: 'Then a background step', status: 'missing-target'}] } };

    var givenDefinition = {text: 'Given a background step', steps: []};
    var whenDefinition = {text: 'When a background step', steps: []};
    var thenDefinition = {text: 'Then a background step', steps: []};
    var definitions = [givenDefinition, whenDefinition, thenDefinition];

    definitionRegistry.locateForText.andCallFake(function(text){
      for(var i=0; i<definitions.length; i++){
        if(definitions[i].text === text) return {type: 'substep', value: definitions[i]};
      }
      return undefined;
    });

    featureStepToDefinitionBinder.bindDefinitionsToStepsIn([feature1, feature2]);
    expect(feature1.background.steps[0].status).toBe('substeps-target');
    expect(feature1.background.steps[1].status).toBe('substeps-target');
    expect(feature1.background.steps[2].status).toBe('substeps-target');
    expect(feature1.background.steps[0].definition).toBe(givenDefinition);
    expect(feature1.background.steps[1].definition).toBe(whenDefinition);
    expect(feature1.background.steps[2].definition).toBe(thenDefinition);
    expect(feature2.background.steps[0].status).toBe('substeps-target');
    expect(feature2.background.steps[1].status).toBe('substeps-target');
    expect(feature2.background.steps[2].status).toBe('substeps-target');
    expect(feature2.background.steps[0].definition).toBe(givenDefinition);
    expect(feature2.background.steps[1].definition).toBe(whenDefinition);
    expect(feature2.background.steps[2].definition).toBe(thenDefinition);
  });

  it('should attach definitions to each scenario step in each feature', function(){

    var feature1 = { scenarios: [{ steps: [{text: 'Given a scenario step', status: 'missing-target'}, {text: 'When a scenario step', status: 'missing-target'}, {text: 'Then a scenario step', status: 'missing-target'}] }] };
    var feature2 = { scenarios: [{ steps: [{text: 'Given a scenario step'}, {text: 'When a scenario step'}, {text: 'Then a scenario step'}] }] };

    var givenDefinition = {text: 'Given a scenario step', steps: []};
    var whenDefinition = {text: 'When a scenario step', steps: []};
    var thenDefinition = {text: 'Then a scenario step', steps: []};
    var definitions = [givenDefinition, whenDefinition, thenDefinition];

    definitionRegistry.locateForText.andCallFake(function(text){
      for(var i=0; i<definitions.length; i++){
        if(definitions[i].text === text) return {type: 'substep', value: definitions[i]};
      }
      return undefined;
    });

    featureStepToDefinitionBinder.bindDefinitionsToStepsIn([feature1, feature2]);

    expect(feature1.scenarios[0].steps[0].status).toBe('substeps-target');
    expect(feature1.scenarios[0].steps[1].status).toBe('substeps-target');
    expect(feature1.scenarios[0].steps[2].status).toBe('substeps-target');
    expect(feature1.scenarios[0].steps[0].definition).toBe(givenDefinition);
    expect(feature1.scenarios[0].steps[1].definition).toBe(whenDefinition);
    expect(feature1.scenarios[0].steps[2].definition).toBe(thenDefinition);
    expect(feature2.scenarios[0].steps[0].status).toBe('substeps-target');
    expect(feature2.scenarios[0].steps[1].status).toBe('substeps-target');
    expect(feature2.scenarios[0].steps[2].status).toBe('substeps-target');
    expect(feature2.scenarios[0].steps[0].definition).toBe(givenDefinition);
    expect(feature2.scenarios[0].steps[1].definition).toBe(whenDefinition);
    expect(feature2.scenarios[0].steps[2].definition).toBe(thenDefinition);
  });

});
