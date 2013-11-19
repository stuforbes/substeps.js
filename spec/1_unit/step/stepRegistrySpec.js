'use strict';

describe('stepRegistry', function(){

  var stepRegistry;
  var callbackIterator;

  beforeEach(function(){
    callbackIterator = jasmine.createSpyObj('callbackIterator', ['iterateOver']);
    stepRegistry = require('../../../lib/step/stepRegistry')(callbackIterator, require('underscore'));
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

    var callback = jasmine.createSpy();
    stepRegistry.fireProcessEvent('beforeAllFeatures', {}, callback);
    expect(callbackIterator.iterateOver).toHaveBeenCalledWith(processors.beforeAllFeatures, jasmine.any(Function), callback);

    stepRegistry.fireProcessEvent('beforeEveryScenario', {}, callback);
    expect(callbackIterator.iterateOver).toHaveBeenCalledWith(processors.beforeEveryScenario, jasmine.any(Function), callback);

    stepRegistry.fireProcessEvent('afterEveryFeature');
    expect(callbackIterator.iterateOver).toHaveBeenCalledWith(processors.afterEveryFeature, jasmine.any(Function), undefined);
  });

  it('should update the processor set when new ones are registered, not overwrite', function(){
    var processors = {beforeEveryFeature: [jasmine.createSpy(), jasmine.createSpy()], afterEveryScenario: [jasmine.createSpy(), jasmine.createSpy()], afterAllFeatures: [jasmine.createSpy(), jasmine.createSpy()]};
    stepRegistry.registerAllProcessors(processors);

    var newProcessors = {beforeEveryFeature: [jasmine.createSpy(), jasmine.createSpy()], afterEveryScenario: [jasmine.createSpy(), jasmine.createSpy()], afterAllFeatures: [jasmine.createSpy(), jasmine.createSpy()]};
    stepRegistry.registerAllProcessors(newProcessors);

    var callback = jasmine.createSpy();
    stepRegistry.fireProcessEvent('beforeEveryFeature', {}, callback);
    expect(callbackIterator.iterateOver).toHaveBeenCalledWith([processors.beforeEveryFeature[0], processors.beforeEveryFeature[1], newProcessors.beforeEveryFeature[0], newProcessors.beforeEveryFeature[1]], jasmine.any(Function), callback);

    stepRegistry.fireProcessEvent('afterEveryScenario', {});
    expect(callbackIterator.iterateOver).toHaveBeenCalledWith([processors.afterEveryScenario[0], processors.afterEveryScenario[1], newProcessors.afterEveryScenario[0], newProcessors.afterEveryScenario[1]], jasmine.any(Function), undefined);

    stepRegistry.fireProcessEvent('afterAllFeatures', callback);
    expect(callbackIterator.iterateOver).toHaveBeenCalledWith([processors.afterAllFeatures[0], processors.afterAllFeatures[1], newProcessors.afterAllFeatures[0], newProcessors.afterAllFeatures[1]], jasmine.any(Function), undefined);
  });
});