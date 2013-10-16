module.exports = function DefinitionRegistry(_){

  // List of definitions that have been processed so far, keyed on pattern
  var processedDefinitions = [];

  /**
   * Add a new definition to the list of processed definitions
   * @param definition The new definition
   */
  var updateProcessedDefinitions = function(definition){
    processedDefinitions.push({pattern: definition.pattern, definition: definition});
  };

  /**
   * Find the 1st definition that has been processed that can match the supplied text
   * @param text The text to be matched on
   * @returns The 1st definition to match the text, or undefined
   */
  var findDefinitionForText = function(text){
    var definitionEntry = _.find(processedDefinitions, function(entry){
      return new RegExp(entry.pattern, 'g').test(text);
    });
    if(definitionEntry){
      return definitionEntry.definition;
    }
    return undefined;
  };

  return {

    register: function(definition){
      updateProcessedDefinitions(definition);
    },

    locateForText: function(text){
      return findDefinitionForText(text);
    }
  };
};
