module.exports = function SubstepsExecutionBinder(executionFactory, output, _){

  return {
    create: function(){

      return {
        bindExecutionTo: function(definitions){
          definitions.forEach(function (definition) {

            definition.steps.forEach(function(step){
              executionFactory.stepExecutor(step);
            });
          });
        }
      }
    }
  }
};