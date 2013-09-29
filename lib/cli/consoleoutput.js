module.exports = function ConsoleOutput(colors){

  var depth=0;

  var outputText = function(text){
    var str = '';
    for(var i=0; i<depth; i++){
      str+='\t';
    }
    console.log(str+text);
  }

  return {
    descend: function(){
      depth++;
    },

    ascend: function(){
      if(depth > 0){
        depth--;
      }
    },

    printSuccess: function(text){
      outputText(text.green);
    },

    printMissingDefinition: function(text){
      outputText(text.yellow);
    },

    printFailure: function(text){
      outputText(text.red);
    }
  };
}
