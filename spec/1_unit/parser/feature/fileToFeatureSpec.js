'use strict';

describe('fileToFeature', function () {

  var featureDirective, tagDirective, backgroundDirective, scenarioDirective, scenarioOutlineDirective, examplesDirective;

  var fileToFeature;

  var waitForCallback = function (callback) {
    var isSatisfied = false;

    return function () {


      callback(function () {
        isSatisfied = true;
      });

      waitsFor(function () {
        return isSatisfied;
      });
    }
  };

  var createDirective = function (applicableParentType, isDirectiveTaggable, directiveText) {
    var directive = jasmine.createSpyObj(directiveText + '-Directive', ['isApplicable', 'isTaggable', 'create', 'bindTo']);
    directive.isApplicable.andCallFake(function (previous) {
      return previous.type === applicableParentType;
    });
    directive.isTaggable = isDirectiveTaggable;
    directive.text = directiveText;

    return directive;
  };

  beforeEach(function () {
    var directives = jasmine.createSpyObj('directives', ['directives', 'directiveFeature', 'directiveTag', 'directiveBackground', 'directiveScenario', 'directiveScenarioOutline', 'directiveExamples']);
    var stringTools = jasmine.createSpyObj('stringTools', ['stripCommentsFrom']);
    var _ = require('underscore');
    _.str = require('underscore.string');

    stringTools.stripCommentsFrom.andCallFake(function (text) {
      return text;
    });

    featureDirective = {text: 'Feature:', isTaggable: true};
    tagDirective = createDirective('', false, 'Tags:');
    backgroundDirective = createDirective('feature', false, 'Background:');
    scenarioDirective = createDirective('feature', true, 'Scenario:');
    scenarioOutlineDirective = createDirective('feature', true, 'Scenario Outline:');
    examplesDirective = createDirective('scenario-outline', false, 'Examples:');
    directives.directiveFeature.andReturn(featureDirective);
    directives.directiveTag.andReturn(tagDirective);
    directives.directiveBackground.andReturn(backgroundDirective);
    directives.directiveScenario.andReturn(scenarioDirective);
    directives.directiveScenarioOutline.andReturn(scenarioOutlineDirective);
    directives.directiveExamples.andReturn(examplesDirective);

    tagDirective.create.andCallFake(function (text) {
      return {node: {tags: text.split(' '), type: 'tag'}};
    });

    directives.directives.andReturn([featureDirective, tagDirective, backgroundDirective, scenarioDirective, scenarioOutlineDirective, examplesDirective]);

    fileToFeature = require('../../../../lib/parser/feature/fileToFeature')(directives, stringTools, _);
  });

  describe('feature processing', function () {
    it('should process a feature if there is no previous content', waitForCallback(function (isSatisfied) {

      fileToFeature.apply('Feature: Some feature', function (error, result) {
        expect(error).toBeUndefined();
        expect(result.feature).toBe('Some feature');

        isSatisfied();
      });
    }));

    it('should report an error if trying to process a feature when there is already a feature defined', waitForCallback(function (isSatisfied) {

      fileToFeature.apply('Feature: Some feature\nFeature: Some other feature', function (error, result) {
        expect(result).toBeUndefined();
        expect(error).toBe('Only one feature is allowed per feature file');

        isSatisfied();
      });
    }));
  });

  describe('directive processing', function () {
    it('should process a directive if it is applicable to the previous node', waitForCallback(function (isSatisfied) {

      var node = {background: 'background'};
      backgroundDirective.create.andReturn({node: node, type: 'background'});

      fileToFeature.apply('Feature: A feature\nBackground: Some background', function (error, result) {
        expect(error).toBeUndefined();
        expect(result).toBeDefined();

        expect(backgroundDirective.create).toHaveBeenCalledWith('Some background', {feature: 'A feature'});
        expect(backgroundDirective.bindTo).toHaveBeenCalledWith(node, {feature: 'A feature'});

        isSatisfied();
      });
    }));

    it('should not process a directive if it is not applicable to the previous node', waitForCallback(function (isSatisfied) {

      var node = {examples: 'examples'};
      examplesDirective.create.andReturn({node: node, type: 'examples'});

      fileToFeature.apply('Feature: A feature\nExamples:', function (error, result) {
        expect(result).toBeUndefined();
        expect(error).toBeDefined();
        expect(error).toBe('Could not create feature. Unexpected directive (Examples) on line 2');

        isSatisfied();
      });
    }));

    it('should process a directive if it is applicable to the parent of the previous node', waitForCallback(function (isSatisfied) {

      var backgroundNode = {background: 'background'};
      var scenarioNode = {scenario: 'scenario'};
      backgroundDirective.create.andReturn({node: backgroundNode, type: 'background'});
      scenarioDirective.create.andReturn({node: scenarioNode, type: 'scenario'});

      fileToFeature.apply('Feature: A feature\nBackground: Some background\nScenario: A scenario', function (error, result) {
        expect(error).toBeUndefined();
        expect(result).toBeDefined();

        expect(backgroundDirective.create).toHaveBeenCalledWith('Some background', {feature: 'A feature'});
        expect(backgroundDirective.bindTo).toHaveBeenCalledWith(backgroundNode, {feature: 'A feature'});

        expect(scenarioDirective.create).toHaveBeenCalledWith('A scenario', {feature: 'A feature'});
        expect(scenarioDirective.bindTo).toHaveBeenCalledWith(scenarioNode, {feature: 'A feature'});

        isSatisfied();
      });
    }));

    it('should not process a directive if  it is not applicable to the parent of the previous node', waitForCallback(function (isSatisfied) {

      var backgroundNode = {background: 'background'};
      backgroundDirective.create.andReturn({node: backgroundNode, type: 'background'});
      var examplesNode = {examples: 'examples'};
      examplesDirective.create.andReturn({node: examplesNode, type: 'examples'});

      fileToFeature.apply('Feature: A feature\nBackground: Some background\nExamples:', function (error, result) {
        expect(result).toBeUndefined();
        expect(error).toBeDefined();
        expect(error).toBe('Could not create feature. Unexpected directive (Examples) on line 3');

        isSatisfied();
      });
    }));
  });

  describe('example row processing', function () {
    it('should process a standard text line as an example column line if the previous directive was example, and there are no columns defined', waitForCallback(function (isSatisfied) {

      var scenarioOutlineNode = {scenario: 'scenario'};
      scenarioOutlineDirective.create.andReturn({node: scenarioOutlineNode, type: 'scenario-outline'});
      var examplesNode = {exampleColumns: []};
      examplesDirective.create.andReturn({node: examplesNode, type: 'examples'});

      fileToFeature.apply('Feature: A feature\nScenario Outline: Some scenario outline\nExamples: examples\n|column-1|column-2|column-3|', function (error, result) {
        expect(error).toBeUndefined();
        expect(result).toBeDefined();

        var exampleColumns = examplesNode.exampleColumns;
        expect(exampleColumns.length).toBe(3);
        expect(exampleColumns[0]).toBe('column-1');
        expect(exampleColumns[1]).toBe('column-2');
        expect(exampleColumns[2]).toBe('column-3');

        isSatisfied();
      });
    }));

    it('should process a standard text line as an example row line if the previous directive was example, and there are already columns defined', waitForCallback(function (isSatisfied) {
      var scenarioOutlineNode = {scenario: 'scenario'};
      scenarioOutlineDirective.create.andReturn({node: scenarioOutlineNode, type: 'scenario-outline'});
      var examplesNode = {examples: [], exampleColumns: []};
      examplesDirective.create.andReturn({node: examplesNode, type: 'examples'});

      fileToFeature.apply('Feature: A feature\nScenario Outline: Some scenario outline\nExamples: examples\n|column-1|column-2|column-3|\n|value-1|value-2|value-3|', function (error, result) {
        expect(error).toBeUndefined();
        expect(result).toBeDefined();

        var examplesRows = examplesNode.examples;
        expect(examplesRows.length).toBe(1);

        var examplesRow = examplesRows[0];
        expect(examplesRow[0]).toBe('value-1');
        expect(examplesRow[1]).toBe('value-2');
        expect(examplesRow[2]).toBe('value-3');

        isSatisfied();
      });
    }));
  });

  describe('step processing', function () {
    it('process a standard text line as a step for the previous node, if the previous node is a step container', waitForCallback(function (isSatisfied) {

      var scenarioNode = {scenario: 'scenario', steps: []};
      scenarioDirective.create.andReturn({node: scenarioNode, type: 'scenario'});

      fileToFeature.apply('Feature: A feature\nScenario: Some scenario outline\nGiven a step\nWhen a step2\nThen a step3', function (error, result) {
        expect(error).toBeUndefined();
        expect(result).toBeDefined();

        var steps = scenarioNode.steps;
        expect(steps.length).toBe(3);
        expect(steps[0].text).toBe('Given a step');
        expect(steps[1].text).toBe('When a step2');
        expect(steps[2].text).toBe('Then a step3');

        isSatisfied();
      });
    }));
  });

  describe('tag processing', function () {
    it('adds a tag to the feature it precedes', waitForCallback(function (isSatisfied) {

      fileToFeature.apply('Tags: tag-1\nFeature: A feature', function (error, result) {
        expect(error).toBeUndefined();
        expect(result).toBeDefined();

        if (result) {
          expect(result.feature).toBe('A feature');
          expect(result.tags).toBeDefined();
          expect(result.tags.length).toBe(1);
          expect(result.tags[0]).toBe('tag-1');
        }
        isSatisfied();
      });
    }));

    it('adds multiple tags to the feature they precedes', waitForCallback(function (isSatisfied) {

      fileToFeature.apply('Tags: tag-1 tag-2 tag-3\nFeature: A feature', function (error, result) {
        expect(error).toBeUndefined();
        expect(result).toBeDefined();

        if (result) {
          expect(result.feature).toBe('A feature');
          expect(result.tags).toBeDefined();
          expect(result.tags.length).toBe(3);
          expect(result.tags[0]).toBe('tag-1');
          expect(result.tags[1]).toBe('tag-2');
          expect(result.tags[2]).toBe('tag-3');
        }
        isSatisfied();
      });
    }));

    it('adds a tag to the scenario it precedes', waitForCallback(function (isSatisfied) {

      var scenarioNode = {scenario: 'scenario'};
      scenarioDirective.create.andReturn({node: scenarioNode, type: 'scenario'});


      fileToFeature.apply('Feature: A feature\nTags: tag-1\nScenario: Some scenario', function (error, result) {
        expect(error).toBeUndefined();
        expect(result).toBeDefined();

        expect(scenarioNode.tags).toBeDefined();
        expect(scenarioNode.tags.length).toBe(1);
        expect(scenarioNode.tags[0]).toBe('tag-1');

        isSatisfied();
      });
    }));

    it('adds multiple tags to the scenario they precedes', waitForCallback(function (isSatisfied) {

      var scenarioNode = {scenario: 'scenario'};
      scenarioDirective.create.andReturn({node: scenarioNode, type: 'scenario'});

      fileToFeature.apply('Feature: A feature\nTags: tag-1 tag-2 tag-3\nScenario: Some scenario', function (error, result) {
        expect(error).toBeUndefined();
        expect(result).toBeDefined();

        expect(scenarioNode.tags).toBeDefined();
        expect(scenarioNode.tags.length).toBe(3);
        expect(scenarioNode.tags[0]).toBe('tag-1');
        expect(scenarioNode.tags[1]).toBe('tag-2');
        expect(scenarioNode.tags[2]).toBe('tag-3');

        isSatisfied();
      });
    }));

    it('ignores any tags that precede a background', waitForCallback(function (isSatisfied) {

      var node = {background: 'background'};
      backgroundDirective.create.andReturn({node: node, type: 'background'});
      var scenarioNode = {scenario: 'scenario'};
      scenarioDirective.create.andReturn({node: scenarioNode, type: 'scenario'});

      fileToFeature.apply('Feature: A feature\nTags: tag-1\nBackground: A background\nScenario: Some scenario', function (error, result) {
        expect(error).toBeUndefined();
        expect(result).toBeDefined();

        expect(result.tags).toBeUndefined();
        expect(scenarioNode.tags).toBeUndefined();

        isSatisfied();
      });
    }));

    it('ignores any tags that precede a step', waitForCallback(function (isSatisfied) {

      var scenarioNode = {scenario: 'scenario', steps: []};
      scenarioDirective.create.andReturn({node: scenarioNode, type: 'scenario'});

      fileToFeature.apply('Feature: A feature\nScenario: Some scenario\nTags: tag-1\nGiven something\nScenario: Another scenario', function (error, result) {
        expect(error).toBeUndefined();
        expect(result).toBeDefined();

        expect(scenarioNode.tags).toBeUndefined();
        expect(scenarioNode.tags).toBeUndefined();

        isSatisfied();
      });
    }));

    it('ignores any tags that precede an example', waitForCallback(function (isSatisfied) {
      var scenarioOutlineNode = {scenario: 'scenario', steps: []};
      scenarioOutlineDirective.create.andReturn({node: scenarioOutlineNode, type: 'scenario-outline'});
      var examplesNode = {examples: [], exampleColumns: []};
      examplesDirective.create.andReturn({node: examplesNode, type: 'examples'});

      fileToFeature.apply('Feature: A feature\nScenario Outline: Some scenario\nGiven something\nExamples:\nTags: tag-1\n|column-1|column-2|', function (error, result) {
        expect(error).toBeUndefined();
        expect(result).toBeDefined();

        expect(scenarioOutlineNode.tags).toBeUndefined();
        expect(examplesNode.tags).toBeUndefined();

        isSatisfied();
      });
    }));

    it('passes any tags from the feature down to all of its scenarios', waitForCallback(function (isSatisfied) {

      scenarioDirective.create.andCallFake(function (text, parent) {
        return {node: {scenario: text, steps: [], tags: parent.tags}, type: 'scenario'};
      });
      scenarioDirective.bindTo.andCallFake(function (scenario, feature) {
        if (!feature.scenarios) {
          feature.scenarios = [scenario];
        }
        else {
          feature.scenarios.push(scenario);
        }
      });

      fileToFeature.apply('Tags: tag-1\nFeature: A feature\nScenario: scenario 1\nTags: tag-2\nScenario: scenario 2', function (error, result) {
        expect(error).toBeUndefined();
        expect(result).toBeDefined();

        if (result) {
          expect(result.feature).toBe('A feature');
          expect(result.tags).toBeDefined();
          expect(result.tags.length).toBe(1);
          expect(result.tags[0]).toBe('tag-1');

          expect(result.scenarios.length).toBe(2);
          expect(result.scenarios[0].tags).toBeDefined();
          expect(result.scenarios[0].tags.length).toBe(1);
          expect(result.scenarios[0].tags[0]).toBe('tag-1');

          expect(result.scenarios[1].tags).toBeDefined();
          expect(result.scenarios[1].tags.length).toBe(2);
          expect(result.scenarios[1].tags[0]).toBe('tag-1');
          expect(result.scenarios[1].tags[1]).toBe('tag-2');
        }
        isSatisfied();
      });
    }));
  });

});
