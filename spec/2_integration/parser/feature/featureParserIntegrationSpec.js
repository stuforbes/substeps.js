'use strict';

describe('featureParser integration', function () {

  var _;
  var executionFactory;
  var stepRegistry;
  var output;

  var featureParser;

  beforeEach(function () {
    _ = require('underscore');
    _.str = require('underscore.string');
    output = require('../../../../lib/cli/consoleoutput')();

    executionFactory = require('../../../../lib/execution/executionFactory')(output, _);
    stepRegistry = require('../../../../lib/step/stepRegistry')(_);
    featureParser = require('../../../../lib/parser/feature/featureParserFactory')(executionFactory, stepRegistry, output, _);
  });

  beforeEach(function () {
    this.addMatchers(featureMatcher());

  });

  it('should convert all files to a list of features', function () {

    var onCompleteCalled = false;

    var files = [
      {path: 'spec/2_integration/parser/feature/data/feature/feature1.feature', name: 'feature1.feature'},
      {path: 'spec/2_integration/parser/feature/data/feature/feature2.feature', name: 'feature2.feature'}
    ];

    var feature1 = createFeatureModel('1st');
    var feature2 = createFeatureModel('2nd');

    featureParser.parse(files, function (error, results) {
      expect(error).toBeUndefined();
      expect(results).toBeDefined();

      if(results){
        expect(results.length).toBe(2);
        expect(results[0]).isFeature(feature1);
        expect(results[1]).isFeature(feature2);
      }

      onCompleteCalled = true;
    });

    waitsFor(function () {
      return onCompleteCalled;
    });
  });

  var createFeatureModel = function (position) {
    return {'feature': 'The ' + position + ' feature',
      background: { steps: ['A background step 1', 'A background step 2']
      },
      scenarios: [
        {scenario: 'The ' + position + ' scenario', outline: false, steps: ['Given a step', 'When a step', 'Then a step']},
        {scenario: 'The ' + position + ' scenario outline', outline: true,
          steps: ['Given a step', 'When a step', 'Then a step'],
          examples: {
            exampleColumns: ['example-column1', 'example-column2'],
            examples: [
              {example: ['example-row11', 'example-row12']},
              {example: ['example-row21', 'example-row22']}
            ]
          }
        }
      ]
    };
  }

  var featureMatcher = function () {

    var isBackgroundMatch = function (actual, expected) {
      return isStepsMatch(actual.steps, expected.steps);
    };

    var isScenariosMatch = function (actual, expected) {
      if (actual.length === expected.length) {
        for (var i in actual) {
          if (actual[i].outline === expected[i].outline) {
            var result;
            if (actual[i].outline) {
              result = isScenarioOutlineMatch(actual[i], expected[i]);
            } else {
              result = isScenarioMatch(actual[i], expected[i]);
            }
            if (!result) {
              return false;
            }
          } else {
            return false;
          }
        }
        return true;
      }
      return false;
    };

    var isScenarioMatch = function (actual, expected) {
      return (actual.text == expected.scenario) && isStepsMatch(actual.steps, expected.steps);
    };

    var isScenarioOutlineMatch = function (actual, expected) {
      var scenarioMatch = isScenarioMatch(actual, expected);

      if (scenarioMatch) {
        return isExamplesMatch(actual.examples, expected.examples);
      } else{
        return false;
      }
    };

    var isStepsMatch = function (actuals, expecteds) {
      if (actuals.length === expecteds.length) {
        for (var i in actuals) {
          if (actuals[i].text !== expecteds[i]) {
            return false;
          }
        }
        return true;
      }
      return false;
    };

    var isExamplesMatch = function (actual, expected) {
      if(isExampleColumnsMatch(actual.exampleColumns, expected.exampleColumns)){
        if(isExampleRowsMatch(actual.examples, expected.examples)){
          return true;
        }
      }
      return false;
//      if (actuals.length !== expecteds.length) {
//        for (var i in actuals) {
//          if (!isExampleMatch(actuals[i], expecteds[i])) {
//            return false;
//          }
//        }
//        return true;
//      }
//      return false;
    };

    var isExampleColumnsMatch = function(actuals, expecteds){
      if(actuals.length === expecteds.length){
        for(var i in actuals){
          if(actuals[i] !== expecteds[i]){
            return false;
          }
        }
        return true;
      }
      return false;
    };

    var isExampleRowsMatch = function(actuals, expecteds){
      if(actuals.length === expecteds.length){
        for(var i in actuals){
          if(!isExampleMatch(actuals[i], expecteds[i].example)){
            return false;
          }
        }
        return true;
      }
      return false;
    };

    var isExampleMatch = function (actual, expected) {
      if (actual.length === expected.length) {
        for (var i in actual) {
          if (!actual[i] === expected[i]) {
            return false;
          }
        }
        return true;
      }
      return false;
    };

    return {
      isFeature: function (feature) {
        var actual = this.actual;
        if (this.actual.feature === feature.feature) {
          if (isBackgroundMatch(this.actual.background, feature.background)) {
            if (isScenariosMatch(this.actual.scenarios, feature.scenarios)) {
              return true;
            }
          }
        }
        return false;
      }
    };
  }
});