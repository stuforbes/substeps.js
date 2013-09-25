module.exports = function featureParserFactory(){

  var _ = require('underscore');
  _.str = require('underscore.string')
  var async = require('asyncjs');

  var fileToFeature = require('./fileToFeature')(require('./directives')(), require('../../string/stringTools')(), _);
  var featureExecutionBinder = require('./featureExecutionBinder')();
  return require('./featureParser')(async, fileToFeature, featureExecutionBinder);
}
