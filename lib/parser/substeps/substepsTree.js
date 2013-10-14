module.exports = function SubstepsTree(definitionRegistry){

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
   * Find a definition that matches the text in step, and bind to it, or add the step to the step call cache
   * @param step The step to be processed
   */
  var bindStepToDefinitionOrCacheForLaterBinding = function(step){
    var locatedDefinitionForStep = definitionRegistry.locateForText(step.text);
    if (locatedDefinitionForStep !== undefined) {
      step.status = 'substeps-target';
      step.definition = locatedDefinitionForStep;
    } else {
      stepCallToStepObjects.push(step);
    }
  };

  /**
   * Update the processed definitions list with the definition, and bind all suitable steps in the step cache to the definition
   * @param definition
   */
  var createFunctionForDefinitionAndUpdateCachedSteps = function(definition){
    definitionRegistry.register(definition);
    var allCachedStepCalls = allStepCallsCachedWithPattern(definition.pattern);
    allCachedStepCalls.forEach(function (step) {
      step.status = 'substeps-target';
      step.definition = definition;
    });
  };

  return {
    create: function(){
      return {
        createSubstepsTreeFrom: function(definitions){
          definitions.forEach(function (definition) {

            definition.steps.forEach(bindStepToDefinitionOrCacheForLaterBinding);

            createFunctionForDefinitionAndUpdateCachedSteps(definition);
          });
        }
      };
    }
  };
};
