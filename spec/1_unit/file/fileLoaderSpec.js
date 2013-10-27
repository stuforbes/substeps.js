'use strict';

describe('fileLoader', function(){

  var async;
  var fs;
  var fileLoader;

  beforeEach(function(){
    async = jasmine.createSpyObj('asyncjs', ['walkfiles', 'files', 'stat', 'filter', 'sort', 'toArray']);
    fs = jasmine.createSpyObj('fs', ['stat']);

    async.walkfiles.andReturn(async);
    async.files.andReturn(async);
    async.stat.andReturn(async);
    async.filter.andReturn(async);
    async.sort.andReturn(async);
    async.toArray.andReturn(async);


    fileLoader = require('../../../lib/file/fileLoader')(async, fs, require('wait.for'));
  });

  it('should use async to locate all feature files recursively', function(){

    fs.stat.andCallFake(function(path, callback){
      callback(null, {isDirectory: function(){return true;}});
    });

    var onComplete = jasmine.createSpy('onComplete');
    var featureFileFilter = jasmine.createSpy('featureFileFilter');
    var stat = jasmine.createSpy('file stat');

    fileLoader.loadFilesOfType('directory', 'feature', onComplete);

    expect(async.walkfiles).toHaveBeenCalledWith('directory');
    expect(async.stat).toHaveBeenCalled();
    expect(async.filter).toHaveBeenCalled();
    expect(async.sort).toHaveBeenCalled();
  });

  it('should use async to locate a single feature file', function(){

    fs.stat.andCallFake(function(path, callback){
      callback(null, {isDirectory: function(){return false;}});
    });

    var onComplete = jasmine.createSpy('onComplete');
    var featureFileFilter = jasmine.createSpy('featureFileFilter');
    var stat = jasmine.createSpy('file stat');

    fileLoader.loadFilesOfType('directory', 'feature', onComplete);

    expect(async.files).toHaveBeenCalledWith(['directory']);
    expect(async.stat).toHaveBeenCalled();
    expect(async.filter).toHaveBeenCalled();
  });

  it('should filter out directories', function(){

    fs.stat.andCallFake(function(path, callback){
      callback(null, {isDirectory: function(){return true;}});
    });

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

    fs.stat.andCallFake(function(path, callback){
      callback(null, {isDirectory: function(){return true;}});
    });

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

    fs.stat.andCallFake(function(path, callback){
      callback(null, {isDirectory: function(){return true;}});
    });

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

