'use strict';

describe('stepParameterLocator', function () {

  var stepParameterLocator;

  beforeEach(function () {
    stepParameterLocator = require('../../../lib/execution/stepParameterLocator')(require('underscore'));
  });

  it('should return an empty array if there are no step parameters or available parameters', function () {

    var result = stepParameterLocator.locateForStep({parameters: []}, []);
    expect(result.length).toBe(0);
  });

  it('should return an empty array if there are no step parameters but some available parameters', function () {

    var result = stepParameterLocator.locateForStep({parameters: []}, [{name: 'param1'}, {name: 'param2'}, {name: 'param3'}]);
    expect(result.length).toBe(0);
  });

  it('should return a single item array if the step has a single parameter that can be located', function(){
    var result = stepParameterLocator.locateForStep({parameters: ['param2']}, [{name: 'param1', value: 'value1'}, {name: 'param2', value: 'value2'}, {name: 'param3', value: 'value3'}]);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('param2');
    expect(result[0].value).toBe('value2');
  });

  it('should return an empty array if the step has a single parameter that can not be located', function(){
    var result = stepParameterLocator.locateForStep({parameters: ['param4']}, [{name: 'param1', value: 'value1'}, {name: 'param2', value: 'value2'}, {name: 'param3', value: 'value3'}]);
    expect(result.length).toBe(0);
  });

  it('should return a multi item array if the step has multiple parameters that can be located', function(){
    var result = stepParameterLocator.locateForStep({parameters: ['param2', 'param3']}, [{name: 'param1', value: 'value1'}, {name: 'param2', value: 'value2'}, {name: 'param3', value: 'value3'}]);
    expect(result.length).toBe(2);

    expect(result[0].name).toBe('param2');
    expect(result[0].value).toBe('value2');
    expect(result[1].name).toBe('param3');
    expect(result[1].value).toBe('value3');
  });
});
