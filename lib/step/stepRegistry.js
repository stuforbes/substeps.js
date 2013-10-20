module.exports = function DefinitionRegistry(_){

  // List of steps that have been processed so far, keyed on pattern
  var processedSteps = [];

  // List of definitions that have been processed so far, keyed on pattern
  var processedDefinitions = [];

  /**
   * Add a new step implementation to the list of processed implementation
   * @param step The new step implementation
   * @return boolean - true if the implementation was added, false if it wasn't
   */
  var updateProcessedSteps = function(step){
    if(!findDefinitionForText(step.text) && !findStepImplForText(step.text)){
      processedSteps.push({pattern: step.pattern, value: step});
      return true;
    } else{
      return false;
    }
  };

  /**
   * Add a new definition to the list of processed definitions
   * @param definition The new definition
   * @return true if the definition was added, false if it wasn't
   */
  var updateProcessedDefinitions = function(definition){
    if(!findDefinitionForText(definition.text) && !findStepImplForText(definition.text)){
      processedDefinitions.push({pattern: definition.pattern, value: definition});
      return true;
    } else{
      return false;
    }
  };

  /**
   * Find the 1st definition that has been processed that can match the supplied text
   * @param text The text to be matched on
   * @returns {{type: 'substep', value: *}}, or undefined
   */
  var findDefinitionForText = function(text){
    return findInMapForText(text, processedDefinitions, 'substep');
  };

  /**
   * Find the 1st step that has been processed that can match the supplied text
   * @param text The text to be matched on
   * @returns {{type: 'step-impl', value: *}}, or undefined
   */
  var findStepImplForText = function(text){
    return findInMapForText(text, processedSteps, 'step-impl');
  };

  /**
   * Find an item in the supplied map, where the supplied text matches the key (a pattern)
   * @param text The text to search for
   * @param map Map of items, keyed on pattern
   * @param type String representation of the type of value of the map
   * @returns {{type: string, value: *}}
   */
  var findInMapForText = function(text, map, type){
    var entry = _.find(map, function(entry){
      return new RegExp(entry.pattern, 'g').test(text);
    });
    if(entry){
      return {type: type, value: entry.value};
    }
  };

  return {

    registerDefinition: function(definition){
      return updateProcessedDefinitions(definition);
    },

    registerStep: function(step){
      return updateProcessedSteps(step);
    },

    locateForText: function(text){
      var step = findStepImplForText(text);
      if(!step){
        return findDefinitionForText(text);
      }
      return findStepImplForText(text);
    }
  };
};
