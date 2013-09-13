'use strict';

describe('stringToolsSpec', function(){

  var stringTools;

  beforeEach(function(){
    stringTools = require('../../../lib/string/stringTools')();
  });

  it('should strip comments from the end of a line', function(){
    expect(stringTools.stripCommentsFrom('some step line # with a comment')).toBe('some step line');
  });

  it('return an empty line if the only content is in a comment', function(){
    expect(stringTools.stripCommentsFrom('# a comment line')).toBe('');
    expect(stringTools.stripCommentsFrom('  # a comment line with leading whitespace')).toBe('');
  });

  it('should return the same line if there is no comment', function(){
    expect(stringTools.stripCommentsFrom('some step line')).toBe('some step line');
  });

  it('should return the same line if the only comment is in a quote', function(){
    expect(stringTools.stripCommentsFrom('some step line with a " comment # in double quotes"')).toBe('some step line with a " comment # in double quotes"');
    expect(stringTools.stripCommentsFrom('some step line with a \' comment # in single quotes\'')).toBe('some step line with a \' comment # in single quotes\'');
  });
});