'use strict';

describe('fileLoader integration', function(){

  var async;
  var fileLoader;

  beforeEach(function(){
    async = require('asyncjs');

    fileLoader = require('../../../lib/file/fileLoader')(async);
  });

  it('should find all feature files in the directory', function(){

    var onCompleteCalled = false;

    fileLoader.loadFilesOfType('spec/integration/file/data/features', 'feature', function(error, results){

      expect(error).toBeNull();
      var filenames = results.map(function (f) {
        return f.name;
      });
      expect(filenames).toEqual(['sub-feature11.feature', 'sub-feature12.feature', 'sub-feature21.feature', 'sub-feature22.feature', 'test.feature', 'test2.feature']);
      onCompleteCalled = true;
    });

    waitsFor(function() { return onCompleteCalled; });
  });
});