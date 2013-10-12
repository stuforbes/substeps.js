module.exports = function ExecutionFactory(output, _){

  var definitionPattern = function(definition){
    return new RegExp(definition.pattern, 'g');
  };

  var definitionMatching = function(step, definitions) {
    var definition = _.find(definitions, function (definition) { return definitionPattern(definition).test(step); });
    if(definition){
      var matches = definitionPattern(definition).exec(step);
      var numDefinitionParameters = definition.parameters ? definition.parameters.length : 0;
      if(matches.length != (numDefinitionParameters + 1)){
        console.log('Error - expected '+numDefinitionParameters+' parameters, but found '+(matches.length-1))
      } else {
        var paramsAndValues = _.reduce(matches.slice(1), function(result, match, index){
          result.push({name: definition.parameters[index], value: match});
          return result;
        }, []);
        return {definition: definition, params: paramsAndValues};
      }
    }
    return undefined;
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
      return function(params){
        output.printSuccess((stepContainer.prefix ? stepContainer.prefix : '') +' ' +stepContainer.text);
        output.descend();
        stepContainer.steps.forEach(function(step){
          step.executor();
        });
        output.ascend();
      };
    },

    stepExecutor: function(step, definitions){
      var matchingDefinitionAndParams = definitionMatching(step.text, definitions);
      if(matchingDefinitionAndParams){
        step.steps = matchingDefinitionAndParams.definition.steps;
        step.executor = function(){
          output.printSuccess(step.text);
          step.steps.forEach(function(innerStep){
            innerStep.executor(matchingDefinitionAndParams.params);
          });
        }
      } else{
        step.executor = function(){
          output.printMissingDefinition(step.text);
        }
      }
    }
  };
};
