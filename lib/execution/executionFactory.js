module.exports = function ExecutionFactory(stepRegistry, callbackIterator, parameterExtractor, stepParameterLocator, output, _) {

  var processOutputText = function(substep, params){
    if (params) {
      var text = substep.text;
      params.forEach(function(param){
        text = text.replace('<' + param.name + '>', param.value);
      });
      return text;
    } else {
      return substep.text;
    }
  };

  var updateStepWithParentParams = function (step, parentParams) {
    step.processedText = function () {
      if (parentParams && parentParams.length > 0) {
        var text = step.text;
        parentParams.forEach(function (parentParam) {
          for (key in parentParam) {
            text = text.replace('<' + key + '>', parentParam[key]);
          }
        });
        return text;
      } else {
        return step.text;
      }
    }
  };

  var executeSubstepTarget = function (step) {
    return function (parentParams, callback) {
      updateStepWithParentParams(step, parentParams);
      output.printSuccess(step.processedText());
      if (step.definition && step.definition.steps) {
        var params = parameterExtractor.extractFor(step, step.definition);
        if (params) {
          output.descend();

          callbackIterator.iterateOver(step.definition.steps, function (substep, callback) {
            var substepParams = stepParameterLocator.locateForStep(substep, params);
            substep.execute(substepParams, callback);
          });
          output.ascend();
        } else {
          output.printFailure(step.text + ' - Could not process params when calling substep ' + step.definition.text);
        }
      } else {
        output.printFailure(step.text + ' - No definition associated to step');
      }
      callback();
    };
  };

  var executeStepImplTarget = function (step) {
    return function (parentParams) {
      updateStepWithParentParams(step, parentParams);

      if (step.stepImpl) {
        var matches = new RegExp(step.stepImpl.pattern, 'g').exec(step.processedText());

        if (matches.length < 1) {
          output.printFailure('Could not process step ' + step.text + ' - step was not correctly formed');
        } else {
          var functionArguments = matches.slice(1);

          try {
            step.stepImpl.execute.apply(this, functionArguments);
            output.printSuccess(step.text);
          } catch (e) {
            output.printFailure(step.text);
//            console.log(e);
          }

        }
      } else {
        output.printFailure(step.text + ' - No step implementation associated to step')
      }
    };
  };

  var callStepChain = function (idx, steps, paramsForStepFn) {
    if (steps && idx < steps.length) {
      steps[idx].execute(paramsForStepFn(steps[idx]), function () {
        callStepChain(idx + 1, steps, paramsForStepFn);
      });
    }
  };

  return {

    featureSetExecutor: function (features) {
      return function (tagManager) {

        stepRegistry.fireProcessEvent('beforeAllFeatures', {}, function (error) {
          if (!error || error === null) {
            features.forEach(function (feature) {
              if (tagManager.isApplicable(feature.tags)) {
                stepRegistry.fireProcessEvent('beforeEveryFeature', {}, function (error) {
                  if (!error || error === null) {
                    feature.execute(tagManager);

                    stepRegistry.fireProcessEvent('afterEveryFeature', {});
                  }
                });
              }
            });

            stepRegistry.fireProcessEvent('afterAllFeatures', {});
          }
        });
      };
    },

    featureExecutor: function (feature) {
      return function (tagManager) {
        // if feature has applicable tags
        if (tagManager.isApplicable(feature.tags)) {

          // iterate over scenarios
          feature.scenarios.forEach(function (scenario) {

            // if scenario has applicable tags
            if (tagManager.isApplicable(scenario.tags)) {

              // do the beforeEveryScenario processor
              stepRegistry.fireProcessEvent('beforeEveryScenario', {}, function (error) {

                // if there were no errors in scenario prep
                if (!error || error === null) {

                  // do background
                  if (feature.background) {
                    feature.background.execute();
                  }

                  // do scenario
                  scenario.execute();

                  // do afterEveryScenario processor
                  stepRegistry.fireProcessEvent('afterEveryScenario', {});
                }
              });
            }
          });
        }
      }
    },

    backgroundExecutor: function (background) {
      return function () {

        output.printSuccess('Background:');
        output.descend();

        callbackIterator.iterateOver(background.steps, function (step) {
          step.execute();
        });

        output.ascend();
      };
    },

    scenarioExecutor: function (scenario) {
      return function () {
        output.printSuccess('Scenario: ' + scenario.text);
        output.descend();

        callbackIterator.iterateOver(scenario.steps, function (step) {
          step.execute();
        });

        output.ascend();
      }
    },

    substepExecutor: function (substep) {
      return function (params, callback) {
        if (substep.definition && substep.definition.steps) {
          output.printSuccess(processOutputText(substep, params));
          output.descend();

          callbackIterator.iterateOver(substep.definition.steps, function(step, callback){
            step.execute(stepParameterLocator.locateForStep(step, params), callback);
          }, callback);

          output.ascend();

        } else {
          output.printFailure(substep.text + ' - No definition associated to step')
        }
      };
    },

    stepExecutor: function (step) {
      if ('step-impl-target' === step.status) {
        return executeStepImplTarget(step);
      } else if ('missing-target' === step.status) {
        return  function () {
          output.printMissingDefinition(step.text);
        }
      } else {
        return function () {
          output.printFailure('Unknown status (' + step.status + ') for step ' + step.text);
        }
      }
    }
  };
};
