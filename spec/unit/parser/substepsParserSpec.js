'use strict';

describe('substepsParser', function(){

  var async;
  var substepExecutionBinder;
  var fileToDefinitionList;
  var substepsParser;

  beforeEach(function(){
    async = jasmine.createSpyObj('asyncjs', ['list', 'readFile', 'map', 'reduce', 'each', 'end']);
    fileToDefinitionList = jasmine.createSpyObj('fileToDefinitionList', ['apply']);
    substepExecutionBinder = jasmine.createSpyObj('substepExecutionBinder', ['create']);

    substepsParser = require('../../../lib/parser/substepsParser')(async, substepExecutionBinder, fileToDefinitionList);

    async.list.andReturn(async);
    async.readFile.andReturn(async);
    async.map.andReturn(async);
    async.reduce.andReturn(async);
    async.each.andReturn(async);
    async.end.andReturn(async);
  });

  it('should use async to read all files and convert to definitions', function(){

    var onComplete = jasmine.createSpy('onComplete');
    var files = ['file1', 'file2', 'file3'];

    substepsParser.parse(files, onComplete);

    expect(async.list).toHaveBeenCalledWith(files);
    expect(async.readFile).toHaveBeenCalledWith('utf8');
    expect(async.map).toHaveBeenCalled();
    expect(async.reduce).toHaveBeenCalled();
    expect(async.each).toHaveBeenCalled();
    expect(async.end).toHaveBeenCalledWith(onComplete);
  });

  it('should map file contents to a list of substep definitions', function(){

    var next = jasmine.createSpy('next');
    var definitionList = [{text: 'definition1'}, {text: 'definition2'}];

    var file = {
      data: 'file data'
    };

    fileToDefinitionList.apply.andReturn(definitionList);

    async.map.andCallFake(function(callback){
      callback(file, next);
      return async;
    });

    substepsParser.parse([file], jasmine.createSpy());

    expect(fileToDefinitionList.apply).toHaveBeenCalledWith('file data');
    expect(next).toHaveBeenCalledWith(null, definitionList);
  });

  it('should concat all definitions into a single array', function(){

    var previousDefinitions = [{text: 'definition1'}, {text: 'definition2'}];
    var currentDefinitions = [{text: 'definition3'}, {text: 'definition4'}];
    var result = [];

    async.reduce.andCallFake(function(callback){
      result = callback(previousDefinitions, currentDefinitions);
      return async;
    });

    substepsParser.parse([{data: 'file data'}], jasmine.createSpy());

    expect(result.length).toBe(4);
    expect(result[0].text).toBe('definition1');
    expect(result[1].text).toBe('definition2');
    expect(result[2].text).toBe('definition3');
    expect(result[3].text).toBe('definition4');
  });

  it('should append execution info to the definitions', function(){

    var next = jasmine.createSpy('next');
    var executionBinderImpl = {
      bindExecutionTo: jasmine.createSpy('executionBinderImpl')
    };
    var definitionList = [{text: 'definition1'}, {text: 'definition2'}];

    substepExecutionBinder.create.andReturn(executionBinderImpl);

    fileToDefinitionList.apply.andReturn(definitionList);

    async.each.andCallFake(function(callback){
      callback(definitionList, next);
      return async;
    });

    substepsParser.parse({data: 'file data'}, jasmine.createSpy());

    expect(executionBinderImpl.bindExecutionTo).toHaveBeenCalledWith(definitionList);
  });
});
