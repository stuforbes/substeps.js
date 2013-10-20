module.exports = function featureParserFactory(executionFactory, stepRegistry, output, _){

  var async = require('asyncjs');


  var fileToFeature = require('./fileToFeature')(require('./directives')(), require('../../string/stringTools')(), _);
  var featureStepToDefinitionBinder = require('./featureStepToDefinitionBinder')(stepRegistry);
  var featureExecutionBinder = require('./featureExecutionBinder')(executionFactory, _);
  return require('./featureParser')(async, fileToFeature, featureStepToDefinitionBinder, featureExecutionBinder);
}
