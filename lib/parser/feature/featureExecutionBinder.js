module.exports = function FeatureExecutionBinder(_) {

  return {
    create: function () {

      return {

        bindExecutionTo: function (features, definitions) {

          var processStepContainer = function (stepContainer) {
            stepContainer.steps.forEach(function (step) {
              var matchingDefinition = definitionMatching(step.step);

              if (matchingDefinition) {
                step.executor = function () {
                  matchingDefinition.executor();
                }
              } else{
                step.executor = function(){
                  console.log('couldn\'t find executor')
                }
              }
            });
            stepContainer.executor = function(){
              stepContainer.steps.forEach(function(step){
                step.executor();
              });
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
          });
        }
      };
    }
  };
}
