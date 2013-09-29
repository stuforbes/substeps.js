Feature: A user can manage their pages within a document, choosing to create, edit and delete them,
	in addition to manipulating the page hierarchy 

Background: Delete all existing documents
	Given I am authoring the new document 'Document' with summary 'A Summary'


Scenario: When authoring a new document, there will already be a page named Home, and this will be the selected page
	Then the current page will be 'Home' at '/'


Scenario: A user can create new pages, that will be added immediately below the selected page
	When I add a new page with the name 'New page 1' and url 'new-page-1'
	Then the page at position 1 under 'Home' will be 'New page 1'
	
	When I navigate to the page 'Home/New page 1'
	When I add a new page with the name 'New page 2' and url 'new-page-2'
	Then the page at position 2 under 'Home' will be 'New page 2'
	
	When I navigate to the page 'Home/New page 1'
	When I add a new page with the name 'New page 3' and url 'new-page-3'
	Then the page at position 1 under 'Home' will be 'New page 1'
	Then the page at position 2 under 'Home' will be 'New page 3'
	Then the page at position 3 under 'Home' will be 'New page 2'


Scenario: A user cannot create a page with no name
	When I add a new page with the name '' and url 'new-page'
	Then I will see the warning 'You cannot create a page without a name'


Scenario: A user cannot create a page with no url
	When I add a new page with the name 'New page' and url ' '
	Then I will see the warning 'You cannot create a page without a url'


Scenario: A user cannot create a page with the same name as a sibling
	Given there is a page with the name 'Existing Page' and url 'existing-page' at position '1' under 'Home'
	
	When I add a new page with the name 'Existing Page' and url 'a-url'
	Then I will see the warning 'There is already a page with the name Existing Page. Please choose another'


Scenario: A user cannot create a page with the same url as a sibling
	Given there is a page with the name 'Existing Page' and url 'existing-page' at position '1' under 'Home'
	
	When I add a new page with the name 'A Page' and url 'existing-page'
	Then I will see the warning 'There is already a page with the url existing-page. Please choose another'


Scenario: A user can create a page with the same name as another on a different level
	Given there is a page with the name 'Parent Page' and url 'parent' at position '1' under 'Home'
	Given the page 'Parent Page' has a child named 'Existing Page' with the url 'existing-page'
	
	When I navigate to the page 'Parent Page'
	When I add a new page with the name 'Existing Page' and url 'a-url'
	Then the page at position 2 under 'Home' will be 'Existing Page'


Scenario: A user can create a page with the same url as another on a different level
	Given there is a page with the name 'Parent Page' and url 'parent' at position '1' under 'Home'
	Given the page 'Parent Page' has a child named 'Existing Page' with the url 'existing-page'

	When I navigate to the page 'Parent Page'	
	When I add a new page with the name 'A Page' and url 'existing-page'
	Then the page at position 2 under 'Home' will be 'A Page'


Scenario: A user can delete pages
	Given there is a page with the name 'Page to be deleted' and url 'deleted' at position '2' under 'Home'
		
	When I delete the page 'Page to be deleted'
	Then I will not see 'Page to be deleted' in the page hierarachy


Scenario: A user can edit the name of a page
	Given there is a page with the name 'Page to edit' and url 'editable-page' at position '2' under 'Home'
	When I edit the page name 'Page to edit'
	When I enter text 'Updated page' to the current element
	Then I will see 'Updated page' with the url 'editable-page' at position 2 in the hierarchy
	Then I will not see 'Page to edit' in the document list


Scenario: A user can edit the url of a page
	Given there is a page with the name 'Page to edit' and url 'editable-page' at position '2' under 'Home'
	When I edit the page url for the page 'Page to edit'
	When I enter text '/updated-url' to the current element
	Then I will see 'Updated page' with the url '/updated-url' at position 2 in the hierarchy
	Then I will not see 'Page to edit' in the document list


Scenario: A user cannot edit a page to have no name
	Given there is a page with the name 'Page to edit' and url 'editable-page' at position '2' under 'Home'
	When I edit the page name 'Page to edit'
	When I clear the text of the current element
	Then I will see the warning 'You cannot create a page without a name'


Scenario: A user cannot edit a page to have no url
	Given there is a page with the name 'Page to edit' and url 'editable-page' at position '2' under 'Home'
	When I edit the page url for the page 'Page to edit'
	When I clear the text of the current element
	Then I will see the warning 'You cannot create a page without a url'


Scenario: A user cannot edit a page to have the same name as a sibling
	Given there is a page with the name 'Existing Page' and url 'existing-page' at position '2' under 'Home'
	Given there is a page with the name 'Page to edit' and url 'editable-page' at position '3' under 'Home'
	When I edit the page url for the page 'Page to edit'
	When I enter text 'Existing Page' to the current element
	Then I will see the warning 'You cannot create a page with the same name as another page'


Scenario: A user cannot edit a page to have the same url as a sibling
	Given there is a page with the name 'Existing Page' and url 'existing-page' at position '2' under 'Home'
	Given there is a page with the name 'Page to edit' and url 'editable-page' at position '3' under 'Home'
	When I edit the page url for the page 'Page to edit'
	When I enter text 'existing-page' to the current element
	Then I will see the warning 'You cannot create a page with the same url as another page'


Scenario: A user can edit a page to have the same name as another on a different level
	Given there is a page with the name 'Parent Page' and url 'parent' at position '2' under 'Home'
	Given the page 'Parent Page' has a child named 'Existing Page' with the url 'existing-page'
	Given there is a page with the name 'Page to edit' and url 'page-to-edit' at position '3' under 'Home'
	
	When I edit the page name 'Page to edit'
	When I enter text 'Existing Page' to the current element
	Then the page at position 2 under 'Home' will be 'Existing Page'


Scenario: A user can create a page with the same url as another on a different level
	Given there is a page with the name 'Parent Page' and url 'parent' at position '2' under 'Home'
	Given the page 'Parent Page' has a child named 'Existing Page' with the url 'existing-page'
	Given there is a page with the name 'Page to edit' and url 'page-to-edit' at position '3' under 'Home'
	
	When I edit the page url for the page 'Page to edit'
	When I enter text 'existing-page' to the current element
	Then the page at position 2 under 'Home' will be 'Existing Page'


Scenario: A user cannot edit the url of the home page
	Then I cannot edit the url for the page 'Home'


Scenario: A user can indent a page, so that its is inside the page above
	Given there is a page with the name 'Parent Page' and url 'parent' at position '2' under 'Home'
	When I navigate to the page 'Home/Parent Page'
	Given there is a page with the name 'Page to indent' and url 'indent' at position '3' under 'Home'
	
	When I indent the page 'Page to indent'
	Then the page 'Parent Page' has a child 'Page to indent'	
	

Scenario: A user can outdent a page, so that it is immediately below its current parent
	Given there is a page with the name 'Parent Page' and url 'parent' at position '2' under 'Home'
	Given the page 'Parent Page' has a child named 'Page to outdent' with the url 'outdent'
	
	When I outdent the page 'Page to outdent'
	Then the page at position 3 under 'Home' will be 'Page to outdent'


Scenario: A user can move a page to be in a different part of the hierarchy
	Given there is a page with the name 'Page 1' and url 'page1' at position '2' under 'Home'
	Given there is a page with the name 'Page 2' and url 'page2' at position '3' under 'Home'
	
	When I move the page 'Page 3' to position 2
	Then the page at position 2 under 'Home' will be 'Page 3'
	Then the page at position 3 under 'Home' will be 'Page 2'
