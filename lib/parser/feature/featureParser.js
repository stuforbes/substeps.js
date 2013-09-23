module.exports = function FeatureParser(async, fileToFeature) {

return {
    parse: function (files, callback) {

      async.list(files)
        .readFile('utf8')
        .map(function (file, next) {
          fileToFeature.apply(file.data, function(error, result){
            next(error, result);
          });
        })
        .toArray(callback);
    }
  };
};


var createFeatureModel = function(position){
  var feature1 = {text: 'The '+position+' feature',
    background: { steps: ['A background step 1', 'A background step 2']
    },
    scenarios: [
      {scenario: 'The '+position+' scenario', outline: false, steps: ['Given a step', 'When a step', 'Then a step']},
      {scenario: 'The '+position+' scenario outline', outline: true,
        steps: ['Given a step', 'When a step', 'Then a step'],
        examples: [
          {example: ['example-row11','example-row12']},
          {example: ['example-row21','example-row22']}
        ]
      }
    ]
  };
}