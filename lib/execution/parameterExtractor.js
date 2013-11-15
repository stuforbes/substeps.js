/**
 * Used to extract an array of name, value pairs of parameters for a step text and definition
 */
module.exports = function ParameterExtractor(_){

  var patternFor = function(patternString){
    return new RegExp(patternString, 'g');
  };

  var isValidMatch = function(matches, parameterNames){
    var numParameters = parameterNames ? parameterNames.length : 0;
    if(matches.length != (numParameters + 1)){
      console.log('Error - expected '+numParameters+' parameters, but found '+(matches.length-1))
      return false;
    }
    return true;
  };

  var toParameterNVPs = function(matches, parameterNames){
    return _.reduce(matches.slice(1), function(result, match, index){
      result.push({name: parameterNames[index], value: match});
      return result;
    }, []);
  };

  return  {
    /**
     * Match the text with the pattern, and find the variable values (ie the bits that are 'matched' as regex patterns)
     * @param text The complete text line, including actual variable values
     * @param patternString The pattern to match, including wildcard match placeholders for variables. Note that this is the patternString, not the regex pattern object itself
     * @param parameterNames The names of the parameters expected to be resolved in the text
     */
    extractFor: function(text, patternString, parameterNames){
      var matches = patternFor(patternString).exec(text);
      if(matches != null && isValidMatch(matches, parameterNames)){
        return toParameterNVPs(matches, parameterNames);
      }
      return undefined;
    }
  }
};
