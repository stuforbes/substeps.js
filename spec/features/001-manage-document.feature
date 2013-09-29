Feature: A user can manage their documents, electing to create, edit and delete them

Background: Delete all existing documents
	Given I am on the home page
	Given there are no documents in the system
	
Scenario: A user can create new documents
	When I choose to add a new document
	When I set the new document name as 'New Document'
	When I set the new document summary as 'This is a new document'
	When I save the new document
	Then I will see 'New Document' with the url '/new-document' and summary 'This is a new document' in the document list
	
Scenario: A user can create new documents with a custom url
	When I choose to add a new document
	When I set the new document name as 'New Document'
	When I set the new document url as 'custom-url'
	When I set the new document summary as 'This is a new document'
	When I save the new document
	Then I will see 'New Document' with the url '/custom-url' and summary 'This is a new document' in the document list

Scenario: A user cannot create a document without a valid name
	When I choose to add a new document
	When I set the new document url as 'document-url'
	When I set the new document summary as 'This is a new document'
	When I save the new document
	Then I will see the warning 'You cannot create a document without a name'
	
Scenario: A user cannot create a document without a valid url
	When I choose to add a new document
	When I set the new document name as 'New Document'
	When I clear the new document url
	When I set the new document summary as 'This is a new document'
	When I save the new document
	Then I will see the warning 'You cannot create a document without a url'

Scenario: A user can create a document without a summary
	When I choose to add a new document
	When I set the new document name as 'New Document with no summary'
	When I save the new document
	Then I will see 'New Document with no summary' with no summary
	
Scenario: A user cannot create a document with a duplicate name
	Given there is a document with the name 'New Document' and summary 'This is a new document'
	When I choose to add a new document
	When I set the new document name as 'New Document'
	When I set the new document summary as 'This is a new document'	
	When I save the new document
	Then I will see the warning 'There is already a document with the name New Document. Please choose another'

Scenario: A user cannot create a document with a duplicate name
	Given there is a document with the name 'New Document' and summary 'This is a new document'
	When I choose to add a new document
	When I set the new document name as 'New Document'
	When I set the new document summary as 'This is a new document'	
	When I save the new document
	Then I will see the warning 'There is already a document with the name New Document. Please choose another'

Scenario: A user cannot create a document with a duplicate name
	Given there is a document with the name 'New Document' and summary 'This is a new document'
	When I choose to add a new document
	When I set the new document name as 'New Document 2'
	When I set the new document url as 'new-document'
	When I set the new document summary as 'This is a new document'	
	When I save the new document
	Then I will see the warning 'There is already a document with the url new-document. Please choose another'

Scenario: A user can edit their document name
	Given there is a document with the name 'Document to edit' and summary 'This is an editable document'
	When I edit the document name 'Document to edit'
	When I enter text 'Updated document' to the current element
	Then I will see 'Updated document' with the url '/document-to-edit' and summary 'This is an editable document' in the document list
	Then I will not see 'Document to edit' in the document list
	
Scenario: A user can edit their document url
	Given there is a document with the name 'Document to edit' and summary 'This is an editable document'
	When I edit the document url to 'document-to-edit' for document 'Document to edit'
	When I enter text 'updated-url' to the current element
	Then I will see 'Document to edit' with the url '/updated-url' and summary 'This is an editable document' in the document list
	
Scenario: A user can edit their document summary
	Given there is a document with the name 'Document to edit' and summary 'This is an editable document'

	When I edit the document summary to 'This is an editable document' for document 'Document to edit'
	When I enter text 'This is an updated document' to the current element
	
	Then I will see 'Document to edit' with the url '/document-to-edit' and summary 'This is an updated document' in the document list

Scenario: A user cannot edit a document to have no name
	Given there is a document with the name 'Document to edit' and summary 'This is an editable document'

	When I edit the document name 'Document to edit'
	When I clear the text of the current element
	Then I will see the warning 'You cannot create a document without a name'
	
Scenario: A user cannot edit a document to have no url
	Given there is a document with the name 'Document to edit' and summary 'This is an editable document'

	When I edit the document url to 'document-to-edit' for document 'Document to edit'
	When I clear the text of the current element
	Then I will see the warning 'You cannot create a document without a url'
	
Scenario: A user cannot edit a document to have a duplicate name
	Given there is a document with the name 'Document to edit' and summary 'This is an editable document'
	Given there is a document with the name 'Existing document' and summary 'This is a new document'

	When I edit the document name 'Document to edit'
	When I enter text 'Existing document' to the current element
	Then I will see the warning 'There is already a document with the name Existing document. Please choose another'
	
Scenario: A user cannot edit a document to have a duplicate url
	Given there is a document with the name 'Document to edit' and summary 'This is an editable document'
	Given there is a document with the name 'Existing document' and summary 'This is a new document'

	When I edit the document url to 'document-to-edit' for document 'Document to edit'
	When I enter text 'existing-document' to the current element
	Then I will see the warning 'There is already a document with the url existing-document. Please choose another'
	
Scenario: A user can delete an existing document by confirming the delete process correctly
	Given there is a document with the name 'Document to delete' and summary 'This is an deletable document'
	When I delete the document 'Document to delete'
	Then I will not see 'Document to delete' in the document list	

Scenario: All documents will be displayed, ordered by name
	Given there is a document with the name 'Document 2' and summary 'This is document 2'
	Given there is a document with the name 'Document 4' and summary 'This is document 4'
	Given there is a document with the name 'Document 3' and summary 'This is document 3'
	Given there is a document with the name 'Document 1' and summary 'This is document 1'

	Then the documents will be shown in the order 'Document 1, Document 2, Document 3, Document 4'