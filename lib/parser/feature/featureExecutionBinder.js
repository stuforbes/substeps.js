module.exports = function FeatureExecutionBinder(executionFactory, _) {

  return {
    create: function () {

      return {

        bindExecutionTo: function (features, definitions) {

          var processStepContainer = function (stepContainer) {
            stepContainer.steps.forEach(function (step) {
              step.executor = executionFactory.stepExecutor(step, definitions);

            });
            stepContainer.executor = executionFactory.stepContainerExecutor(stepContainer);
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

            feature.executor = executionFactory.featureExecutor(feature);
          });
        }
      };
    }
  };
}
