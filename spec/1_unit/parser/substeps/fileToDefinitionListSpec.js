'use strict';

describe('fileToDefinitionList', function(){

  var stringTools;
  var fileToDefinitionList;
  var _;

  beforeEach(function(){
    stringTools = jasmine.createSpyObj('stringTools', ['stripCommentsFrom']);
    _ = require('underscore');
    _.str = jasmine.createSpyObj('_str', ['startsWith']);

    fileToDefinitionList = require('../../../../lib/parser/substeps/fileToDefinitionList')(stringTools, _);

    stringTools.stripCommentsFrom.andCallFake(function(line){
      if(line.indexOf('#') > -1) return line.substring(0, line.indexOf('#')).trim();
      return line;
    });
    _.str.startsWith.andCallFake(function(str, startsWith){
      return str.substring(0, startsWith.length) == startsWith;
    })
  });

  it('should return an empty definition list if the contents are empty', function(){
    var fileContents = '';

    var definitions = fileToDefinitionList.apply(fileContents);
    expect(definitions.length).toBe(0);
  });

  it('should return an empty definition list if no definitions are in the content', function(){
    var fileContents = 'some content\nsome more content\nsomething else';

    var definitions = fileToDefinitionList.apply(fileContents);
    expect(definitions.length).toBe(0);
  });

  it('should return an empty definition list if the only definition is in a comment', function(){
    var fileContents = 'some content\nsome more content\n#Define: a substep\n#\tcontent';

    var definitions = fileToDefinitionList.apply(fileContents);
    expect(definitions.length).toBe(0);
  });

  it('should return a single definition if it is in the content', function(){
    var fileContents = 'Define: Some substep\n\tStep 1\n\tStep 2\n\tStep 3';

    var definitions = fileToDefinitionList.apply(fileContents);
    expect(definitions.length).toBe(1);

    var definition = definitions[0];
    expect(definition.text).toBe('Some substep');
    expect(definition.steps.length).toBe(3);
    expect(definition.steps[0].text).toBe('Step 1');
    expect(definition.steps[1].text).toBe('Step 2');
    expect(definition.steps[2].text).toBe('Step 3');
  });

  it('should return a single definition if it is in the content with trailing comments removed from the definition', function(){
    var fileContents = 'Define: Some substep #This is a comment\n\tStep 1\n\tStep 2\n\tStep 3';

    var definitions = fileToDefinitionList.apply(fileContents);
    expect(definitions.length).toBe(1);

    var definition = definitions[0];
    expect(definition.text).toBe('Some substep');
    expect(definition.steps.length).toBe(3);
    expect(definition.steps[0].text).toBe('Step 1');
    expect(definition.steps[1].text).toBe('Step 2');
    expect(definition.steps[2].text).toBe('Step 3');
  });

  it('should return a single definition if it is in the content with trailing comments removed from the steps', function(){
    var fileContents = 'Define: Some substep\n\tStep 1  #Some comment\n\tStep 2   #Some comment\n\tStep 3  #Some comment';

    var definitions = fileToDefinitionList.apply(fileContents);
    expect(definitions.length).toBe(1);

    var definition = definitions[0];
    expect(definition.text).toBe('Some substep');
    expect(definition.steps.length).toBe(3);
    expect(definition.steps[0].text).toBe('Step 1');
    expect(definition.steps[1].text).toBe('Step 2');
    expect(definition.steps[2].text).toBe('Step 3');
  });

  it('should return multiple definitions if they are in the content', function(){
    var fileContents = 'Define: The 1st Substep\n\tStep 1\n\tStep 2\n\tStep 3\n' +
      'Define: The 2nd Substep\n\tStep 1\n\tStep 2\n\tStep 3';

    var definitions = fileToDefinitionList.apply(fileContents);
    expect(definitions.length).toBe(2);

    var definition1 = definitions[0];
    expect(definition1.text).toBe('The 1st Substep');
    expect(definition1.steps.length).toBe(3);
    expect(definition1.steps[0].text).toBe('Step 1');
    expect(definition1.steps[1].text).toBe('Step 2');
    expect(definition1.steps[2].text).toBe('Step 3');

    var definition2 = definitions[1];
    expect(definition2.text).toBe('The 2nd Substep');
    expect(definition2.steps.length).toBe(3);
    expect(definition2.steps[0].text).toBe('Step 1');
    expect(definition2.steps[1].text).toBe('Step 2');
    expect(definition2.steps[2].text).toBe('Step 3');
  });

  it('should have an empty parameter list and a pattern that matches the text for a definition that doesnt contain parameters', function(){
    var fileContents = 'Define: A parameterless Substep\n\tStep 1\n\tStep 2\n\tStep 3\n';

    var definitions = fileToDefinitionList.apply(fileContents);
    expect(definitions.length).toBe(1);

    expect(definitions[0].parameters.length).toBe(0);
    expect(definitions[0].pattern).toBe('A parameterless Substep');
  });

  it('should have a single parameter in the parameter list for a definition that contains 1 parameter', function(){
    var fileContents = 'Define: A <single> parameter Substep\n\tStep 1\n\tStep 2\n\tStep 3\n';

    var definitions = fileToDefinitionList.apply(fileContents);
    expect(definitions.length).toBe(1);

    expect(definitions[0].parameters.length).toBe(1);
    expect(definitions[0].parameters[0]).toBe('single');
    expect(definitions[0].pattern).toBe('A ([^"]*) parameter Substep');
  });

  it('should have multiple parameters in the parameter list for a definition that contains 3 parameter', function(){
    var fileContents = 'Define: The <first> parameter, the <second> parameter and the <third> parameter in the Substep\n\tStep 1\n\tStep 2\n\tStep 3\n';

    var definitions = fileToDefinitionList.apply(fileContents);
    expect(definitions.length).toBe(1);

    expect(definitions[0].parameters.length).toBe(3);
    expect(definitions[0].parameters[0]).toBe('first');
    expect(definitions[0].parameters[1]).toBe('second');
    expect(definitions[0].parameters[2]).toBe('third');
    expect(definitions[0].pattern).toBe('The ([^"]*) parameter, the ([^"]*) parameter and the ([^"]*) parameter in the Substep');
  });

  it('should have an empty parameter list for a step that doesnt contain parameters', function(){
    var fileContents = 'Define: A Substep\n\tStep 1\n\tStep 2\n\tStep 3\n';

    var definitions = fileToDefinitionList.apply(fileContents);
    expect(definitions.length).toBe(1);

    expect(definitions[0].steps[0].parameters.length).toBe(0);
  });

  it('should have a single parameter in the parameter list for a step that contains 1 parameter', function(){
    var fileContents = 'Define: A Substep\n\tStep with <parameter> 1\n\tStep 2\n\tStep 3\n';

    var definitions = fileToDefinitionList.apply(fileContents);
    expect(definitions.length).toBe(1);

    expect(definitions[0].steps[0].parameters.length).toBe(1);
    expect(definitions[0].steps[0].parameters[0]).toBe('parameter');
  });

  it('should have multiple parameters in the parameter list for a definition that contains 3 parameter', function(){
    var fileContents = 'Define: A Substep\n\tStep 1\n\tA Step with <first> parameter, a <second> parameter and a <third> parameter 2\n\tStep 3\n';

    var definitions = fileToDefinitionList.apply(fileContents);
    expect(definitions.length).toBe(1);

    expect(definitions[0].steps[1].parameters.length).toBe(3);
    expect(definitions[0].steps[1].parameters[0]).toBe('first');
    expect(definitions[0].steps[1].parameters[1]).toBe('second');
    expect(definitions[0].steps[1].parameters[2]).toBe('third');
  });
});