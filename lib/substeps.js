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
  var tagManagerFactory = require('./tag/tagManager')(_);


  var stepLoader = require('./step/stepLoader')(stepRegistry, require('asyncjs'), require('fs'), require('vm'));
  var substepsParser = require('./parser/substeps/substepsParserFactory')(executionFactory, stepRegistry, output);
  var featureParser = require('./parser/feature/featureParserFactory')(executionFactory, stepRegistry, output, _);

  return {
    start: function(){
      var config = cli.configuration();
      log.info('Config: \n\tFeatures = '+config.features+'\n\tSubsteps: '+config.substeps);
      var tagManager = tagManagerFactory.create(config.tags);

      wait.launchFiber(function(){

        var stepFiles = wait.for(fileLoader.loadFilesOfType, config.steps, 'js');
        log.debug('Loaded '+stepFiles.length);

        wait.for(stepLoader.loadStepImplementationsAndProcessors, stepFiles);
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
            feature.execute(tagManager);
          });
        } else {
          featureModels.execute(tagManager);
        }
      });
    }
  };
};