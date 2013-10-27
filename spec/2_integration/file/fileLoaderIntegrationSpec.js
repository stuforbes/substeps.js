'use strict';

describe('fileLoader integration', function(){

  var async;
  var fs;
  var waitFor;
  var fileLoader;

  beforeEach(function(){
    async = require('asyncjs');
    fs = require('fs');
    waitFor = require('wait.for');

    fileLoader = require('../../../lib/file/fileLoader')(async, fs, waitFor);
  });

  it('should find all feature files in the directory', function(){

    var onCompleteCalled = false;

    fileLoader.loadFilesOfType('spec/2_integration/file/data/features', 'feature', function(error, results){

      expect(error).toBeNull();
      var filenames = results.map(function (f) {
        return f.name;
      });
      expect(filenames).toEqual(['sub-feature11.feature', 'sub-feature12.feature', 'sub-feature21.feature', 'sub-feature22.feature', 'test.feature', 'test2.feature']);
      onCompleteCalled = true;
    });

    waitsFor(function() { return onCompleteCalled; });
  });

  it('should load a single file if a file path is specified in the arguments', function(){
    var onCompleteCalled = false;

    fileLoader.loadFilesOfType('spec/2_integration/file/data/features/test.feature', 'feature', function(error, results){

      expect(error).toBeNull();
      var filenames = results.map(function (f) {
        return f.name;
      });
      expect(filenames).toEqual(['test.feature']);
      onCompleteCalled = true;
    });
//
//    waitsFor(function() { return onCompleteCalled; });
  });
});