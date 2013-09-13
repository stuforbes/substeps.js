module.exports = function Substeps(){


  var wait = require('wait.for');
  var Log = require('log');
  var log = new Log('info')

  var cli = require('./cli/cli')(require('commander'), process);
  var fileLoader = require('./file/fileLoader')(require('asyncjs'));


  var substepsParser = require('./parser/substeps/substepsParserFactory')();

  return {
    start: function(){
      var config = cli.configuration();
      log.info('Config: \n\tFeatures = '+config.features+'\n\tSubsteps: '+config.substeps);

      wait.launchFiber(function(){
        var featureFiles = wait.for(fileLoader.loadFilesOfType, config.features, 'feature');
        log.debug('Loaded '+featureFiles.length+' feature files');

        var substeps = wait.for(fileLoader.loadFilesOfType, config.substeps, 'substeps');
        log.debug('Loaded '+featureFiles.length+' substeps files');

        var substepsDefinitions = wait.for(substepsParser.parse, substeps);
        console.log('substep definitions '+substepsDefinitions.length);

        substepsDefinitions.forEach(function(definition){
          console.log('Definition: '+definition.text);
          definition.steps.forEach(function(step){
//            console.log('\t'+step.text);
            step.executor();
          });
          console.log('\n\n');
        });

      });
      console.log('done');
    }
  };
};