stepDefinitions('Sample step definitions', function(){

  step('Call an external step with \'$param\' and value \'$value\'', function(param, value){
    console.log('Invoked step \'Call an external step with \''+param+'\' and value \''+value+'\'');
  });

  step('Do something else', function(){
    console.log('Invoked step \'Do something else');
  });
});