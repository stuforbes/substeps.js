stepImplementations('Sample step implementations', function(){

  var _;

  step('Call an external step with \'([^"]*)\' and value \'([^"]*)\'', function(param, value, callback){
//    console.log('Invoked step \'Call an external step with \''+param+'\' and value \''+value+'\'');

//    expect(value % 2).toBe(0);
//    _ = require('underscore');

    callback();
  });

  step('Do something else', function(callback){
//    console.log('Invoked step \'Do something else');
//    console.log(_.filter([1, 2, 3, 4], function(item){ return item % 2 === 0; }));

    callback();
  });
});