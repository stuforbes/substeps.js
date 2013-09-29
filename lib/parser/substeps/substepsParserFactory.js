module.exports = function substepsParserFactory(output){

  var _s = require('underscore.string')
  var async = require('asyncjs');

  var fileToDefinitionList = require('./fileToDefinitionList')(require('../../string/stringTools')(), _s);
  var substepsExecutionBinder = require('./substepsExecutionBinder')(output);
  return require('./substepsParser')(async, substepsExecutionBinder, fileToDefinitionList);
}
