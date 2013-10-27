var stepImpls = [];
var processors = {beforeAllFeatures: [], beforeEveryFeature: [], beforeEveryScenario: [], afterAllFeatures: [], afterEveryFeature: [], afterEveryScenario: []};

var currentStatus = {stepImplementation: null, step: null};

var stepImplementations = function(description, implementationsFunc){
  if(currentStatus.stepImplementation !== null){
    throw new Error('You must declare not step implementations inside other step implementations. The step implementation \''+ description +'\' is inside the implementation '+currentStatus.stepImplementation);
  }
  currentStatus.stepImplementation = description;
  implementationsFunc.call();
  currentStatus.stepImplementation = null;
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

var beforeAllFeatures = function(func){
  processors.beforeAllFeatures.push(func);
};

var beforeEveryFeature = function(func){
  processors.beforeEveryFeature.push(func);
};

var beforeEveryScenario = function(func){
  processors.beforeEveryScenario.push(func);
};

var afterAllFeatures = function(func){
  processors.afterAllFeatures.push(func);
};

var afterEveryFeature = function(func){
  processors.afterEveryFeature.push(func);
};

var afterEveryScenario = function(func){
  processors.afterEveryScenario.push(func);
};

var allSteps = function(){
  return stepImpls;
};

var allProcessors = function(){
  return processors;
};