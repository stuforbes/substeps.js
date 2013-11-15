'use strict';

describe('callbackIterator', function () {

  var callbackIterator;

  beforeEach(function () {
    callbackIterator = require('../../../lib/execution/callbackIterator')();
  });

  it('should not call the processor with an empty array', function () {

    var arr = [];
    var processor = jasmine.createSpy();

    callbackIterator.iterateOver(arr, processor);
    expect(processor).not.toHaveBeenCalled();
  });

  it('should call the processor once with a single item array', function () {

    var arr = ['item-1'];
    var processor = jasmine.createSpy();
    processor.andCallFake(function(item, callback){
      callback();
    });

    callbackIterator.iterateOver(arr, processor);
    expect(processor).toHaveBeenCalledWith('item-1', jasmine.any(Function));
  });

  it('should call the processor for every item in an array, if the callback is invoked', function () {

    var arr = ['item-1', 'item-2', 'item-3'];
    var processor = jasmine.createSpy();
    processor.andCallFake(function(item, callback){
      callback();
    });

    callbackIterator.iterateOver(arr, processor);
    expect(processor.callCount).toBe(3);
    expect(processor).toHaveBeenCalledWith('item-1', jasmine.any(Function));
    expect(processor).toHaveBeenCalledWith('item-2', jasmine.any(Function));
    expect(processor).toHaveBeenCalledWith('item-3', jasmine.any(Function));
  });

  it('should no call the processor for every item in an array if the callback is not invoked', function () {

    var arr = ['item-1', 'item-2', 'item-3'];
    var processor = jasmine.createSpy();
    processor.andCallFake(function(item, callback){
      if(item === 'item-1'){
        callback();
      }
    });

    callbackIterator.iterateOver(arr, processor);
    expect(processor.callCount).toBe(2);
    expect(processor).toHaveBeenCalledWith('item-1', jasmine.any(Function));
    expect(processor).toHaveBeenCalledWith('item-2', jasmine.any(Function));
  });
});
