var stepImpls = [];

var currentStatus = {stepImplementation: null, step: null};

var stepImplementations = function(description, implementationsFunc){
  if(currentStatus.stepImplementation !== null){
    throw new Error('You must declare not step implementations inside other step implementations. The step implementation \''+ description +'\' is inside the implementation '+currentStatus.stepImplementation);
  }
  currentStatus.stepImplementation = description;
  implementationsFunc.call();
  currentStatus.stepImplementation = description;
};

var step = function(text, stepFunc){
  if(currentStatus.stepImplementation === null){
    throw new Error('You must declare steps inside a step implementation. The step \''+text+'\' is outside all step implementations');
  }
  if(currentStatus.step !== null){
    throw new Error('You must not declare steps inside other steps. The step \''+text+'\' is inside \''+currentStatus.step+'\'');
  }
  currentStatus.step = text;
  stepImpls.push({text: text, pattern: text, execute: stepFunc});
  currentStatus.step = null;
};

var allSteps = function(){
  return stepImpls;
};