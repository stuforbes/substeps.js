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

  it('should register all processors, ready for execution', function(){
    var processors = {beforeAllFeatures: [jasmine.createSpy(), jasmine.createSpy()], beforeEveryScenario: [jasmine.createSpy(), jasmine.createSpy()], afterEveryFeature: [jasmine.createSpy(), jasmine.createSpy()]};

    stepRegistry.registerAllProcessors(processors);

    stepRegistry.fireProcessEvent('beforeAllFeatures');
    expect(processors.beforeAllFeatures[0]).toHaveBeenCalled();
    expect(processors.beforeAllFeatures[1]).toHaveBeenCalled();

    stepRegistry.fireProcessEvent('beforeEveryScenario');
    expect(processors.beforeEveryScenario[0]).toHaveBeenCalled();
    expect(processors.beforeEveryScenario[1]).toHaveBeenCalled();

    stepRegistry.fireProcessEvent('afterEveryFeature');
    expect(processors.afterEveryFeature[0]).toHaveBeenCalled();
    expect(processors.afterEveryFeature[1]).toHaveBeenCalled();
  });

  it('should update the processor set when new ones are registered, not overwrite', function(){
    var processors = {beforeEveryFeature: [jasmine.createSpy(), jasmine.createSpy()], afterEveryScenario: [jasmine.createSpy(), jasmine.createSpy()], afterAllFeatures: [jasmine.createSpy(), jasmine.createSpy()]};
    stepRegistry.registerAllProcessors(processors);

    var newProcessors = {beforeEveryFeature: [jasmine.createSpy(), jasmine.createSpy()], afterEveryScenario: [jasmine.createSpy(), jasmine.createSpy()], afterAllFeatures: [jasmine.createSpy(), jasmine.createSpy()]};
    stepRegistry.registerAllProcessors(newProcessors);

    stepRegistry.fireProcessEvent('beforeEveryFeature');
    expect(processors.beforeEveryFeature[0]).toHaveBeenCalled();
    expect(processors.beforeEveryFeature[1]).toHaveBeenCalled();
    expect(newProcessors.beforeEveryFeature[0]).toHaveBeenCalled();
    expect(newProcessors.beforeEveryFeature[1]).toHaveBeenCalled();

    stepRegistry.fireProcessEvent('afterEveryScenario');
    expect(processors.afterEveryScenario[0]).toHaveBeenCalled();
    expect(processors.afterEveryScenario[1]).toHaveBeenCalled();
    expect(newProcessors.afterEveryScenario[0]).toHaveBeenCalled();
    expect(newProcessors.afterEveryScenario[1]).toHaveBeenCalled();

    stepRegistry.fireProcessEvent('afterAllFeatures');
    expect(processors.afterAllFeatures[0]).toHaveBeenCalled();
    expect(processors.afterAllFeatures[1]).toHaveBeenCalled();
    expect(newProcessors.afterAllFeatures[0]).toHaveBeenCalled();
    expect(newProcessors.afterAllFeatures[1]).toHaveBeenCalled();
  });
});