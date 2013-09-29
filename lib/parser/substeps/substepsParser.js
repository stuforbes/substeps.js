module.exports = function SubstepsParser(async, substepExecutionBinder, fileToDefinitionList) {

return {
    parse: function (files, callback) {

      async.list(files)
        .readFile('utf8')
        .map(function (file, next) {
          console.log('file '+file.name)
          next(null, fileToDefinitionList.apply(file.data));
        })
        .reduce(function (previousValue, currentValue) {
          return previousValue.concat(currentValue)
        })
        .each(function (definitions, next) {
          next(null, substepExecutionBinder.create().bindExecutionTo(definitions));
        })
        .end(callback);
    }
  };
};
