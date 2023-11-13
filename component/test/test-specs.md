Test Specifications
===================

This provides the set of test cases that should be performed. They are organized
by page and include both positive and negative test cases.

## Login screen

- valid username and password
- blank username
- blank password
- valid username but invalid password
- invalid username
- username with only spaces
- password with only spaces
- hit ENTER key to submit with valid username and valid password
- click LOGIN button to submit
- click "Forgot password?" link
- click "Verify account?" link
- click "Community Data Portal" link
- click "AIRR Data Commons" link
- click Documentation link
- click "Send Feedback" link
- click "https://www.ireceptor-plus.com/"
- click "TACC" link
- click "Email" link
- click "Create Account" link

## Logout

- valid logout on icon click
- valid logout on "Logout" click

## Verify account screen

? verification code

## Feedback screen

- valid data in feedback and email sections
- valid data in feedback but no email
- valid email but no feedback
- valid feedback but email not an email address
? recaptcha

## Forgot password screen

- valid username
- invalid username
? password reset codes

## User Profile screen

- click icon to navigate to User Profile
- click "User Profile" to navigate to User Profile
- change username
- add data to each field and check against back-end, including preferences

## My Projects screen

- create new project link navigates correctly
- click on a project
- click # Repertoires
- click # Subjects
- click # Clones
- click # Rearrangements

## Project Overview screen

- click Overview
- click Files
- click Subjects
- click Repertoires
- click Repertoire Groups
- click Analyses
- click "Publish Project"
- click "Archive Project" and verify deleted
- click "Edit Project Metadata"
 - change fields and check against back-end data
 - add user
 - delete user

## Project Files screen

- click "Sort By"
 - click "File Name"
 - click "Newest"
 - click "Oldest"
 - click "File Size"
- click "Upload Files"
 - click "Upload from your computer"
  - click "Add File(s)"
   - click "Start Upload"
   - click "Cancel Upload"
   - click "Done"
   - edit "Type," "Tags," and "Direction" and check against back-end data
   - click "Delete File"
- click "Pair Read Files"
 - select "Paired-end FASTQ read files"
 - select "FASTA read files and quality score files"
 - enter data in text boxes
? check anything on back-end
 - click "Cancel"
 - click "Perform pairing"
- click "Revert Files Changes" and check against back-end
- click "Save Files Changes" and check against back-end
? click on file name itself

## Project Subjects screen

- click "Details"
- click "Sort By"
 - click "Subject ID"
 - click "Sex"
 - click "Age"
- click "Import/Export"
 - click "Import Subject Table"
 - click "Export Subject Table"
- click "Add Subject"
 - click "New Blank Subject"
  - add data to fields, click "Validate and Save Changes," and check against back-end
  - add data and click "Revert Subject Changes"
- click "+" icon next to a Subject
- click "Edit" next to a Subject
- click "+" icon next to Add Diagnosis
- click "Add Diagnosis"
 - check that data is added on the back-end
- click trash bin icon next to "Delete"
- click "Delete"
 - verify deleted on the back-end
- click sheets of paper icon next to "Duplicate Diagnosis"
 - verify duplicated on the back-end
- click trash bin icon next to "Delete Diagnosis" and check against back-end
- click "Delete Diagnosis" and check against back-end
 - click "New Subject from Template NAME"

## Project Repertoires screen

- click "Sort By"
 - click "Repertoire Name"
 - click "Subject ID"
 - click "Sample ID"
 - click "Tissue"
 - click "Disease State"
 - click "Cell Subset"
- click "Import/Export"
 - click "Import AIRR Repertoire Metadata"
 - click "Export AIRR Repertoire Metadata"
- click "Templates"
 - click "Show Templates"
 - click "New Blank Template"
 - click "Apply NAME Template to samples"
- click "+" icon next to Add Repertoire
- click "Add Repertoire"
 - click "New Blank Repertoire"
  - add data and click "Revert Repertoire Changes" and check against back-end
  - add data and click "Save Repertoire Changes" and check against back-end
 - click "Edit"
  - make changes click "Revert Repertoire Changes" and check against back-end
  - make changes click "Save Repertoire Changes" and check against back-end
 - click "New Sample from Template NAME"
 - click "Delete" and check against back-end
- click person icon next to "Subject ID"

## Project Repertoire Groups screen

- click "Create a Repertoire Group"
 - add data to fields and click "Save"
 - add data to fields and click save icon
  - check data against back-end

## Project Analyses screen

- click "Sort By"
 - click "File Name"
 - click "Newest"
 - click "Oldest"
 - click "File Size"
- click "Templates"
 - click "Show Templates"
 - click "New Blank Template"
 - click "Create Analyses from NAME Template"
- click "Create Analysis"
- click "+" icon next to "Create Analysis"
 - click "New TCR Workflow"
 - click "New IG Workflow"
 - click "New 10x Genomics Workflow"
 - click "New Comparative Analysis"
? check data against back-end

?? Community Data
