/**
 * Support for processing items in an array, waiting for the callback from
 * an iteration process to be invoked before processing the next item in the array
 */
module.exports = function CallbackIterator(){

  var processArrayItem = function(idx, arr, processor){
    if(arr && idx < arr.length){
      processor(arr[idx], function(){
        processArrayItem(idx+1, arr, processor);
      });
    }
  };

  return  {
    /**
     * iterate over the array, calling the processor on each item. Wait for a callback to be invoked before
     * calling subsequent items in the array
     * @param arr The array to be iterated over
     * @param processor A processor function, which takes the arguments function(item, callback)
     */
    iterateOver: function(arr, processor){
      processArrayItem(0, arr, processor);
    }
  }
};
