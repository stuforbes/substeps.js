module.exports = function FeatureExecutionBinder(executionFactory, _) {

  return {
    create: function () {

      return {

        bindExecutionTo: function (features) {

          var processBackground = function(background){
            background.execute = executionFactory.backgroundExecutor(background);

            processStepContainer(background);
          };

          var processScenario = function(scenario){
            scenario.execute = executionFactory.scenarioExecutor(scenario);

            processStepContainer(scenario);
          }

          var processStepContainer = function (stepContainer) {
            stepContainer.steps.forEach(function (step) {
              if(step.definition && step.definition !== null){
                step.execute = executionFactory.substepExecutor(step);
                processStepContainer(step.definition);
              } else{
                step.execute = executionFactory.stepExecutor(step);
              }
            });
          };

          features.forEach(function (feature) {
            // handle background
            if (feature.background) {
              processBackground(feature.background);
            }

            // handle scenarios
            if (feature.scenarios) {
              feature.scenarios.forEach(function (scenario) {
                processScenario(scenario);
              });
            }

            feature.execute = executionFactory.featureExecutor(feature);
          });
        }
      };
    }
  };
};
