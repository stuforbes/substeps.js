module.exports = function FileToFeature(directives, stringTools, _) {

  var directiveOrUndefined = function (text) {
    return _.find(directives.directives(), function (directive) {
      return _.str.startsWith(text, directive.text);
    });
  };

  var processFeature = function (text) {
    return {type: 'feature', directive: directives.directiveFeature(), node: {feature: text.substring(directives.directiveFeature().text.length).trim()}};
  };

  var processTag = function(text){
    return directives.directiveTag().create(text.substring(directives.directiveTag().text.length).trim())
  };

  var processDirective = function (text, directive, previous, feature, lineNumber, failure) {
    if (directive.isApplicable(previous)) {
      var newNode = directive.create(text.substring(directive.text.length).trim(), previous.node);
      newNode.directive = directive;
      directive.bindTo(newNode.node, previous.node);

      // temporary var - use this to traverse the tree
      newNode.parent = previous;
      return newNode;
    } else if (previous.parent !== undefined) {
      return processDirective(text, directive, previous.parent, feature, lineNumber, failure);
    } else{
      failure.isFailure = true;
      failure.message = 'Could not create feature. Unexpected directive ('+directive.text.substring(0, directive.text.length-1)+') on line '+lineNumber;
      return undefined;
    }
  };

  var processExampleRow = function (text, previous) {
    if (previous.node.exampleColumns.length === 0) {
      previous.node.exampleColumns = trimAndFilterEmptyExamples(text);
    } else {
      previous.node.examples.push(trimAndFilterEmptyExamples(text));
    }
  };

  var trimAndFilterEmptyExamples = function (text) {
    return _.filter(_.map(text.split('|'), function (val) {
      return val.trim();
    }), function (val) {
      return val.trim().length > 0;
    });
  };

  var processStep = function (text, previous, feature, lineNumber, failure) {
    if(previous.node){
    if(previous.node.steps){
      previous.node.steps.push({text: text, status: 'missing-target'});
    } else{
      failure.isFailure = true;
      failure.message = 'Could not create feature. Tried to add a step ('+text+') to directive ('+previous.type+') on line '+lineNumber
    }
    } else {
      failure.isFailure = true;
      failure.message = 'Could not create feature. Tried to create a step ('+text+') before a directive was created on line '+lineNumber
    }
  };

  var isExamplesDirective = function (previous) {
    return previous.type === 'examples';
  };

  var bindScopedTagsToNode = function(directive, tags){
    if(directive.node !== null){

      if(directive.directive.isTaggable){
        if(directive.node.tags){
          directive.node.tags = directive.node.tags.concat(tags);
        } else{
          directive.node.tags = tags;
        }
      }
    }
  };

  var resetScopedTags = function(scopedTags){
    if(scopedTags){
      scopedTags.dueThisIteration = false;
      scopedTags.node = null;
    }
  };

  return {
    apply: function (fileContents, callback) {
      var lines = fileContents.split('\n');

      var feature = null;
      var scopedTags = {definedThisIteration: false, dueThisIteration: false, node: null};
      var previous = {type: '', node: null};
      var failure = {isFailure: false};

      lines.forEach(function (line, i) {
        if (!failure.isFailure) {
          var lineNumber = i+1;
          var trimmed = stringTools.stripCommentsFrom(line).trim();
          if (trimmed.length > 0) {
            var directive = directiveOrUndefined(trimmed);
            if (directive !== undefined) {
              if (directive.text === 'Feature:') {
                if (feature == null) {
                  previous = feature = processFeature(trimmed);
                } else {
                  failure = {isFailure: true, message: 'Only one feature is allowed per feature file'};
                }
              } else if(directive.text === 'Tags:'){
                scopedTags = processTag(trimmed);
                scopedTags.definedThisIteration = true;
              } else {
                previous = processDirective(trimmed, directive, previous, feature, lineNumber, failure);
              }
            } else if (isExamplesDirective(previous)) {
              resetScopedTags(scopedTags);
              processExampleRow(trimmed, previous);
            } else {
              resetScopedTags(scopedTags);
              processStep(trimmed, previous, feature, lineNumber, failure);
            }
          }

          // handle tags
          if(scopedTags.definedThisIteration){
            scopedTags.definedThisIteration = false;
            scopedTags.dueThisIteration = true;
          } else if(scopedTags.dueThisIteration){
            var tags = scopedTags.node.tags;
            resetScopedTags(scopedTags);
            bindScopedTagsToNode(previous, tags);
          }
        }
      });

      if (failure.isFailure) {
        callback(failure.message);
      } else {
        callback(undefined, feature.node);
      }
    }
  };
};
