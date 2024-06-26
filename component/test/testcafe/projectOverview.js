//
// projectSubjects.js
// Project Pages Test Cases
//
// VDJServer
// https://vdjserver.org
//
// Copyright (C) 2023 The University of Texas Southwestern Medical Center
//
// Author: Ryan Kennedy
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
// Date: June 2024
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

  //Project Values
  const studyId = "Test Study ID";
  //append a random number less than 1,000,000 to studyTitle
  const studyTitle = "Test Study Title_" + Math.floor(Math.random()*1000000);
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
  
  const userName = "apitest";

  //General Selectors
  const createProjectSelect = Selector('#create-project', {timeout:config.timeout});
  const subjectsTabSelect = Selector('#subjects-tab', {timeout:config.timeout});
  //const addUserOptionSelect = Selector('.dropdown-item')
  const addUserSelect = Selector('#user-name')
  const addUserOptionSelect = addUserSelect.find(userName)
  const addUserButtonSelect = Selector('#add-project-user', {timeout:config.timeout});
  const deleteUserButtonSelect = Selector('#delete-project-user', {timeout:config.timeout});

  //Project Field Selectors
  const studyTypeSelect = Selector('#dropdownOntology');
  const studyTypeOption = studyTypeSelect.find('option');

 test('Create a Project and Check Back-end Values', async t => {
  await login(t,config.username,config.password,'CLICK','#home-login');

  await t.click(createProjectSelect);

  await t
    .typeText('#NCBI', studyId)
    .typeText('#study_title', studyTitle)
    .typeText('#description', studyDesc)
    .typeText('#criteria', incExcCriteria)
    .typeText('#grants', grants)
    .click('#'+keywords[0])
    .click('#'+keywords[1])
    .click(studyTypeSelect) 
    .click('a[name="NCIT:C16084"]')
    .typeText('#publications', pubs)
    .typeText('#lab_name', labName)
    .typeText('#lab_address', labAddr)
    .typeText('#collectedby_name', cName)
    .typeText('#collectedby_email', cEmail)
    .typeText('#collectedby_address', cAddr)
    .typeText('#submittedby_name', sName)
    .typeText('#submittedby_email', sEmail)
    .typeText('#submittedby_address', sAddr)
    .click('#create-new-project');

  await t.expect(Selector('.modal-body > p:nth-child(1)').innerText).contains('successfully', 'Project successfully created', {timeout:config.timeout});

  await t.click(Selector('#cancel-message-button', {timeout:config.timeout}));

  await new Promise(r => setTimeout(r, 14000));

  await t
    .scrollIntoView(subjectsTabSelect)
    .click(subjectsTabSelect)

  const getPageUrl = ClientFunction(() => window.location.href);
  const url = await getPageUrl();

  projectUuid = url.split("/")[4];
  projectUuidUrl += projectUuid;
  console.log("Project UUID: " + projectUuid);

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
    .expect(m["value"]["study_type"]["id"]).eql("NCIT:C16084")
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

 test('Add a new user to the Project, confirm the user was added, delete the user, and confirm the user was deleted', async t => {
  await login(t,config.username,config.password,'CLICK','#home-login');

  await new Promise(r => setTimeout(r, 5000));
  const getPageUrl = ClientFunction(() => window.location.href);

  await t.navigateTo('./'+projectUuidUrl);
  await new Promise(r => setTimeout(r, 10000));
  const url = await getPageUrl();
  console.log("URL: " + url);

  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(deleteUserButtonSelect)
    .typeText('#user-name', userName)
    .pressKey('down')
    .pressKey('enter')
    .click(".user-status")
    .click(addUserButtonSelect)
    
  await new Promise(r => setTimeout(r, 10000));
  
  await t.click(Selector('#confirm-message-button', {timeout:config.timeout}));

  //check back-end TODO
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

  var newUserSpot;
  if(m['permission'][0]["username"]=='vdj-test1') newUserSpot = 1;
  else newUserSpot = 0;

  await t
    .expect(m['permission'].length).eql(2)
    .expect(m['permission'][newUserSpot]["username"]).contains(userName)

  //delete user
  await t
    .click(deleteUserButtonSelect.withAttribute('name',userName))
    
  //check back-end TODO
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
 
  await t
    .expect(m['permission'].length).eql(1)
    .expect(m['permission'][0]["username"]).eql('vdj-test1')

 });

 test('Edit the Project and Check Back-end Values', async t => {
  await login(t,config.username,config.password,'CLICK','#home-login');

  await new Promise(r => setTimeout(r, 5000));

  await t.navigateTo('./'+projectUuidUrl);
  await new Promise(r => setTimeout(r, 5000));

  await t
    .click('#edit-project');

  await t
    .click('#navbar-stats-icon')
    .typeText('#study_id', studyId2,{ replace: true })
    .typeText('#study_title', studyTitle2,{ replace: true })
    .scrollIntoView(studyTypeSelect)
    .click(studyTypeSelect)
    .click('a[name="NCIT:C15273"]')
    .scrollIntoView('#criteria')
    .typeText('#criteria', incExcCriteria2,{ replace: true })
    .scrollIntoView('#'+keywords[0])
    .click('#'+keywords[0])
    .click('#'+keywords[1])
    .click('#'+keywords[2])
    .typeText('#publications', pubs2,{ replace: true })
    .typeText('#grants', grants2,{ replace: true })
    .typeText('#lab_name', labName2,{ replace: true })
    .typeText('#lab_address', labAddr2,{ replace: true })
    .typeText('#collected_by',collBy,{ replace: true})
    .typeText('#submitted_by',subBy,{ replace: true})
    .scrollIntoView(Selector('#description'))
    .typeText('#description', studyDesc2,{ replace: true })
    .click('#save-edit-project');

  await new Promise(r => setTimeout(r, 5000));

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
    .expect(m["value"]["study_type"]["id"]).eql("NCIT:C15273")
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

 test('Delete the Project and Check Back-end Values', async t => {
  await login(t,config.username,config.password,'CLICK','#home-login');

  await new Promise(r => setTimeout(r, 5000));

  await t.navigateTo('./'+projectUuidUrl);
  await new Promise(r => setTimeout(r, 10000));

  await t
    .click('#archive-project')

  await new Promise(r => setTimeout(r, 5000));

  await t
    .click('#confirm-message-button')

  //check back-end
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
    //m = m['result'][0];
  }
 });

 test('Attempt to create a Project with a blank Study ID', async t => {
  const blankStudyTitle = "    ";
  const tabbedStudyTitle = "\t\t";

  await login(t,config.username,config.password,'CLICK','#home-login');

  await new Promise(r => setTimeout(r, 5000));

  await t.click(createProjectSelect);

  await t
    .typeText('#study_title', blankStudyTitle)
    .click('#create-new-project');

  await new Promise(r => setTimeout(r, 5000));

  const errorMessage = Selector('div').withText('Please enter a non-blank Project/Study Title').exists;

  await t
    .expect(errorMessage).ok()

  await t
    .typeText('#study_title', tabbedStudyTitle)
    .click('#create-new-project');

  await new Promise(r => setTimeout(r, 5000));

  const errorMessage2 = Selector('div').withText('Please enter a non-blank Project/Study Title').exists;

  await t
    .expect(errorMessage2).ok()
 });



//method is either ENTERKEY or CLICK
//clickItem is the id of the item (optional)
async function login(t,username,password,method,clickItem) {
    if(username!='') await t.typeText('#username', username);
    if(password!='') await t.typeText('#password', password);
        if(method == "ENTERKEY") {
            await t.pressKey('enter');
        } else if(method == 'CLICK') {
            await t.click(Selector(clickItem, {timeout: config.timeout}));
        }
}
