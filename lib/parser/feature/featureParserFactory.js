module.exports = function featureParserFactory(executionFactory, output, _){

  var async = require('asyncjs');


  var fileToFeature = require('./fileToFeature')(require('./directives')(), require('../../string/stringTools')(), _);
  var featureExecutionBinder = require('./featureExecutionBinder')(executionFactory, _);
  return require('./featureParser')(async, fileToFeature, featureExecutionBinder);
}
