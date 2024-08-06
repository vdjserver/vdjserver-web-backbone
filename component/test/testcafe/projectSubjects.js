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
// Date: May 2024
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
var subjectUuid2 = "";

fixture('Project Subjects Page Test Cases')
  .page(config.url);

//append a random number less than 1,000,000 to subjectId
var subjectId = 'Subject ID ' + Math.floor(Math.random()*1000000);
console.log("\nSubject ID " + subjectId);

  //Project Values
  const studyId = "Test Study ID";
  //append a random number less than 1,000,000 to studyTitle
  const studyTitle = "Test Study Title_" + Math.floor(Math.random()*1000000);
  const studyDesc = "Test Study Description";
  const incExcCriteria = "Criteria";
  const grants = "1234";
  const keywords = ["contains_tr","contains_paired_chain"];
  const pubs = "1;2;3;4";
  const labName = "UTSW";
  const labAddr = "11 S. Main St";
  const cName = "Joe";
  const cEmail = "joe@email.com";
  const cAddr = Math.floor(Math.random()*100) + " N. Main St";
  const sName = "Jim";
  const sEmail = "jim@email.com";
  const sAddr = "13 W. Main St";

  //Subject Values
  const synthetic = "true";
  const species = 'Macaca mulatta';
  const species2 = 'Homo sapiens';
  const strain = 'abcde'
  const sex = 'pooled';
  const ageType = 'range';
  const ageMin = '3';
  const ageMax = '9';
  const ageUnit = 'day';
  const ageEvent = 'event';
  const race = 'race';
  const ancestryPopulation = 'ancestry';
  const ethnicity = 'ethnicity';
  const linkedSubjects = 'null';
  const linkType = 'linkType';

  //Diagnosis Values
  const diseaseDiagnosis = 'malaria';
  const diseaseLength = 'Disease Length';
  const diseaseStage = 'Disease Stage';
  const studyGroupDescription = 'Study Group Description';
  const priorTherapies = 'Prior Therapies';
  const immunogen = 'Immunogen';
  const intervention = 'Intervention';
  const medicalHistory = 'Medical History';

  const diseaseDiagnosis2 = 'influenza';
  const diseaseLength2 = 'Disease Length2';
  const diseaseStage2 = 'Disease Stage' + Math.floor(Math.random()*1000000);
  const studyGroupDescription2 = 'Study Group Description2';
  const priorTherapies2 = 'Prior Therapies2';
  const immunogen2 = 'Immunogen2';
  const intervention2 = 'Intervention2';
  const medicalHistory2 = 'Medical History2';
  const diseaseLength3 = 'Disease Length3';

  //General Selectors
  const createProjectSelect = Selector('#create-project', {timeout:config.timeout});
  const subjectsTabSelect = Selector('#subjects-tab', {timeout:config.timeout});
  const detailsSummarySelect = Selector('#project-subjects-details-summary', {timeout:config.timeout});
  const sortDropdownSelect = Selector('#project-subjects-sort-button', {timeout:config.timeout});
  const sortDropdownOptionSelect = Selector('#project-subjects-sort-select', {timeout:config.timeout});
  const newSubjectSelect = Selector('#project-subjects-new-subject', {timeout:config.timeout});
  const revertChangesSelect = Selector('#project-subjects-revert-changes', {timeout:config.timeout});
  const saveChangesSelect = Selector('#project-subjects-save-changes', {timeout:config.timeout});
  const subjectsDropdownSelect = Selector('#project-subject-dropdown', {timeout:config.timeout});
  const subjectsDropdownEditSelect = Selector('#project-subject-edit', {timeout:config.timeout});
  const subjectsDropdownDuplicateSelect = Selector('#project-subject-duplicate', {timeout:config.timeout});
  const subjectsDropdownDeleteSelect = Selector('#project-subject-delete', {timeout:config.timeout});
  const subjectsDropdownAddDiagnosisSelect = Selector('#project-subject-add-diagnosis', {timeout:config.timeout});
  const diagnosisDropdownSelect = Selector('#project-subject-diagnosis-dropdown', {timeout:config.timeout});
  const diagnosisDropdownDuplicateSelect = Selector('#project-subject-duplicate-diagnosis', {timeout:config.timeout});
  const diagnosisDropdownDeleteSelect = Selector('#project-subject-delete-diagnosis', {timeout:config.timeout});

  //Project Field Selectors
  const studyTypeSelect = Selector('#dropdownOntology');
  const studyTypeOption = studyTypeSelect.find('option');

  //Subject Field Selectors
  const syntheticSelect = Selector('#synthetic');
  const syntheticOption = syntheticSelect.find('option');
  const speciesSelect = Selector('#species');
  const speciesOption = speciesSelect.find('option');
  const strainSelect = Selector('#strain_name');
  const sexSelect = Selector('#sex');
  const sexOption = sexSelect.find('option');
  const ageTypeSelect = Selector('#age_type');
  const ageTypeOption = ageTypeSelect.find('option');
  const ageMinSelect = Selector('#age_min');
  const ageMaxSelect = Selector('#age_max');
  const ageUnitSelect = Selector('#age_unit');
  const ageUnitOption = ageUnitSelect.find('option');
  const ageEventSelect = Selector('#age_event');
  const raceSelect = Selector('#race');
  const ancestryPopulationSelect = Selector('#ancestry_population');
  const ethnicitySelect = Selector('#ethnicity');
  const linkedSubjectsSelect = Selector("#linked_subjects");
  const linkedSubjectsOption = linkedSubjectsSelect.find('option');
  const linkTypeSelect = Selector('#link_type');

  //Diagnosis Field Selectors
  const diseaseDiagnosisSelect = Selector('#diagnosisOntology_0');
  const diseaseDiagnosisOption = diseaseDiagnosisSelect.find('option');
  const diseaseDiagnosisOptionSelect = Selector('#ontology-select');

  const diseaseLengthSelect = Selector('#disease_length_0');
  const diseaseStageSelect = Selector('#disease_stage_0');
  const studyGroupDescriptionSelect = Selector('#study_group_description_0');
  const priorTherapiesSelect = Selector('#prior_therapies_0');
  const immunogenSelect = Selector('#immunogen_0');
  const interventionSelect = Selector('#intervention_0');
  const medicalHistorySelect = Selector('#medical_history_0');

  const diseaseLengthSelect2 = Selector('#disease_length_1');
  const diseaseStageSelect2 = Selector('#disease_stage_1');
  const studyGroupDescriptionSelect2 = Selector('#study_group_description_1');
  const priorTherapiesSelect2 = Selector('#prior_therapies_1');
  const immunogenSelect2 = Selector('#immunogen_1');
  const interventionSelect2 = Selector('#intervention_1');
  const medicalHistorySelect2 = Selector('#medical_history_1');

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

 test('Add a Subject (with Diagnosis) to the previously created Project and Check Back-end Values', async t => {
  await login(t,config.username,config.password,'CLICK','#home-login');

  await new Promise(r => setTimeout(r, 5000));
  const getPageUrl = ClientFunction(() => window.location.href);

  await t.navigateTo('./'+projectUuidUrl);
  await new Promise(r => setTimeout(r, 10000));
  const url = await getPageUrl();
  console.log("URL: " + url);

  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(subjectsTabSelect)
    .click(subjectsTabSelect)
  await t
    .click(newSubjectSelect)
    .typeText('input[name="subject_id"]', subjectId)
    .click(syntheticSelect)
    .click(syntheticOption.withAttribute('value',synthetic))
    .click(speciesSelect)
    .click(speciesOption.withText(species))
    .typeText('#strain_name', strain)
    .click(sexSelect)
    .click(sexOption.withText(sex))
    .click(ageTypeSelect)
    .click(ageTypeOption.withText(ageType))
    .typeText('#age_min',ageMin)
    .typeText('#age_max',ageMax)
    .click(ageUnitSelect)
    .click(ageUnitOption.withAttribute('value',ageUnit))
    .typeText('#age_event',ageEvent)
    .typeText('#race',race)
    .typeText('#ancestry_population',ancestryPopulation)
    .typeText('#ethnicity',ethnicity)
    .click(linkedSubjectsSelect)
    .click(linkedSubjectsOption.withText(linkedSubjects))
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

  await t.click(saveChangesSelect);
  await new Promise(r => setTimeout(r, 5000));

  await t
    .click(detailsSummarySelect);

  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var m = await tapisV2.getMetadataForType(token.access_token, projectUuid, 'subject');
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/name/subject',
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
    m = m['result'];
  }

  subjectUuid = m[0]["uuid"];
  console.log("Subject UUID: " + subjectUuid);

  //check Subject values
  await t
    .expect(m[0]["value"]["subject_id"]).eql(subjectId)
    .expect(m[0]["value"]["synthetic"]).ok() //expect m to be truthy
    .expect(m[0]["value"]["species"].label).eql(species)
    .expect(m[0]["value"]["sex"]).eql(sex)
    .expect(m[0]["value"]["age_min"]).eql(parseFloat(ageMin))
    .expect(m[0]["value"]["age_max"]).eql(parseFloat(ageMax))
    .expect(m[0]["value"]["age_unit"].label).eql(ageUnit)
    .expect(m[0]["value"]["age_event"]).eql(ageEvent)
    .expect(m[0]["value"]["ancestry_population"]).eql(ancestryPopulation)
    .expect(m[0]["value"]["ethnicity"]).eql(ethnicity)
    .expect(m[0]["value"]["race"]).eql(race)
    .expect(m[0]["value"]["strain_name"]).eql(strain)
    .expect(m[0]["value"]["link_type"]).eql(linkType)

  if(linkedSubjects == 'null') await t.expect(m[0]["value"]["linked_subjects"] == null).ok()
  else await t.expect(m[0]["value"]["linked_subjects"] == linkedSubjects).ok()

  //check Diagnosis values
  await t
    .expect(m[0]["value"]["diagnosis"][0]["disease_diagnosis"].label.toLowerCase()).contains(diseaseDiagnosis.toLowerCase())
    .expect(m[0]["value"]["diagnosis"][0]["disease_length"]).eql(diseaseLength)
    .expect(m[0]["value"]["diagnosis"][0]["disease_stage"]).eql(diseaseStage)
    .expect(m[0]["value"]["diagnosis"][0]["study_group_description"]).eql(studyGroupDescription)
    .expect(m[0]["value"]["diagnosis"][0]["prior_therapies"]).eql(priorTherapies)
    .expect(m[0]["value"]["diagnosis"][0]["immunogen"]).eql(immunogen)
    .expect(m[0]["value"]["diagnosis"][0]["intervention"]).eql(intervention)
    .expect(m[0]["value"]["diagnosis"][0]["medical_history"]).eql(medicalHistory)

 });

 test('Add another Diagnosis to the previously created Subject and check against the Back-end', async t => {
  await login(t,config.username,config.password,'CLICK','#home-login');

  await new Promise(r => setTimeout(r, 5000));
  await t.navigateTo('./'+projectUuidUrl);

  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(subjectsTabSelect)
    .click(subjectsTabSelect)
  await t
    .click(subjectsDropdownSelect.withAttribute('name',subjectUuid))
    .click(subjectsDropdownAddDiagnosisSelect)
    .click(diseaseDiagnosisSelect)
    .typeText('#ontology-search-input',diseaseDiagnosis2)
    .click(diseaseDiagnosisOptionSelect.withText(diseaseDiagnosis2))
    .typeText('#disease_length_0',diseaseLength2)
    .typeText('#disease_stage_0',diseaseStage2)
    .typeText('#study_group_description_0',studyGroupDescription2)
    .typeText('#prior_therapies_0',priorTherapies2)
    .typeText('#immunogen_0',immunogen2)
    .typeText('#intervention_0',intervention2)
    .typeText('#medical_history_0',medicalHistory2);

  await t.click(saveChangesSelect);

  await new Promise(r => setTimeout(r, 5000));

  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var m = await tapisV2.getProjectMetadata(token.access_token, subjectUuid);
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/uuid/' + subjectUuid,
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

  //find the back-end index of the duplicated Diagnosis
  var dIndex;
  if(m["value"]["diagnosis"][0]["disease_diagnosis"].label.toLowerCase()==diseaseDiagnosis2.toLowerCase())
    dIndex = 0;
  else dIndex = 1;

  //check Diagnosis values
  await t
    .expect(m["value"]["diagnosis"][dIndex]["disease_diagnosis"].label.toLowerCase()).eql(diseaseDiagnosis2.toLowerCase())
    .expect(m["value"]["diagnosis"][dIndex]["disease_length"]).eql(diseaseLength2)
    .expect(m["value"]["diagnosis"][dIndex]["disease_stage"]).eql(diseaseStage2)
    .expect(m["value"]["diagnosis"][dIndex]["study_group_description"]).eql(studyGroupDescription2)
    .expect(m["value"]["diagnosis"][dIndex]["prior_therapies"]).eql(priorTherapies2)
    .expect(m["value"]["diagnosis"][dIndex]["immunogen"]).eql(immunogen2)
    .expect(m["value"]["diagnosis"][dIndex]["intervention"]).eql(intervention2)
    .expect(m["value"]["diagnosis"][dIndex]["medical_history"]).eql(medicalHistory2)
 });

 test('Duplicate a Diagnosis for the previously created Subject and check against the Back-end', async t => {
  await login(t,config.username,config.password,'CLICK','#home-login');

  await new Promise(r => setTimeout(r, 5000));
  await t.navigateTo('./'+projectUuidUrl);

  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(subjectsTabSelect)
    .click(subjectsTabSelect)
  await t
    .click(diagnosisDropdownSelect)
    .click(diagnosisDropdownDuplicateSelect.withAttribute('name','duplicate_0'))
    .typeText('#disease_length_0',diseaseLength3,{replace: true})

  await t.click(saveChangesSelect);

  await new Promise(r => setTimeout(r, 5000));

  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var m = await tapisV2.getProjectMetadata(token.access_token, subjectUuid);
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/uuid/' + subjectUuid,
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

  //determine the back-end index of the Diagnosis in question and its duplicate
  var d1Index, d2Index;
  if(m["value"]["diagnosis"][0]["disease_diagnosis"].label.toLowerCase()==diseaseDiagnosis.toLowerCase()) {
    d1Index = 1;
    d2Index = 2;
  } else if(m["value"]["diagnosis"][1]["disease_diagnosis"].label.toLowerCase()==diseaseDiagnosis.toLowerCase()) {
    d1Index = 0;
    d2Index = 2;
  } else {
    d1Index = 0;
    d2Index = 1;
  }

  //check Diagnosis values
  await t
    .expect(m["value"]["diagnosis"][d2Index]["disease_diagnosis"].label.toLowerCase()).eql(m["value"]["diagnosis"][d1Index]["disease_diagnosis"].label.toLowerCase())
    .expect(m["value"]["diagnosis"][d2Index]["disease_length"]).notEql(m["value"]["diagnosis"][d1Index]["disease_length"])
    .expect(m["value"]["diagnosis"][d1Index]["disease_length"]).eql(diseaseLength3)
    .expect(m["value"]["diagnosis"][d2Index]["disease_stage"]).eql(m["value"]["diagnosis"][d1Index]["disease_stage"])
    .expect(m["value"]["diagnosis"][d2Index]["study_group_description"]).eql(m["value"]["diagnosis"][d1Index]["study_group_description"])
    .expect(m["value"]["diagnosis"][d2Index]["prior_therapies"]).eql(m["value"]["diagnosis"][d1Index]["prior_therapies"])
    .expect(m["value"]["diagnosis"][d2Index]["immunogen"]).eql(m["value"]["diagnosis"][d1Index]["immunogen"])
    .expect(m["value"]["diagnosis"][d2Index]["intervention"]).eql(m["value"]["diagnosis"][d1Index]["intervention"])
    .expect(m["value"]["diagnosis"][d2Index]["medical_history"]).eql(m["value"]["diagnosis"][d1Index]["medical_history"])
 });

 test('Delete the newest Diagnosis for the previously created Subject and check against the Back-end', async t => {
  await login(t,config.username,config.password,'CLICK','#home-login');

  await new Promise(r => setTimeout(r, 5000));
  await t.navigateTo('./'+projectUuidUrl);

  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(subjectsTabSelect)
    .click(subjectsTabSelect)

  await t
    .click(diagnosisDropdownSelect)
    .click(diagnosisDropdownDeleteSelect.withAttribute('name','delete_0'))

  await t.click(saveChangesSelect);

  await new Promise(r => setTimeout(r, 5000));

  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var m = await tapisV2.getProjectMetadata(token.access_token, subjectUuid);
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/uuid/' + subjectUuid,
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

  //confirm only 2 Diagnoses are stored in the back-end
  await t
    .expect(m["value"]["diagnosis"].length).eql(2)
 });

 test('Duplicate the newest Subject and add a unique Subject ID, save, and then delete the Subject', async t => {
  await login(t,config.username,config.password,'CLICK','#home-login');

  await new Promise(r => setTimeout(r, 5000));
  await t.navigateTo('./'+projectUuidUrl);

  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(subjectsTabSelect)
    .click(subjectsTabSelect)

  //Duplicate the newest Subject
  await t
    .click(subjectsDropdownSelect.withAttribute('name',subjectUuid))
    .click(subjectsDropdownDuplicateSelect.withAttribute('name',subjectUuid))
    .typeText('input[name="subject_id"]', subjectId+'-D', {replace: true})
    .click(linkedSubjectsSelect)
    .click(linkedSubjectsOption.withText(linkedSubjects))

  await t.click(saveChangesSelect);

  await new Promise(r => setTimeout(r, 5000));

  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var m = await tapisV2.getMetadataForType(token.access_token, projectUuid, 'subject');
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/name/subject',
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
        .expect(m['result'].length).eql(2);
    m = m['result'];
  }

  //confirm 2 Subjects are stored in the back-end
  await t
    .expect(m.length).eql(2);

  //get UUID for the newly duplicated Subject
  var subjectUuidD ="";
  if(m[0]["uuid"] != subjectUuid) subjectUuidD = m[0]["uuid"];
  else subjectUuidD = m[1]["uuid"];
  console.log("Subject-D UUID: " + subjectUuidD);


  //delete the newly duplicated Subject and save
  await t
    .click(subjectsDropdownSelect.withAttribute('name',subjectUuidD))
    .click(subjectsDropdownDeleteSelect.withAttribute('name',subjectUuidD))

  await t.click(saveChangesSelect);

  await new Promise(r => setTimeout(r, 5000));

  token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    m = await tapisV2.getMetadataForType(token.access_token, projectUuid, 'subject');
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/name/subject',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    m = await tapisV3.sendRequest(requestSettings);
    //console.log(JSON.stringify(m, null, 2));
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(1);
    m = m['result'];
  }

  //confirm only 1 Subject is stored in the back-end
  await t
    .expect(m.length).eql(1);
 });

 test('View existing Subject in Summary and Details view mode and confirm the correct values are shown', async t => {
  //Summary view selectors
  const subjectIdText = Selector('div').withText(subjectId).exists;
  const sexSpeciesText = Selector('div').withText(sex + '/' + species).exists;
  const raceEthnicityText = Selector('div').withText(race + '/'+ ethnicity).exists;
  const ageText = Selector('div').withText(ageMin + '-' + ageMax + ' ' + ageUnit).exists;
  const studyGroupDescriptionText = Selector('div').withText(studyGroupDescription).exists;
  const studyGroupDescriptionText2 = Selector('div').withText(studyGroupDescription2).exists;
  const studyGroupDescriptionDetailsText = Selector('#study_group_description_0');
  const studyGroupDescriptionDetailsText2 = Selector('#study_group_description_1');
  const diseaseDiagnosisText = Selector('div').withText(diseaseDiagnosis.toLowerCase()).exists;
  const diseaseDiagnosisText2 = Selector('div').withText(diseaseDiagnosis2.toLowerCase()).exists;
  const diseaseDiagnosisDetailsText = Selector('#disease_diagnosis_0');
  const diseaseDiagnosisDetailsText2 = Selector('#disease_diagnosis_1');

  //Details view selectors
  const subjectIdDetailsText = Selector('input[name="subject_id"]');
  //Regular expression code for additional flexibility 
  //const syntheticRegExp = new RegExp(synthetic, "i"); 

  await login(t,config.username,config.password,'CLICK','#home-login');
  await new Promise(r => setTimeout(r, 5000));

  await t.navigateTo('./'+projectUuidUrl);
  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(subjectsTabSelect)
    .click(subjectsTabSelect)

  await new Promise(r => setTimeout(r, 5000));

  //Summary view checks
  await t
    .expect(subjectIdText).ok()
    .expect(sexSpeciesText).ok()
    .expect(raceEthnicityText).ok()
    .expect(ageText).ok()
    .expect(studyGroupDescriptionText).ok()
    .expect(studyGroupDescriptionText2).ok()
    .expect(diseaseDiagnosisText).ok()
    .expect(diseaseDiagnosisText2).ok()

  await t
    .click(detailsSummarySelect);

  //Details view checks
  await t
    .expect(subjectIdDetailsText.value).eql(subjectId)
    //.expect(syntheticSelect.value).match(syntheticRegExp)
    .expect(syntheticSelect.value).eql(synthetic)
    .expect(speciesSelect.value).eql(species)
    .expect(strainSelect.value).eql(strain)
    .expect(sexSelect.value).eql(sex)
    .expect(ageTypeSelect.value).eql(ageType)
    .expect(ageMinSelect.value).eql(ageMin)
    .expect(ageMaxSelect.value).eql(ageMax)
    .expect(ageUnitSelect.value).eql(ageUnit)
    .expect(ageEventSelect.value).eql(ageEvent)
    .expect(raceSelect.value).eql(race)
    .expect(ancestryPopulationSelect.value).eql(ancestryPopulation)
    .expect(ethnicitySelect.value).eql(ethnicity)
    .expect(linkedSubjectsSelect.value).eql(linkedSubjects)
    .expect(linkTypeSelect.value).eql(linkType)

    .expect(diseaseDiagnosisDetailsText.getAttribute('value')).contains(diseaseDiagnosis2)
    .expect(diseaseLengthSelect.value).eql(diseaseLength2)
    .expect(diseaseStageSelect.value).eql(diseaseStage2)
    .expect(studyGroupDescriptionDetailsText.getAttribute('value')).eql(studyGroupDescription2)
    .expect(priorTherapiesSelect.value).eql(priorTherapies2)
    .expect(immunogenSelect.value).eql(immunogen2)
    .expect(interventionSelect.value).eql(intervention2)
    .expect(medicalHistorySelect.value).eql(medicalHistory2)

    .expect(diseaseDiagnosisDetailsText2.getAttribute('value')).contains(diseaseDiagnosis)
    .expect(diseaseLengthSelect2.value).eql(diseaseLength)
    .expect(diseaseStageSelect2.value).eql(diseaseStage)
    .expect(studyGroupDescriptionDetailsText2.getAttribute('value')).eql(studyGroupDescription)
    .expect(priorTherapiesSelect2.value).eql(priorTherapies)
    .expect(immunogenSelect2.value).eql(immunogen)
    .expect(interventionSelect2.value).eql(intervention)
    .expect(medicalHistorySelect2.value).eql(medicalHistory)
 });

 test('View existing Subject in Summary view mode, edit, revert, and confirm the correct values are still shown', async t => {
  //Temporary Values
  const subjectIdR = "Subject ID R";
  const syntheticR = "false";
  const speciesR = 'Mus musculus';
  const sexR = 'female';
  const ageTypeR = 'point';
  const ageMinR = '5';
  const ageUnitR = 'month';
  const raceR = 'raceR';
  const ethnicityR = 'ethnicityR';
  const studyGroupDescriptionR = 'Study Group DescriptionR';
  const diseaseDiagnosisSelect = Selector('#diagnosisOntology_0');
  const diseaseDiagnosisOption = diseaseDiagnosisSelect.find('option');
  const diseaseDiagnosisOptionSelect = Selector('#ontology-select');
  const diseaseDiagnosisR = 'tuberculosis';
  const diseaseDiagnosisSelect2 = Selector('#diagnosisOntology_1');
  const diseaseDiagnosis2R = 'cholera';

  //Summary view selectors with original values
  const subjectIdText = Selector('div').withText(subjectId).exists;
  const sexSpeciesText = Selector('div').withText(sex + '/' + species).exists;
  const raceEthnicityText = Selector('div').withText(race + '/'+ ethnicity).exists;
  const ageText = Selector('div').withText(ageMin + '-' + ageMax + ' ' + ageUnit).exists;
  const studyGroupDescriptionText = Selector('div').withText(studyGroupDescription).exists;
  const studyGroupDescriptionText2 = Selector('div').withText(studyGroupDescription2).exists;
  const diseaseDiagnosisText = Selector('div').withText(diseaseDiagnosis.toLowerCase()).exists;
  const diseaseDiagnosisText2 = Selector('div').withText(diseaseDiagnosis2.toLowerCase()).exists;

  //Details view selectors
  const subjectIdDetailsText = Selector('input[name="subject_id"]');
  const ageMinSelect = Selector('#age_min');
  const ageMaxSelect = Selector('#age_max');
  const raceSelect = Selector('#race');
  const ethnicitySelect = Selector('#ethnicity');
  const studyGroupDescriptionDetailsText = Selector('#study_group_description_0');
  const studyGroupDescriptionDetailsText2 = Selector('#study_group_description_1');
  const diseaseDiagnosisDetailsText = Selector('#disease_diagnosis_0');
  const diseaseDiagnosisDetailsText2 = Selector('#disease_diagnosis_1');

  await login(t,config.username,config.password,'CLICK','#home-login');
  await new Promise(r => setTimeout(r, 5000));

  await t.navigateTo('./'+projectUuidUrl);
  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(subjectsTabSelect)
    .click(subjectsTabSelect)

  //update values but do not save
  await t
    .click(subjectsDropdownSelect)
    .click(subjectsDropdownEditSelect)
    .typeText('input[name="subject_id"]', subjectIdR,{replace: true})
    .click(syntheticSelect)
    .click(syntheticOption.withAttribute('value',syntheticR))
    .click(speciesSelect)
    .click(speciesOption.withText(speciesR))
    .click(sexSelect)
    .click(sexOption.withText(sexR))
    .click(ageTypeSelect)
    .click(ageTypeOption.withText(ageTypeR))
    .typeText('#age_point',ageMinR,{replace: true})
    .click(ageUnitSelect)
    .click(ageUnitOption.withAttribute('value',ageUnitR))
    .typeText('#race',raceR,{replace: true})
    .typeText('#ethnicity',ethnicityR,{replace: true})
    .click(diseaseDiagnosisSelect)
    .typeText('#ontology-search-input',diseaseDiagnosisR,{replace: true})
    .click(diseaseDiagnosisOptionSelect.withText(diseaseDiagnosisR))
    .click(diseaseDiagnosisSelect2)
    .typeText(Selector('#disease-diagnosis-region-1').find('#ontology-search-input'),diseaseDiagnosis2R,{replace: true})
    .click(diseaseDiagnosisOptionSelect.withText(diseaseDiagnosis2R))

  await t.click(revertChangesSelect);
  await new Promise(r => setTimeout(r, 5000));

  //Summary view checks
  await t
    .expect(subjectIdText).ok()
    .expect(sexSpeciesText).ok()
    .expect(raceEthnicityText).ok()
    .expect(ageText).ok()
    .expect(studyGroupDescriptionText).ok()
    .expect(studyGroupDescriptionText2).ok()
    .expect(diseaseDiagnosisText).ok()
    .expect(studyGroupDescriptionText).ok()
    .expect(studyGroupDescriptionText2).ok()
    .expect(diseaseDiagnosisText).ok()
    .expect(diseaseDiagnosisText2).ok()

  await t
    .click(detailsSummarySelect);

  //Details view checks
  await t
    .expect(subjectIdDetailsText.value).eql(subjectId)
    .expect(speciesSelect.value).eql(species)
    .expect(sexSelect.value).eql(sex)
    .expect(ageTypeSelect.value).eql(ageType)
    .expect(ageMinSelect.value).eql(ageMin)
    .expect(ageMaxSelect.value).eql(ageMax)
    .expect(ageUnitSelect.value).eql(ageUnit)
    .expect(raceSelect.value).eql(race)
    .expect(ethnicitySelect.value).eql(ethnicity)
    .expect(studyGroupDescriptionDetailsText.getAttribute('value')).eql(studyGroupDescription2)
    .expect(studyGroupDescriptionDetailsText2.getAttribute('value')).eql(studyGroupDescription)
    .expect(diseaseDiagnosisDetailsText.getAttribute('value')).contains(diseaseDiagnosis2)
    .expect(diseaseDiagnosisDetailsText2.getAttribute('value')).contains(diseaseDiagnosis)
 });

 test('Duplicate the newest Subject and add a unique Subject ID and change the linked Subject value, for the previously created Project', async t => {
  await login(t,config.username,config.password,'CLICK','#home-login');

  await new Promise(r => setTimeout(r, 5000));
  await t.navigateTo('./'+projectUuidUrl);

  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(subjectsTabSelect)
    .click(subjectsTabSelect)

  await t
    .click(subjectsDropdownSelect.withAttribute('name',subjectUuid))
    .click(subjectsDropdownDuplicateSelect.withAttribute('name',subjectUuid))
    .typeText('input[name="subject_id"]', subjectId+'-2', {replace: true})
    .click(linkedSubjectsSelect)
    .click(linkedSubjectsOption.withText(linkedSubjects))

  await t.click(saveChangesSelect);

  await new Promise(r => setTimeout(r, 5000));

  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var m = await tapisV2.getMetadataForType(token.access_token, projectUuid, 'subject');
    subjectUuid2 = m[0]["uuid"];
    m = await tapisV2.getProjectMetadata(token.access_token, subjectUuid);
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/name/subject',
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
        .expect(m['result'].length).eql(2);

    //determine which record holds the new Subject
    if(m['result'][0]['uuid'] == subjectUuid) {
      m = m['result'][1];
      subjectUuid2 = m["uuid"];
    } else {
      m = m['result'][0];
      subjectUuid2 = m["uuid"];
    }

    var requestSettings2 = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/uuid/' + subjectUuid,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    m = await tapisV3.sendRequest(requestSettings2);
    //console.log(JSON.stringify(m, null, 2));
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(1);
    m = m['result'][0];
  }
  console.log("Subject2 UUID: " + subjectUuid2);

  if (config.tapis_version == 2) {
    var m2 = await tapisV2.getProjectMetadata(token.access_token, subjectUuid2);
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/uuid/' + subjectUuid2,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var m2 = await tapisV3.sendRequest(requestSettings);
    //console.log(JSON.stringify(m, null, 2));
    await t.expect(m2['status']).eql("success")
        .expect(m2['result'].length).eql(1);
    m2 = m2['result'][0];
  }

  //check Back-end values
  await t
    //subject
    .expect(m["value"]["subject_id"]).notEql(m2["value"]["subject_id"])
    .expect(m["value"]["subject_id"]).eql(subjectId)
    .expect(m2["value"]["subject_id"]).eql(subjectId+'-2')
    .expect(m["value"]["synthetic"]).eql(m2["value"]["synthetic"])
    .expect(m["value"]["species"].label).eql(m2["value"]["species"].label)
    .expect(m["value"]["sex"]).eql(m2["value"]["sex"])
    .expect(m["value"]["age_min"]).eql(m2["value"]["age_min"])
    .expect(m["value"]["age_max"]).eql(m2["value"]["age_max"])
    .expect(m["value"]["age_unit"].label).eql(m2["value"]["age_unit"].label)
    .expect(m["value"]["age_event"]).eql(m2["value"]["age_event"])
    .expect(m["value"]["ancestry_population"]).eql(m2["value"]["ancestry_population"])
    .expect(m["value"]["ethnicity"]).eql(m2["value"]["ethnicity"])
    .expect(m["value"]["race"]).eql(m2["value"]["race"])
    .expect(m["value"]["strain_name"]).eql(m2["value"]["strain_name"])
    //.expect(m["value"]["linked_subjects"] == null).ok()
    //.expect(m["value"]["linked_subjects"] == linkedSubjects).ok()
    .expect(m["value"]["link_type"]).eql(m2["value"]["link_type"])

  if(linkedSubjects == 'null') await t.expect(m["value"]["linked_subjects"] == null).ok()
  else await t.expect(m["value"]["linked_subjects"] == linkedSubjects).ok()

    //diagnosis 0
    .expect(m["value"]["diagnosis"][0]["disease_diagnosis"].label.toLowerCase()).eql(m2["value"]["diagnosis"][0]["disease_diagnosis"].label.toLowerCase())
    .expect(m["value"]["diagnosis"][0]["disease_length"]).eql(m2["value"]["diagnosis"][0]["disease_length"])
    .expect(m["value"]["diagnosis"][0]["disease_stage"]).eql(m2["value"]["diagnosis"][0]["disease_stage"])
    .expect(m["value"]["diagnosis"][0]["study_group_description"]).eql(m2["value"]["diagnosis"][0]["study_group_description"])
    .expect(m["value"]["diagnosis"][0]["prior_therapies"]).eql(m2["value"]["diagnosis"][0]["prior_therapies"])
    .expect(m["value"]["diagnosis"][0]["immunogen"]).eql(m2["value"]["diagnosis"][0]["immunogen"])
    .expect(m["value"]["diagnosis"][0]["intervention"]).eql(m2["value"]["diagnosis"][0]["intervention"])
    .expect(m["value"]["diagnosis"][0]["medical_history"]).eql(m2["value"]["diagnosis"][0]["medical_history"])

    //diagnosis 1
    .expect(m["value"]["diagnosis"][1]["disease_diagnosis"].label.toLowerCase()).eql(m2["value"]["diagnosis"][1]["disease_diagnosis"].label.toLowerCase())
    .expect(m["value"]["diagnosis"][1]["disease_length"]).eql(m2["value"]["diagnosis"][1]["disease_length"])
    .expect(m["value"]["diagnosis"][1]["disease_stage"]).eql(m2["value"]["diagnosis"][1]["disease_stage"])
    .expect(m["value"]["diagnosis"][1]["study_group_description"]).eql(m2["value"]["diagnosis"][1]["study_group_description"])
    .expect(m["value"]["diagnosis"][1]["prior_therapies"]).eql(m2["value"]["diagnosis"][1]["prior_therapies"])
    .expect(m["value"]["diagnosis"][1]["immunogen"]).eql(m2["value"]["diagnosis"][1]["immunogen"])
    .expect(m["value"]["diagnosis"][1]["intervention"]).eql(m2["value"]["diagnosis"][1]["intervention"])
    .expect(m["value"]["diagnosis"][1]["medical_history"]).eql(m2["value"]["diagnosis"][1]["medical_history"])

 });

 test('Add a new Subject with a non-unique Subject ID for the previously created Project', async t => {
  await login(t,config.username,config.password,'CLICK','#home-login');

  await new Promise(r => setTimeout(r, 5000));
  await t.navigateTo('./'+projectUuidUrl);

  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(subjectsTabSelect)
    .click(subjectsTabSelect)
  await t
    .click(newSubjectSelect)
    .typeText('input[name="subject_id"]', subjectId)

  await t.click(saveChangesSelect);

  await new Promise(r => setTimeout(r, 5000));

  const errorMessage = Selector('div').withText('Please enter a non-blank, unique Subject ID.').exists;

  //const errorYes = Selector('.is-invalid').exists; //good

  await t
    //.expect(errorYes).ok() //good
    .expect(errorMessage).ok() 
 });

 test('Add a new Subject with a blank Subject ID for the previously created Project', async t => {
  const blankSubjectId = '  ';

  await login(t,config.username,config.password,'CLICK','#home-login');

  await new Promise(r => setTimeout(r, 5000));
  await t.navigateTo('./'+projectUuidUrl);

  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(subjectsTabSelect)
    .click(subjectsTabSelect)
  await t
    .click(newSubjectSelect)
    .typeText('input[name="subject_id"]', blankSubjectId)

  await t.click(saveChangesSelect);

  await new Promise(r => setTimeout(r, 5000));

  const errorMessage = Selector('div').withText('Please enter a non-blank, unique Subject ID.').exists;

  await t
    .expect(errorMessage).ok()
 });

 test('Edit existing Subject and add a negative age_min point value', async t => {
  const ageType = 'point';
  const ageMin = '-3';

  await login(t,config.username,config.password,'CLICK','#home-login');
  await new Promise(r => setTimeout(r, 5000));

  await t.navigateTo('./'+projectUuidUrl);
  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(subjectsTabSelect)
    .click(subjectsTabSelect)
  await t
    .click(subjectsDropdownSelect)
    .click(subjectsDropdownEditSelect)
    .click(ageTypeSelect)
    .click(ageTypeOption.withText(ageType))
    .typeText('#age_point',ageMin,{ replace: true })

  await t.click(saveChangesSelect);

  await new Promise(r => setTimeout(r, 5000));

  const errorMessage = Selector('div').withText('Please enter a valid age number ≥ 0.').exists;

  await t
    .expect(errorMessage).ok()
 });

 test('Edit existing Subject and add a negative age_max range value', async t => {
  const ageType = 'range';
  const ageMin = '1';
  const ageMax = '-3';

  await login(t,config.username,config.password,'CLICK','#home-login');
  await new Promise(r => setTimeout(r, 5000));

  await t.navigateTo('./'+projectUuidUrl);
  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(subjectsTabSelect)
    .click(subjectsTabSelect)
  await t
    .click(subjectsDropdownSelect)
    .click(subjectsDropdownEditSelect)
    .click(ageTypeSelect)
    .click(ageTypeOption.withText(ageType))
    .typeText('#age_min',ageMin,{ replace: true })
    .typeText('#age_max',ageMax,{ replace: true })

  await t.click(saveChangesSelect);

  await new Promise(r => setTimeout(r, 5000));

  const errorMessage1 = Selector('div').withText('Please enter a valid minimum age number ≥ 0.').exists;
  const errorMessage2 = Selector('div').withText('Please enter a valid maximum age number that is greater than the minimum age number.').exists;

  await t
    .expect(errorMessage1).ok()
    .expect(errorMessage2).ok()
 });

 test('Edit existing Subject and add an age range with age_max < age_min', async t => {
  const ageType = 'range';
  const ageMin = '8';
  const ageMax = '4';

  await login(t,config.username,config.password,'CLICK','#home-login');
  await new Promise(r => setTimeout(r, 5000));

  await t.navigateTo('./'+projectUuidUrl);
  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(subjectsTabSelect)
    .click(subjectsTabSelect)

  await t
    .click(subjectsDropdownSelect)
    .click(subjectsDropdownEditSelect)
    .click(ageTypeSelect)
    .click(ageTypeOption.withText(ageType))
    .typeText('#age_min',ageMin,{ replace: true })
    .typeText('#age_max',ageMax,{ replace: true })

  await t.click(saveChangesSelect);

  await new Promise(r => setTimeout(r, 5000));

  const errorMessage1 = Selector('div').withText('Please enter a valid minimum age number ≥ 0.').exists;
  const errorMessage2 = Selector('div').withText('Please enter a valid maximum age number that is greater than the minimum age number.').exists;

  await t
    .expect(errorMessage1).ok()
    .expect(errorMessage2).ok()
 });

 test('Change Subject 2\'s age and sex values, add a third Subject, and check Sort options', async t => {
  const subjectId2 = 'Z ' + subjectId;
  const subjectId3 = 'V ' + subjectId;

  const sex2 = 'female';
  const sex3 = 'hermaphrodite';

  const ageType2 = 'range';
  const ageType3 = 'point';
  const ageMin2 = '4';
  const ageMax2 = '4';
  const ageMin3 = '1';
  const ageUnit2 = "hour";
  const ageUnit3 = "month";

  await login(t,config.username,config.password,'CLICK','#home-login');
  await new Promise(r => setTimeout(r, 5000));

  await t.navigateTo('./'+projectUuidUrl);
  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(subjectsTabSelect)
    .click(subjectsTabSelect)

  await new Promise(r => setTimeout(r, 5000));

  //update values for Subject 2
  await t
    .click(subjectsDropdownSelect.withAttribute('name',subjectUuid2))
    .click(subjectsDropdownEditSelect.withAttribute('name', subjectUuid2))
    .typeText('input[name="subject_id"]', subjectId2, {replace:true})
    .click(sexSelect)
    .click(sexOption.withText(sex2))
    .click(ageTypeSelect)
    .click(ageTypeOption.withText(ageType2))
    .typeText('#age_min',ageMin2,{ replace: true })
    .typeText('#age_max',ageMax2,{ replace: true })
    .click(ageUnitSelect)
    .click(ageUnitOption.withAttribute('value',ageUnit2))

  await t.click(saveChangesSelect);

  //Add the third Subject
  await t
    .click(newSubjectSelect)
    .typeText('input[name="subject_id"]', subjectId3, {replace:true})
    .click(sexSelect)
    .click(sexOption.withText(sex3))
    .click(ageTypeSelect)
    .click(ageTypeOption.withText(ageType3))
    .typeText('#age_point',ageMin3,{ replace: true })
    .click(ageUnitSelect)
    .click(ageUnitOption.withAttribute('value',ageUnit3))

  await new Promise(r => setTimeout(r, 5000));

  await t.click(saveChangesSelect);

  await new Promise(r => setTimeout(r, 5000));

  var token = await tapisIO.getToken({username: config.username, password: config.password});

  //get all subjects
  if (config.tapis_version == 2) {
    var subjects = await tapisV2.getMetadataForType(token.access_token, projectUuid, 'subject');
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/name/subject',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var subjects = await tapisV3.sendRequest(requestSettings);
    //console.log(JSON.stringify(subjects, null, 2));
    await t.expect(subjects['status']).eql("success")
        .expect(subjects['result'].length).eql(3);
    subjects = subjects['result'];
  }

  //find uuid values for the subjects based on their subject id
  var uuid1 = "";
  var uuid2 = "";
  var uuid3 = "";

  if(subjects[0]['value']['subject_id'] == subjectId) uuid1 = subjects[0]['uuid'];
  else if(subjects[0]['value']['subject_id'] == subjectId2) uuid2 = subjects[0]['uuid'];
  else if(subjects[0]['value']['subject_id'] == subjectId3) uuid3 = subjects[0]['uuid'];

  if(subjects[1]['value']['subject_id'] == subjectId) uuid1 = subjects[1]['uuid'];
  else if(subjects[1]['value']['subject_id'] == subjectId2) uuid2 = subjects[1]['uuid'];
  else if(subjects[1]['value']['subject_id'] == subjectId3) uuid3 = subjects[1]['uuid'];

  if(subjects[2]['value']['subject_id'] == subjectId) uuid1 = subjects[2]['uuid'];
  else if(subjects[2]['value']['subject_id'] == subjectId2) uuid2 = subjects[2]['uuid'];
  else if(subjects[2]['value']['subject_id'] == subjectId3) uuid3 = subjects[2]['uuid'];

  //sort by subject id
  await t
    .click(sortDropdownSelect)
    .click(sortDropdownOptionSelect.withAttribute('name','subjectid'))

  //get elements in sorted order
  var subj1 = await subjectsDropdownSelect.nth(0).getAttribute('name');
  var subj2 = await subjectsDropdownSelect.nth(1).getAttribute('name');
  var subj3 = await subjectsDropdownSelect.nth(2).getAttribute('name');

  //confirm sorted order matches expected order
  await t
    .expect(subj1).eql(uuid1)
    .expect(subj2).eql(uuid3)
    .expect(subj3).eql(uuid2)

  //sort by sex
  await t
    .click(sortDropdownSelect)
    .click(sortDropdownOptionSelect.withAttribute('name','sex'))

  //get elements in sorted order
  subj1 = await subjectsDropdownSelect.nth(0).getAttribute('name');
  subj2 = await subjectsDropdownSelect.nth(1).getAttribute('name');
  subj3 = await subjectsDropdownSelect.nth(2).getAttribute('name');

  //confirm sorted order matches expected order
  await t
    .expect(subj1).eql(uuid2)
    .expect(subj2).eql(uuid3)
    .expect(subj3).eql(uuid1)

  //sort by age
  await t
    .click(sortDropdownSelect)
    .click(sortDropdownOptionSelect.withAttribute('name','age'))

  //get elements in sorted order
  subj1 = await subjectsDropdownSelect.nth(0).getAttribute('name');
  subj2 = await subjectsDropdownSelect.nth(1).getAttribute('name');
  subj3 = await subjectsDropdownSelect.nth(2).getAttribute('name');

  //confirm sorted order matches expected order
  await t
    .expect(subj1).eql(uuid2)
    .expect(subj2).eql(uuid1)
    .expect(subj3).eql(uuid3)
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
