'use strict';

describe('parameterExtractor', function () {

  var parameterExtractor;

  beforeEach(function () {
    parameterExtractor = require('../../../lib/execution/parameterExtractor')(require('underscore'));
  });

  it('should return an empty array if there are no parameters', function () {

    var result = parameterExtractor.extractFor('A parameterless string', 'A parameterless string', []);
    expect(result.length).toBe(0);
  });

  it('should return a single item array if the pattern has a single parameter', function(){
    var result = parameterExtractor.extractFor('A single \'parameter\' string', 'A single \'([^\']*)\' string', ['paramName']);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('paramName');
    expect(result[0].value).toBe('parameter');
  });

  it('should return a multi item array if the pattern has multiple parameters', function(){
    var result = parameterExtractor.extractFor('A multi parameter text with \'parameter1\', \'parameter2\' and \'parameter3\'', 'A multi parameter text with \'([^\']*)\', \'([^\']*)\' and \'([^\']*)\'', ['key1', 'key2', 'key3']);
    expect(result.length).toBe(3);

    expect(result[0].name).toBe('key1');
    expect(result[0].value).toBe('parameter1');
    expect(result[1].name).toBe('key2');
    expect(result[1].value).toBe('parameter2');
    expect(result[2].name).toBe('key3');
    expect(result[2].value).toBe('parameter3');
  });

  it('should return undefined if the text does not match the pattern', function(){
    var result = parameterExtractor.extractFor('Some text', 'A pattern', []);
    expect(result).toBeUndefined();
  });

  it('should return undefined if the parameter list is longer than the number of parameters in the pattern', function(){
    var result = parameterExtractor.extractFor('A multi parameter text with \'parameter1\' and \'parameter2\'', 'A multi parameter text with \'([^\']*)\' and \'([^\']*)\'', ['key1', 'key2', 'key3']);
    expect(result).toBeUndefined();
  });

  it('should return undefined if the parameter list is shorter than the number of parameters in the pattern', function(){
    var result = parameterExtractor.extractFor('A multi parameter text with \'parameter1\', \'parameter2\' and \'parameter3\'', 'A multi parameter text with \'([^\']*)\', \'([^\']*)\' and \'([^\']*)\'', ['key1', 'key2']);
    expect(result).toBeUndefined();
  });
});
