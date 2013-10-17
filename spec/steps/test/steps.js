stepDefinitions(function(){

  step('Call an external step with \'$param\' and value \'$value\'', function(param, value){
    console.log('Invoked step \'Call an external step with \''+param+'\' and value \''+value+'\'');
  });
});