'use strict';

describe('featureParser', function(){

  var async;
  var fileToFeature;
  var featureParser;

  beforeEach(function(){
    async = jasmine.createSpyObj('asyncjs', ['list', 'readFile', 'map', 'toArray']);
    fileToFeature = jasmine.createSpyObj('fileToFeatureList', ['apply']);

    featureParser = require('../../../../lib/parser/feature/featureParser')(async, fileToFeature);

    async.list.andReturn(async);
    async.readFile.andReturn(async);
    async.map.andReturn(async);
    async.toArray.andReturn(async);
  });

  it('should use async to read all files and convert to definitions', function(){

    var onComplete = jasmine.createSpy('onComplete');
    var files = ['file1', 'file2', 'file3'];

    featureParser.parse(files, onComplete);

    expect(async.list).toHaveBeenCalledWith(files);
    expect(async.readFile).toHaveBeenCalledWith('utf8');
    expect(async.map).toHaveBeenCalled();
//    expect(async.reduce).toHaveBeenCalled();
//    expect(async.each).toHaveBeenCalled();
    expect(async.toArray).toHaveBeenCalledWith(onComplete);
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
});
