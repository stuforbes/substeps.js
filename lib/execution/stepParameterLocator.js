/**
 * Locates all parameters in an available parameter array that are relevant to a step
 */
module.exports = function StepParameterLocator(_){

  var locateParameter = function(name, availableParameters){
    return _.find(availableParameters, function(availableParameter){ return availableParameter.name === name; });
  };

  return {
    /**
     * Examines the parameters for step, and locates them in availableParameters
     * @param step
     * @param availableParameters
     * @returns {Array}, keyed on parameter.name, with a value of parameter.value
     */
    locateForStep: function(step, availableParameters){
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
    }
  };
};
