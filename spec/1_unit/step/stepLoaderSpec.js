'use strict';

describe('stepLoader', function(){

  var stepRegistry;
  var stepLoader;

  beforeEach(function(){
    stepRegistry = jasmine.createSpyObj('stepRegistry', ['registerStep']);
    stepLoader = require('../../../lib/step/stepRegistry')(stepRegistry);
  });

  it('should use step directives to process step files and update the registry', function(){
    expect(true).toBe(false);
  });

  it('should report a problem if 2 steps have the same text', function(){
    expect(true).toBe(false);
  });
});