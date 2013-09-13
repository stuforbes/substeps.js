'use strict';

describe('fileLoader', function(){

  var async;
  var fileLoader;

  beforeEach(function(){
    async = jasmine.createSpyObj('asyncjs', ['walkfiles', 'stat', 'filter', 'sort', 'toArray']);

    async.walkfiles.andReturn(async);
    async.stat.andReturn(async);
    async.filter.andReturn(async);
    async.sort.andReturn(async);
    async.toArray.andReturn(async);


    fileLoader = require('../../../lib/file/fileLoader')(async);
  });

  it('should use async to locate all feature files recursively', function(){

    var onComplete = jasmine.createSpy('onComplete');
    var featureFileFilter = jasmine.createSpy('featureFileFilter');
    var stat = jasmine.createSpy('file stat');

    fileLoader.loadFilesOfType('directory', 'feature', onComplete);

    expect(async.walkfiles).toHaveBeenCalledWith('directory');
    expect(async.stat).toHaveBeenCalled();
    expect(async.filter).toHaveBeenCalled();
    expect(async.sort).toHaveBeenCalled();
    expect(async.toArray).toHaveBeenCalledWith(onComplete);
  });

  it('should filter out directories', function(){

    var file = {
      stat: jasmine.createSpyObj('stat', ['isFile']),
      name: 'test'
    };
    file.stat.isFile.andReturn(false);

    var result;

    async.filter.andCallFake(function(callback){
      result = callback(file);
      return async;
    });

    fileLoader.loadFilesOfType('directory', 'feature', jasmine.createSpy());

    expect(file.stat.isFile).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should filter out non-feature files', function(){

    var file = {
      stat: jasmine.createSpyObj('stat', ['isFile']),
      name: 'file.something'
    };
    file.stat.isFile.andReturn(true);

    var result;

    async.filter.andCallFake(function(callback){
      result = callback(file);
      return async;
    });

    fileLoader.loadFilesOfType('directory', 'feature', jasmine.createSpy());

    expect(file.stat.isFile).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should retain feature files when filtering', function(){

    var file = {
      stat: jasmine.createSpyObj('stat', ['isFile']),
      name: 'test.feature'
    };
    file.stat.isFile.andReturn(true);

    var result;

    async.filter.andCallFake(function(callback){
      result = callback(file);
      return async;
    });

    fileLoader.loadFilesOfType('directory', 'feature', jasmine.createSpy());

    expect(file.stat.isFile).toHaveBeenCalled();
    expect(result).toBe(true);
  });

});

