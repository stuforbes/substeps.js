module.exports = function StringTools(){

  var startsWithQuote = function(text){
    return text.charAt(0) == '\'' || text.charAt(0) == '"';
  }

  var findCommentIndex = function(text){
    var splitByQuotes = text.split(/('[^']+'|"[^,]+")/g);
    var index = 0;

    for(var i in splitByQuotes){
      var indexOfComment = splitByQuotes[i].indexOf('#');
      if(startsWithQuote(splitByQuotes[i]) || indexOfComment == -1){
        // skip ahead - this line part is a quote
        index += splitByQuotes[i].length;
      } else {
          index += indexOfComment;
          break;
      }
    }
    return index;
  }

  return {
    stripCommentsFrom: function(line){
      if(line.indexOf('#') == -1){
        return line;
      }

      var index = findCommentIndex(line);

      return line.substring(0, index).trim();
    }
  }
}
