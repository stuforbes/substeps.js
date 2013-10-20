'use strict';

describe('stepRegistry', function(){

  var stepRegistry;

  beforeEach(function(){
    stepRegistry = require('../../../lib/step/stepRegistry')(require('underscore'));
  });

  it('should store definitions which can be looked up via direct text matching', function(){
    var definition = {text: 'A definition', pattern: 'A definition'};
    var result = stepRegistry.registerDefinition(definition);
    expect(result).toBe(true);

    var located = stepRegistry.locateForText('A definition');
    expect(located).toBeDefined();
    expect(located.type).toBe('substep');
    expect(located.value).toBe(definition);
  });

  it('should store definitions which can be looked up via pattern matching', function(){
    var definition = {text: 'A \'<param>\' definition', pattern: 'A \'([^"]*)\' definition'};
    var result = stepRegistry.registerDefinition(definition);
    expect(result).toBe(true);

    var located = stepRegistry.locateForText('A \'something\' definition');
    expect(located).toBeDefined();
    expect(located.type).toBe('substep');
    expect(located.value).toBe(definition);
  });

  it('should not allow a definition to be registered if it shares a name with an existing definition', function(){
    var definition = {text: 'A definition', pattern: 'A definition'};
    var result = stepRegistry.registerDefinition(definition);
    expect(result).toBe(true);

    result = stepRegistry.registerDefinition(definition);
    expect(result).toBe(false);
  });

  it('should not allow a definition to be registered if it shares a name with an existing step', function(){
    var result = stepRegistry.registerStep({text: 'A step', pattern: 'A step'});
    expect(result).toBe(true);

    result = stepRegistry.registerDefinition({text: 'A step', pattern: 'A step'});
    expect(result).toBe(false);
  });

  it('should store step implementations which can be looked up via direct text matching', function(){
    var step = {text: 'A step', pattern: 'A step'};
    var result = stepRegistry.registerStep(step);
    expect(result).toBe(true);

    var located = stepRegistry.locateForText('A step');
    expect(located).toBeDefined();
    expect(located.type).toBe('step-impl');
    expect(located.value).toBe(step);
  });

  it('should store step implementations which can be looked up via pattern matching', function(){
    var step = {text: 'A \'<param>\' step', pattern: 'A \'([^"]*)\' step'};
    var result = stepRegistry.registerStep(step);
    expect(result).toBe(true);

    var located = stepRegistry.locateForText('A \'something\' step');
    expect(located).toBeDefined();
    expect(located.type).toBe('step-impl');
    expect(located.value).toBe(step);
  });

  it('should not allow a step to be registered if it shares a name with an existing step', function(){
    stepRegistry.registerStep({text: 'A step', pattern: 'A step'});
    var result = stepRegistry.registerStep({text: 'A step', pattern: 'A step'});
    expect(result).toBe(false);
  });

  it('should return an undefined value if a step or definition cannot be located', function(){
    var located = stepRegistry.locateForText('An unknown step or definition');

    expect(located).toBeUndefined();
  });
});