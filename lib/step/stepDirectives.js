var stepImpls = [];

var stepDefinitions = function(description, definitionsFunc){
  console.log('Step Definitions: '+description);

  definitionsFunc.call();
};

var step = function(text, stepFunc){
  console.log('adding step '+text);
  stepImpls.push({text: text, execute: stepFunc})
};

var allSteps = function(){
  console.log('fetching all steps '+stepImpls.length);
  return stepImpls;
}