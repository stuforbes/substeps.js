module.exports = function ExecutionFactory(output, _){

  var definitionPattern = function(definition){
    return new RegExp(definition.pattern, 'g');
  };

  var paramsAndValues = function(step, definition){
    var matches = definitionPattern(definition).exec(step.processedText());
    var numDefinitionParameters = definition.parameters ? definition.parameters.length : 0;
    if(matches.length != (numDefinitionParameters + 1)){
      console.log('Error - expected '+numDefinitionParameters+' parameters, but found '+(matches.length-1))
    } else {
      return _.reduce(matches.slice(1), function(result, match, index){
        result.push({name: definition.parameters[index], value: match});
        return result;
      }, []);
    }
    return undefined;
  };

  var createParamsArrayFor = function(step, availableParameters){
    var params = [];
    if(step.parameters){
      step.parameters.forEach(function(parameterName){
        var locatedParameter = locateParameter(parameterName, availableParameters);
        if(locatedParameter){
          var paramOb = {};
          paramOb[locatedParameter.name] = locatedParameter.value;
          params.push(paramOb);
        }
      });
    }
    return params;
  };

  var locateParameter = function(name, availableParameters){
    return _.find(availableParameters, function(availableParameter){ return availableParameter.name === name; });
  };

  var updateStepWithParentParams = function(step, parentParams){
    step.processedText = function(){
      if(parentParams && parentParams.length > 0){
        var text = step.text;
        parentParams.forEach(function(parentParam){
          for(key in parentParam){
            text = text.replace('<'+key+'>', parentParam[key]);
          }
        });
        return text;
      } else{
        return step.text;
      }
    }
  };

  var executeSubstepTarget = function(step){
    return function(parentParams){
      updateStepWithParentParams(step, parentParams);
      output.printSuccess(step.processedText());
      if(step.definition && step.definition.steps){
        var params = paramsAndValues(step, step.definition);
        if(params){
          output.descend();
          step.definition.steps.forEach(function(substep){
            substep.execute(createParamsArrayFor(substep, params));
          });
          output.ascend();
        } else {
          output.printFailure(step.text+' - Could not process params when calling substep '+step.definition.text);
        }
      } else {
        output.printFailure(step.text+' - No definition associated to step');
      }
    };
  };

  var executeStepImplTarget = function(step){
    return function(parentParams){
      updateStepWithParentParams(step, parentParams);

      if(step.stepImpl){
        var matches = new RegExp(step.stepImpl.pattern, 'g').exec(step.processedText());

        if(matches.length < 1){
          output.printFailure('Could not process step '+step.text+' - step was not correctly formed');
        } else{
          var functionArguments = matches.slice(1);

          try{
            step.stepImpl.execute.apply(this, functionArguments);
            output.printSuccess(step.text);
          } catch(e){
            output.printFailure(step.text);
//            console.log(e);
          }

        }
      } else{
        output.printFailure(step.text+' - No step implementation associated to step')
      }
    };
  };


  return {

    featureExecutor: function(feature){
      return function(tagManager, beforeScenarioHook, afterScenarioHook){
        if(tagManager.isApplicable(feature.tags)){
          feature.scenarios.forEach(function(scenario){
            if(tagManager.isApplicable(scenario.tags)){
              if(feature.background){
                feature.background.execute();
              }
              beforeScenarioHook();
              scenario.execute();
              afterScenarioHook();
            }
          });
        }
      }
    },

    stepContainerExecutor: function(stepContainer){
      return function(params){
        output.printSuccess((stepContainer.prefix ? stepContainer.prefix : '') +' ' +stepContainer.text);
        output.descend();
        stepContainer.steps.forEach(function(step){
          step.execute();
        });
        output.ascend();
      };
    },

    stepExecutor: function(step){
      if('substeps-target' === step.status){
        return executeSubstepTarget(step);
      } else if('step-impl-target' === step.status){
        return executeStepImplTarget(step);
      } else if('missing-target' === step.status){
        return  function(){
          output.printMissingDefinition(step.text);
        }
      } else{
        return function(){
          output.printFailure('Unknown status ('+step.status+') for step '+step.text);
        }
      }
    }
  };
};
