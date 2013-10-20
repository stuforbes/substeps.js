module.exports = function substepsParserFactory(executionFactory, stepRegistry, output){

  var _ = require('underscore');
  _.str = require('underscore.string');
  var async = require('asyncjs');

  var fileToDefinitionList = require('./fileToDefinitionList')(require('../../string/stringTools')(), _);
  var substepsTree = require('./substepsTree')(stepRegistry);
  var substepsExecutionBinder = require('./substepsExecutionBinder')(executionFactory, output, _);
  return require('./substepsParser')(async, substepsTree, substepsExecutionBinder, fileToDefinitionList);
};