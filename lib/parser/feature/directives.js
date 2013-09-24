module.exports = function Directives(){
  return {
    directiveFeature: function(){
      return {
        text: 'Feature:',
        stepContainer: false
      }
    },

    directiveBackground: function(){
      return {
        text: 'Background:',
        stepContainer: true,
        isApplicable: function(previous){ return previous.type === 'feature'},
        create: function(text){
          return {type: 'background', node: { steps: [] }};
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
        isApplicable: function(previous){ return previous.type === 'feature'},
        create: function(text){
          return {type: 'scenario', node: {scenario: text, outline: false, steps: []}}
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
        isApplicable: function(previous){ return previous.type === 'feature'},
        create: function(text){
          return {type: 'scenario-outline', node: {scenario: text, outline: true, steps: []}}
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
        isApplicable: function(previous){ return previous.type === 'scenario-outline'},
        create: function(text){
          return {type: 'examples', node: {exampleColumns: [], examples: []}};
        },
        bindTo: function(node, parent){
          parent.examples = node;
        }
      };
    },

    directives: function(){
      return [this.directiveFeature(), this.directiveBackground(), this.directiveScenario(), this.directiveScenarioOutline(), this.directiveExamples()];
    }
  };
}
