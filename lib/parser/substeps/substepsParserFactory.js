module.exports = function substepsParserFactory(executionFactory, output){

  var _ = require('underscore');
  _.str = require('underscore.string')
  var async = require('asyncjs');


  var fileToDefinitionList = require('./fileToDefinitionList')(require('../../string/stringTools')(), _);
  var substepsExecutionBinder = require('./substepsExecutionBinder')(executionFactory, output);
  return require('./substepsParser')(async, substepsExecutionBinder, fileToDefinitionList);
}
