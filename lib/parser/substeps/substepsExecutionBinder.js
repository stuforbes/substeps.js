module.exports = function SubstepsExecutionBinder(){

  return {
    create: function(){

      return {

        // general process:
        //  1. create a function for this substep (how to do??)
        //  2. create entry in  definitionLinesToDefinitionFunctions map
        //  3. check if there are any entries in stepCallToStepObjects for this definition. If so, add function to all step objects
        //  1. iterate through steps, for each one, check if it is in the definitionLinesToDefinitionFunction map
        //  2. if so, add the function from this map to this steps fn property
        //  3. if not, add this step to the stepCallToStepObjects map
        bindExecutionTo: function(definitions){
          var stepCallToStepObjects = [];
          var definitionLinesToDefinitionFunctions = [];

          var bindExecutorToStepOrCacheForLaterBinding = function(step){
            var definitionFunction = definitionLinesToDefinitionFunctions[step.text];
            if (definitionFunction !== undefined) {
              step.executor = definitionFunction;
            } else {
              step.executor = function () {
                console.log('no substep defined for ' + step.text + ' yet');
              };
              if (stepCallToStepObjects[step.text] === undefined) {
                stepCallToStepObjects[step.text] = [];
              }
              stepCallToStepObjects[step.text].push(step);
            }
          };

          var createFunctionForDefinitionAndUpdateCachedSteps = function(definition){
            var func = function () {
              console.log('Substep: ' + definition.text);
            }

            definitionLinesToDefinitionFunctions[definition.text] = func;
            if (stepCallToStepObjects[definition.text] !== undefined) {
              stepCallToStepObjects[definition.text].forEach(function (step) {
                step.executor = func;
              });
              delete stepCallToStepObjects[definition.text];
            }
          }

          definitions.forEach(function (definition) {

            createFunctionForDefinitionAndUpdateCachedSteps(definition);

            definition.steps.forEach(bindExecutorToStepOrCacheForLaterBinding);
            definition.executor = function(){
              definition.steps.forEach(function(step){
                step.executor();
              });
            }
          });
        }
      }
    }
  }
}
