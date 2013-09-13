module.exports = function FeatureParser(async, fileToFeature) {

return {
    parse: function (files, callback) {

      async.list(files)
        .readFile('utf8')
        .map(function (file, next) {
          next(null, fileToFeature.apply(file.data));
        })
        .reduce(function (previousValue, currentValue) {
          return previousValue.concat(currentValue)
        })
//        .each(function (definitions, next) {
//          next(null, substepExecutionBinder.create().bindExecutionTo(definitions));
//        })
        .end(callback);
    }
  };
};
