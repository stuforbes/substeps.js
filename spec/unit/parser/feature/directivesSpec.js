'use strict';

describe('directives', function(){

  var directives;

  beforeEach(function(){
    directives = require('../../../../lib/parser/feature/directives')();
  });

  describe('directiveFeature', function(){
    it('should have a text of "Feature:"', function(){
      expect(directives.directiveFeature().text).toBe('Feature:');
    });

    it('should not be a step container', function(){
      expect(directives.directiveFeature().stepContainer).toBe(false);
    });
  });

  describe('directiveBackground', function(){
    it('should have a text of "Background:"', function(){
      expect(directives.directiveBackground().text).toBe('Background:');
    });

    it('should be a step container', function(){
      expect(directives.directiveBackground().stepContainer).toBe(true);
    });

    it('should be applicable if the previous node was a feature', function(){
      expect(directives.directiveBackground().isApplicable({type: 'feature'})).toBe(true);
    });

    it('should not be applicable if the previous node was not a feature', function(){
      expect(directives.directiveBackground().isApplicable({type: 'scenario'})).toBe(false);
    });

    it('should create a valid background node', function(){
      var background = directives.directiveBackground().create('anything');
      expect(background.type).toBe('background');
      expect(background.node.steps).toBeDefined();
      expect(background.node.steps.length).toBe(0);
    });

    it('should add the background to the feature', function(){
      var feature = {};
      var background = {steps: []};

      directives.directiveBackground().bindTo(background, feature);
      expect(feature.background).toBe(background);
    });
  });

  describe('directiveScenario', function(){
    it('should have a text of "Scenario:"', function(){
      expect(directives.directiveScenario().text).toBe('Scenario:');
    });

    it('should be a step container', function(){
      expect(directives.directiveScenario().stepContainer).toBe(true);
    });

    it('should be applicable if the previous node was a feature', function(){
      expect(directives.directiveScenario().isApplicable({type: 'feature'})).toBe(true);
    });

    it('should not be applicable if the previous node was not a feature', function(){
      expect(directives.directiveScenario().isApplicable({type: 'scenario'})).toBe(false);
    });

    it('should create a valid scenario node', function(){
      var scenario = directives.directiveScenario().create('A scenario');
      expect(scenario.type).toBe('scenario');
      expect(scenario.node.scenario).toBe('A scenario');
      expect(scenario.node.outline).toBe(false);
      expect(scenario.node.steps).toBeDefined();
      expect(scenario.node.steps.length).toBe(0);
    });

    it('should add the scenario to the feature', function(){
      var feature = {};
      var scenario = {text: 'A scenario', outline: false, steps: []};

      directives.directiveScenario().bindTo(scenario, feature);
      expect(feature.scenarios.length).toBe(1);
      expect(feature.scenarios[0]).toBe(scenario);
    });
  });

  describe('directiveScenarioOutline', function(){
    it('should have a text of "Scenario Outline:"', function(){
      expect(directives.directiveScenarioOutline().text).toBe('Scenario Outline:');
    });

    it('should be a step container', function(){
      expect(directives.directiveScenarioOutline().stepContainer).toBe(true);
    });

    it('should be applicable if the previous node was a feature', function(){
      expect(directives.directiveScenarioOutline().isApplicable({type: 'feature'})).toBe(true);
    });

    it('should not be applicable if the previous node was not a feature', function(){
      expect(directives.directiveScenarioOutline().isApplicable({type: 'scenario'})).toBe(false);
    });

    it('should create a valid scenario outline node', function(){
      var scenario = directives.directiveScenarioOutline().create('A scenario outline');
      expect(scenario.type).toBe('scenario-outline');
      expect(scenario.node.scenario).toBe('A scenario outline');
      expect(scenario.node.outline).toBe(true);
      expect(scenario.node.steps).toBeDefined();
      expect(scenario.node.steps.length).toBe(0);
    });

    it('should add the scenario outline to the feature', function(){
      var feature = {};
      var scenarioOutline = {text: 'A scenario outline', outline: false, steps: []};

      directives.directiveScenarioOutline().bindTo(scenarioOutline, feature);
      expect(feature.scenarios.length).toBe(1);
      expect(feature.scenarios[0]).toBe(scenarioOutline);
    });
  });

  describe('directiveExamples', function(){
    it('should have a text of "Examples:"', function(){
      expect(directives.directiveExamples().text).toBe('Examples:');
    });

    it('should not be a step container', function(){
      expect(directives.directiveExamples().stepContainer).toBe(false);
    });

    it('should be applicable if the previous node was a scenario outline', function(){
      expect(directives.directiveExamples().isApplicable({type: 'scenario-outline'})).toBe(true);
    });

    it('should not be applicable if the previous node was not a scenario outline', function(){
      expect(directives.directiveExamples().isApplicable({type: 'scenario'})).toBe(false);
    });

    it('should create a valid examples node', function(){
      var examples = directives.directiveExamples().create('anything');
      expect(examples.type).toBe('examples');
      expect(examples.node.exampleColumns).toBeDefined();
      expect(examples.node.exampleColumns.length).toBe(0);
      expect(examples.node.examples).toBeDefined();
      expect(examples.node.examples.length).toBe(0);
    });

    it('should add the scenario outline to the feature', function(){
      var scenarioOutline = {text: 'A scenario outline', outline: false, steps: []};
      var examples = {exampleColumns: [], examples: []};

      directives.directiveExamples().bindTo(examples, scenarioOutline);
      expect(scenarioOutline.examples).toBe(examples);
    });
  });


});
