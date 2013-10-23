module.exports = function Directives(_){

  var parseTags = function(text){
    return _.map(text.split(/[ ,\n]+/), function(t){ return t.trim(); });
  };

  return {

    directiveTag: function(){
      return {
        text: 'Tags:',
        stepContainer: false,
        isTaggable: false,
        isApplicable: function(previous){ return true; },
        create: function(text){
          return {type: 'tag', node: {prefix: 'Tags:', tags: parseTags(text)}}
        }
      }
    },

    directiveFeature: function(){
      return {
        text: 'Feature:',
        stepContainer: false,
        isTaggable: true
      }
    },

    directiveBackground: function(){
      return {
        text: 'Background:',
        stepContainer: true,
        isTaggable: false,
        isApplicable: function(previous){ return previous.type === 'feature'},
        create: function(text){
          return {type: 'background', node: { prefix: 'Background:', text: '', steps: [] }};
        },
        bindTo: function(node, parent){
          parent.background = node;
        }
      }
    },

    directiveScenario: function(){
      return {
        text: 'Scenario:',
        stepContainer: true,
        isTaggable: true,
        isApplicable: function(previous){ return previous.type === 'feature'},
        create: function(text, parent){
          var scenario = {type: 'scenario', node: {prefix: 'Scenario:', text: text, outline: false, steps: []}};
          scenario.node.tags = parent.tags ? parent.tags : [];
          return scenario;
        },
        bindTo: function(node, parent){
          if(parent.scenarios === undefined){
            parent.scenarios = [];
          }
          parent.scenarios.push(node);
        }
      }
    },

    directiveScenarioOutline: function(){
      return {
        text: 'Scenario Outline:',
        stepContainer: true,
        isTaggable: true,
        isApplicable: function(previous){ return previous.type === 'feature'},
        create: function(text, parent){
          var scenarioOutline = {type: 'scenario-outline', node: {prefix: 'Scenario Outline', text: text, outline: true, steps: []}};
          scenarioOutline.node.tags = parent.tags ? parent.tags : [];
          return scenarioOutline;
        },
        bindTo: function(node, parent){
          if(parent.scenarios === undefined){
            parent.scenarios = [];
          }
          parent.scenarios.push(node);
        }
      };
    },

    directiveExamples: function(){
      return {
        text: 'Examples:',
        stepContainer: false,
        isTaggable: false,
        isApplicable: function(previous){ return previous.type === 'scenario-outline'},
        create: function(text){
          return {type: 'examples', node: {prefix: 'Examples', text: '', exampleColumns: [], examples: []}};
        },
        bindTo: function(node, parent){
          parent.examples = node;
        }
      };
    },

    directives: function(){
      return [this.directiveTag(), this.directiveFeature(), this.directiveBackground(), this.directiveScenario(), this.directiveScenarioOutline(), this.directiveExamples()];
    }
  };
}
