'use strict';

describe('cli', function(){

  var commander, process;
  var cli;

  beforeEach(function(){
    commander = jasmine.createSpyObj('commander', ['option', 'version', 'parse']);
    process = jasmine.createSpyObj('process', ['exit']);

    commander.option.andReturn(commander);
    commander.version.andReturn(commander);
    commander.parse.andReturn(commander);

    cli = require('../../../lib/cli/cli.js')(commander, process);
  });

  it('should stop the process if the feature folder is not present', function(){

    commander.substeps = 'substeps';
    commander.steps = 'steps';

    cli.configuration();

    expect(process.exit).toHaveBeenCalled();
  });

  it('should stop the process if the substeps folder is not present', function(){

    commander.features = 'features';
    commander.steps = 'steps';

    cli.configuration();

    expect(process.exit).toHaveBeenCalled();
  });

  it('should stop the process if the steps are not present', function(){

    commander.features = 'features';
    commander.substeps = 'substeps';

    cli.configuration();

    expect(process.exit).toHaveBeenCalled();
  });

  it('should return valid configuration if the feature file, substeps file and steps are present', function(){

    commander.features = 'features';
    commander.substeps = 'substeps';
    commander.steps = 'steps';

    var config = cli.configuration();
    expect(config.features).toBe('features');
    expect(config.substeps).toBe('substeps');
    expect(config.steps).toBe('steps');

    expect(process.exit).not.toHaveBeenCalled();

  });

  it('should return any supplied tags', function(){

    commander.features = 'features';
    commander.substeps = 'substeps';
    commander.steps = 'steps';
    commander.tags = '"tag-1 tag-2 --unimplemented"';

    var config = cli.configuration();
    expect(config.tags).toBe('"tag-1 tag-2 --unimplemented"');

    expect(process.exit).not.toHaveBeenCalled();
  });
});