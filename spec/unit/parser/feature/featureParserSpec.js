'use strict';

describe('featureParser', function(){

  var async;
  var fileToFeature;
  var featureParser;
  var featureExecutionBinder;

  beforeEach(function(){
    async = jasmine.createSpyObj('asyncjs', ['list', 'readFile', 'map', 'reduce', 'each', 'end']);
    fileToFeature = jasmine.createSpyObj('fileToFeatureList', ['apply']);
    featureExecutionBinder = jasmine.createSpyObj('featureExecutionBinder', ['create']);

    featureParser = require('../../../../lib/parser/feature/featureParser')(async, fileToFeature, featureExecutionBinder);

    async.list.andReturn(async);
    async.readFile.andReturn(async);
    async.map.andReturn(async);
    async.each.andReturn(async);
    async.reduce.andReturn(async);
    async.end.andReturn(async);
  });

  it('should use async to read all files and convert to definitions', function(){

    var onComplete = jasmine.createSpy('onComplete');
    var files = ['file1', 'file2', 'file3'];
    var substeps = ['substep1', 'substep2', 'substep3'];

    featureParser.parse(files, substeps, onComplete);

    expect(async.list).toHaveBeenCalledWith(files);
    expect(async.readFile).toHaveBeenCalledWith('utf8');
    expect(async.map).toHaveBeenCalled();
    expect(async.reduce).toHaveBeenCalled();
    expect(async.each).toHaveBeenCalled();
    expect(async.end).toHaveBeenCalledWith(onComplete);
  });

  it('should map file contents to a feature', function(){

    var next = jasmine.createSpy('next');
    var feature = {text: 'feature1'};

    var file = {
      data: 'file data'
    };

    fileToFeature.apply.andReturn(feature);

    async.map.andCallFake(function(callback){
      callback(file, next);
      return async;
    });

    featureParser.parse([file], jasmine.createSpy());

    expect(fileToFeature.apply).toHaveBeenCalledWith('file data', jasmine.any(Function));
  });

  it('should reduce 2 features to an array of features', function(){
    var previous = {text: 'feature1'};
    var current = {text: 'feature2'};
    var result = null;

    var file = {
      data: 'file data'
    };

    async.reduce.andCallFake(function(callback){
      result = callback(previous, current);
      return async;
    });

    featureParser.parse([file], jasmine.createSpy());

    expect(result).not.toBeNull()
    expect(result.length).toBe(2);
    expect(result[0]).toBe(previous);
    expect(result[1]).toBe(current);
  });

  it('should reduce an array of existing features and a new feature to an array of features', function(){
    var previous = [{text: 'feature1'}, {text: 'feature2'}];
    var current = {text: 'feature3'};
    var result = null;

    var file = {
      data: 'file data'
    };

    async.reduce.andCallFake(function(callback){
      result = callback(previous, current);
      return async;
    });

    featureParser.parse([file], jasmine.createSpy());

    expect(result).not.toBeNull()
    expect(result.length).toBe(3);
    expect(result[0]).toBe(previous[0]);
    expect(result[1]).toBe(previous[1]);
    expect(result[2]).toBe(current);
  });

  it('should append execution info to the features', function(){

    var next = jasmine.createSpy('next');
    var executionBinderImpl = {
      bindExecutionTo: jasmine.createSpy('executionBinderImpl')
    };
    var substepDefinitionList = [{text: 'definition1'}, {text: 'definition2'}];
    var featureList = [{text: 'feature1'}, {text: 'feature2'}];

    next.andCallFake(function(error, result){
      console.log('next called')
    });

    featureExecutionBinder.create.andReturn(executionBinderImpl);

    async.each.andCallFake(function(callback){
      callback(featureList, next);
      return async;
    });

    featureParser.parse({data: 'file data'}, substepDefinitionList, jasmine.createSpy());

    expect(executionBinderImpl.bindExecutionTo).toHaveBeenCalledWith(featureList, substepDefinitionList);
  });
});
