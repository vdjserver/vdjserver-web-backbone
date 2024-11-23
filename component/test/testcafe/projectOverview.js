//
// projectOverview.js
// Project Pages Test Cases
//
// VDJServer
// https://vdjserver.org
//
// Copyright (C) 2024 The University of Texas Southwestern Medical Center
//
// Author: Ryan C. Kennedy
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
// Date: June - November 2024
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

import config from '../test-config';
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';

var tapisV2 = require('vdj-tapis-js/tapis');
var tapisV3 = require('vdj-tapis-js/tapisV3');
var tapisIO = null;
if (config.tapis_version == 2) tapisIO = tapisV2;
if (config.tapis_version == 3) tapisIO = tapisV3;

var projectUuid = "";
var projectUuidUrl = "project/";
projectUuidUrl += projectUuid;
var subjectUuid = "";

fixture('Project Pages Test Cases')
  .page(config.url);

  const loginButtonId = '#home-login';

  //Project Values
  const studyId = "Test Study ID";
  //Append a random number less than 1,000,000 to studyTitle
  const studyTitle = "Test Study Title_" + Math.floor(Math.random()*1000000);
  const studyType = "NCIT:C16084";
  const studyTypeEdit = "NCIT:C15273";
  const studyDesc = "Test Study Description";
  const incExcCriteria = "Criteria";
  const grants = "1234";
  const keywords = ["contains_tr","contains_paired_chain","contains_ig"];
  const pubs = "1;2;3;4";
  const labName = "UTSW";
  const labAddr = "11 S. Main St";
  const cName = "Joe";
  const cEmail = "joe@email.com";
  const cAddr = Math.floor(Math.random()*100) + " N. Main St";
  const sName = "Jim";
  const sEmail = "jim@email.com";
  const sAddr = "13 W. Main St";

  const studyId2 = "Test Study ID2";
  const studyTitle2 = "Test Study Title2_" + Math.floor(Math.random()*1000000);
  const studyDesc2 = "Test Study Description2";
  const incExcCriteria2 = "Criteria2";
  const grants2 = "12342";
  const pubs2 = "1;2;3;42";
  const labName2 = "UTSW2";
  const labAddr2 = "11 S. Main St2";
  const cName2 = "Joe2";
  const cEmail2 = "joe@email.com2";
  const cAddr2 = Math.floor(Math.random()*100) + " N. Main St2";
  const collBy = cName2 + ", " + cEmail2 + ", " + cAddr2;
  const sName2 = "Jim2";
  const sEmail2 = "jim@email.com2";
  const sAddr2 = "13 W. Main St2";
  const subBy = sName2 + ", " + sEmail2 + ", " + sAddr2;
  const projectStudyTitleValidationMessage = "Please enter a non-blank Project/Study Title.";
  const projectSuccessfullyCreatedMessage = "Project successfully created!";
  
  const username = "vdj-test2";

  //General Selectors
  const navbarStatsIconSelect = Selector('#navbar-stats-icon');
  const createProjectSelect = Selector('#create-project');
  const subjectsTabSelect = Selector('#subjects-tab');
  //const addUserOptionSelect = Selector('.dropdown-item')
  const addUserSelect = Selector('#user-name')
  const addUserOptionSelect = addUserSelect.find(username)
  const addUserButtonSelect = Selector('#add-project-user');
  const deleteUserButtonSelect = Selector('#delete-project-user');
  const invalidFeedbackSelect = Selector('.invalid-feedback');

  //Project Field Selectors
  const studyIdSelect = Selector('#NCBI');
  const studyIdEditSelect = Selector('#study_id');
  const studyTitleSelect = Selector('#study_title');
  const descriptionSelect = Selector('#description');
  const criteriaSelect = Selector('#criteria');
  const grantsSelect = Selector('#grants');
  const studyTypeSelect = Selector('#dropdownOntology');
  const ontologySelectSelect = Selector('#ontology-select');
  const publicationsSelect = Selector('#publications');
  const labNameSelect = Selector('#lab_name');
  const labAddressSelect = Selector('#lab_address');
  const collectedByNameSelect = Selector('#collectedby_name');
  const collectedByEmailSelect = Selector('#collectedby_email');
  const collectedByAddressSelect = Selector('#collectedby_address');
  const submittedByNameSelect = Selector('#submittedby_name');
  const submittedByEmailSelect = Selector('#submittedby_email');
  const submittedByAddressSelect = Selector('#submittedby_address');
  const createNewProjectSelect = Selector('#create-new-project');

  const editProjectSelect = Selector('#edit-project');
  const editProjectSaveSelect = Selector('#save-edit-project');
  const collectedBySelect = Selector('#collected_by');
  const submittedBySelect = Selector('#submitted_by');
  const projectModalDialogSelect = Selector('.modal-dialog');
  const projectModalBodyClass = '.modal-body';
  const projectModalConfirmButtonSelect = Selector('#confirm-message-button');
  const projectModalCancelButtonSelect = Selector('#cancel-message-button');
  const projectArchiveSelect = Selector('#archive-project');
  const projectUserSelect = Selector("#user-name");

 test('Create a Project and Check Back-end Values', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t
    .click(createProjectSelect)
    .typeText(studyIdSelect, studyId)
    .typeText(studyTitleSelect, studyTitle)
    .typeText(descriptionSelect, studyDesc)
    .typeText(criteriaSelect, incExcCriteria)
    .typeText(grantsSelect, grants)
    .click('#'+keywords[0])
    .click('#'+keywords[1])
    .click(studyTypeSelect)
    .click(Selector(ontologySelectSelect.withAttribute('name',studyType)))
    .typeText(publicationsSelect, pubs)
    .typeText(labNameSelect, labName)
    .typeText(labAddressSelect, labAddr)
    .typeText(collectedByNameSelect, cName)
    .typeText(collectedByEmailSelect, cEmail)
    .typeText(collectedByAddressSelect, cAddr)
    .typeText(submittedByNameSelect, sName)
    .typeText(submittedByEmailSelect, sEmail)
    .typeText(submittedByAddressSelect, sAddr)
    .click(createNewProjectSelect)

  await t.expect(projectModalDialogSelect.find(projectModalBodyClass).withExactText(projectSuccessfullyCreatedMessage).exists).ok()
  await t.click(projectModalCancelButtonSelect);

  await t.click(subjectsTabSelect);

  const getPageUrl = ClientFunction(() => window.location.href);
  var url = await getPageUrl();

  projectUuid = url.split("/")[4];
  projectUuidUrl += projectUuid;
  //console.log("Project UUID: " + projectUuid);

  await t.navigateTo('./'+projectUuidUrl);
  url = await getPageUrl();
  console.log("URL: " + url);

  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var m = await tapisV2.getProjectMetadata(token.access_token, projectUuid);
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/uuid/' + projectUuid,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var m = await tapisV3.sendRequest(requestSettings);
    //console.log(JSON.stringify(m, null, 2));
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(1);
    m = m['result'][0];
  }

  await t
    .expect(m["value"]["study_id"]).eql(studyId)
    .expect(m["value"]["study_title"]).eql(studyTitle)
    .expect(m["value"]["study_description"]).eql(studyDesc)
    .expect(m["value"]["inclusion_exclusion_criteria"]).eql(incExcCriteria)
    .expect(m["value"]["grants"]).eql(grants)
    .expect(m["value"]["keywords_study"][0]).eql(keywords[0])
    .expect(m["value"]["keywords_study"][1]).eql(keywords[1])
    .expect(m["value"]["study_type"]["id"]).eql(studyType)
    .expect(m["value"]["pub_ids"]).eql(pubs)
    .expect(m["value"]["lab_name"]).eql(labName)
    .expect(m["value"]["lab_address"]).eql(labAddr)
    .expect(m["value"]["collected_by"].split(", ")[0]).eql(cName)
    .expect(m["value"]["collected_by"].split(", ")[1]).eql(cEmail)
    .expect(m["value"]["collected_by"].split(", ")[2]).eql(cAddr)
    .expect(m["value"]["submitted_by"].split(", ")[0]).eql(sName)
    .expect(m["value"]["submitted_by"].split(", ")[1]).eql(sEmail)
    .expect(m["value"]["submitted_by"].split(", ")[2]).eql(sAddr)
 });

 test('Confirm a blank Study Title is not allowed', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t
    .click(createProjectSelect)
    .typeText(studyIdSelect, studyId)
    .typeText(studyTitleSelect,'  ',{replace:true})
    .typeText(descriptionSelect, studyDesc)
    .click(createNewProjectSelect);
  
  var errorMessage = invalidFeedbackSelect.withExactText(projectStudyTitleValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).ok()
 });

 test('Add a new user to the Project, confirm the user was added, delete the user, and confirm the user was deleted', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  const getPageUrl = ClientFunction(() => window.location.href);

  await t.navigateTo('./'+projectUuidUrl);

  //Add the user
  await t
    .typeText(projectUserSelect,username)
    //.pressKey('down') //This was needed for the old method
    //.pressKey('enter')
    //.click(".user-status")
    .click(addUserButtonSelect)
  
  await t
    .click(projectModalConfirmButtonSelect)
    .click(projectModalCancelButtonSelect)
    .wait(config.save_timeout);

  await t.eval(() => location.reload(true)); //Reload the page to update the user list

  //Check the Back-end
  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var m = await tapisV2.getProjectMetadata(token.access_token, projectUuid);
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/uuid/' + projectUuid,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var m = await tapisV3.sendRequest(requestSettings);
    //console.log(JSON.stringify(m, null, 2));
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(1);
    m = m['result'][0];
  }

  //Check the number of users on the Project
  var numUsers = 0;
  for(let i in m['permission']) numUsers++;

  await t
    .expect(numUsers).eql(2)
    .expect(username in m['permission']).ok()
    .expect(m['permission'][username]['read']).eql(true)
    .expect(m['permission'][username]['write']).eql(true)

  //Delete the user
  await t
    .click(deleteUserButtonSelect.withAttribute('name',username))
    .click(projectModalConfirmButtonSelect)
    .click(projectModalCancelButtonSelect)
    .wait(config.save_timeout);

  //Check the Back-end
  token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var m = await tapisV2.getProjectMetadata(token.access_token, projectUuid);
  } else {
    var m = await tapisV3.sendRequest(requestSettings);
    //console.log(JSON.stringify(m, null, 2));
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(1);
    m = m['result'][0];
  }

  numUsers = 0;
  for(let i in m['permission']) numUsers++;
 
  await t
    .expect(numUsers).eql(1)
    .expect(config.username in m['permission']).ok()
    .expect(m['permission'][config.username]['read']).eql(true)
    .expect(m['permission'][config.username]['write']).eql(true)
 });

 test('Edit the Project and Check Back-end Values', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t
    .click(editProjectSelect)
    .click(navbarStatsIconSelect)
    .typeText(studyIdEditSelect,studyId2,{ replace: true })
    .typeText(studyTitleSelect,studyTitle2,{ replace: true })
    .click(studyTypeSelect)
    .click(Selector(ontologySelectSelect.withAttribute('name',studyTypeEdit)))
    .typeText(criteriaSelect, incExcCriteria2,{ replace: true })
    .click('#'+keywords[0])
    .click('#'+keywords[1])
    .click('#'+keywords[2])
    .typeText(publicationsSelect,pubs2,{ replace: true })
    .typeText(grantsSelect,grants2,{ replace: true })
    .typeText(labNameSelect,labName2,{ replace: true })
    .typeText(labAddressSelect,labAddr2,{ replace: true })
    .typeText(collectedBySelect,collBy,{ replace: true})
    .typeText(submittedBySelect,subBy,{ replace: true})
    .typeText(descriptionSelect,studyDesc2,{ replace: true })
    .click(editProjectSaveSelect)
    .wait(config.save_timeout)

  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var m = await tapisV2.getProjectMetadata(token.access_token, projectUuid);
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/uuid/' + projectUuid,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var m = await tapisV3.sendRequest(requestSettings);
    //console.log(JSON.stringify(m, null, 2));
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(1);
    m = m['result'][0];
  }

  await t
    .expect(m["value"]["study_id"]).eql(studyId2)
    .expect(m["value"]["study_title"]).eql(studyTitle2)
    .expect(m["value"]["study_description"]).eql(studyDesc2)
    .expect(m["value"]["inclusion_exclusion_criteria"]).eql(incExcCriteria2)
    .expect(m["value"]["grants"]).eql(grants2)
    .expect(m["value"]["keywords_study"][0]).eql(keywords[2])
    .expect(m["value"]["study_type"]["id"]).eql(studyTypeEdit)
    .expect(m["value"]["pub_ids"]).eql(pubs2)
    .expect(m["value"]["lab_name"]).eql(labName2)
    .expect(m["value"]["lab_address"]).eql(labAddr2)
    .expect(m["value"]["collected_by"].split(", ")[0]).eql(cName2)
    .expect(m["value"]["collected_by"].split(", ")[1]).eql(cEmail2)
    .expect(m["value"]["collected_by"].split(", ")[2]).eql(cAddr2)
    .expect(m["value"]["submitted_by"].split(", ")[0]).eql(sName2)
    .expect(m["value"]["submitted_by"].split(", ")[1]).eql(sEmail2)
    .expect(m["value"]["submitted_by"].split(", ")[2]).eql(sAddr2)
 });

/*TODO- Delete is not implemented on the Back-end, yet
 test('Delete the Project and Check Back-end Values', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t
    .click(projectArchiveSelect)
    .wait(config.save_timeout)
    .click(projectModalConfirmButtonSelect)

  //Check that the Project is deleted on the Back-end
  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var m = await tapisV2.getProjectMetadata(token.access_token, projectUuid);
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/uuid/' + projectUuid,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var m = await tapisV3.sendRequest(requestSettings);
    //console.log(JSON.stringify(m, null, 2));
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(0);
  }
 });*/

 test('Attempt to create a Project with a blank Study ID', async t => {
  const blankStudyTitle = "    ";
  const tabbedStudyTitle = "\t\t";

  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t
    .click(createProjectSelect)
    .typeText(studyTitleSelect, blankStudyTitle)
    .click(createNewProjectSelect)

  const errorMessage = invalidFeedbackSelect.withExactText(projectStudyTitleValidationMessage).filterVisible().exists;

  await t
    .expect(errorMessage).ok()
    .typeText(studyTitleSelect, tabbedStudyTitle)
    .click(createNewProjectSelect)

  const errorMessage2 = invalidFeedbackSelect.withExactText(projectStudyTitleValidationMessage).filterVisible().exists;

  await t
    .expect(errorMessage2).ok()
 });

//method is either ENTERKEY or CLICK
//clickItem is the id of the item (optional)
async function login(t,username,password,method,clickItem) {
    if(username!='') await t.typeText('#username', username);
    if(password!='') await t.typeText('#password', password);
        if(method == "ENTERKEY") await t.pressKey('enter');
        else if(method == 'CLICK') await t.click(Selector(clickItem));
        await t.wait(config.login_timeout);  //Wait to complete the login process
}
