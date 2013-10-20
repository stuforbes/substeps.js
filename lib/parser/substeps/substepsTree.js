module.exports = function SubstepsTree(stepRegistry){

  // List of steps that so far do not have a definition associated to it
  var stepCallToStepObjects = [];

  /**
   * Find all steps that are currently cached with no supporting definition, that have text that can be matched with the pattern
   * @param patternStr The pattern to match on
   * @returns All matching cached steps
   */
  var allStepCallsCachedWithPattern = function(patternStr){
    var pattern = new RegExp(patternStr, 'g');
    return stepCallToStepObjects.filter(function(step){
      return pattern.test(step.text);
    });
  };

  /**
   * Find a stepImplementation or definition that matches the text in step, and bind to it, or add the step to the step call cache
   * @param step The step to be processed
   */
  var bindStepToStepImplementationOrDefinitionOrCacheForLaterBinding = function(stepImplementations){
    return function(step){
      var locatedTargetForStep = stepRegistry.locateForText(step.text);
      if (locatedTargetForStep !== undefined) {
        if('substep' === locatedTargetForStep.type){
          step.status = 'substeps-target';
          step.definition = locatedTargetForStep.value;
        } else {
          step.status = 'step-impl-target';
          step.stepImpl = locatedTargetForStep.value;
        }
      } else {
        stepCallToStepObjects.push(step);
      }
    }
  };

  /**
   * Update the processed definitions list with the definition, and bind all suitable steps in the step cache to the definition
   * @param definition
   */
  var createFunctionForDefinitionAndUpdateCachedSteps = function(definition){
    stepRegistry.registerDefinition(definition);
    var allCachedStepCalls = allStepCallsCachedWithPattern(definition.pattern);
    allCachedStepCalls.forEach(function (step) {
      step.status = 'substeps-target';
      step.definition = definition;
    });
  };

  return {
    create: function(){
      return {
        createSubstepsTreeFrom: function(definitions, stepImplementations){
          definitions.forEach(function (definition) {

            definition.steps.forEach(bindStepToStepImplementationOrDefinitionOrCacheForLaterBinding(stepImplementations));

            createFunctionForDefinitionAndUpdateCachedSteps(definition);
          });
        }
      };
    }
  };
};
