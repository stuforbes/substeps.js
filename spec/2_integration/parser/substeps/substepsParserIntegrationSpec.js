'use strict';

describe('substepsParser integration', function(){

  var executionFactory;
  var stepRegistry;
  var output;

  var substepsParser;

  beforeEach(function(){
    var _ = require('underscore');
    output = require('../../../../lib/cli/consoleoutput')();
    stepRegistry = require('../../../../lib/step/stepRegistry')(require('../../../../lib/execution/callbackIterator'), _);
    executionFactory = require('../../../../lib/execution/executionFactory')(output, _);

    substepsParser = require('../../../../lib/parser/substeps/substepsParserFactory')(executionFactory, stepRegistry, output);
  });

  beforeEach(function(){
    this.addMatchers({
      isDefinition: function(text, steps){
        if(this.actual.text === text){
          if(this.actual.steps.length === steps.length){
            for(var i in steps){
              if(this.actual.steps[i].text !== steps[i]){
                return false;
              }
            }
            return true;
          }
        }
        return false;
      }
    });
  });

  it('should convert all files to a list of definitions', function(){

    var onCompleteCalled = false;

    var files = [
      {path: 'spec/2_integration/parser/substeps/data/substeps/substeps1.substeps', name: 'substeps1.substeps'},
      {path: 'spec/2_integration/parser/substeps/data/substeps/substeps2.substeps', name: 'substeps2.substeps'}
    ];

    substepsParser.parse(files, function(error, results){
      expect(error).not.toBeDefined();

      expect(results).toBeDefined();
      if(results){
        expect(results.length).toBe(4);
        expect(results[0]).isDefinition('The 1st substep', ['Given a step', 'When a step', 'Then a step']);
        expect(results[1]).isDefinition('The 2nd substep', ['Given a step', 'When a step', 'Then a step']);
        expect(results[2]).isDefinition('The 3rd substep', ['Given a step', 'When a step', 'Then a step']);
        expect(results[3]).isDefinition('The 4th substep', ['Given a step', 'When a step', 'Then a step']);
      }
      onCompleteCalled = true;
    });

    waitsFor(function() { return onCompleteCalled; });
  });

  it('should attach step impls to substep steps', function(){
    var onCompleteCalled = false;

    var files = [{path: 'spec/2_integration/parser/substeps/data/substeps/substeps1.substeps', name: 'substeps1.substeps'}];
    var steps = [{text: 'Given a step', pattern: 'Given a step'}, {text: 'When a step', pattern: 'When a step'}, {text: 'Then a step', pattern: 'Then a step'}];

    steps.forEach(function(step){ stepRegistry.registerStep(step); });

    substepsParser.parse(files, function(error, results){
      expect(error).not.toBeDefined();

      expect(results).toBeDefined();
      if(results){
        expect(results.length).toBe(2);
        expect(results[0].steps[0].status).toBe('step-impl-target');
        expect(results[0].steps[1].status).toBe('step-impl-target');
        expect(results[0].steps[2].status).toBe('step-impl-target');
        expect(results[1].steps[0].status).toBe('step-impl-target');
        expect(results[1].steps[1].status).toBe('step-impl-target');
        expect(results[1].steps[2].status).toBe('step-impl-target');
      }
      onCompleteCalled = true;
    });

    waitsFor(function() { return onCompleteCalled; });

  });
});