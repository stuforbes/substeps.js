module.exports = function FileToDefinitionList(stringTools, _s){

  var definitionFrom = function(text){
    return {text: text.substring(7).trim(), steps: []};
  }

  var stepFrom = function(text){
    return {text: text};
  }

  return {
    apply: function(fileContents){
      var lines = fileContents.split('\n');

      var definitions = new Array();

      lines.forEach(function(line){
        var trimmed = stringTools.stripCommentsFrom(line).trim();
        if(_s.startsWith(trimmed, 'Define:')){
          definitions.push(definitionFrom(trimmed));
        } else if(trimmed.length > 0 && definitions.length > 0){
          definitions[definitions.length-1].steps.push(stepFrom(trimmed));
        }
      });

      return definitions;
    }
  };
}
