module.exports = function FeatureExecutionBinder(output, _) {

  return {
    create: function () {

      return {

        bindExecutionTo: function (features, definitions) {

          var processStepContainer = function (stepContainer) {
            stepContainer.steps.forEach(function (step) {
              var matchingDefinition = definitionMatching(step.text);

              if (matchingDefinition) {
                step.executor = function () {
                  matchingDefinition.executor();
                }
              } else{
                step.executor = function(){
                  output.printMissingDefinition(step.text);
                }
              }
            });
            stepContainer.executor = function(){
              output.printSuccess(stepContainer.text);
              output.descend();
              stepContainer.steps.forEach(function(step){
                step.executor();
              });
              output.ascend();
            }
          };

          var definitionMatching = function (step) {
            return _.find(definitions, function (definition) { return (definition.text === step) });
          };

          features.forEach(function (feature) {
            // handle background
            if (feature.background) {
              processStepContainer(feature.background);
            }

            // handle scenarios
            if (feature.scenarios) {
              feature.scenarios.forEach(function (scenario) {
                processStepContainer(scenario);
              });
            }

            feature.executor = function(){
              feature.scenarios.forEach(function(scenario){
                if(feature.background){
                  feature.background.executor();
                }
                scenario.executor();
              })
            }
          });
        }
      };
    }
  };
}
