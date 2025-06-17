//
// projectSubjects.js
// Project Subjects Page Test Cases
//
// VDJServer
// https://vdjserver.org
//
// Copyright (C) 2023 The University of Texas Southwestern Medical Center
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

const { General, Login, Project, Subject } = require('./pages');
const general = new General();
const login = new Login();
const project = new Project();
const subject = new Subject();

fixture('Project Subjects Page Test Cases')
  .page(config.url);

 test('Create a Project and Check Back-end Values', async t => {
  await login.login(t,config.username,config.password,'CLICK',login.loginButtonId);

  await t
    .click(general.createProjectSelect)
    .typeText(project.studyIdSelect, project.studyId)
    .typeText(project.studyTitleSelect, project.studyTitle)
    .typeText(project.descriptionSelect, project.studyDescription)
    .typeText(project.criteriaSelect, project.inclusionExclusionCriteria)
    .typeText(project.grantsSelect, project.grants)
    .click('#'+project.keywords[0])
    .click('#'+project.keywords[1])
    .click(project.studyTypeSelect)
    .click(Selector(general.ontologySelectSelect.withAttribute('name',project.studyType)))
    .typeText(project.publicationsSelect, project.publications)
    .typeText(project.labNameSelect, project.labName)
    .typeText(project.labAddressSelect, project.labAddress)
    .typeText(project.collectedByNameSelect, project.cName)
    .typeText(project.collectedByEmailSelect, project.cEmail)
    .typeText(project.collectedByAddressSelect, project.cAddress)
    .typeText(project.submittedByNameSelect, project.sName)
    .typeText(project.submittedByEmailSelect, project.sEmail)
    .typeText(project.submittedByAddressSelect, project.sAddress)
    .click(project.createNewProjectSelect)

  await t
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(project.successfullyCreatedString).exists).ok()
    .click(project.modalCancelButtonSelect)

  await t.click(general.subjectsTabSelect);

  const getPageUrl = ClientFunction(() => window.location.href);
  var url = await getPageUrl();
  general.projectUuid = url.split("/")[4];
  general.projectUuidUrl += general.projectUuid;
  //console.log("Project UUID: " + general.projectUuid);

  await t.navigateTo('./'+general.projectUuidUrl);
  url = await getPageUrl();
  console.log("URL: " + url);

  var token = await login.getTokenFromLocalStorage();
  if (config.tapis_version == 2) {
    var m = await general.tapisV2.getProjectMetadata(token.access_token, general.projectUuid);
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/uuid/' + general.projectUuid,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var m = await general.tapisV3.sendRequest(requestSettings);
    //console.log(JSON.stringify(m, null, 2));
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(1);
    m = m['result'][0];
  }

  await t
    .expect(m["value"]["study_id"]).eql(project.studyId)
    .expect(m["value"]["study_title"]).eql(project.studyTitle)
    .expect(m["value"]["study_description"]).eql(project.studyDescription)
    .expect(m["value"]["inclusion_exclusion_criteria"]).eql(project.inclusionExclusionCriteria)
    .expect(m["value"]["grants"]).eql(project.grants)
    .expect(m["value"]["keywords_study"][0]).eql(project.keywords[0])
    .expect(m["value"]["keywords_study"][1]).eql(project.keywords[1])
    .expect(m["value"]["study_type"]["id"]).eql(project.studyType)
    .expect(m["value"]["pub_ids"]).eql(project.publications)
    .expect(m["value"]["lab_name"]).eql(project.labName)
    .expect(m["value"]["lab_address"]).eql(project.labAddress)
    .expect(m["value"]["collected_by"].split(", ")[0]).eql(project.cName)
    .expect(m["value"]["collected_by"].split(", ")[1]).eql(project.cEmail)
    .expect(m["value"]["collected_by"].split(", ")[2]).eql(project.cAddress)
    .expect(m["value"]["submitted_by"].split(", ")[0]).eql(project.sName)
    .expect(m["value"]["submitted_by"].split(", ")[1]).eql(project.sEmail)
    .expect(m["value"]["submitted_by"].split(", ")[2]).eql(project.sAddress)
 });

 test('Add a Subject (with Diagnosis) to the previously created Project and Check Back-end Values', async t => {
  await login.login(t,config.username,config.password,'CLICK',login.loginButtonId);

  const getPageUrl = ClientFunction(() => window.location.href);

  await t.navigateTo('./'+general.projectUuidUrl);

  await t
    .click(general.subjectsTabSelect)
    .click(subject.newSubjectSelect)

  var subjectCid = await subject.projectSubjectFormSelect.find(subject.projectSubjectDropdownId).getAttribute('name');

  await t
    .typeText(subject.subjectIdBaseId + subjectCid, subject.subjectId)
    .click(subject.syntheticSelect)
    .click(subject.syntheticOption.withAttribute('value',subject.synthetic))
    .click(subject.speciesSelect)
    .click(subject.speciesOption.withExactText(subject.species))
    .typeText(subject.strainSelect, subject.strain)
    .click(subject.sexSelect)
    .click(subject.sexOption.withExactText(subject.sex))
    .click(subject.ageTypeSelect)
    .click(subject.ageTypeOption.withExactText(subject.ageType))
    .typeText(subject.ageMinSelect,subject.ageMin)
    .typeText(subject.ageMaxSelect,subject.ageMax)
    .click(subject.ageUnitSelect)
    .click(subject.ageUnitOption.withAttribute('value',subject.ageUnit))
    .typeText(subject.ageEventSelect,subject.ageEvent)
    .typeText(subject.raceSelect,subject.race)
    .typeText(subject.ancestryPopulationSelect,subject.ancestryPopulation)
    .typeText(subject.ethnicitySelect,subject.ethnicity)
    .click(subject.linkedSubjectsSelect)
    .click(subject.linkedSubjectsOption.withExactText(subject.linkedSubjects))
    .typeText(subject.linkTypeSelect,subject.linkType)
    .click(subject.diseaseDiagnosisSelect)
    .typeText(general.ontologyInputSelect,subject.diseaseDiagnosis)
    .click(subject.diseaseDiagnosisOptionSelect.withExactText(subject.diseaseDiagnosis))
    .typeText(subject.diseaseLengthSelect,subject.diseaseLength)
    .typeText(subject.diseaseStageSelect,subject.diseaseStage)
    .typeText(subject.studyGroupDescriptionSelect,subject.studyGroupDescription)
    .typeText(subject.priorTherapiesSelect,subject.priorTherapies)
    .typeText(subject.immunogenSelect,subject.immunogen)
    .typeText(subject.interventionSelect,subject.intervention)
    .typeText(subject.medicalHistorySelect,subject.medicalHistory)
    .click(subject.saveChangesSelect)
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).ok()
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).notOk()
    .click(subject.detailsSummarySelect)

  var token = await login.getTokenFromLocalStorage();
  if (config.tapis_version == 2) {
    var m = await general.tapisV2.getMetadataForType(token.access_token, general.projectUuid, 'subject');
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/subject',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var m = await general.tapisV3.sendRequest(requestSettings);
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(1);
    m = m['result'];
  }

  general.subjectUuid = m[0]["uuid"];
  //console.log("Subject UUID: " + general.subjectUuid);

  //Check Subject values
  await t
    .expect(m[0]["value"]["subject_id"]).eql(subject.subjectId)
    .expect(m[0]["value"]["synthetic"]).ok() //Expect m to be truthy
    .expect(m[0]["value"]["species"].label).eql(subject.species)
    .expect(m[0]["value"]["sex"]).eql(subject.sex)
    .expect(m[0]["value"]["age_min"]).eql(parseFloat(subject.ageMin))
    .expect(m[0]["value"]["age_max"]).eql(parseFloat(subject.ageMax))
    .expect(m[0]["value"]["age_unit"].label).eql(subject.ageUnit)
    .expect(m[0]["value"]["age_event"]).eql(subject.ageEvent)
    .expect(m[0]["value"]["ancestry_population"]).eql(subject.ancestryPopulation)
    .expect(m[0]["value"]["ethnicity"]).eql(subject.ethnicity)
    .expect(m[0]["value"]["race"]).eql(subject.race)
    .expect(m[0]["value"]["strain_name"]).eql(subject.strain)
    .expect(m[0]["value"]["link_type"]).eql(subject.linkType)

  if(subject.linkedSubjects == 'null') await t.expect(m[0]["value"]["linked_subjects"] == null).ok()
  else await t.expect(m[0]["value"]["linked_subjects"] == subject.linkedSubjects).ok()

  //Check Diagnosis values
  await t
    .expect(m[0]["value"]["diagnosis"][0]["disease_diagnosis"].label.toLowerCase()).contains(subject.diseaseDiagnosis.toLowerCase())
    .expect(m[0]["value"]["diagnosis"][0]["disease_length"]).eql(subject.diseaseLength)
    .expect(m[0]["value"]["diagnosis"][0]["disease_stage"]).eql(subject.diseaseStage)
    .expect(m[0]["value"]["diagnosis"][0]["study_group_description"]).eql(subject.studyGroupDescription)
    .expect(m[0]["value"]["diagnosis"][0]["prior_therapies"]).eql(subject.priorTherapies)
    .expect(m[0]["value"]["diagnosis"][0]["immunogen"]).eql(subject.immunogen)
    .expect(m[0]["value"]["diagnosis"][0]["intervention"]).eql(subject.intervention)
    .expect(m[0]["value"]["diagnosis"][0]["medical_history"]).eql(subject.medicalHistory)
 });

 test('Confirm adding a Subject with a null Species is not allowed', async t => {
  await login.login(t,config.username,config.password,'CLICK',login.loginButtonId);

  const getPageUrl = ClientFunction(() => window.location.href);

  await t.navigateTo('./'+general.projectUuidUrl);

  await t
    .click(general.subjectsTabSelect)
    .click(subject.newSubjectSelect)

  var subjectCid = await subject.projectSubjectFormSelect.find(subject.projectSubjectDropdownId).getAttribute('name');

  await t
    .typeText(subject.subjectIdBaseId + subjectCid, subject.subjectId + "nullSpecies")
    .click(subject.speciesSelect)
    .click(subject.speciesOption.withExactText("null"))
    .click(subject.saveChangesSelect)
    //.expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).ok()
    //.expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).notOk()
    .wait(config.timeout)

  var errorMessage = general.invalidFeedbackSelect.withExactText(subject.speciesValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).ok()
 });

 test('Add another Diagnosis to the previously created Subject and check against the Back-end', async t => {
  await login.login(t,config.username,config.password,'CLICK',login.loginButtonId);

  await t.navigateTo('./'+general.projectUuidUrl);

  await t
    .click(general.subjectsTabSelect)
    .click(subject.subjectsDropdownSelect.withAttribute('name',general.subjectUuid))
    .click(subject.subjectsDropdownAddDiagnosisSelect)
    .click(subject.diseaseDiagnosisSelect)
    .typeText(general.ontologyInputSelect,subject.diseaseDiagnosis2)
    .click(subject.diseaseDiagnosisOptionSelect.withExactText(subject.diseaseDiagnosis2))
    .typeText(subject.diseaseLengthSelect,subject.diseaseLength2)
    .typeText(subject.diseaseStageSelect,subject.diseaseStage2)
    .typeText(subject.studyGroupDescriptionSelect,subject.studyGroupDescription2)
    .typeText(subject.priorTherapiesSelect,subject.priorTherapies2)
    .typeText(subject.immunogenSelect,subject.immunogen2)
    .typeText(subject.interventionSelect,subject.intervention2)
    .typeText(subject.medicalHistorySelect,subject.medicalHistory2)
    .click(subject.saveChangesSelect)
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).ok()
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).notOk()

  var token = await login.getTokenFromLocalStorage();
  if (config.tapis_version == 2) {
    var m = await general.tapisV2.getProjectMetadata(token.access_token, general.subjectUuid);
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/uuid/' + general.subjectUuid,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var m = await general.tapisV3.sendRequest(requestSettings);
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(1);
    m = m['result'][0];
  }

  //Find the Back-end index of the duplicated Diagnosis
  var dIndex;
  if(m["value"]["diagnosis"][0]["disease_diagnosis"].label.toLowerCase()==subject.diseaseDiagnosis2.toLowerCase())
    dIndex = 0;
  else dIndex = 1;

  //Check Diagnosis values
  await t
    .expect(m["value"]["diagnosis"][dIndex]["disease_diagnosis"].label.toLowerCase()).eql(subject.diseaseDiagnosis2.toLowerCase())
    .expect(m["value"]["diagnosis"][dIndex]["disease_length"]).eql(subject.diseaseLength2)
    .expect(m["value"]["diagnosis"][dIndex]["disease_stage"]).eql(subject.diseaseStage2)
    .expect(m["value"]["diagnosis"][dIndex]["study_group_description"]).eql(subject.studyGroupDescription2)
    .expect(m["value"]["diagnosis"][dIndex]["prior_therapies"]).eql(subject.priorTherapies2)
    .expect(m["value"]["diagnosis"][dIndex]["immunogen"]).eql(subject.immunogen2)
    .expect(m["value"]["diagnosis"][dIndex]["intervention"]).eql(subject.intervention2)
    .expect(m["value"]["diagnosis"][dIndex]["medical_history"]).eql(subject.medicalHistory2)
 });

 test('Duplicate a Diagnosis for the previously created Subject, change disease length, and check against the Back-end', async t => {
  await login.login(t,config.username,config.password,'CLICK',login.loginButtonId);

  await t.navigateTo('./'+general.projectUuidUrl);

  await t
    .click(general.subjectsTabSelect)
    .click(subject.diagnosisDropdownSelect)
    .click(subject.diagnosisDropdownDuplicateSelect.withAttribute('name','duplicate_0'))
    .typeText(subject.diseaseLengthSelect,subject.diseaseLength3,{replace: true})
    .click(subject.saveChangesSelect)
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).ok()
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).notOk()

  var token = await login.getTokenFromLocalStorage();
  if (config.tapis_version == 2) {
    var m = await general.tapisV2.getProjectMetadata(token.access_token, general.subjectUuid);
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/uuid/' + general.subjectUuid,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var m = await general.tapisV3.sendRequest(requestSettings);
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(1);
    m = m['result'][0];
  }

  //Determine the Back-end index of the Diagnosis in question and its duplicate
  var d1Index, d2Index;
  if(m["value"]["diagnosis"][0]["disease_diagnosis"].label.toLowerCase()==subject.diseaseDiagnosis.toLowerCase()) {
    d1Index = 1;
    d2Index = 2;
  } else if(m["value"]["diagnosis"][1]["disease_diagnosis"].label.toLowerCase()==subject.diseaseDiagnosis.toLowerCase()) {
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
    .expect(m["value"]["diagnosis"][d1Index]["disease_length"]).eql(subject.diseaseLength3)
    .expect(m["value"]["diagnosis"][d2Index]["disease_stage"]).eql(m["value"]["diagnosis"][d1Index]["disease_stage"])
    .expect(m["value"]["diagnosis"][d2Index]["study_group_description"]).eql(m["value"]["diagnosis"][d1Index]["study_group_description"])
    .expect(m["value"]["diagnosis"][d2Index]["prior_therapies"]).eql(m["value"]["diagnosis"][d1Index]["prior_therapies"])
    .expect(m["value"]["diagnosis"][d2Index]["immunogen"]).eql(m["value"]["diagnosis"][d1Index]["immunogen"])
    .expect(m["value"]["diagnosis"][d2Index]["intervention"]).eql(m["value"]["diagnosis"][d1Index]["intervention"])
    .expect(m["value"]["diagnosis"][d2Index]["medical_history"]).eql(m["value"]["diagnosis"][d1Index]["medical_history"])
 });

 test('Delete the newest Diagnosis for the previously created Subject and check against the Back-end', async t => {
  await login.login(t,config.username,config.password,'CLICK',login.loginButtonId);

  await t.navigateTo('./'+general.projectUuidUrl);

  await t
    .click(general.subjectsTabSelect)
    .click(subject.diagnosisDropdownSelect)
    .click(subject.diagnosisDropdownDeleteSelect.withAttribute('name','delete_0'))
    .click(subject.saveChangesSelect)
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).ok()
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).notOk()

  var token = await login.getTokenFromLocalStorage();
  if (config.tapis_version == 2) {
    var m = await general.tapisV2.getProjectMetadata(token.access_token, general.subjectUuid);
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/uuid/' + general.subjectUuid,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var m = await general.tapisV3.sendRequest(requestSettings);
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(1);
    m = m['result'][0];
  }

  //Confirm only 2 Diagnoses are stored in the Back-end
  await t
    .expect(m["value"]["diagnosis"].length).eql(2)
 });

 test('Duplicate the newest Subject and add a unique Subject ID, confirm the duplicate is correct on the Back-end, confirm the Linked Subjects drop-down populates correctly, save, and then delete the Subject', async t => {
  await login.login(t,config.username,config.password,'CLICK',login.loginButtonId);

  await t.navigateTo('./'+general.projectUuidUrl);

  await t.click(general.subjectsTabSelect);

  //Duplicate the newest Subject
  await t
    .click(subject.subjectsDropdownSelect.withAttribute('name',general.subjectUuid))
    .click(subject.subjectsDropdownDuplicateSelect.withAttribute('name',general.subjectUuid))

  var subjectCid = await subject.projectSubjectFormSelect.find(subject.projectSubjectDropdownId).getAttribute('name');

  await t
    .typeText(subject.subjectIdBaseId + subjectCid, subject.subjectId+'-D', {replace: true})
    .click(subject.linkedSubjectsSelect)
    .click(subject.linkedSubjectsOption.withExactText(subject.linkedSubjects))
    .click(subject.saveChangesSelect)
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).ok()
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).notOk()

  //Reload the page so the dynamic drop-downs update
  await t.eval(() => location.reload(true));

  //Expect 2 options now
  await t
    .click(subject.subjectsDropdownSelect.withAttribute('name',general.subjectUuid))
    .click(subject.subjectsDropdownEditSelect.withAttribute('name',general.subjectUuid))
    .expect(subject.linkedSubjectsOption.count).eql(2)
    .expect((Selector(subject.projectSubjectFormIdBase+general.subjectUuid).find(subject.linkedSubjectsId)).find('option').withExactText(subject.subjectId+'-D').exists).ok()
    .expect((Selector(subject.projectSubjectFormIdBase+general.subjectUuid).find(subject.linkedSubjectsId)).find('option').withExactText('null').exists).ok()

  var token = await login.getTokenFromLocalStorage();
  if (config.tapis_version == 2) {
    var m = await general.tapisV2.getMetadataForType(token.access_token, general.projectUuid, 'subject');
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/subject',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var m = await general.tapisV3.sendRequest(requestSettings);
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(2);
    m = m['result'];
  }

  //Confirm 2 Subjects are stored in the Back-end
  await t
    .expect(m.length).eql(2);

  //Get the UUID for the newly duplicated Subject
  var subjectUuidD ="";
  if(m[0]["uuid"] != general.subjectUuid) subjectUuidD = m[0]["uuid"];
  else subjectUuidD = m[1]["uuid"];
  //console.log("Subject-D UUID: " + subjectUuidD);

  //Subject ID values should differ
  if(m[0]["uuid"] == general.subjectUuid && m[1]["uuid"] == subjectUuidD) {
    await t.expect(m[0]["value"]["subject_id"]).eql(subject.subjectId)
    await t.expect(m[1]["value"]["subject_id"]).eql(subject.subjectId+'-D')
  } else if(m[1]["uuid"] == general.subjectUuid && m[0]["uuid"] == subjectUuidD) {
    await t.expect(m[1]["value"]["subject_id"]).eql(subject.subjectId)
    await t.expect(m[0]["value"]["subject_id"]).eql(subject.subjectId+'-D')
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
    .click(subject.subjectsDropdownSelect.withAttribute('name',subjectUuidD))
    .click(subject.subjectsDropdownDeleteSelect.withAttribute('name',subjectUuidD))
    .click(subject.saveChangesSelect)
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).ok()
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).notOk()

  token = await login.getTokenFromLocalStorage();
  if (config.tapis_version == 2) {
    m = await general.tapisV2.getMetadataForType(token.access_token, general.projectUuid, 'subject');
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/subject',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    m = await general.tapisV3.sendRequest(requestSettings);
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(1);
    m = m['result'];
  }

  //Confirm only 1 Subject is stored in the Back-end
  await t
    .expect(m.length).eql(1);
 });

 test('Confirm \'Revert Changes\' and \'Save Changes\' buttons are disabled/enabled correctly', async t => {
  await login.login(t,config.username,config.password,'CLICK',login.loginButtonId);

  await t.navigateTo('./'+general.projectUuidUrl);

  await t.click(general.subjectsTabSelect);

  //Expect the buttons to be unavailable when no changes have been made
  await t.expect(subject.revertChangesSelect.withExactText('Revert Changes').hasAttribute('disabled')).ok()
  await t.expect(subject.saveChangesSelect.withExactText('Validate/Save Changes').hasAttribute('disabled')).ok()

  //Duplicate the newest Subject and check buttons; edit a field and check buttons
  await t
    .click(subject.subjectsDropdownSelect.withAttribute('name',general.subjectUuid))
    .click(subject.subjectsDropdownDuplicateSelect.withAttribute('name',general.subjectUuid))
    .expect(subject.revertChangesSelect.withExactText('Revert Changes').hasAttribute('disabled')).notOk()
    .expect(subject.saveChangesSelect.withExactText('Validate/Save Changes').hasAttribute('disabled')).notOk()
    .click(subject.revertChangesSelect)
    .click(subject.subjectsDropdownSelect.withAttribute('name',general.subjectUuid))
    .click(subject.subjectsDropdownEditSelect.withAttribute('name',general.subjectUuid))
    .typeText(subject.strainSelect, 'StrainCheck',  {replace: true})
    .pressKey('tab') //Change focus
    .expect(subject.revertChangesSelect.withExactText('Revert Changes').hasAttribute('disabled')).notOk()
    .expect(subject.saveChangesSelect.withExactText('Validate/Save Changes').hasAttribute('disabled')).notOk()
    .click(subject.revertChangesSelect)

  //Ensure the buttons are disabled after a Save
  await t
    .click(subject.subjectsDropdownSelect.withAttribute('name',general.subjectUuid))
    .click(subject.subjectsDropdownEditSelect.withAttribute('name',general.subjectUuid))
    .typeText(subject.ancestryPopulationSelect, 'AncestryPopulationCheck',  {replace: true})
    .click(subject.saveChangesSelect)
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).ok()
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).notOk()
    .expect(subject.revertChangesSelect.withExactText('Revert Changes').hasAttribute('disabled')).ok()
    .expect(subject.saveChangesSelect.withExactText('Validate/Save Changes').hasAttribute('disabled')).ok()
    .click(subject.subjectsDropdownSelect.withAttribute('name',general.subjectUuid))
    .click(subject.subjectsDropdownEditSelect.withAttribute('name',general.subjectUuid))
    .typeText(subject.ancestryPopulationSelect, subject.ancestryPopulation, {replace: true})
    .click(subject.saveChangesSelect)
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).ok()
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).notOk()
 });

 test('View existing Subject in Summary and Details view mode and confirm the correct values are shown', async t => {
  await login.login(t,config.username,config.password,'CLICK',login.loginButtonId);

  await t.navigateTo('./'+general.projectUuidUrl);

  await t.click(general.subjectsTabSelect);

  //Summary view selectors
  const subjectIdTextUntrimmed = await Selector('div').withExactText("Subject ID: " + subject.subjectId).innerText;
  const sexSpeciesTextUntrimmed = await Selector('div').withExactText("Sex/Species: " + subject.sex + '/' + subject.species).innerText;
  const raceEthnicityTextUntrimmed = await Selector('div').withExactText("Race/Ethnicity: " + subject.race + '/'+ subject.ethnicity).innerText;
  const ageTextUntrimmed = await Selector('div').withExactText("Age: " + subject.ageMin + '-' + subject.ageMax + ' ' + subject.ageUnit + "(s)").innerText;
  const studyGroupDescriptionTextUntrimmed = await Selector('div').withExactText("Study Group Description: " + subject.studyGroupDescription).innerText;
  const studyGroupDescriptionText2Untrimmed = await Selector('div').withExactText("Study Group Description: " + subject.studyGroupDescription2).innerText;

  const diseaseDiagnosisText = Selector('div').withText(subject.diseaseDiagnosis.toLowerCase()).exists; //We don't know the exact DOID
  const diseaseDiagnosisText2 = Selector('div').withText(subject.diseaseDiagnosis2.toLowerCase()).exists;

  const subjectIdTextTrimmed = await subjectIdTextUntrimmed.toString().trim();
  const sexSpeciesTextTrimmed = await sexSpeciesTextUntrimmed.toString().trim();
  const raceEthnicityTextTrimmed = await raceEthnicityTextUntrimmed.toString().trim();
  const ageTextTrimmed = await ageTextUntrimmed.toString().trim();
  const studyGroupDescriptionTextTrimmed = await studyGroupDescriptionTextUntrimmed.toString().trim();
  const studyGroupDescriptionText2Trimmed = await studyGroupDescriptionText2Untrimmed.toString().trim();

  //Details view selectors
  const subjectIdDetailsText = Selector(subject.subjectIdBaseId + general.subjectUuid);
  //Regular expression code for additional flexibility 
  //const syntheticRegExp = new RegExp(subject.synthetic, "i"); 
  
  //Summary view checks
  await t
    .expect(subjectIdTextTrimmed).eql("Subject ID: " + subject.subjectId)
    .expect(sexSpeciesTextTrimmed).eql("Sex/Species: " + subject.sex + '/' + subject.species)
    .expect(raceEthnicityTextTrimmed).eql("Race/Ethnicity: " + subject.race + '/'+ subject.ethnicity)
    .expect(ageTextTrimmed).eql("Age: " + subject.ageMin + '-' + subject.ageMax + ' ' + subject.ageUnit + "(s)")
    .expect(studyGroupDescriptionTextTrimmed).eql("Study Group Description: " + subject.studyGroupDescription)
    .expect(studyGroupDescriptionText2Trimmed).eql("Study Group Description: " + subject.studyGroupDescription2)
    .expect(diseaseDiagnosisText).ok()
    .expect(diseaseDiagnosisText2).ok()

  await t
    .click(subject.detailsSummarySelect);

  //Details view checks
  await t
    .expect(subjectIdDetailsText.value).eql(subject.subjectId)
    //.expect(subject.syntheticSelect.value).match(syntheticRegExp)
    .expect(subject.syntheticSelect.value).eql(subject.synthetic)
    .expect(subject.speciesSelect.value).eql(subject.species)
    .expect(subject.strainSelect.value).eql(subject.strain)
    .expect(subject.sexSelect.value).eql(subject.sex)
    .expect(subject.ageTypeSelect.value).eql(subject.ageType)
    .expect(subject.ageMinSelect.value).eql(subject.ageMin)
    .expect(subject.ageMaxSelect.value).eql(subject.ageMax)
    .expect(subject.ageUnitSelect.value).eql(subject.ageUnit)
    .expect(subject.ageEventSelect.value).eql(subject.ageEvent)
    .expect(subject.raceSelect.value).eql(subject.race)
    .expect(subject.ancestryPopulationSelect.value).eql(subject.ancestryPopulation)
    .expect(subject.ethnicitySelect.value).eql(subject.ethnicity)
    .expect(subject.linkTypeSelect.value).eql(subject.linkType)

    .expect(subject.diseaseDiagnosisDetailsText.getAttribute('value')).contains(subject.diseaseDiagnosis2) //Again, we don't have the DOID
    .expect(subject.diseaseLengthSelect.value).eql(subject.diseaseLength2)
    .expect(subject.diseaseStageSelect.value).eql(subject.diseaseStage2)
    .expect(subject.studyGroupDescriptionSelect.getAttribute('value')).eql(subject.studyGroupDescription2)
    .expect(subject.priorTherapiesSelect.value).eql(subject.priorTherapies2)
    .expect(subject.immunogenSelect.value).eql(subject.immunogen2)
    .expect(subject.interventionSelect.value).eql(subject.intervention2)
    .expect(subject.medicalHistorySelect.value).eql(subject.medicalHistory2)

    .expect(subject.diseaseDiagnosisDetailsText2.getAttribute('value')).contains(subject.diseaseDiagnosis)
    .expect(subject.diseaseLength2Select.value).eql(subject.diseaseLength)
    .expect(subject.diseaseStage2Select.value).eql(subject.diseaseStage)
    .expect(subject.studyGroupDescription2Select.getAttribute('value')).eql(subject.studyGroupDescription)
    .expect(subject.priorTherapies2Select.value).eql(subject.priorTherapies)
    .expect(subject.immunogen2Select.value).eql(subject.immunogen)
    .expect(subject.intervention2Select.value).eql(subject.intervention)
    .expect(subject.medicalHistory2Select.value).eql(subject.medicalHistory)

  //Special handling for when subject.linkedSubjects == "null"
  if(subject.linkedSubjects == 'null') await t.expect(subject.linkedSubjectsSelect.value).eql('')
  else await t.expect(subject.linkedSubjectsSelect.value == subject.linkedSubjects).ok()
 });

 test('View existing Subject in Summary view mode, edit, revert, and confirm the correct values are still shown', async t => {
  await login.login(t,config.username,config.password,'CLICK',login.loginButtonId);

  await t.navigateTo('./'+general.projectUuidUrl);

  await t.click(general.subjectsTabSelect);

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
  const subjectIdTextUntrimmed = await Selector('div').withExactText("Subject ID: " + subject.subjectId).innerText;
  const sexSpeciesTextUntrimmed = await Selector('div').withExactText("Sex/Species: " + subject.sex + '/' + subject.species).innerText;
  const raceEthnicityTextUntrimmed = await Selector('div').withExactText("Race/Ethnicity: " + subject.race + '/'+ subject.ethnicity).innerText;
  const ageTextUntrimmed = await Selector('div').withExactText("Age: " + subject.ageMin + '-' + subject.ageMax + ' ' + subject.ageUnit + "(s)").innerText;
  const studyGroupDescriptionTextUntrimmed = await Selector('div').withExactText("Study Group Description: " + subject.studyGroupDescription).innerText;
  const studyGroupDescriptionText2Untrimmed = await Selector('div').withExactText("Study Group Description: " + subject.studyGroupDescription2).innerText;
  const diseaseDiagnosisText = Selector('div').withText(subject.diseaseDiagnosis.toLowerCase()).exists; //We don't know the exact DOID
  const diseaseDiagnosisText2 = Selector('div').withText(subject.diseaseDiagnosis2.toLowerCase()).exists;

  const subjectIdTextTrimmed = await subjectIdTextUntrimmed.toString().trim();
  const sexSpeciesTextTrimmed = await sexSpeciesTextUntrimmed.toString().trim();
  const raceEthnicityTextTrimmed = await raceEthnicityTextUntrimmed.toString().trim();
  const ageTextTrimmed = await ageTextUntrimmed.toString().trim();
  const studyGroupDescriptionTextTrimmed = await studyGroupDescriptionTextUntrimmed.toString().trim();
  const studyGroupDescriptionText2Trimmed = await studyGroupDescriptionText2Untrimmed.toString().trim();

  //Details view selectors
  const subjectIdDetailsText = Selector(subject.subjectIdBaseId + general.subjectUuid);

  //Edit values but do not Save
  await t
    .click(subject.subjectsDropdownSelect)
    .click(subject.subjectsDropdownEditSelect)
    .typeText(subject.subjectIdBaseId + general.subjectUuid, subjectIdR, {replace: true})
    .click(subject.syntheticSelect)
    .click(subject.syntheticOption.withAttribute('value',syntheticR))
    .click(subject.speciesSelect)
    .click(subject.speciesOption.withExactText(speciesR))
    .click(subject.sexSelect)
    .click(subject.sexOption.withExactText(sexR))
    .click(subject.ageTypeSelect)
    .click(subject.ageTypeOption.withExactText(ageTypeR))
    .typeText(subject.agePointSelect,ageMinR,{replace: true})
    .click(subject.ageUnitSelect)
    .click(subject.ageUnitOption.withAttribute('value',ageUnitR))
    .typeText(subject.raceSelect,raceR,{replace: true})
    .typeText(subject.ethnicitySelect,ethnicityR,{replace: true})
    .click(subject.diseaseDiagnosisSelect)
    .typeText(general.ontologyInputSelect,diseaseDiagnosisR,{replace: true})
    .click(subject.diseaseDiagnosisOptionSelect.withExactText(diseaseDiagnosisR))
    .click(subject.diseaseDiagnosis2Select)
    .typeText(subject.diseaseDiagnosisRegion1Select.find(subject.diagnosisOntologyId),diseaseDiagnosis2R,{replace: true})
    .click(subject.diseaseDiagnosisOptionSelect.withExactText(diseaseDiagnosis2R))

  await t.click(subject.revertChangesSelect);

  //Summary view checks
  await t
    .expect(subjectIdTextTrimmed).eql("Subject ID: " + subject.subjectId)
    .expect(sexSpeciesTextTrimmed).eql("Sex/Species: " + subject.sex + '/' + subject.species)
    .expect(raceEthnicityTextTrimmed).eql("Race/Ethnicity: " + subject.race + '/'+ subject.ethnicity)
    .expect(ageTextTrimmed).eql("Age: " + subject.ageMin + '-' + subject.ageMax + ' ' + subject.ageUnit + "(s)")
    .expect(studyGroupDescriptionTextTrimmed).eql("Study Group Description: " + subject.studyGroupDescription)
    .expect(studyGroupDescriptionText2Trimmed).eql("Study Group Description: " + subject.studyGroupDescription2)
    .expect(diseaseDiagnosisText).ok()
    .expect(diseaseDiagnosisText2).ok()

  await t
    .click(subject.detailsSummarySelect);

  //Details view checks
  await t
    .expect(subjectIdDetailsText.value).eql(subject.subjectId)
    .expect(subject.syntheticSelect.value).eql(subject.synthetic)
    .expect(subject.speciesSelect.value).eql(subject.species)
    .expect(subject.strainSelect.value).eql(subject.strain)
    .expect(subject.sexSelect.value).eql(subject.sex)
    .expect(subject.ageTypeSelect.value).eql(subject.ageType)
    .expect(subject.ageMinSelect.value).eql(subject.ageMin)
    .expect(subject.ageMaxSelect.value).eql(subject.ageMax)
    .expect(subject.ageUnitSelect.value).eql(subject.ageUnit)
    .expect(subject.ageEventSelect.value).eql(subject.ageEvent)
    .expect(subject.raceSelect.value).eql(subject.race)
    .expect(subject.ancestryPopulationSelect.value).eql(subject.ancestryPopulation)
    .expect(subject.ethnicitySelect.value).eql(subject.ethnicity)
    .expect(subject.linkTypeSelect.value).eql(subject.linkType)

    .expect(subject.diseaseDiagnosisDetailsText.getAttribute('value')).contains(subject.diseaseDiagnosis2) //Again, we don't have the DOID
    .expect(subject.diseaseLengthSelect.value).eql(subject.diseaseLength2)
    .expect(subject.diseaseStageSelect.value).eql(subject.diseaseStage2)
    .expect(subject.studyGroupDescriptionSelect.getAttribute('value')).eql(subject.studyGroupDescription2)
    .expect(subject.priorTherapiesSelect.value).eql(subject.priorTherapies2)
    .expect(subject.immunogenSelect.value).eql(subject.immunogen2)
    .expect(subject.interventionSelect.value).eql(subject.intervention2)
    .expect(subject.medicalHistorySelect.value).eql(subject.medicalHistory2)

    .expect(subject.diseaseDiagnosisDetailsText2.getAttribute('value')).contains(subject.diseaseDiagnosis)
    .expect(subject.diseaseLength2Select.value).eql(subject.diseaseLength)
    .expect(subject.diseaseStage2Select.value).eql(subject.diseaseStage)
    .expect(subject.studyGroupDescription2Select.getAttribute('value')).eql(subject.studyGroupDescription)
    .expect(subject.priorTherapies2Select.value).eql(subject.priorTherapies)
    .expect(subject.immunogen2Select.value).eql(subject.immunogen)
    .expect(subject.intervention2Select.value).eql(subject.intervention)
    .expect(subject.medicalHistory2Select.value).eql(subject.medicalHistory)

  //Special handling for when subject.linkedSubjects == "null"
  if(subject.linkedSubjects == 'null') await t.expect(subject.linkedSubjectsSelect.value).eql('')
  else await t.expect(subject.linkedSubjectsSelect.value == subject.linkedSubjects).ok()
 });

 test('Duplicate the newest Subject and add a unique Subject ID and change the linked Subject value, for the previously created Project', async t => {
  await login.login(t,config.username,config.password,'CLICK',login.loginButtonId);

  await t.navigateTo('./'+general.projectUuidUrl);

  await t.click(general.subjectsTabSelect);

  await t
    .click(subject.subjectsDropdownSelect.withAttribute('name',general.subjectUuid))
    .click(subject.subjectsDropdownDuplicateSelect.withAttribute('name',general.subjectUuid))

  var subjectCid = await subject.projectSubjectFormSelect.find(subject.projectSubjectDropdownId).getAttribute('name');

  await t
    .typeText(subject.subjectIdBaseId + subjectCid, subject.subjectId+'-2', {replace: true})
    .click(subject.linkedSubjectsSelect)
    .click(subject.linkedSubjectsOption.withExactText(subject.linkedSubjects))
    .click(subject.saveChangesSelect)
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).ok()
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).notOk()

  var token = await login.getTokenFromLocalStorage();
  if (config.tapis_version == 2) {
    var m = await general.tapisV2.getMetadataForType(token.access_token, general.projectUuid, 'subject');
    general.subjectUuid2 = m[0]["uuid"];
    m = await general.tapisV2.getProjectMetadata(token.access_token, general.subjectUuid);
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/subject',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var m = await general.tapisV3.sendRequest(requestSettings);
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(2);

    //Determine which record holds the new Subject
    if(m['result'][0]['uuid'] == general.subjectUuid) {
      m = m['result'][1];
      general.subjectUuid2 = m["uuid"];
    } else {
      m = m['result'][0];
      general.subjectUuid2 = m["uuid"];
    }

    var requestSettings2 = {
        url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/uuid/' + general.subjectUuid,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    m = await general.tapisV3.sendRequest(requestSettings2);
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(1);
    m = m['result'][0];
  }
  //console.log("Subject2 UUID: " + general.subjectUuid2);

  if (config.tapis_version == 2) {
    var m2 = await general.tapisV2.getProjectMetadata(token.access_token, general.subjectUuid2);
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/uuid/' + general.subjectUuid2,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var m2 = await general.tapisV3.sendRequest(requestSettings);
    await t.expect(m2['status']).eql("success")
        .expect(m2['result'].length).eql(1);
    m2 = m2['result'][0];
  }

  //Check the Back-end values
  await t
    //subject
    .expect(m["value"]["subject_id"]).notEql(m2["value"]["subject_id"])
    .expect(m["value"]["subject_id"]).eql(subject.subjectId)
    .expect(m2["value"]["subject_id"]).eql(subject.subjectId+'-2')
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

  if(subject.linkedSubjects == 'null') await t.expect(m["value"]["linked_subjects"] == null).ok()
  else await t.expect(m["value"]["linked_subjects"] == subject.linkedSubjects).ok()

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
  await login.login(t,config.username,config.password,'CLICK',login.loginButtonId);

  await t.navigateTo('./'+general.projectUuidUrl);

  await t
    .click(general.subjectsTabSelect)
    .click(subject.newSubjectSelect)

  var subjectCid = await subject.projectSubjectFormSelect.find(subject.projectSubjectDropdownId).getAttribute('name');

  await t
    .typeText(subject.subjectIdBaseId + subjectCid, subject.subjectId)
    .click(subject.saveChangesSelect)

  const errorMessage = Selector('div').withExactText('Please enter a non-blank, unique Subject ID.').exists;

  await t
    .expect(errorMessage).ok() 
 });

 test('Add a new Subject with a blank Subject ID for the previously created Project', async t => {
  const blankSubjectId = '  ';

  await login.login(t,config.username,config.password,'CLICK',login.loginButtonId);

  await t.navigateTo('./'+general.projectUuidUrl);

  await t
    .click(general.subjectsTabSelect)
    .click(subject.newSubjectSelect)

  var blankSubjectCid = await subject.projectSubjectFormSelect.find(subject.projectSubjectDropdownId).getAttribute('name');

  await t
    .typeText(subject.subjectIdBaseId + blankSubjectCid, blankSubjectId)
    .click(subject.saveChangesSelect)

  const errorMessage = Selector('div').withExactText('Please enter a non-blank, unique Subject ID.').exists;

  await t
    .expect(errorMessage).ok()
 });

 test('Edit existing Subject and add a negative age_min point value', async t => {
  const ageType = 'point';
  const ageMin = '-3';

  await login.login(t,config.username,config.password,'CLICK',login.loginButtonId);

  await t.navigateTo('./'+general.projectUuidUrl);

  await t
    .click(general.subjectsTabSelect)
    .click(subject.subjectsDropdownSelect.withAttribute('name',general.subjectUuid))
    .click(subject.subjectsDropdownEditSelect.withAttribute('name',general.subjectUuid))
    .click(subject.ageTypeSelect)
    .click(subject.ageTypeOption.withExactText(ageType))
    .typeText(subject.agePointSelect,ageMin,{ replace: true })
    .click(subject.saveChangesSelect)

  const errorMessage = Selector('div').withExactText('Please enter a valid age number ≥ 0.').exists;

  await t
    .expect(errorMessage).ok()
 });

 test('Edit existing Subject and add a negative age_max range value', async t => {
  const ageType = 'range';
  const ageMin = '1';
  const ageMax = '-3';

  await login.login(t,config.username,config.password,'CLICK',login.loginButtonId);

  await t.navigateTo('./'+general.projectUuidUrl);

  await t
    .click(general.subjectsTabSelect)
    .click(subject.subjectsDropdownSelect.withAttribute('name',general.subjectUuid))
    .click(subject.subjectsDropdownEditSelect.withAttribute('name',general.subjectUuid))
    .click(subject.ageTypeSelect)
    .click(subject.ageTypeOption.withExactText(ageType))
    .typeText(subject.ageMinSelect,ageMin,{ replace: true })
    .typeText(subject.ageMaxSelect,ageMax,{ replace: true })
    .click(subject.saveChangesSelect)

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

  await login.login(t,config.username,config.password,'CLICK',login.loginButtonId);

  await t.navigateTo('./'+general.projectUuidUrl);

  await t.click(general.subjectsTabSelect);

  await t
    .click(subject.subjectsDropdownSelect.withAttribute('name',general.subjectUuid))
    .click(subject.subjectsDropdownEditSelect.withAttribute('name',general.subjectUuid))
    .click(subject.ageTypeSelect)
    .click(subject.ageTypeOption.withExactText(ageType))
    .typeText(subject.ageMinSelect,ageMin,{ replace: true })
    .typeText(subject.ageMaxSelect,ageMax,{ replace: true })
    .click(subject.saveChangesSelect)

  const errorMessage1 = Selector('div').withExactText('Please enter a valid minimum age number ≥ 0.').exists;
  const errorMessage2 = Selector('div').withExactText('Please enter a valid maximum age number that is greater than the minimum age number.').exists;

  await t
    .expect(errorMessage1).ok()
    .expect(errorMessage2).ok()
 });

 test('Change Subject 2\'s age and sex values, add a third Subject, and check Sort options', async t => {
  const subjectId2 = 'Z ' + subject.subjectId;
  const subjectId3 = 'V ' + subject.subjectId;

  const sex2 = 'female';
  const sex3 = 'hermaphrodite';

  const ageType2 = 'range';
  const ageType3 = 'point';
  const ageMin2 = '4';
  const ageMax2 = '4';
  const ageMin3 = '1';
  const ageUnit2 = "hour";
  const ageUnit3 = "month";

  await login.login(t,config.username,config.password,'CLICK',login.loginButtonId);

  await t.navigateTo('./'+general.projectUuidUrl);

  await t.click(general.subjectsTabSelect);

  //Update values for Subject 2
  await t
    .click(subject.subjectsDropdownSelect.withAttribute('name',general.subjectUuid2))
    .click(subject.subjectsDropdownEditSelect.withAttribute('name',general.subjectUuid2))
    .typeText(subject.subjectIdBaseId + general.subjectUuid2, subjectId2, {replace:true})
    .click(subject.sexSelect)
    .click(subject.sexOption.withExactText(sex2))
    .click(subject.ageTypeSelect)
    .click(subject.ageTypeOption.withExactText(ageType2))
    .typeText(subject.ageMinSelect,ageMin2,{ replace: true })
    .typeText(subject.ageMaxSelect,ageMax2,{ replace: true })
    .click(subject.ageUnitSelect)
    .click(subject.ageUnitOption.withAttribute('value',ageUnit2))
    .click(subject.saveChangesSelect)
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).ok()
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).notOk()

  //Add the third Subject
  await t
    .click(subject.newSubjectSelect)

  var subject3Cid = await subject.projectSubjectFormSelect.find(subject.projectSubjectDropdownId).getAttribute('name');
  var subject3Form = Selector(subject.projectSubjectFormIdBase + subject3Cid);

  await t
    .typeText(subject.subjectIdBaseId + subject3Cid, subjectId3, {replace:true})
    .click(subject3Form.find('#' + await subject.speciesSelect.getAttribute('id')))
    .click(subject.speciesOption.withExactText(subject.species2))
    .click(subject3Form.find('#' + await subject.sexSelect.getAttribute('id')))
    .click(subject.sexOption.withExactText(sex3))
    .click(subject3Form.find('#' + await subject.ageTypeSelect.getAttribute('id')))
    .click(subject.ageTypeOption.withExactText(ageType3))
    .typeText(subject3Form.find('#' + await subject.agePointSelect.getAttribute('id')),ageMin3,{ replace: true })
    .click(subject3Form.find('#' + await subject.ageUnitSelect.getAttribute('id')))
    .click(subject.ageUnitOption.withAttribute('value',ageUnit3))
    .click(subject.saveChangesSelect)
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).ok()
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).notOk()

  var token = await login.getTokenFromLocalStorage();

  //Get all the Subjects
  if (config.tapis_version == 2) {
    var subjects = await general.tapisV2.getMetadataForType(token.access_token, general.projectUuid, 'subject');
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/subject',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var subjects = await general.tapisV3.sendRequest(requestSettings);
    await t.expect(subjects['status']).eql("success")
        .expect(subjects['result'].length).eql(3);
    subjects = subjects['result'];
  }

  //Find the uuid values for the subjects based on their Subject ID
  var uuid1 = "";
  var uuid2 = "";
  var uuid3 = "";

  if(subjects[0]['value']['subject_id'] == subject.subjectId) uuid1 = subjects[0]['uuid'];
  else if(subjects[0]['value']['subject_id'] == subjectId2) uuid2 = subjects[0]['uuid'];
  else if(subjects[0]['value']['subject_id'] == subjectId3) uuid3 = subjects[0]['uuid'];

  if(subjects[1]['value']['subject_id'] == subject.subjectId) uuid1 = subjects[1]['uuid'];
  else if(subjects[1]['value']['subject_id'] == subjectId2) uuid2 = subjects[1]['uuid'];
  else if(subjects[1]['value']['subject_id'] == subjectId3) uuid3 = subjects[1]['uuid'];

  if(subjects[2]['value']['subject_id'] == subject.subjectId) uuid1 = subjects[2]['uuid'];
  else if(subjects[2]['value']['subject_id'] == subjectId2) uuid2 = subjects[2]['uuid'];
  else if(subjects[2]['value']['subject_id'] == subjectId3) uuid3 = subjects[2]['uuid'];

  //Sort by Subject ID
  await t
    .click(subject.sortDropdownSelect)
    .click(subject.sortDropdownOptionSelect.withAttribute('name','subjectid'))

  //Get the elements in the sorted order
  var subj1 = await subject.subjectsDropdownSelect.nth(0).getAttribute('name');
  var subj2 = await subject.subjectsDropdownSelect.nth(1).getAttribute('name');
  var subj3 = await subject.subjectsDropdownSelect.nth(2).getAttribute('name');

  //Confirm the sorted order matches the expected order
  await t
    .expect(subj1).eql(uuid1)
    .expect(subj2).eql(uuid3)
    .expect(subj3).eql(uuid2)

  //Sort by Sex
  await t
    .click(subject.sortDropdownSelect)
    .click(subject.sortDropdownOptionSelect.withAttribute('name','sex'))

  //Get the elements in the sorted order
  subj1 = await subject.subjectsDropdownSelect.nth(0).getAttribute('name');
  subj2 = await subject.subjectsDropdownSelect.nth(1).getAttribute('name');
  subj3 = await subject.subjectsDropdownSelect.nth(2).getAttribute('name');

  //Confirm the sorted order matches the expected order
  await t
    .expect(subj1).eql(uuid2)
    .expect(subj2).eql(uuid3)
    .expect(subj3).eql(uuid1)

  //Sort by Age
  await t
    .click(subject.sortDropdownSelect)
    .click(subject.sortDropdownOptionSelect.withAttribute('name','age'))

  //Get the elements in the sorted order
  subj1 = await subject.subjectsDropdownSelect.nth(0).getAttribute('name');
  subj2 = await subject.subjectsDropdownSelect.nth(1).getAttribute('name');
  subj3 = await subject.subjectsDropdownSelect.nth(2).getAttribute('name');

  //Confirm the sorted order matches the expected order
  await t
    .expect(subj1).eql(uuid2)
    .expect(subj2).eql(uuid1)
    .expect(subj3).eql(uuid3)
 });
