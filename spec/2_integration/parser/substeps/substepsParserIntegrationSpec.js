'use strict';

describe('substepsParser integration', function(){

  var executionFactory;
  var output;

  var substepsParser;

  beforeEach(function(){
    output = require('../../../../lib/cli/consoleoutput')();
    executionFactory = require('../../../../lib/execution/executionFactory')(output, require('underscore'));

    substepsParser = require('../../../../lib/parser/substeps/substepsParserFactory')(executionFactory, output);
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
});