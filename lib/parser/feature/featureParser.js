module.exports = function FeatureParser(async, fileToFeature, featureDefinitionBinder, featureExecutionBinder) {

return {
    parse: function (files, substepDefinitions, callback) {

      async.list(files)
        .readFile('utf8')
        .map(function (file, next) {
          fileToFeature.apply(file.data, function(error, result){
            next(error, result);
          });
        })
        .reduce(function (previousValue, currentValue) {
          if(previousValue instanceof Array){
            previousValue.push(currentValue);
            return previousValue;
          } else{
            return [previousValue, currentValue];
          }
        })
        .each(function (features, next) {
          if(!(features instanceof Array)) features = [features];
          featureDefinitionBinder.create().bindDefinitionsToStepsIn(features);
          featureExecutionBinder.create().bindExecutionTo(features, substepDefinitions)
          next(null, features);
        })
        .end(callback);
    }
  };
};