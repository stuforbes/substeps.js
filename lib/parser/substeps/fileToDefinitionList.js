module.exports = function FileToDefinitionList(stringTools, _){

  var regex = /<([^>]*)>/g;
//    var regex = /single/g;


  var definitionFrom = function(text){
    return {text: text.substring(7).trim(), parameters: extractParamsFrom(text), steps: []};
  }

  var stepFrom = function(text){
    return {text: text, parameters: extractParamsFrom(text)};
  }

  var extractParamsFrom = function(text){
    var params = text.match(regex);
    if(!params || params === null){
      return [];
    } else{
      return _.map(params, function(p){ return p.substring(1, p.length-1); })
    }
  }

  return {
    apply: function(fileContents){
      var lines = fileContents.split('\n');

      var definitions = new Array();

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
}
