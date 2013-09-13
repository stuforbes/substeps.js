module.exports = function FileLoader(async){

  var walkDirectory = function(directory, fileExtension, onComplete){
    var results = [];

    async.walkfiles(directory)
      .stat()
      .filter(function(file){
        return file.stat.isFile() && endsWith(file.name, fileExtension);
      }).sort(function(f1, f1){
        return f1.path.localeCompare(f1.path);
      }).toArray(onComplete);
  };

  var endsWith = function(str, suffix){
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }

  return {
    loadFilesOfType: function(parentFolder, fileExtension, onComplete){
      walkDirectory(parentFolder, fileExtension, onComplete);
    }
  };
}
