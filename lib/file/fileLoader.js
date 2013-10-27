module.exports = function FileLoader(async, fs, wait){

  var asDirectory = function(path, callback){
    doWithPathIf(path, callback, function(stats){ return stats.isDirectory(); });
  };

  var asFile = function(path, callback){
    doWithPathIf(path, callback, function(stats){ return !stats.isDirectory(); });
  };

  var doWithPathIf = function(path, callback, statsFunc){
    fs.stat(path, function(err, stats){
      if(err){
        console.log('Error when reading path '+path+'. Error is: ' + err);
      } else{
        if(statsFunc(stats)){
          callback();
        }
      }
    });
  };

  var walkDirectory = function(path, fileExtension, onComplete){

    var results = [];

    async.walkfiles(path)
      .stat()
      .filter(function(file){
        return file.stat.isFile() && endsWith(file.name, fileExtension);
      }).sort(function(f1, f2){
        return f1.path.localeCompare(f2.path);
      }).toArray(onComplete);
  };

  var processFile = function(file, fileExtension, onComplete){
    async.files([file])
      .stat()
      .filter(function(file){
        return file.stat.isFile() && endsWith(file.name, fileExtension);
      }).toArray(onComplete);
  };

  var endsWith = function(str, suffix){
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  return {
    loadFilesOfType: function(parentFolders, fileExtension, onComplete){
      wait.launchFiber(function(){
        var count = 0;
        var allResults = [];
        var parentFoldersArr = parentFolders.split(',');

        var completeParentFolder = function(err, results){
          if(results) allResults = allResults.concat(results);
          count ++;
          if(count === parentFoldersArr.length) {
            onComplete(err, allResults);
          }
        };

        parentFoldersArr.forEach(function(parentFolder){
          asDirectory(parentFolder, function(){
            walkDirectory(parentFolder, fileExtension, completeParentFolder);
          });
          asFile(parentFolder, function(){
            processFile(parentFolder, fileExtension, completeParentFolder);
          });
        });
      });

    }
  };
};
