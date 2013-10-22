module.exports = function Substeps(){

  var projectDir = __dirname+'/../';

  module.exports = GLOBAL.stepRequire = function(module){
    return require(projectDir + module);
  };

  require('expectations');

  var wait = require('wait.for');
  var Log = require('log');
  var log = new Log('info');
  var _ = require('underscore');
  _.str = require('underscore.string');

  var cli = require('./cli/cli')(require('commander'), process);
  var fileLoader = require('./file/fileLoader')(require('asyncjs'), require('fs'));
  var output = require('./cli/consoleoutput')(require('colors'));
  var executionFactory = require('./execution/executionFactory')(output, _);
  var stepRegistry = require('./step/stepRegistry')(_);


  var stepLoader = require('./step/stepLoader')(stepRegistry, require('asyncjs'), require('fs'), require('vm'));
  var substepsParser = require('./parser/substeps/substepsParserFactory')(executionFactory, stepRegistry, output);
  var featureParser = require('./parser/feature/featureParserFactory')(executionFactory, stepRegistry, output, _);

  return {
    start: function(){
      var config = cli.configuration();
      log.info('Config: \n\tFeatures = '+config.features+'\n\tSubsteps: '+config.substeps);

      wait.launchFiber(function(){

        var stepFiles = wait.for(fileLoader.loadFilesOfType, config.steps, 'js');
        log.debug('Loaded '+stepFiles.length);

        wait.for(stepLoader.loadStepImplementations, stepFiles);
        log.debug('Loaded step implementations');

        var featureFiles = wait.for(fileLoader.loadFilesOfType, config.features, 'feature');
        log.debug('Loaded '+featureFiles.length+' feature files');

        var substeps = wait.for(fileLoader.loadFilesOfType, config.substeps, 'substeps');
        log.debug('Loaded '+featureFiles.length+' substeps files');

        var substepsDefinitions = wait.for(substepsParser.parse, substeps);
        console.log('substep definitions '+substepsDefinitions.length);

        var featureModels = wait.for(featureParser.parse, featureFiles);
        console.log('feature models '+featureModels.length);

        if(featureModels instanceof Array){
          featureModels.forEach(function(feature){
            feature.execute();
          });
        } else {
          featureModels.execute();
        }

//        featureModels.forEach(function(feature){
//          console.log('Feature: '+feature.feature);
//          if(feature.background){
//            console.log('\nBackground:');
//            feature.background.steps.forEach(function(step){
//              console.log('\t'+step.text);
//            });
//          }
//
//          feature.scenarios.forEach(function(scenario){
//            console.log('\n'+(scenario.outline ? 'Scenario Outline:' : 'Scenario:')+' '+scenario.text);
//            scenario.steps.forEach(function(step){
//              console.log('\t'+step.text);
//            })
//          });
//
//          console.log('\n\n');
//        });

//        substepsDefinitions.forEach(function(definition){
//          console.log('Definition: '+definition.text);
//          definition.steps.forEach(function(step){
////            console.log('\t'+step.text);
//            step.executor();
//          });
//          console.log('\n\n');
//        });

      });
      console.log('done');
    }
  };
};