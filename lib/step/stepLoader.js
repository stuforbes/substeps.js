module.exports = function StepLoader(stepRegistry, async, fs, vm){

  var validateAndCallback = function(steps, callback){

    var stepMap = [];
    var error = {isError: false, message: ''};
    steps.forEach(function(step){
      if(!error.isError){
        if(stepMap[step.text]){
          error = {isError: true, message: 'Substeps could not execute - there are 2 steps with the text \''+step.text+'\''};
        } else{
          stepMap[step.text] = step;
          stepRegistry.registerStep(step);
        }
      }
    });

    if(error.isError){
      callback(error.message);
    } else{
      callback(undefined, steps);
    }
  };

  return {

    loadStepImplementations: function(stepFiles, callback){

      var src = fs.readFileSync(__dirname+'/stepDirectives.js');
      vm.runInThisContext(src, 'stepDirectives');

      stepFiles.forEach(function(stepFile){
        stepRequire(stepFile.path);
      });

      validateAndCallback(allSteps(), callback);

    }
  };
};