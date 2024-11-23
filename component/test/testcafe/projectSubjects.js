//
// projectSubjects.js
// Project Subjects Page Test Cases
//
// VDJServer
// https://vdjserver.org
//
// Copyright (C) 2024 The University of Texas Southwestern Medical Center
//
// Author: Ryan C. Kennedy
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
// Date: May - November 2024
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

  const loginButtonId = '#home-login';

//Append a random number less than 1,000,000 to subjectId
var subjectId = 'Subject ID ' + Math.floor(Math.random()*1000000);
//console.log("\nSubject ID " + subjectId);

  //Project Values
  const studyId = "Test Study ID";
  //Append a random number less than 1,000,000 to studyTitle
  const studyTitle = "Test Study Title_" + Math.floor(Math.random()*1000000);
  const studyType = "NCIT:C16084";
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
  const projectSuccessfullyCreatedMessage = "Project successfully created!";

  //Subject Values
  const projectSubjectFormId = '#project-subject-form_';
  const projectSubjectDropdownId = '#project-subject-dropdown';
  const linkedSubjectsId = '#linked_subjects';
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
  const speciesValidationMessage = "Please select a non-null Species.";

  //Diagnosis Values
  const diagnosisOntologyId = '#ontology-search-input';
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
  const createProjectSelect = Selector('#create-project');
  const subjectsTabSelect = Selector('#subjects-tab');
  const detailsSummarySelect = Selector('#project-subjects-details-summary');
  const sortDropdownSelect = Selector('#project-subjects-sort-button');
  const sortDropdownOptionSelect = Selector('#project-subjects-sort-select');
  const newSubjectSelect = Selector('#project-subjects-new-subject');
  const revertChangesSelect = Selector('#project-subjects-revert-changes');
  const saveChangesSelect = Selector('#project-subjects-save-changes');
  const subjectsDropdownSelect = Selector('#project-subject-dropdown');
  const subjectsDropdownEditSelect = Selector('#project-subject-edit');
  const subjectsDropdownDuplicateSelect = Selector('#project-subject-duplicate');
  const subjectsDropdownDeleteSelect = Selector('#project-subject-delete');
  const subjectsDropdownAddDiagnosisSelect = Selector('#project-subject-add-diagnosis');
  const diagnosisDropdownSelect = Selector('#project-subject-diagnosis-dropdown');
  const diagnosisDropdownDuplicateSelect = Selector('#project-subject-duplicate-diagnosis');
  const diagnosisDropdownDeleteSelect = Selector('#project-subject-delete-diagnosis');

  //Project Field Selectors
  const studyIdSelect = Selector('#NCBI');
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
  const projectModalDialogSelect = Selector('.modal-dialog');
  const projectModalBodyClass = '.modal-body';
  const projectModalCancelButtonSelect = Selector('#cancel-message-button');

  //Subject Field Selectors
  const projectSubjectFormSelect = Selector('.project-subject-form');
  const subjectIdBaseId = '#subject_id_';
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
  const agePointSelect = Selector('#age_point');
  const ageUnitSelect = Selector('#age_unit');
  const ageUnitOption = ageUnitSelect.find('option');
  const ageEventSelect = Selector('#age_event');
  const raceSelect = Selector('#race');
  const ancestryPopulationSelect = Selector('#ancestry_population');
  const ethnicitySelect = Selector('#ethnicity');
  const linkedSubjectsSelect = Selector("#linked_subjects");
  const linkedSubjectsOption = linkedSubjectsSelect.find('option');
  const linkTypeSelect = Selector('#link_type');
  const invalidFeedbackSelect = Selector('.invalid-feedback');

  //Diagnosis Field Selectors
  const diseaseDiagnosisRegion1Select = Selector('#disease-diagnosis-region-1')
  const diagnosisOntologySelectSelect = Selector('#ontology-search-input');
  const diseaseDiagnosisSelect = Selector('#diagnosisOntology_0');
  const diseaseDiagnosisOption = diseaseDiagnosisSelect.find('option');
  const diseaseDiagnosisOptionSelect = Selector('#ontology-select');
  const diseaseDiagnosis2Select = Selector('#diagnosisOntology_1');

  const diseaseLengthSelect = Selector('#disease_length_0');
  const diseaseStageSelect = Selector('#disease_stage_0');
  const studyGroupDescriptionSelect = Selector('#study_group_description_0');
  const priorTherapiesSelect = Selector('#prior_therapies_0');
  const immunogenSelect = Selector('#immunogen_0');
  const interventionSelect = Selector('#intervention_0');
  const medicalHistorySelect = Selector('#medical_history_0');

  const diseaseLength2Select = Selector('#disease_length_1');
  const diseaseStage2Select = Selector('#disease_stage_1');
  const studyGroupDescription2Select = Selector('#study_group_description_1');
  const priorTherapies2Select = Selector('#prior_therapies_1');
  const immunogen2Select = Selector('#immunogen_1');
  const intervention2Select = Selector('#intervention_1');
  const medicalHistory2Select = Selector('#medical_history_1');

  const diseaseDiagnosisDetailsText = Selector('#disease_diagnosis_0');
  const diseaseDiagnosisDetailsText2 = Selector('#disease_diagnosis_1');

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

 test('Add a Subject (with Diagnosis) to the previously created Project and Check Back-end Values', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  const getPageUrl = ClientFunction(() => window.location.href);

  await t.navigateTo('./'+projectUuidUrl);
  const url = await getPageUrl();

  await t
    .click(subjectsTabSelect)
    .click(newSubjectSelect)

  var subjectCid = await projectSubjectFormSelect.find(projectSubjectDropdownId).getAttribute('name');

  await t
    .typeText(subjectIdBaseId + subjectCid, subjectId)
    .click(syntheticSelect)
    .click(syntheticOption.withAttribute('value',synthetic))
    .click(speciesSelect)
    .click(speciesOption.withExactText(species))
    .typeText(strainSelect, strain)
    .click(sexSelect)
    .click(sexOption.withExactText(sex))
    .click(ageTypeSelect)
    .click(ageTypeOption.withExactText(ageType))
    .typeText(ageMinSelect,ageMin)
    .typeText(ageMaxSelect,ageMax)
    .click(ageUnitSelect)
    .click(ageUnitOption.withAttribute('value',ageUnit))
    .typeText(ageEventSelect,ageEvent)
    .typeText(raceSelect,race)
    .typeText(ancestryPopulationSelect,ancestryPopulation)
    .typeText(ethnicitySelect,ethnicity)
    .click(linkedSubjectsSelect)
    .click(linkedSubjectsOption.withExactText(linkedSubjects))
    .typeText(linkTypeSelect,linkType)
    .click(diseaseDiagnosisSelect)
    .typeText(diagnosisOntologySelectSelect,diseaseDiagnosis)
    .click(diseaseDiagnosisOptionSelect.withExactText(diseaseDiagnosis))
    .typeText(diseaseLengthSelect,diseaseLength)
    .typeText(diseaseStageSelect,diseaseStage)
    .typeText(studyGroupDescriptionSelect,studyGroupDescription)
    .typeText(priorTherapiesSelect,priorTherapies)
    .typeText(immunogenSelect,immunogen)
    .typeText(interventionSelect,intervention)
    .typeText(medicalHistorySelect,medicalHistory)
    .click(saveChangesSelect)
    .wait(config.save_timeout)
    .click(detailsSummarySelect)

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
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(1);
    m = m['result'];
  }

  subjectUuid = m[0]["uuid"];
  //console.log("Subject UUID: " + subjectUuid);

  //Check Subject values
  await t
    .expect(m[0]["value"]["subject_id"]).eql(subjectId)
    .expect(m[0]["value"]["synthetic"]).ok() //Expect m to be truthy
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

  //Check Diagnosis values
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

 test('Confirm adding a Subject with a null Species is not allowed', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  const getPageUrl = ClientFunction(() => window.location.href);

  await t.navigateTo('./'+projectUuidUrl);

  await t
    .click(subjectsTabSelect)
    .click(newSubjectSelect)

  var subjectCid = await projectSubjectFormSelect.find(projectSubjectDropdownId).getAttribute('name');

  await t
    .typeText(subjectIdBaseId + subjectCid, subjectId + "nullSpecies")
    .click(speciesSelect)
    .click(speciesOption.withExactText("null"))
    .click(saveChangesSelect)
    .wait(config.save_timeout)

  var errorMessage = invalidFeedbackSelect.withExactText(speciesValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).ok()
 });

 test('Add another Diagnosis to the previously created Subject and check against the Back-end', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t
    .click(subjectsTabSelect)
    .click(subjectsDropdownSelect.withAttribute('name',subjectUuid))
    .click(subjectsDropdownAddDiagnosisSelect)
    .click(diseaseDiagnosisSelect)
    .typeText(diagnosisOntologySelectSelect,diseaseDiagnosis2)
    .click(diseaseDiagnosisOptionSelect.withExactText(diseaseDiagnosis2))
    .typeText(diseaseLengthSelect,diseaseLength2)
    .typeText(diseaseStageSelect,diseaseStage2)
    .typeText(studyGroupDescriptionSelect,studyGroupDescription2)
    .typeText(priorTherapiesSelect,priorTherapies2)
    .typeText(immunogenSelect,immunogen2)
    .typeText(interventionSelect,intervention2)
    .typeText(medicalHistorySelect,medicalHistory2)
    .click(saveChangesSelect)
    .wait(config.save_timeout)

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
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(1);
    m = m['result'][0];
  }

  //Find the Back-end index of the duplicated Diagnosis
  var dIndex;
  if(m["value"]["diagnosis"][0]["disease_diagnosis"].label.toLowerCase()==diseaseDiagnosis2.toLowerCase())
    dIndex = 0;
  else dIndex = 1;

  //Check Diagnosis values
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

 test('Duplicate a Diagnosis for the previously created Subject, change disease length, and check against the Back-end', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t
    .click(subjectsTabSelect)
    .click(diagnosisDropdownSelect)
    .click(diagnosisDropdownDuplicateSelect.withAttribute('name','duplicate_0'))
    .typeText(diseaseLengthSelect,diseaseLength3,{replace: true})
    .click(saveChangesSelect)
    .wait(config.save_timeout)

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
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(1);
    m = m['result'][0];
  }

  //Determine the Back-end index of the Diagnosis in question and its duplicate
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

  //Check Diagnosis values
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
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t
    .click(subjectsTabSelect)
    .click(diagnosisDropdownSelect)
    .click(diagnosisDropdownDeleteSelect.withAttribute('name','delete_0'))
    .click(saveChangesSelect)
    .wait(config.save_timeout)

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
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(1);
    m = m['result'][0];
  }

  //Confirm only 2 Diagnoses are stored in the Back-end
  await t
    .expect(m["value"]["diagnosis"].length).eql(2)
 });

 test('Duplicate the newest Subject and add a unique Subject ID, confirm the duplicate is correct on the Back-end, confirm the Linked Subjects drop-down populates correctly, save, and then delete the Subject', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t.click(subjectsTabSelect);

  //Duplicate the newest Subject
  await t
    .click(subjectsDropdownSelect.withAttribute('name',subjectUuid))
    .click(subjectsDropdownDuplicateSelect.withAttribute('name',subjectUuid))

  var subjectCid = await projectSubjectFormSelect.find(projectSubjectDropdownId).getAttribute('name');

  await t
    .typeText(subjectIdBaseId + subjectCid, subjectId+'-D', {replace: true})
    .click(linkedSubjectsSelect)
    .click(linkedSubjectsOption.withExactText(linkedSubjects))
    .click(saveChangesSelect)
    .wait(config.save_timeout)

  //Reload the page so the dynamic drop-downs update
  await t.eval(() => location.reload(true));

  //Expect 2 options now
  await t
    .click(subjectsDropdownSelect.withAttribute('name',subjectUuid))
    .click(subjectsDropdownEditSelect.withAttribute('name',subjectUuid))
    .expect(linkedSubjectsOption.count).eql(2)
    .expect((Selector(projectSubjectFormId+subjectUuid).find(linkedSubjectsId)).find('option').withExactText(subjectId+'-D').exists).ok()
    .expect((Selector(projectSubjectFormId+subjectUuid).find(linkedSubjectsId)).find('option').withExactText('null').exists).ok()

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
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(2);
    m = m['result'];
  }

  //Confirm 2 Subjects are stored in the Back-end
  await t
    .expect(m.length).eql(2);

  //Get the UUID for the newly duplicated Subject
  var subjectUuidD ="";
  if(m[0]["uuid"] != subjectUuid) subjectUuidD = m[0]["uuid"];
  else subjectUuidD = m[1]["uuid"];
  //console.log("Subject-D UUID: " + subjectUuidD);

  //Subject ID values should differ
  if(m[0]["uuid"] == subjectUuid && m[1]["uuid"] == subjectUuidD) {
    await t.expect(m[0]["value"]["subject_id"]).eql(subjectId)
    await t.expect(m[1]["value"]["subject_id"]).eql(subjectId+'-D')
  } else if(m[1]["uuid"] == subjectUuid && m[0]["uuid"] == subjectUuidD) {
    await t.expect(m[1]["value"]["subject_id"]).eql(subjectId)
    await t.expect(m[0]["value"]["subject_id"]).eql(subjectId+'-D')
  }

  //Check that the duplicated Subject values match
  await t
    .expect(m[0]["value"]["synthetic"]).eql(m[1]["value"]["synthetic"])
    .expect(m[0]["value"]["species"].label).eql(m[1]["value"]["species"].label)
    .expect(m[0]["value"]["sex"]).eql(m[1]["value"]["sex"])
    .expect(m[0]["value"]["age_min"]).eql(m[1]["value"]["age_min"])
    .expect(m[0]["value"]["age_max"]).eql(m[1]["value"]["age_max"])
    .expect(m[0]["value"]["age_unit"].label).eql(m[1]["value"]["age_unit"].label)
    .expect(m[0]["value"]["age_event"]).eql(m[1]["value"]["age_event"])
    .expect(m[0]["value"]["ancestry_population"]).eql(m[1]["value"]["ancestry_population"])
    .expect(m[0]["value"]["ethnicity"]).eql(m[1]["value"]["ethnicity"])
    .expect(m[0]["value"]["race"]).eql(m[1]["value"]["race"])
    .expect(m[0]["value"]["strain_name"]).eql(m[1]["value"]["strain_name"])
    .expect(m[0]["value"]["linked_subjects"]).eql(m[1]["value"]["linked_subjects"])
    .expect(m[0]["value"]["link_type"]).eql(m[1]["value"]["link_type"])
    
  //Check that the duplicated Diagnosis values match
  await t
    .expect(m[0]["value"]["diagnosis"][0]["disease_diagnosis"].label.toLowerCase()).eql(m[1]["value"]["diagnosis"][0]["disease_diagnosis"].label.toLowerCase())
    .expect(m[0]["value"]["diagnosis"][0]["disease_length"]).eql(m[1]["value"]["diagnosis"][0]["disease_length"])
    .expect(m[0]["value"]["diagnosis"][0]["disease_stage"]).eql(m[1]["value"]["diagnosis"][0]["disease_stage"])
    .expect(m[0]["value"]["diagnosis"][0]["study_group_description"]).eql(m[1]["value"]["diagnosis"][0]["study_group_description"])
    .expect(m[0]["value"]["diagnosis"][0]["prior_therapies"]).eql(m[1]["value"]["diagnosis"][0]["prior_therapies"])
    .expect(m[0]["value"]["diagnosis"][0]["immunogen"]).eql(m[1]["value"]["diagnosis"][0]["immunogen"])
    .expect(m[0]["value"]["diagnosis"][0]["intervention"]).eql(m[1]["value"]["diagnosis"][0]["intervention"])
    .expect(m[0]["value"]["diagnosis"][0]["medical_history"]).eql(m[1]["value"]["diagnosis"][0]["medical_history"])
    .expect(m[0]["value"]["diagnosis"][1]["disease_diagnosis"].label.toLowerCase()).eql(m[1]["value"]["diagnosis"][1]["disease_diagnosis"].label.toLowerCase())
    .expect(m[0]["value"]["diagnosis"][1]["disease_length"]).eql(m[1]["value"]["diagnosis"][1]["disease_length"])
    .expect(m[0]["value"]["diagnosis"][1]["disease_stage"]).eql(m[1]["value"]["diagnosis"][1]["disease_stage"])
    .expect(m[0]["value"]["diagnosis"][1]["study_group_description"]).eql(m[1]["value"]["diagnosis"][1]["study_group_description"])
    .expect(m[0]["value"]["diagnosis"][1]["prior_therapies"]).eql(m[1]["value"]["diagnosis"][1]["prior_therapies"])
    .expect(m[0]["value"]["diagnosis"][1]["immunogen"]).eql(m[1]["value"]["diagnosis"][1]["immunogen"])
    .expect(m[0]["value"]["diagnosis"][1]["intervention"]).eql(m[1]["value"]["diagnosis"][1]["intervention"])
    .expect(m[0]["value"]["diagnosis"][1]["medical_history"]).eql(m[1]["value"]["diagnosis"][1]["medical_history"])

  //Delete the newly duplicated Subject and Save
  await t
    .click(subjectsDropdownSelect.withAttribute('name',subjectUuidD))
    .click(subjectsDropdownDeleteSelect.withAttribute('name',subjectUuidD))
    .click(saveChangesSelect)
    .wait(config.save_timeout)

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
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(1);
    m = m['result'];
  }

  //Confirm only 1 Subject is stored in the Back-end
  await t
    .expect(m.length).eql(1);
 });

 test('Confirm \'Revert Changes\' and \'Save Changes\' buttons are disabled/enabled correctly', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t.click(subjectsTabSelect)

  //Expect the buttons to be unavailable when no changes have been made
  await t.expect(revertChangesSelect.withExactText('Revert Changes').hasAttribute('disabled')).ok()
  await t.expect(saveChangesSelect.withExactText('Validate/Save Changes').hasAttribute('disabled')).ok()

  //Duplicate the newest Subject and check buttons; edit a field and check buttons
  await t
    .click(subjectsDropdownSelect.withAttribute('name',subjectUuid))
    .click(subjectsDropdownDuplicateSelect.withAttribute('name',subjectUuid))
    .expect(revertChangesSelect.withExactText('Revert Changes').hasAttribute('disabled')).notOk()
    .expect(saveChangesSelect.withExactText('Validate/Save Changes').hasAttribute('disabled')).notOk()
    .click(revertChangesSelect)
    .click(subjectsDropdownSelect.withAttribute('name',subjectUuid))
    .click(subjectsDropdownEditSelect.withAttribute('name',subjectUuid))
    .typeText(strainSelect, 'StrainCheck',  {replace: true})
    .pressKey('tab') //Change focus
    .expect(revertChangesSelect.withExactText('Revert Changes').hasAttribute('disabled')).notOk()
    .expect(saveChangesSelect.withExactText('Validate/Save Changes').hasAttribute('disabled')).notOk()
    .click(revertChangesSelect)

  //Ensure the buttons are disabled after a Save
  await t
    .click(subjectsDropdownSelect.withAttribute('name',subjectUuid))
    .click(subjectsDropdownEditSelect.withAttribute('name',subjectUuid))
    .typeText(ancestryPopulationSelect, 'AncestryPopulationCheck',  {replace: true})
    .click(saveChangesSelect)
    .wait(config.save_timeout)
    .expect(revertChangesSelect.withExactText('Revert Changes').hasAttribute('disabled')).ok()
    .expect(saveChangesSelect.withExactText('Validate/Save Changes').hasAttribute('disabled')).ok()
    .click(subjectsDropdownSelect.withAttribute('name',subjectUuid))
    .click(subjectsDropdownEditSelect.withAttribute('name',subjectUuid))
    .typeText(ancestryPopulationSelect, ancestryPopulation, {replace: true})
    .click(saveChangesSelect)
    .wait(config.save_timeout)
 });

 test('View existing Subject in Summary and Details view mode and confirm the correct values are shown', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t.click(subjectsTabSelect);

  //Summary view selectors
  const subjectIdTextUntrimmed = await Selector('div').withExactText("Subject ID: " + subjectId).innerText;
  const sexSpeciesTextUntrimmed = await Selector('div').withExactText("Sex/Species: " + sex + '/' + species).innerText;
  const raceEthnicityTextUntrimmed = await Selector('div').withExactText("Race/Ethnicity: " + race + '/'+ ethnicity).innerText;
  const ageTextUntrimmed = await Selector('div').withExactText("Age: " + ageMin + '-' + ageMax + ' ' + ageUnit + "(s)").innerText;
  const studyGroupDescriptionTextUntrimmed = await Selector('div').withExactText("Study Group Description: " + studyGroupDescription).innerText;
  const studyGroupDescriptionText2Untrimmed = await Selector('div').withExactText("Study Group Description: " + studyGroupDescription2).innerText;

  const diseaseDiagnosisText = Selector('div').withText(diseaseDiagnosis.toLowerCase()).exists; //We don't know the exact DOID
  const diseaseDiagnosisText2 = Selector('div').withText(diseaseDiagnosis2.toLowerCase()).exists;

  const subjectIdTextTrimmed = await subjectIdTextUntrimmed.toString().trim();
  const sexSpeciesTextTrimmed = await sexSpeciesTextUntrimmed.toString().trim();
  const raceEthnicityTextTrimmed = await raceEthnicityTextUntrimmed.toString().trim();
  const ageTextTrimmed = await ageTextUntrimmed.toString().trim();
  const studyGroupDescriptionTextTrimmed = await studyGroupDescriptionTextUntrimmed.toString().trim();
  const studyGroupDescriptionText2Trimmed = await studyGroupDescriptionText2Untrimmed.toString().trim();

  //Details view selectors
  const subjectIdDetailsText = Selector(subjectIdBaseId + subjectUuid);
  //Regular expression code for additional flexibility 
  //const syntheticRegExp = new RegExp(synthetic, "i"); 
  
  //Summary view checks
  await t
    .expect(subjectIdTextTrimmed).eql("Subject ID: " + subjectId)
    .expect(sexSpeciesTextTrimmed).eql("Sex/Species: " + sex + '/' + species)
    .expect(raceEthnicityTextTrimmed).eql("Race/Ethnicity: " + race + '/'+ ethnicity)
    .expect(ageTextTrimmed).eql("Age: " + ageMin + '-' + ageMax + ' ' + ageUnit + "(s)")
    .expect(studyGroupDescriptionTextTrimmed).eql("Study Group Description: " + studyGroupDescription)
    .expect(studyGroupDescriptionText2Trimmed).eql("Study Group Description: " + studyGroupDescription2)
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
    .expect(linkTypeSelect.value).eql(linkType)

    .expect(diseaseDiagnosisDetailsText.getAttribute('value')).contains(diseaseDiagnosis2) //Again, we don't have the DOID
    .expect(diseaseLengthSelect.value).eql(diseaseLength2)
    .expect(diseaseStageSelect.value).eql(diseaseStage2)
    .expect(studyGroupDescriptionSelect.getAttribute('value')).eql(studyGroupDescription2)
    .expect(priorTherapiesSelect.value).eql(priorTherapies2)
    .expect(immunogenSelect.value).eql(immunogen2)
    .expect(interventionSelect.value).eql(intervention2)
    .expect(medicalHistorySelect.value).eql(medicalHistory2)

    .expect(diseaseDiagnosisDetailsText2.getAttribute('value')).contains(diseaseDiagnosis)
    .expect(diseaseLength2Select.value).eql(diseaseLength)
    .expect(diseaseStage2Select.value).eql(diseaseStage)
    .expect(studyGroupDescription2Select.getAttribute('value')).eql(studyGroupDescription)
    .expect(priorTherapies2Select.value).eql(priorTherapies)
    .expect(immunogen2Select.value).eql(immunogen)
    .expect(intervention2Select.value).eql(intervention)
    .expect(medicalHistory2Select.value).eql(medicalHistory)

  //Special handling for when linkedSubjects == "null"
  if(linkedSubjects == 'null') await t.expect(linkedSubjectsSelect.value).eql('')
  else await t.expect(linkedSubjectsSelect.value == linkedSubjects).ok()
 });

 test('View existing Subject in Summary view mode, edit, revert, and confirm the correct values are still shown', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t.click(subjectsTabSelect);

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
  const diseaseDiagnosisR = 'tuberculosis';
  const diseaseDiagnosis2R = 'cholera';

  //Summary view selectors
  const subjectIdTextUntrimmed = await Selector('div').withExactText("Subject ID: " + subjectId).innerText;
  const sexSpeciesTextUntrimmed = await Selector('div').withExactText("Sex/Species: " + sex + '/' + species).innerText;
  const raceEthnicityTextUntrimmed = await Selector('div').withExactText("Race/Ethnicity: " + race + '/'+ ethnicity).innerText;
  const ageTextUntrimmed = await Selector('div').withExactText("Age: " + ageMin + '-' + ageMax + ' ' + ageUnit + "(s)").innerText;
  const studyGroupDescriptionTextUntrimmed = await Selector('div').withExactText("Study Group Description: " + studyGroupDescription).innerText;
  const studyGroupDescriptionText2Untrimmed = await Selector('div').withExactText("Study Group Description: " + studyGroupDescription2).innerText;
  const diseaseDiagnosisText = Selector('div').withText(diseaseDiagnosis.toLowerCase()).exists; //We don't know the exact DOID
  const diseaseDiagnosisText2 = Selector('div').withText(diseaseDiagnosis2.toLowerCase()).exists;

  const subjectIdTextTrimmed = await subjectIdTextUntrimmed.toString().trim();
  const sexSpeciesTextTrimmed = await sexSpeciesTextUntrimmed.toString().trim();
  const raceEthnicityTextTrimmed = await raceEthnicityTextUntrimmed.toString().trim();
  const ageTextTrimmed = await ageTextUntrimmed.toString().trim();
  const studyGroupDescriptionTextTrimmed = await studyGroupDescriptionTextUntrimmed.toString().trim();
  const studyGroupDescriptionText2Trimmed = await studyGroupDescriptionText2Untrimmed.toString().trim();

  //Details view selectors
  const subjectIdDetailsText = Selector(subjectIdBaseId + subjectUuid);

  //Edit values but do not Save
  await t
    .click(subjectsDropdownSelect)
    .click(subjectsDropdownEditSelect)
    .typeText(subjectIdBaseId + subjectUuid, subjectIdR, {replace: true})
    .click(syntheticSelect)
    .click(syntheticOption.withAttribute('value',syntheticR))
    .click(speciesSelect)
    .click(speciesOption.withExactText(speciesR))
    .click(sexSelect)
    .click(sexOption.withExactText(sexR))
    .click(ageTypeSelect)
    .click(ageTypeOption.withExactText(ageTypeR))
    .typeText(agePointSelect,ageMinR,{replace: true})
    .click(ageUnitSelect)
    .click(ageUnitOption.withAttribute('value',ageUnitR))
    .typeText(raceSelect,raceR,{replace: true})
    .typeText(ethnicitySelect,ethnicityR,{replace: true})
    .click(diseaseDiagnosisSelect)
    .typeText(diagnosisOntologySelectSelect,diseaseDiagnosisR,{replace: true})
    .click(diseaseDiagnosisOptionSelect.withExactText(diseaseDiagnosisR))
    .click(diseaseDiagnosis2Select)
    .typeText(diseaseDiagnosisRegion1Select.find(diagnosisOntologyId),diseaseDiagnosis2R,{replace: true})
    .click(diseaseDiagnosisOptionSelect.withExactText(diseaseDiagnosis2R))

  await t
    .click(revertChangesSelect)

  //Summary view checks
  await t
    .expect(subjectIdTextTrimmed).eql("Subject ID: " + subjectId)
    .expect(sexSpeciesTextTrimmed).eql("Sex/Species: " + sex + '/' + species)
    .expect(raceEthnicityTextTrimmed).eql("Race/Ethnicity: " + race + '/'+ ethnicity)
    .expect(ageTextTrimmed).eql("Age: " + ageMin + '-' + ageMax + ' ' + ageUnit + "(s)")
    .expect(studyGroupDescriptionTextTrimmed).eql("Study Group Description: " + studyGroupDescription)
    .expect(studyGroupDescriptionText2Trimmed).eql("Study Group Description: " + studyGroupDescription2)
    .expect(diseaseDiagnosisText).ok()
    .expect(diseaseDiagnosisText2).ok()

  await t
    .click(detailsSummarySelect);

  //Details view checks
  await t
    .expect(subjectIdDetailsText.value).eql(subjectId)
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
    .expect(linkTypeSelect.value).eql(linkType)

    .expect(diseaseDiagnosisDetailsText.getAttribute('value')).contains(diseaseDiagnosis2) //Again, we don't have the DOID
    .expect(diseaseLengthSelect.value).eql(diseaseLength2)
    .expect(diseaseStageSelect.value).eql(diseaseStage2)
    .expect(studyGroupDescriptionSelect.getAttribute('value')).eql(studyGroupDescription2)
    .expect(priorTherapiesSelect.value).eql(priorTherapies2)
    .expect(immunogenSelect.value).eql(immunogen2)
    .expect(interventionSelect.value).eql(intervention2)
    .expect(medicalHistorySelect.value).eql(medicalHistory2)

    .expect(diseaseDiagnosisDetailsText2.getAttribute('value')).contains(diseaseDiagnosis)
    .expect(diseaseLength2Select.value).eql(diseaseLength)
    .expect(diseaseStage2Select.value).eql(diseaseStage)
    .expect(studyGroupDescription2Select.getAttribute('value')).eql(studyGroupDescription)
    .expect(priorTherapies2Select.value).eql(priorTherapies)
    .expect(immunogen2Select.value).eql(immunogen)
    .expect(intervention2Select.value).eql(intervention)
    .expect(medicalHistory2Select.value).eql(medicalHistory)

  //Special handling for when linkedSubjects == "null"
  if(linkedSubjects == 'null') await t.expect(linkedSubjectsSelect.value).eql('')
  else await t.expect(linkedSubjectsSelect.value == linkedSubjects).ok()
 });

 test('Duplicate the newest Subject and add a unique Subject ID and change the linked Subject value, for the previously created Project', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t.click(subjectsTabSelect);

  await t
    .click(subjectsDropdownSelect.withAttribute('name',subjectUuid))
    .click(subjectsDropdownDuplicateSelect.withAttribute('name',subjectUuid))

  var subjectCid = await projectSubjectFormSelect.find(projectSubjectDropdownId).getAttribute('name');

  await t
    .typeText(subjectIdBaseId + subjectCid, subjectId+'-2', {replace: true})
    .click(linkedSubjectsSelect)
    .click(linkedSubjectsOption.withExactText(linkedSubjects))
    .click(saveChangesSelect)
    .wait(config.save_timeout)

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
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(2);

    //Determine which record holds the new Subject
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
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(1);
    m = m['result'][0];
  }
  //console.log("Subject2 UUID: " + subjectUuid2);

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
    await t.expect(m2['status']).eql("success")
        .expect(m2['result'].length).eql(1);
    m2 = m2['result'][0];
  }

  //Check the Back-end values
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
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t
    .click(subjectsTabSelect)
    .click(newSubjectSelect)

  var subjectCid = await projectSubjectFormSelect.find(projectSubjectDropdownId).getAttribute('name');

  await t
    .typeText(subjectIdBaseId + subjectCid, subjectId)
    .click(saveChangesSelect)
    .wait(config.save_timeout)

  const errorMessage = Selector('div').withExactText('Please enter a non-blank, unique Subject ID.').exists;

  await t
    .expect(errorMessage).ok() 
 });

 test('Add a new Subject with a blank Subject ID for the previously created Project', async t => {
  const blankSubjectId = '  ';

  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t
    .click(subjectsTabSelect)
    .click(newSubjectSelect)

  var blankSubjectCid = await projectSubjectFormSelect.find(projectSubjectDropdownId).getAttribute('name');

  await t
    .typeText(subjectIdBaseId + blankSubjectCid, blankSubjectId)
    .click(saveChangesSelect)
    .wait(config.save_timeout)

  const errorMessage = Selector('div').withExactText('Please enter a non-blank, unique Subject ID.').exists;

  await t
    .expect(errorMessage).ok()
 });

 test('Edit existing Subject and add a negative age_min point value', async t => {
  const ageType = 'point';
  const ageMin = '-3';

  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t
    .click(subjectsTabSelect)
    .click(subjectsDropdownSelect.withAttribute('name',subjectUuid))
    .click(subjectsDropdownEditSelect.withAttribute('name',subjectUuid))
    .click(ageTypeSelect)
    .click(ageTypeOption.withExactText(ageType))
    .typeText(agePointSelect,ageMin,{ replace: true })
    .click(saveChangesSelect)
    .wait(config.save_timeout)

  const errorMessage = Selector('div').withExactText('Please enter a valid age number ≥ 0.').exists;

  await t
    .expect(errorMessage).ok()
 });

 test('Edit existing Subject and add a negative age_max range value', async t => {
  const ageType = 'range';
  const ageMin = '1';
  const ageMax = '-3';

  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t
    .click(subjectsTabSelect)
    .click(subjectsDropdownSelect.withAttribute('name',subjectUuid))
    .click(subjectsDropdownEditSelect.withAttribute('name',subjectUuid))
    .click(ageTypeSelect)
    .click(ageTypeOption.withExactText(ageType))
    .typeText(ageMinSelect,ageMin,{ replace: true })
    .typeText(ageMaxSelect,ageMax,{ replace: true })
    .click(saveChangesSelect)
    .wait(config.save_timeout)

  const errorMessage1 = Selector('div').withExactText('Please enter a valid minimum age number ≥ 0.').exists;
  const errorMessage2 = Selector('div').withExactText('Please enter a valid maximum age number that is greater than the minimum age number.').exists;

  await t
    .expect(errorMessage1).ok()
    .expect(errorMessage2).ok()
 });

 test('Edit existing Subject and add an age range with age_max < age_min', async t => {
  const ageType = 'range';
  const ageMin = '8';
  const ageMax = '4';

  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t.click(subjectsTabSelect);

  await t
    .click(subjectsDropdownSelect.withAttribute('name',subjectUuid))
    .click(subjectsDropdownEditSelect.withAttribute('name',subjectUuid))
    .click(ageTypeSelect)
    .click(ageTypeOption.withExactText(ageType))
    .typeText(ageMinSelect,ageMin,{ replace: true })
    .typeText(ageMaxSelect,ageMax,{ replace: true })
    .click(saveChangesSelect)
    .wait(config.save_timeout)

  const errorMessage1 = Selector('div').withExactText('Please enter a valid minimum age number ≥ 0.').exists;
  const errorMessage2 = Selector('div').withExactText('Please enter a valid maximum age number that is greater than the minimum age number.').exists;

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

  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t.click(subjectsTabSelect);

  //Update values for Subject 2
  await t
    .click(subjectsDropdownSelect.withAttribute('name',subjectUuid2))
    .click(subjectsDropdownEditSelect.withAttribute('name', subjectUuid2))
    .typeText(subjectIdBaseId + subjectUuid2, subjectId2, {replace:true})
    .click(sexSelect)
    .click(sexOption.withExactText(sex2))
    .click(ageTypeSelect)
    .click(ageTypeOption.withExactText(ageType2))
    .typeText(ageMinSelect,ageMin2,{ replace: true })
    .typeText(ageMaxSelect,ageMax2,{ replace: true })
    .click(ageUnitSelect)
    .click(ageUnitOption.withAttribute('value',ageUnit2))
    .click(saveChangesSelect)
    .wait(config.save_timeout)

  //Add the third Subject
  await t
    .click(newSubjectSelect)

  var subject3Cid = await projectSubjectFormSelect.find(projectSubjectDropdownId).getAttribute('name');
  var subject3Form = Selector(projectSubjectFormId + subject3Cid);

  await t
    .typeText(subjectIdBaseId + subject3Cid, subjectId3, {replace:true})
    .click(subject3Form.find('#' + await speciesSelect.getAttribute('id')))
    .click(speciesOption.withExactText(species2))
    .click(subject3Form.find('#' + await sexSelect.getAttribute('id')))
    .click(sexOption.withExactText(sex3))
    .click(subject3Form.find('#' + await ageTypeSelect.getAttribute('id')))
    .click(ageTypeOption.withExactText(ageType3))
    .typeText(subject3Form.find('#' + await agePointSelect.getAttribute('id')),ageMin3,{ replace: true })
    .click(subject3Form.find('#' + await ageUnitSelect.getAttribute('id')))
    .click(ageUnitOption.withAttribute('value',ageUnit3))
    .click(saveChangesSelect)
    .wait(config.save_timeout)

  var token = await tapisIO.getToken({username: config.username, password: config.password});

  //Get all the Subjects
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
    await t.expect(subjects['status']).eql("success")
        .expect(subjects['result'].length).eql(3);
    subjects = subjects['result'];
  }

  //Find the uuid values for the Subjects based on their Subject ID
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

  //Sort by Subject ID
  await t
    .click(sortDropdownSelect)
    .click(sortDropdownOptionSelect.withAttribute('name','subjectid'))

  //Get the elements in the sorted order
  var subj1 = await subjectsDropdownSelect.nth(0).getAttribute('name');
  var subj2 = await subjectsDropdownSelect.nth(1).getAttribute('name');
  var subj3 = await subjectsDropdownSelect.nth(2).getAttribute('name');

  //Confirm the sorted order matches the expected order
  await t
    .expect(subj1).eql(uuid1)
    .expect(subj2).eql(uuid3)
    .expect(subj3).eql(uuid2)

  //Sort by Sex
  await t
    .click(sortDropdownSelect)
    .click(sortDropdownOptionSelect.withAttribute('name','sex'))

  //Get the elements in the sorted order
  subj1 = await subjectsDropdownSelect.nth(0).getAttribute('name');
  subj2 = await subjectsDropdownSelect.nth(1).getAttribute('name');
  subj3 = await subjectsDropdownSelect.nth(2).getAttribute('name');

  //Confirm the sorted order matches the expected order
  await t
    .expect(subj1).eql(uuid2)
    .expect(subj2).eql(uuid3)
    .expect(subj3).eql(uuid1)

  //Sort by Age
  await t
    .click(sortDropdownSelect)
    .click(sortDropdownOptionSelect.withAttribute('name','age'))

  //Get the elements in the sorted order
  subj1 = await subjectsDropdownSelect.nth(0).getAttribute('name');
  subj2 = await subjectsDropdownSelect.nth(1).getAttribute('name');
  subj3 = await subjectsDropdownSelect.nth(2).getAttribute('name');

  //Confirm the sorted order matches the expected order
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
        if(method == "ENTERKEY") await t.pressKey('enter');
        else if(method == 'CLICK') await t.click(Selector(clickItem));
        await t.wait(config.login_timeout);  //Wait to complete the login process
}
