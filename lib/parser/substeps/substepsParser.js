module.exports = function SubstepsParser(async, substepsTree, substepExecutionBinder, fileToDefinitionList) {

return {
    parse: function (files, steps, callback) {

      async.list(files)
        .readFile('utf8')
        .map(function (file, next) {
          next(null, fileToDefinitionList.apply(file.data));
        })
        .reduce(function (previousValue, currentValue) {
          return previousValue.concat(currentValue)
        })
        .each(function (definitions, next) {
          substepsTree.create().createSubstepsTreeFrom(definitions, steps);
          substepExecutionBinder.create().bindExecutionTo(definitions)
          next(null, definitions);
        })
        .end(callback);
    }
  };
};
