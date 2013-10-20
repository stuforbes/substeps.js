module.exports = function FeatureExecutionBinder(executionFactory, _) {

  return {
    create: function () {

      return {

        bindExecutionTo: function (features) {

          var processStepContainer = function (stepContainer) {
            stepContainer.steps.forEach(function (step) {
              step.execute = executionFactory.stepExecutor(step);

            });
            stepContainer.execute = executionFactory.stepContainerExecutor(stepContainer);
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

            feature.execute = executionFactory.featureExecutor(feature);
          });
        }
      };
    }
  };
};
