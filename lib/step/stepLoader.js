module.exports = function StepLoader(async, fs){

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

  var walkDirectory = function(directory, stepImplCallback){
//    async.walkfiles(directory)
//      .stat()
//      .filter(function(file){
//        return file.stat.isFile() && endsWith(file.name, fileExtension);
//      }).sort(function(f1, f2){
//        return f1.path.localeCompare(f2.path);
//      })
//      .map()
//      .toArray(onComplete);
  };


  return {
    loadStepImplementations: function(stepFiles, callback){
      if(!(stepFiles instanceof Array)) stepFiles = [stepFiles];

//      var stepImpls = [];
//      stepFiles.forEach(function(stepFile){
//        asDirectory(stepFile, function(){
//          walkDirectory(stepFile, function(stepImpl){ stepImpls.push(stepImpl); });
//        });
//        asFile(stepFile, function(){
//          readFile(stepFile, function(stepImpl){ stepImpls.push(stepImpl); });
//        });
//      });

//      async.files(stepFiles)
//        .stat()
//        .each(function(files, next){
//          return next(null, files);
//        }).toArray(callback);
    }
  }
};