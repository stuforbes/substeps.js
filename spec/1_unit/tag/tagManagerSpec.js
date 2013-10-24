'use strict';

describe('tagManager', function(){

  var tagManagerFactory;

  beforeEach(function(){
    var _ = require('underscore');
    tagManagerFactory = require('../../../lib/tag/tagManager')(_);
  });

  it('should allow all entries if the tag list was empty', function(){
    var tagManager = tagManagerFactory.create();

    expect(tagManager.isApplicable(['tag-1 tag-2'])).toBe(true);
    expect(tagManager.isApplicable([])).toBe(true);
  });

  it('should allow an entry if the include tag list is empty, and no tags match the exclude list', function(){
    var tagManager = tagManagerFactory.create('--unimplemented --failing');

    expect(tagManager.isApplicable(['tag-1 tag-2'])).toBe(true);
    expect(tagManager.isApplicable([])).toBe(true);
  });

  it('should refuse an entry if the include tag list is empty, and a tag matches the exclude list', function(){
    var tagManager = tagManagerFactory.create('--unimplemented --failing');

    expect(tagManager.isApplicable(['unimplemented'])).toBe(false);
    expect(tagManager.isApplicable(['failing', 'tag-1'])).toBe(false);
    expect(tagManager.isApplicable(['unimplemented', 'failing'])).toBe(false);
  });

  it('should refuse an entry if no tags match the include list', function(){
    var tagManager = tagManagerFactory.create('tag-1 tag-2');

    expect(tagManager.isApplicable([''])).toBe(false);
    expect(tagManager.isApplicable(['tag-3'])).toBe(false);
  });

  it('should allow an entry if a tag matches the include list', function(){
    var tagManager = tagManagerFactory.create('tag-1 tag-2');

    expect(tagManager.isApplicable(['tag-1'])).toBe(true);
    expect(tagManager.isApplicable(['tag-2'])).toBe(true);
    expect(tagManager.isApplicable(['tag-3', 'tag-4', 'tag-1'])).toBe(true);
  });

  it('should refuse an entry if a tag matches the include list and the exclude list', function(){
    var tagManager = tagManagerFactory.create('tag-1 tag-2 --unimplemented');

    expect(tagManager.isApplicable(['tag-1 unimplemented'])).toBe(false);
    expect(tagManager.isApplicable(['tag-1 tag-2 unimplemented'])).toBe(false);
    expect(tagManager.isApplicable(['unimplemented tag-1 tag-2'])).toBe(false);
  });
});