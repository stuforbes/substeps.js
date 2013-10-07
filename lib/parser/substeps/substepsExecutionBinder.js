module.exports = function SubstepsExecutionBinder(executionFactory, output, _){

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

          var updateDefinitionLinesWith = function(definition){
            definitionLinesToDefinitionFunctions.push({pattern: definition.pattern, executor: definition.executor});
          };

          var findDefinitionForText = function(text){
            var patternAndExecutor = _.find(definitionLinesToDefinitionFunctions, function(entry){ return entry.pattern.test(text); });
            if(patternAndExecutor){
              return patternAndExecutor.executor;
            }
          };

          var bindExecutorToStepOrCacheForLaterBinding = function(step){
            var definitionFunction = findDefinitionForText(step.text);
            if (definitionFunction !== undefined) {
              step.executor = definitionFunction;
            } else {
              step.executor = function () {
                output.printMissingDefinition(step.text);
              };
              if (stepCallToStepObjects[step.text] === undefined) {
                stepCallToStepObjects[step.text] = [];
              }
              stepCallToStepObjects[step.text].push(step);
            }
          };

          var createFunctionForDefinitionAndUpdateCachedSteps = function(definition){
//            var func = function () {
//              console.log('Substep: ' + definition.text);
//            }

            updateDefinitionLinesWith(definition);
            if (stepCallToStepObjects[definition.text] !== undefined) {
              stepCallToStepObjects[definition.text].forEach(function (step) {
                step.executor = definition.executor;
              });
              delete stepCallToStepObjects[definition.text];
            }
          };

          definitions.forEach(function (definition) {

            definition.steps.forEach(bindExecutorToStepOrCacheForLaterBinding);
            definition.executor = executionFactory.stepContainerExecutor(definition);

            createFunctionForDefinitionAndUpdateCachedSteps(definition);
          });
        }
      }
    }
  }
}
