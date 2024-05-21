//
// projectSubjects.js
// Project Subjects Page Test Cases
//
// VDJServer
// https://vdjserver.org
//
// Copyright (C) 2023 The University of Texas Southwestern Medical Center
//
// Author: Ryan Kennedy
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
// Date: October 2023
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
var uuid = "";
if (config.tapis_version == 2) tapisIO = tapisV2;
if (config.tapis_version == 3) tapisIO = tapisV3;

fixture('Project Subjects Page Test Cases')
    .page(config.url);

 test('Create a Project and Check Backend Values', async t => {
  const studyId = "Test Study ID";
  //append a random number less than 1,000,000 to studyTitle
  const studyTitle = "Test Study Title_" + Math.floor(Math.random()*1000000);
  const studyDesc = "Test Study Description";
  const incExcCriteria = "Criteria";
  const grants = "1234";
  const keywords = ["contains_tr","contains_paired_chain"];
  const studyTypeSelect = Selector('#dropdownOntology');
  const studyTypeOption = studyTypeSelect.find('option');
  const pubs = "1;2;3;4";

  const labName = "UTSW";
  const labAddr = "11 S. Main St";

  const cName = "Joe";
  const cEmail = "joe@email.com";
  const cAddr = Math.floor(Math.random()*100) + " N. Main St";

  const sName = "Jim";
  const sEmail = "jim@email.com";
  const sAddr = "13 W. Main St";

  await t
    .typeText('#username', config.username)
    .typeText('#password', config.password)
    .click('#home-login');

  await t.click(Selector('#create-project', {timeout:config.timeout}));

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

  await new Promise(r => setTimeout(r, 5000));

  await t
    .scrollIntoView(Selector('#subjects-tab'))
    .click(Selector('#subjects-tab', {timeout:config.timeout}));

  const getPageUrl = ClientFunction(() => window.location.href);
  const url = await getPageUrl();

  uuid = url.split("/")[4];
  console.log("uuid: " + uuid);
  var token = await tapisIO.getToken({username: config.username, password: config.password});
  console.log(token);

  if (config.tapis_version == 2)
      var m = await tapisV2.getProjectMetadata(token.access_token, uuid);
  else {
    var requestSettings = {
        url: config.url + 'api/v2/project/' + uuid + '/metadata/uuid/' + uuid,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var m = await tapisV3.sendRequest(requestSettings);
    console.log(JSON.stringify(m, null, 2));
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(1);
    m = m['result'][0];
  }
//  console.log(m);
//  console.log(m["value"]["study_id"]);
//  console.log(m["value"]["study_title"]);

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

 test('Add Subject (with Diagnosis) to previously created Project and Check Backend Values', async t => {
  //append a random number less than 1,000,000 to subjectId
  const subjectId = 'Subject ID ' + Math.floor(Math.random()*1000000);
  const syntheticSelect = Selector('#synthetic');
  const syntheticOption = syntheticSelect.find('option');
  const synthetic = 'True';
  const speciesSelect = Selector('#species');
  const speciesOption = speciesSelect.find('option');
  const species = 'Macaca mulatta';
  const strain = 'abcde'
  const sexSelect = Selector('#sex');
  const sexOption = sexSelect.find('option');
  const sex = 'pooled';
  const ageTypeSelect = Selector('#age_type');
  const ageTypeOption = ageTypeSelect.find('option');
  const ageType = 'range';
  const ageMin = '3';
  const ageMax = '9';
  const unitSelect = Selector('#age_unit');
  const unitOption = unitSelect.find('option');
  const unit = 'day(s)';
  const ageEvent = 'event';
  const race = 'race';
  const ancestryPopulation = 'ancestry';
  const ethnicity = 'ethnicity';
  const linkSubject = 'linkSubject';
  const linkType = 'linkType';

  const diseaseDiagnosisSelect = Selector('#diagnosisOntology_0');
  const diseaseDiagnosisOption = diseaseDiagnosisSelect.find('option');
  const diseaseDiagnosisOptionSelect = Selector('#ontology-select');
  const diseaseDiagnosis = 'malaria';
  const diseaseLength = '34';
  const diseaseStage = 'Disease Stage';
  const studyGroupDescription = 'Study Group Description';
  const priorTherapies = 'therapies';
  const immunogen = 'immunogen';
  const intervention = 'intervention';
  const medicalHistory = 'history';

  await t
    .typeText('#username', config.username)
    .typeText('#password', config.password)
    .click('#home-login');
  await new Promise(r => setTimeout(r, 5000));
  const getPageUrl = ClientFunction(() => window.location.href);
const url1 = await getPageUrl();
console.log("url: " + url1);
uuid='project/'+uuid;
//comment out the first test and hard-code uuid for testing purposes
//uuid='project/3873742121508531730-242ac117-0001-012';

  await t.navigateTo('./'+uuid);
  await new Promise(r => setTimeout(r, 5000));
const url2 = await getPageUrl();
console.log("url2: " + url2);
console.log("UUID: " + uuid);

  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(Selector('#subjects-tab'))
    .click(Selector('#subjects-tab', {timeout:config.timeout}));
  await t
    .click(Selector('#project-subjects-add', {timeout:config.timeout}))
    .click(Selector('#project-subjects-new-subject', {timeout:config.timeout}))
    .typeText('input[name="subject_id"]', subjectId)
    .click(syntheticSelect)
    .click(syntheticOption.withText(synthetic))
    .click(speciesSelect)
    .click(speciesOption.withText(species))
    .typeText('#strain_name', strain)
    .click(sexSelect)
    .click(sexOption.withText(sex))
    .click(ageTypeSelect)
    .click(ageTypeOption.withText(ageType))
    .typeText('#age_min',ageMin)
    .typeText('#age_max',ageMax)
    .click(unitSelect)
    .click(unitOption.withText(unit))
    .typeText('#age_event',ageEvent)
    .typeText('#race',race)
    .typeText('#ancestry_population',ancestryPopulation)
    .typeText('#ethnicity',ethnicity)
    .typeText('#linked_subjects',linkSubject)
    .typeText('#link_type',linkType)
    .click(diseaseDiagnosisSelect)
    .typeText('#ontology-search-input',diseaseDiagnosis)
    .click(diseaseDiagnosisOptionSelect.withText(diseaseDiagnosis))
    .typeText('#disease_length_0',diseaseLength)
    .typeText('#disease_stage_0',diseaseStage)
    .typeText('#study_group_description_0',studyGroupDescription)
    .typeText('#prior_therapies_0',priorTherapies)
    .typeText('#immunogen_0',immunogen)
    .typeText('#intervention_0',intervention)
    .typeText('#medical_history_0',medicalHistory);

  await new Promise(r => setTimeout(r, 5000));
  await t.click(Selector('#project-subjects-save-changes', {timeout:config.timeout}));

  await new Promise(r => setTimeout(r, 5000));

  await t
    .click(Selector('#project-subjects-details-summary', {timeout:config.timeout}));

  await new Promise(r => setTimeout(r, 5000));

  const url = await getPageUrl();

  uuid = url.split("/")[4];
  console.log("uuid: " + uuid);
  var token = await tapisIO.getToken({username: config.username, password: config.password});
  console.log(token);

//ADD COPY SUBJECT UUID TO THE HTML
  if (config.tapis_version == 2)
      var m = await tapisV2.getMetadataForType(token.access_token, uuid, 'subject');
  else {
    var requestSettings = {
        url: config.url + 'api/v2/project/' + uuid + '/metadata/name/subject',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var m = await tapisV3.sendRequest(requestSettings);
    console.log(JSON.stringify(m, null, 2));
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(1);
    m = m['result'];
  }

  //var m = await tapisV2.getMetadata(uuid);
  //var m = await tapisV2.getProjectMetadata(token.access_token, uuid);
  //var m = await tapisV2.getAllProjectAssociatedMetadata(token.access_token, uuid);
//  console.log(m);
  console.log(m[0]["value"]);
  console.log(m[0]["value"]["diagnosis"][0]["disease_length"]);

  await t
    .expect(m[0]["value"]["diagnosis"][0]["disease_length"]).eql(diseaseLength)

 });

 test('Add Diagnosis to previously created Subject and check against Backend', async t => {
  const diseaseDiagnosisSelect = Selector('#diagnosisOntology_0');
  const diseaseDiagnosisOption = diseaseDiagnosisSelect.find('option');
  const diseaseDiagnosisOptionSelect = Selector('#ontology-select');
  const diseaseDiagnosis = 'influenza';
  const diseaseLength = '9';
  const diseaseStage = 'Disease Stage' + Math.floor(Math.random()*1000000);
  const studyGroupDescription = 'Study Group Description';
  const priorTherapies = 'Prior Therapies';
  const immunogen = 'Immunogen';
  const intervention = 'Intervention';
  const medicalHistory = 'Medical History';

 });

