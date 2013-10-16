module.exports = function FeatureStepToDefinitionBinder(definitionRegistry) {

  return {
    create: function () {

      var processStepContainer = function(stepContainer){
        stepContainer.steps.forEach(function (step) {
          var locatedDefinitionForStep = definitionRegistry.locateForText(step.text);
          if (locatedDefinitionForStep) {
            step.status = 'substeps-target';
            step.definition = locatedDefinitionForStep;
          }
        });
      };

      return {

        bindDefinitionsToStepsIn: function (features) {
          features.forEach(function(feature){
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
//          var processStepContainer = function (stepContainer) {
//            stepContainer.steps.forEach(function (step) {
//              executionFactory.stepExecutor(step, definitions);
//
//            });
//            stepContainer.execute = executionFactory.stepContainerExecutor(stepContainer);
//          };
//
//          features.forEach(function (feature) {
//            // handle background
//            if (feature.background) {
//              processStepContainer(feature.background);
//            }
//
//            // handle scenarios
//            if (feature.scenarios) {
//              feature.scenarios.forEach(function (scenario) {
//                processStepContainer(scenario);
//              });
//            }
//
//            feature.execute = executionFactory.featureExecutor(feature);
//          });
        }
      };
    }
  };
}
