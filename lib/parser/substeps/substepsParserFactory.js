module.exports = function substepsParserFactory(executionFactory, output){

  var _ = require('underscore');
  _.str = require('underscore.string');
  var async = require('asyncjs');

  var definitionRegistry = require('./definitionRegistry')(_);
  var fileToDefinitionList = require('./fileToDefinitionList')(require('../../string/stringTools')(), _);
  var substepsTree = require('./substepsTree')(definitionRegistry);
  var substepsExecutionBinder = require('./substepsExecutionBinder')(executionFactory, output, _);
  return require('./substepsParser')(async, substepsTree, substepsExecutionBinder, fileToDefinitionList);
};