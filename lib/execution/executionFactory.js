module.exports = function ExecutionFactory(output, _){

  var definitionMatching = function (step, definitions) {
    return _.find(definitions, function (definition) { return (definition.text === step) });
  };

  return {

    featureExecutor: function(feature){
      return function(){
        feature.scenarios.forEach(function(scenario){
          if(feature.background){
            feature.background.executor();
          }
          scenario.executor();
        })
      }
    },

    stepContainerExecutor: function(stepContainer){
      return function(){
        output.printSuccess(stepContainer.prefix+' ' +stepContainer.text);
        output.descend();
        stepContainer.steps.forEach(function(step){
          step.executor();
        });
        output.ascend();
      };
    },

    stepExecutor: function(step, definitions){
      return function(){
        var matchingDefinition = definitionMatching(step.text, definitions);

        if (matchingDefinition) {
          matchingDefinition.executor();
        } else{
          output.printMissingDefinition(step.text);
        }
      }
    }
  };
};
