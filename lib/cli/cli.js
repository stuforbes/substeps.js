module.exports = function Cli(commander, process){

  var configurationLoaded = false;
  var loadConfiguration = function(){
    commander
      .option('-f, --features <features>', 'Feature file/folder location *Mandatory')
      .option('-s, --substeps <substeps>', 'Substeps folder location *Mandatory')
      .option('-i, --steps <steps>', 'Step Implementation files *Mandatory')
      .version('0.0.1')
      .parse(process.argv);

    configurationLoaded = true;

    if(!commander.features || !commander.substeps || !commander.steps){
      console.log('Usage: substeps -f <features> -s <substeps> -i <steps>');
      process.exit();
    }
  };

  return {
    configuration: function(){
      if(!configurationLoaded){
        loadConfiguration();
      }
      return {features: commander.features, substeps: commander.substeps, steps: commander.steps};
    }
  };
};