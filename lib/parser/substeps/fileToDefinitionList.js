module.exports = function FileToDefinitionList(stringTools, _){

  var parameterRegex = /<([^>]*)>/g;
  var matchAllRegexText = '([^"]*)';
//    var regex = /single/g;


  var definitionFrom = function(text){
    var processedText = text.substring(7).trim();
    var patternAndParams = extractParamsFrom(processedText);
    return {text: processedText, pattern: patternAndParams.pattern, parameters: patternAndParams.parameters, steps: []};
  };

  var stepFrom = function(text){
    return {text: text, parameters: extractParamsFrom(text).parameters};
  };

  var extractParamsFrom = function(text){
    var params = text.match(parameterRegex);
    if(!params || params === null){
      return {pattern: text, parameters: []};
    } else{
      var processedText = text;
      params.forEach(function(param){ processedText = processedText.replace(param, matchAllRegexText); });
      return {pattern: processedText, parameters: _.map(params, function(p){ return p.substring(1, p.length-1); })};
    }
  };

  return {
    apply: function(fileContents){
      var lines = fileContents.split('\n');

      var definitions = [];

      lines.forEach(function(line){
        var trimmed = stringTools.stripCommentsFrom(line).trim();
        if(_.str.startsWith(trimmed, 'Define:')){
          definitions.push(definitionFrom(trimmed));
        } else if(trimmed.length > 0 && definitions.length > 0){
          definitions[definitions.length-1].steps.push(stepFrom(trimmed));
        }
      });

      return definitions;
    }
  };
};
