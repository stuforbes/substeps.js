/**
 * Support for processing items in an array, waiting for the callback from
 * an iteration process to be invoked before processing the next item in the array
 */
module.exports = function CallbackIterator(){

  var processArrayItem = function(idx, arr, processor, callback){
    if(arr && idx < arr.length){
      processor(arr[idx], function(){
        processArrayItem(idx+1, arr, processor, callback);
      });
    } else{
      if(callback) callback();
    }
  };

  return  {
    /**
     * iterate over the array, calling the processor on each item. Wait for a callback to be invoked before
     * calling subsequent items in the array
     * @param arr The array to be iterated over
     * @param processor A processor function, which takes the arguments function(item, callback)
     * @param callback (optional) To be called after all items have been executed
     */
    iterateOver: function(arr, processor, callback){
      processArrayItem(0, arr, processor, callback);
    }
  }
};
