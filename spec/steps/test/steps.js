stepImplementations('Sample step implementations', function(){

  step('Call an external step with \'([^"]*)\' and value \'([^"]*)\'', function(param, value){
//    console.log('Invoked step \'Call an external step with \''+param+'\' and value \''+value+'\'');

    expect(value % 2).toBe(0);
  });

  step('Do something else', function(){
//    console.log('Invoked step \'Do something else');
  });
});