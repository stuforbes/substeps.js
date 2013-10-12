'use strict';

describe('fileToFeature', function(){

  var directives;
  var stringTools;
  var _;

  var fileToFeature;

  var waitForCallback = function(callback){
    var isSatisfied = false;

    return function(){


      callback(function(){
        isSatisfied = true;
      });

      waitsFor(function(){
        return isSatisfied;
      });
    }
  };

  var createNodeAndDirective = function(nodeType, nodeText, applicableParentType, directiveText){
    var node = {nodeType: nodeText};
    var directive = jasmine.createSpyObj(nodeType+'Directive', ['isApplicable', 'create', 'bindTo']);
    directive.isApplicable.andCallFake(function(previous){
      return previous.type === applicableParentType;
    });
    directive.create.andCallFake(function(text){
      return {node: node, type: nodeType};
    });
    directive.text = directiveText;

    return {node: node, directive: directive};
  };

  var prepareFind = function(){

    var args = arguments;

    _.find.andCallFake(function(directives, filter){
      if(filter({text: 'Feature:'})){
        return {text: 'Feature:'}
      } else {
        for(var i=0; i<args.length; i++){
          if(filter({text: args[i].directive.text})){
            return args[i].directive;
          }
        }
      }
    });
  }


  beforeEach(function(){
    directives = jasmine.createSpyObj('directives', ['directives', 'directiveFeature']);
    stringTools = jasmine.createSpyObj('stringTools', ['stripCommentsFrom']);
    _ = jasmine.createSpyObj('_', ['find', 'filter', 'map']);
    _.str = jasmine.createSpyObj('_str', ['startsWith']);

    stringTools.stripCommentsFrom.andCallFake(function(text){ return text; });
    directives.directiveFeature.andReturn({text: 'Feature:'});

    _.str.startsWith.andCallFake(function(text, start){
      return text.substring(0, start.length) === start;
    });

    fileToFeature = require('../../../../lib/parser/feature/fileToFeature')(directives, stringTools, _);
  });

  describe('feature processing', function(){
    it('should process a feature if there is no previous content', waitForCallback(function(isSatisfied){

      _.find.andCallFake(function(directives, filter){
        return {text: 'Feature:'};
      });

      fileToFeature.apply('Feature: Some feature', function(error, result){
        expect(error).toBeUndefined();
        expect(result.feature).toBe('Some feature');

        isSatisfied();
      });
    }));

    it('should report an error if trying to process a feature when there is already a feature defined', waitForCallback(function(isSatisfied){

      _.find.andCallFake(function(directives, filter){
        return {text: 'Feature:'};
      });

      fileToFeature.apply('Feature: Some feature\nFeature: Some other feature', function(error, result){
        expect(result).toBeUndefined();
        expect(error).toBe('Only one feature is allowed per feature file');

        isSatisfied();
      });
    }));
  });

  describe('directive processing', function(){
    it('should process a directive if it is applicable to the previous node', waitForCallback(function(isSatisfied){

      var background = createNodeAndDirective('background', 'background', 'feature', 'Background:');

      prepareFind(background);


      fileToFeature.apply('Feature: A feature\nBackground: Some background', function(error, result){
        expect(error).toBeUndefined();
        expect(result).toBeDefined();

        expect(background.directive.create).toHaveBeenCalledWith('Some background');
        expect(background.directive.bindTo).toHaveBeenCalledWith(background.node, {feature: 'A feature'});

        isSatisfied();
      });
    }));

    it('should not process a directive if it is not applicable to the previous node', waitForCallback(function(isSatisfied){
      var examples = createNodeAndDirective('examples', 'examples', 'scenario-outline', 'Examples:');

      prepareFind(examples);

      fileToFeature.apply('Feature: A feature\nExamples:', function(error, result){
        expect(result).toBeUndefined();
        expect(error).toBeDefined();
        expect(error).toBe('Could not create feature. Unexpected directive (Examples) on line 2');

        isSatisfied();
      });
    }));

    it('should process a directive if it is applicable to the parent of the previous node', waitForCallback(function(isSatisfied){

      var background = createNodeAndDirective('background', 'background', 'feature', 'Background:');
      var scenario = createNodeAndDirective('scenario', 'scenario', 'feature', 'Scenario:');

      prepareFind(background, scenario);

      fileToFeature.apply('Feature: A feature\nBackground: Some background\nScenario: A scenario', function(error, result){
        expect(error).toBeUndefined();
        expect(result).toBeDefined();

        expect(background.directive.create).toHaveBeenCalledWith('Some background');
        expect(background.directive.bindTo).toHaveBeenCalledWith(background.node, {feature: 'A feature'});

        expect(scenario.directive.create).toHaveBeenCalledWith('A scenario');
        expect(scenario.directive.bindTo).toHaveBeenCalledWith(scenario.node, {feature: 'A feature'});

        isSatisfied();
      });
    }));

    it('should not process a directive if  it is not applicable to the parent of the previous node', waitForCallback(function(isSatisfied){
      var background = createNodeAndDirective('background', 'background', 'feature', 'Background:');
      var examples = createNodeAndDirective('examples', 'examples', 'examples', 'Examples:');

      prepareFind(background, examples);

      fileToFeature.apply('Feature: A feature\nBackground: Some background\nExamples:', function(error, result){
        expect(result).toBeUndefined();
        expect(error).toBeDefined();
        expect(error).toBe('Could not create feature. Unexpected directive (Examples) on line 3');

        isSatisfied();
      });
    }));
  });

  describe('example row processing', function(){
    it('should process a standard text line as an example column line if the previous directive was example, and there are no columns defined', waitForCallback(function(isSatisfied){
      var scenarioOutline = createNodeAndDirective('scenario-outline', 'scenario-outline', 'feature', 'Scenario Outline:');
      var examples = createNodeAndDirective('examples', 'examples', 'scenario-outline', 'Examples:');
      examples.node.exampleColumns = [];

      prepareFind(scenarioOutline, examples);
      _.map.andCallFake(function(vals, func){ return vals; });
      _.filter.andCallFake(function(vals, func){
        var arr = []
        for(var i in vals){
          if(func(vals[i])) {
            arr.push(vals[i]);
          }
        }
        return arr;
      });

      fileToFeature.apply('Feature: A feature\nScenario Outline: Some scenario outline\nExamples: examples\n|column-1|column-2|column-3|', function(error, result){
        expect(error).toBeUndefined();
        expect(result).toBeDefined();

        var exampleColumns = examples.node.exampleColumns;
        expect(exampleColumns.length).toBe(3);
        expect(exampleColumns[0]).toBe('column-1');
        expect(exampleColumns[1]).toBe('column-2');
        expect(exampleColumns[2]).toBe('column-3');

        isSatisfied();
      });
    }));

    it('should process a standard text line as an example row line if the previous directive was example, and there are already columns defined', waitForCallback(function(isSatisfied){
      var scenarioOutline = createNodeAndDirective('scenario-outline', 'scenario-outline', 'feature', 'Scenario Outline:');
      var examples = createNodeAndDirective('examples', 'examples', 'scenario-outline', 'Examples:');
      examples.node.exampleColumns = [];
      examples.node.examples = [];

      prepareFind(scenarioOutline, examples);
      _.map.andCallFake(function(vals, func){ return vals; });
      _.filter.andCallFake(function(vals, func){
        var arr = []
        for(var i in vals){
          if(func(vals[i])) {
            arr.push(vals[i]);
          }
        }
        return arr;
      });

      fileToFeature.apply('Feature: A feature\nScenario Outline: Some scenario outline\nExamples: examples\n|column-1|column-2|column-3|\n|value-1|value-2|value-3|', function(error, result){
        expect(error).toBeUndefined();
        expect(result).toBeDefined();

        var examplesRows = examples.node.examples;
        expect(examplesRows.length).toBe(1);

        var examplesRow = examplesRows[0];
        expect(examplesRow[0]).toBe('value-1');
        expect(examplesRow[1]).toBe('value-2');
        expect(examplesRow[2]).toBe('value-3');

        isSatisfied();
      });
    }));
  });

  describe('step processing', function(){
    it('process a standard text line as a step for the previous node, if the previous node is a step container', waitForCallback(function(isSatisfied){

      var scenario = createNodeAndDirective('scenario', 'scenario', 'feature', 'Scenario:');
      scenario.node.steps = [];

      prepareFind(scenario);

      fileToFeature.apply('Feature: A feature\nScenario: Some scenario outline\nGiven a step\nWhen a step2\nThen a step3', function(error, result){
        expect(error).toBeUndefined();
        expect(result).toBeDefined();

        var steps = scenario.node.steps;
        expect(steps.length).toBe(3);
        expect(steps[0].text).toBe('Given a step');
        expect(steps[1].text).toBe('When a step2');
        expect(steps[2].text).toBe('Then a step3');

        isSatisfied();
      });
    }));

    it('process reports an error if processing a standard text line as a step for the previous node, and the previous node is not a step container', waitForCallback(function(isSatisfied){

      prepareFind();

      fileToFeature.apply('Feature: A feature\nGiven a step', function(error, result){
        expect(result).toBeUndefined();
        expect(error).toBeDefined();
        expect(error).toBe('Could not create feature. Tried to add a step (Given a step) to directive (feature) on line 2');

        isSatisfied();
      });
    }));
  });

});
