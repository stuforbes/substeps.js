var stepImpls = [];

var currentStatus = {stepDefinition: null, step: null};

var stepDefinitions = function(description, definitionsFunc){
  if(currentStatus.stepDefinition !== null){
    throw new Error('You must declare not step definitions inside other step definitions. The step definition \''+ description +'\' is inside the definition '+currentStatus.stepDefinition);
  }
  console.log('Starting step definitions: '+description);

  currentStatus.stepDefinition = description;
  definitionsFunc.call();
  console.log('Finishing step definitions: '+description);
  currentStatus.stepDefinition = description;
};

var step = function(text, stepFunc){
  if(currentStatus.stepDefinition === null){
    throw new Error('You must declare steps inside a step definition. The step \''+text+'\' is outside all step definitions');
  }
  if(currentStatus.step !== null){
    throw new Error('You must not declare steps inside other steps. The step \''+text+'\' is inside \''+currentStatus.step+'\'');
  }
  console.log('starting step: '+text);
  currentStatus.step = text;
  stepImpls.push({text: text, pattern: text, execute: stepFunc});
  currentStatus.step = null;
};

var allSteps = function(){
  console.log('fetching all steps '+stepImpls.length);
  return stepImpls;
};