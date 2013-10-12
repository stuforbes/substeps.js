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
          var definitionsByPattern = [];

          var updateDefinitionLinesWith = function(definition){
            definitionsByPattern.push({pattern: definition.pattern, definition: definition});
          };

          var allStepCallsCachedWithPattern = function(patternStr){
            var pattern = new RegExp(pattern, 'g');
            return stepCallToStepObjects.filter(function(step){
              return pattern.test(step.text);
            });
          };

          var findDefinitionForText = function(text){
            var definitionEntry = _.find(definitionsByPattern, function(entry){ return new RegExp(entry.pattern, 'g').test(text); });
            if(definitionEntry){
              return definitionEntry.definition;
            }
          };

          var bindExecutorToStepOrCacheForLaterBinding = function(definition){
            return function(step){
              var locatedDefinitionForStep = findDefinitionForText(step.text);
              if (locatedDefinitionForStep !== undefined) {
                var d = definition;
                step.steps = locatedDefinitionForStep.steps;
                step.executor = function(){
                  output.printSuccess(step.text);
                  step.steps.forEach(function(innerStep){
                    innerStep.executor();
                  });
                };
              } else {
                step.executor = function () {
                  output.printMissingDefinition(step.text);
                };
                stepCallToStepObjects.push(step);
              }
            }
          };

          var createFunctionForDefinitionAndUpdateCachedSteps = function(definition){
//            var func = function () {
//              console.log('Substep: ' + definition.text);
//            }

            updateDefinitionLinesWith(definition);
            var allCachedStepCalls = allStepCallsCachedWithPattern(definition.pattern);
            allCachedStepCalls.forEach(function (step) {
              step.steps = definition.steps;
              step.executor = function(){
                output.printSuccess(step.text);
                step.steps.forEach(function(innerStep){
                  innerStep.executor();
                });
              };
            });
          };

          definitions.forEach(function (definition) {

            definition.steps.forEach(bindExecutorToStepOrCacheForLaterBinding(definition));
            definition.executor = executionFactory.stepContainerExecutor(definition);

            createFunctionForDefinitionAndUpdateCachedSteps(definition);
          });
        }
      }
    }
  }
}
