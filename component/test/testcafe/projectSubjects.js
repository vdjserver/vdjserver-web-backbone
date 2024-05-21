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
var projectUuid = "";
//var projectUuid = "2070357305688068591-242ac118-0001-012";
var projectUuid = "5139818080333393425-242ac118-0001-012";
var projectUuidUrl = "project/";
projectUuidUrl += projectUuid;
var subjectUuid = "";
//var subjectUuid = "7817106628923289105-242ac118-0001-012";
var subjectUuid = "2867479733038673425-242ac118-0001-012";
if (config.tapis_version == 2) tapisIO = tapisV2;
if (config.tapis_version == 3) tapisIO = tapisV3;

fixture('Project Subjects Page Test Cases')
    .page(config.url);

//append a random number less than 1,000,000 to subjectId
var subjectId = 'Subject ID ' + Math.floor(Math.random()*1000000);
console.log(subjectId);
var subjectId = 'Subject ID 970299';

  const syntheticSelect = Selector('#synthetic');
  const syntheticOption = syntheticSelect.find('option');
  const synthetic = 'True';
  const speciesSelect = Selector('#species');
  const speciesOption = speciesSelect.find('option');
  const species = 'Macaca mulatta';
  const species2 = 'Homo sapiens';
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
  const unit = 'day';
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

 /*test('Create a Project and Check Back-end Values', async t => {
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

  await login(t,config.username,config.password,'CLICK','#home-login');

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

  projectUuid = url.split("/")[4];
  projectUuidUrl += projectUuid;
console.log("Project UUID: " + projectUuid);
  var token = await tapisV2.getToken({username: config.username, password: config.password});

  var m = await tapisV2.getProjectMetadata(token.access_token, projectUuid);

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
    .scrollIntoView(Selector('#subjects-tab'))
    .click(Selector('#subjects-tab', {timeout:config.timeout}));
  await t
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
    //.click(unitOption.withText(unit))
    .click(unitOption.withAttribute('value',unit))
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

  await t.click(Selector('#project-subjects-save-changes', {timeout:config.timeout}));
  await new Promise(r => setTimeout(r, 5000));

  await t
    .click(Selector('#project-subjects-details-summary', {timeout:config.timeout}));

  var token = await tapisV2.getToken({username: config.username, password: config.password});

//ADD COPY SUBJECT UUID TO THE HTML
  var m = await tapisV2.getMetadataForType(token.access_token, projectUuid, 'subject');
  subjectUuid = m[0]["uuid"];
console.log("Subject UUID: " + subjectUuid);

  //check Diagnosis values
  await t
    .expect(m[0]["value"]["diagnosis"][0]["disease_diagnosis"].label.toLowerCase()).contains(diseaseDiagnosis.toLowerCase())
    //.expect(m[0]["value"]["diagnosis"][0]["disease_diagnosis"].label.toLowerCase()).eql(diseaseDiagnosis.toLowerCase())
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
    .scrollIntoView(Selector('#subjects-tab'))
    .click(Selector('#subjects-tab', {timeout:config.timeout}));
  await t
    //.click(Selector('#project-subjects-add', {timeout:config.timeout}))
    //.click(Selector('#project-subject-dropdown', {timeout:config.timeout}).withAttribute('name',uuid2))
    .click(Selector('#project-subject-dropdown', {timeout:config.timeout}).withAttribute('name',subjectUuid))
    .click(Selector('#project-subject-add-diagnosis', {timeout:config.timeout}))
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

  await t.click(Selector('#project-subjects-save-changes', {timeout:config.timeout}));

  await new Promise(r => setTimeout(r, 5000));

  var token = await tapisV2.getToken({username: config.username, password: config.password});

  var m = await tapisV2.getProjectMetadata(token.access_token, subjectUuid);

  //check Diagnosis values
  await t
    //.expect(m[0]["value"]["diagnosis"][0]["disease_diagnosis"].label.toLowerCase()).contains(diseaseDiagnosis.toLowerCase())
    .expect(m["value"]["diagnosis"][0]["disease_diagnosis"].label.toLowerCase()).eql(diseaseDiagnosis2.toLowerCase())
    .expect(m["value"]["diagnosis"][0]["disease_length"]).eql(diseaseLength2)
    .expect(m["value"]["diagnosis"][0]["disease_stage"]).eql(diseaseStage2)
    .expect(m["value"]["diagnosis"][0]["study_group_description"]).eql(studyGroupDescription2)
    .expect(m["value"]["diagnosis"][0]["prior_therapies"]).eql(priorTherapies2)
    .expect(m["value"]["diagnosis"][0]["immunogen"]).eql(immunogen2)
    .expect(m["value"]["diagnosis"][0]["intervention"]).eql(intervention2)
    .expect(m["value"]["diagnosis"][0]["medical_history"]).eql(medicalHistory2)
 });*/

 test('Duplicate a Diagnosis for the previously created Subject and check against the Back-end', async t => {
  await login(t,config.username,config.password,'CLICK','#home-login');

  await new Promise(r => setTimeout(r, 5000));
  await t.navigateTo('./'+projectUuidUrl);

  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(Selector('#subjects-tab'))
    .click(Selector('#subjects-tab', {timeout:config.timeout}));
  await t
    .click(Selector('#project-subject-diagnosis-dropdown', {timeout:config.timeout}))
    .click(Selector('#project-subject-duplicate-diagnosis', {timeout:config.timeout}).withAttribute('name','duplicate_0'))
    .typeText('#disease_length_0',diseaseLength3,{replace: true})

  await t.click(Selector('#project-subjects-save-changes', {timeout:config.timeout}));

  await new Promise(r => setTimeout(r, 5000));

  var token = await tapisV2.getToken({username: config.username, password: config.password});

  var m = await tapisV2.getProjectMetadata(token.access_token, subjectUuid);

  //check Diagnosis values
  await t
    //.expect(m[0]["value"]["diagnosis"][0]["disease_diagnosis"].label.toLowerCase()).contains(diseaseDiagnosis.toLowerCase())
    .expect(m["value"]["diagnosis"][1]["disease_diagnosis"].label.toLowerCase()).eql(m["value"]["diagnosis"][0]["disease_diagnosis"].label.toLowerCase())
    .expect(m["value"]["diagnosis"][1]["disease_length"]).notEql(m["value"]["diagnosis"][0]["disease_length"])
    .expect(m["value"]["diagnosis"][0]["disease_length"]).eql(diseaseLength3)
    .expect(m["value"]["diagnosis"][1]["disease_stage"]).eql(m["value"]["diagnosis"][0]["disease_stage"])
    .expect(m["value"]["diagnosis"][1]["study_group_description"]).eql(m["value"]["diagnosis"][0]["study_group_description"])
    .expect(m["value"]["diagnosis"][1]["prior_therapies"]).eql(m["value"]["diagnosis"][0]["prior_therapies"])
    .expect(m["value"]["diagnosis"][1]["immunogen"]).eql(m["value"]["diagnosis"][0]["immunogen"])
    .expect(m["value"]["diagnosis"][1]["intervention"]).eql(m["value"]["diagnosis"][0]["intervention"])
    .expect(m["value"]["diagnosis"][1]["medical_history"]).eql(m["value"]["diagnosis"][0]["medical_history"])
 });

 test('Delete the newest Diagnosis for the previously created Subject and check against the Back-end', async t => {
  await login(t,config.username,config.password,'CLICK','#home-login');

  await new Promise(r => setTimeout(r, 5000));
  await t.navigateTo('./'+projectUuidUrl);

  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(Selector('#subjects-tab'))
    .click(Selector('#subjects-tab', {timeout:config.timeout}));

  await t
    .click(Selector('#project-subject-diagnosis-dropdown', {timeout:config.timeout}))
    .click(Selector('#project-subject-delete-diagnosis', {timeout:config.timeout}).withAttribute('name','delete_0'))

  await t.click(Selector('#project-subjects-save-changes', {timeout:config.timeout}));

  await new Promise(r => setTimeout(r, 5000));

  var token = await tapisV2.getToken({username: config.username, password: config.password});

  var m = await tapisV2.getProjectMetadata(token.access_token, subjectUuid);

  //check Diagnosis values
  await t
    .expect(m["value"]["diagnosis"].length).eql(2)
 });

 test('View existing Subject in Summary and Details view mode and confirm the correct values are shown', async t => {
  //Summary view selectors
  const subjectIdText = Selector('div').withText(subjectId).exists;
  const sexSpeciesText = Selector('div').withText(sex + '/' + species).exists;
  const raceEthnicityText = Selector('div').withText(race + '/'+ ethnicity).exists;
  const ageText = Selector('div').withText(ageMin + '-' + ageMax + ' ' + unit).exists;
  const studyGroupDescriptionText = Selector('div').withText(studyGroupDescription).exists;
  const studyGroupDescription2Text = Selector('div').withText(studyGroupDescription2).exists;
  const diseaseDiagnosisText = Selector('div').withText(diseaseDiagnosis.toLowerCase()).exists;
  const diseaseDiagnosis2Text = Selector('div').withText(diseaseDiagnosis2.toLowerCase()).exists;

  //Details view selectors
  const subjectIdDetailsText = Selector('input[name="subject_id"]');
  //Regular expression code for additional flexibility 
  //const syntheticRegExp = new RegExp(synthetic, "i"); 
  const syntheticSelect = Selector('#synthetic');
  const speciesSelect = Selector('#species');
  const strainText = Selector('#strain_name');
  const sexSelect = Selector('#sex');
  const ageTypeSelect = Selector('#age_type');
  const ageUnitSelect = Selector('#age_unit');
  const ageMinText = Selector('#age_min');
  const ageMaxText = Selector('#age_max');
  const ageEventText = Selector('#age_event');
  const raceText = Selector('#race');
  const ancestryPopulationText = Selector('#ancestry_population');
  const ethnicityText = Selector('#ethnicity');
  const linkTypeSelect = Selector('#link_type');

  await login(t,config.username,config.password,'CLICK','#home-login');
  await new Promise(r => setTimeout(r, 5000));

  await t.navigateTo('./'+projectUuidUrl);
  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(Selector('#subjects-tab'))
    .click(Selector('#subjects-tab', {timeout:config.timeout}));

  await new Promise(r => setTimeout(r, 5000));

  //Summary view checks
  await t
    .expect(subjectIdText).ok()
    .expect(sexSpeciesText).ok()
    .expect(raceEthnicityText).ok()
    .expect(ageText).ok()
    .expect(studyGroupDescriptionText).ok()
    .expect(studyGroupDescription2Text).ok()
    .expect(diseaseDiagnosisText).ok()
    .expect(diseaseDiagnosis2Text).ok()

  await t
    .click(Selector('#project-subjects-details-summary', {timeout:config.timeout}));

  //Details view checks
  await t
    .expect(subjectIdDetailsText.value).eql(subjectId)
    //.expect(syntheticSelect.value).match(syntheticRegExp)
    .expect(syntheticSelect.value).eql(synthetic)
    .expect(speciesSelect.value).eql(species)
    .expect(strainText.value).eql(strain)
    .expect(sexSelect.value).eql(sex)
    .expect(ageTypeSelect.value).eql(ageType)
    .expect(ageMinText.value).eql(ageMin)
    .expect(ageMaxText.value).eql(ageMax)
    .expect(ageUnitSelect.value).eql(unit)
    .expect(ageEventText.value).eql(ageEvent)
    .expect(raceText.value).eql(race)
    .expect(ancestryPopulationText.value).eql(ancestryPopulation)
    .expect(ethnicityText.value).eql(ethnicity)
    //.expect(linkedSubjectSelect.value).match(linkSubject)
    .expect(linkTypeSelect.value).eql(linkType)
 });

test('Duplicate the newest Subject and add a unique Subject ID, for the previously created Project', async t => {
  await login(t,config.username,config.password,'CLICK','#home-login');

  await new Promise(r => setTimeout(r, 5000));
  await t.navigateTo('./'+projectUuidUrl);

  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(Selector('#subjects-tab'))
    .click(Selector('#subjects-tab', {timeout:config.timeout}));

  await t
    .click(Selector('#project-subject-dropdown', {timeout:config.timeout}).withAttribute('name',subjectUuid))
    .click(Selector('#project-subject-duplicate', {timeout:config.timeout}).withAttribute('name',subjectUuid))
    .typeText('input[name="subject_id"]', subjectId+'-2', {replace: true})

  await t.click(Selector('#project-subjects-save-changes', {timeout:config.timeout}));

  await new Promise(r => setTimeout(r, 5000));

  var token = await tapisV2.getToken({username: config.username, password: config.password});

  var m = await tapisV2.getMetadataForType(token.access_token, projectUuid, 'subject');
  var subjectUuid2 = m[0]["uuid"];
  m = await tapisV2.getProjectMetadata(token.access_token, subjectUuid);
  var m2 = await tapisV2.getProjectMetadata(token.access_token, subjectUuid2);

console.log(m);
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
    .expect(m["value"]["age_unit"]).eql(m2["value"]["age_unit"].label)
    .expect(m["value"]["age_event"]).eql(m2["value"]["age_event"])
    .expect(m["value"]["ancestry_population"]).eql(m2["value"]["ancestry_population"])
    .expect(m["value"]["ethnicity"]).eql(m2["value"]["ethnicity"])
    .expect(m["value"]["race"]).eql(m2["value"]["race"])
    .expect(m["value"]["strain_name"]).eql(m2["value"]["strain_name"])
    //.expect(m["value"]["linked_subjects"]).eql(m2["value"]["linked_subjects"])
    .expect(m["value"]["link_type"]).eql(m2["value"]["link_type"])

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
    .scrollIntoView(Selector('#subjects-tab'))
    .click(Selector('#subjects-tab', {timeout:config.timeout}));
  await t
    .click(Selector('#project-subjects-new-subject', {timeout:config.timeout}))
    .typeText('input[name="subject_id"]', subjectId)

  await t.click(Selector('#project-subjects-save-changes', {timeout:config.timeout}));

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
    .scrollIntoView(Selector('#subjects-tab'))
    .click(Selector('#subjects-tab', {timeout:config.timeout}));
  await t
    .click(Selector('#project-subjects-new-subject', {timeout:config.timeout}))
    .typeText('input[name="subject_id"]', blankSubjectId)

  await t.click(Selector('#project-subjects-save-changes', {timeout:config.timeout}));

  await new Promise(r => setTimeout(r, 5000));

  const errorMessage = Selector('div').withText('Please enter a non-blank, unique Subject ID.').exists;

  await t
    .expect(errorMessage).ok()
 });

test('Edit existing Subject and add a negative age_min point value', async t => {
  const ageTypeSelect = Selector('#age_type');
  const ageTypeOption = ageTypeSelect.find('option');
  const ageType = 'point';
  const ageMin = '-3';

  await login(t,config.username,config.password,'CLICK','#home-login');
  await new Promise(r => setTimeout(r, 5000));

  await t.navigateTo('./'+projectUuidUrl);
  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(Selector('#subjects-tab'))
    .click(Selector('#subjects-tab', {timeout:config.timeout}));
  await t
    .click(Selector('#project-subject-dropdown', {timeout:config.timeout}))
    .click(Selector('#project-subject-edit', {timeout:config.timeout}))
    .click(ageTypeSelect)
    .click(ageTypeOption.withText(ageType))
    .typeText('#age_point',ageMin,{ replace: true })

  await t.click(Selector('#project-subjects-save-changes', {timeout:config.timeout}));

  await new Promise(r => setTimeout(r, 5000));

  const errorMessage = Selector('div').withText('Please enter a valid age number.').exists;

  await t
    .expect(errorMessage).ok()
 });

test('Edit existing Subject and add a negative age_max range value', async t => {
  const ageTypeSelect = Selector('#age_type');
  const ageTypeOption = ageTypeSelect.find('option');
  const ageType = 'range';
  const ageMin = '1';
  const ageMax = '-3';

  await login(t,config.username,config.password,'CLICK','#home-login');
  await new Promise(r => setTimeout(r, 5000));

  await t.navigateTo('./'+projectUuidUrl);
  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(Selector('#subjects-tab'))
    .click(Selector('#subjects-tab', {timeout:config.timeout}));
  await t
    .click(Selector('#project-subject-dropdown', {timeout:config.timeout}))
    .click(Selector('#project-subject-edit', {timeout:config.timeout}))
    .click(ageTypeSelect)
    .click(ageTypeOption.withText(ageType))
    .typeText('#age_min',ageMin,{ replace: true })
    .typeText('#age_max',ageMax,{ replace: true })

  await t.click(Selector('#project-subjects-save-changes', {timeout:config.timeout}));

  await new Promise(r => setTimeout(r, 5000));

  const errorMessage1 = Selector('div').withText('Please enter a valid age number.').exists;
  const errorMessage2 = Selector('div').withText('Please enter a valid maximum age number that is greater than the minimum age number.').exists;

  await t
    .expect(errorMessage1).ok()
    .expect(errorMessage2).ok()
 });

test('Edit existing Subject and add an age range with age_max < age_min', async t => {
  const ageTypeSelect = Selector('#age_type');
  const ageTypeOption = ageTypeSelect.find('option');
  const ageType = 'range';
  const ageMin = '8';
  const ageMax = '4';

  await login(t,config.username,config.password,'CLICK','#home-login');
  await new Promise(r => setTimeout(r, 5000));

  await t.navigateTo('./'+projectUuidUrl);
  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(Selector('#subjects-tab'))
    .click(Selector('#subjects-tab', {timeout:config.timeout}));

  await t
    .click(Selector('#project-subject-dropdown', {timeout:config.timeout}))
    .click(Selector('#project-subject-edit', {timeout:config.timeout}))
    .click(ageTypeSelect)
    .click(ageTypeOption.withText(ageType))
    .typeText('#age_min',ageMin,{ replace: true })
    .typeText('#age_max',ageMax,{ replace: true })

  await t.click(Selector('#project-subjects-save-changes', {timeout:config.timeout}));

  await new Promise(r => setTimeout(r, 5000));

  const errorMessage1 = Selector('div').withText('Please enter a valid age number.').exists;
  const errorMessage2 = Selector('div').withText('Please enter a valid maximum age number that is greater than the minimum age number.').exists;

  await t
    .expect(errorMessage1).ok()
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
