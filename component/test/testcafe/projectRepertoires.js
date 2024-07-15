//
// projectRepertoires.js
// Project Repertoires Page Test Cases
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
var subjectUuid2 = "";
var repertoireUuid = "";
var dRepertoireUuid = "";
var sampleUuid = "";
var dSampleUuid="";

fixture('Project Repertoires Page Test Cases')
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

  //Repertoire Values
  const repertoireName = "Repertoire Name";
  const repertoireDescription = "Repertoire Description";
  const repertoireSubjectId = "null";

  //Sample Values
  //const sampleId = "Sample ID_" + Math.floor(Math.random()*1000000);
  var sampleId = "Sample ID_251173";
  const sampleType = "Sample Type";
  const tissue = "epithalamus";
  const anatomicSite = "Anatomic Site";
  const diseaseStateSample = "Disease State Sample";
  const collectionTime = "1234"; //TODO NUMBER
  const collectionTimePointRelativeUnit = "day";
  const collectionTimeReference = "Collection Time Reference";
  const biomaterialProvider = "Biomaterial Provider";
  const sequencingRunId = "Sequencing Run ID";
  const sequencingPlatform = "Sequencing Platform";
  const sequencingFacility = "Sequencing Facility";
  const sequencingDate = "2016-12-16";
  const sequencingKit = "Sequencing Kit";
  const sequencingFiles = 'null';
  const tissueProcessing = "Tissue Processing";
  const cellSubset = "T cell";
  const cellPhenotype = "Cell Phenotype";
  const cellSpecies = "Homo sapiens";
  const singleCell = "true";
  const cellNumber = "44";
  const cellsPerReaction = "22";
  const cellStorage = "false";
  const cellQuality = "Cell Quality";
  const cellIsolation = "Cell Isolation";
  const cellProcessingProtocol = "Cell Processing Protocol";
  const templateClass = "DNA";
  const templateQuality = "Template Quality";
  const templateAmount = "4321";
  const templateAmountUnit = "milligram";
  const libraryGenerationMethod = "PCR";
  const libraryGenerationProtocol = "Library Generation Protocol";
  const libraryGenerationKitVersion = "Library Generation Kit Version";
  const completeSequences = "complete";
  const physicalLinkage = "hetero_prelinked";
  const pcrTargetLocus = "TRA";
  const forwardTargetLocation = "Forward Target Location";
  const reverseTargetLocation = "Reverse Target Location";
  const sequencingDataId = "Sequencing Data ID";

  //General Selectors
  const createProjectSelect = Selector('#create-project', {timeout:config.timeout});
  const subjectsTabSelect = Selector('#subjects-tab', {timeout:config.timeout});
  const repertoiresTabSelect = Selector('#repertoires-tab', {timeout:config.timeout});
  const detailsSummarySubjectSelect = Selector('#project-subjects-details-summary', {timeout:config.timeout});
  const detailsSummaryRepertoireSelect = Selector('#project-repertoires-details-summary', {timeout:config.timeout});
//TODO show summary drop-down (also in Subjects)
//attach existing sample?
  const sortRepertoireDropdownSelect = Selector('#project-repertoires-sort-button', {timeout:config.timeout});
  const sortRepertoireDropdownOptionSelect = Selector('#project-repertoires-sort-select', {timeout:config.timeout});
  const newSubjectSelect = Selector('#project-subjects-new-subject', {timeout:config.timeout});
  const saveSubjectChangesSelect = Selector('#project-subjects-save-changes', {timeout:config.timeout});
  const newRepertoireSelect = Selector('#project-repertoires-add', {timeout:config.timeout});
  const newRepertoireAddSelect = Selector('#project-repertoires-add-repertoire', {timeout:config.timeout});
  const revertRepertoireChangesSelect = Selector('#project-repertoires-revert-changes', {timeout:config.timeout});
  const saveRepertoireChangesSelect = Selector('#project-repertoires-save-changes', {timeout:config.timeout});
  const repertoireDropdownSelect = Selector('#project-repertoires-dropdown', {timeout:config.timeout});
  const repertoireDropdownDetailsSummarySelect = Selector('#project-repertoire-show-summary', {timeout:config.timeout});
  const repertoireDropdownEditSelect = Selector('#project-repertoire-edit-repertoire', {timeout:config.timeout});
  const repertoireDropdownDuplicateSelect = Selector('#project-repertoire-duplicate-repertoire', {timeout:config.timeout});
  const repertoireDropdownDeleteSelect = Selector('#project-repertoire-delete-repertoire', {timeout:config.timeout});
  const repertoireDropdownAddSampleSelect = Selector('#project-sample-add-sample', {timeout:config.timeout});
  const sampleDropdownSelect = Selector('#project-samples-add', {timeout:config.timeout});
  const sampleDropdownDuplicateSelect = Selector('#project-sample-duplicate-sample', {timeout:config.timeout});
  const sampleDropdownDeleteSelect = Selector('#project-sample-delete-sample', {timeout:config.timeout});

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

  //Repertoire Field Selectors
  const repertoireNameSelect = Selector('input[name="repertoire_name"]');
  const repertoireDescriptionSelect = Selector('#repertoire_description');
  const subjectIdSelect = Selector('#subject');
  const subjectIdOption = subjectIdSelect.find('option');

  //Sample Field Selectors
  const sampleIdSelect = Selector('input[name="sample_id"]');
  const sampleTypeSelect = Selector('#sample_type');
  const anatomicSiteSelect = Selector('#anatomic_site');
  const diseaseStateSampleSelect = Selector('#disease_state_sample');
  const collectionTimeSelect = Selector('#collection_time_point_relative');
  const collectionTimePointRelativeUnitSelect = Selector('#collection_time_point_relative_unit');
  const collectionTimePointRelativeUnitOption = collectionTimePointRelativeUnitSelect.find('option');
  const collectionTimeReferenceSelect = Selector('#collection_time_point_reference');
  const biomaterialProviderSelect = Selector('#biomaterial_provider');
  const sequencingRunIdSelect = Selector('#sequencing_run_id');
  const sequencingPlatformSelect = Selector('#sequencing_platform');
  const sequencingFacilitySelect = Selector('#sequencing_facility');
  const sequencingDateSelect = Selector('#sequencing_run_date');
  const sequencingKitSelect = Selector('#sequencing_kit');
  const sequencingFilesSelect = Selector('#sequencing_files');
  const sequencingFilesOption = sequencingFilesSelect.find('option');
  const tissueProcessingSelect = Selector('#tissue_processing');
  const cellPhenotypeSelect = Selector('#cell_phenotype');
  const singleCellSelect = Selector('#single_cell')
  const singleCellOption = singleCellSelect.find('option');
  const cellNumberSelect = Selector('#cell_number');
  const cellsPerReactionSelect = Selector('#cells_per_reaction')
  const cellStorageSelect = Selector('#cell_storage')
  const cellStorageOption = cellStorageSelect.find('option');
  const cellStorageOptionSelect = Selector('#ontology-select');
  const cellQualitySelect = Selector('#cell_quality');
  const cellIsolationSelect = Selector('#cell_isolation');
  const cellProcessingProtocolSelect = Selector('#cell_processing_protocol');
  const templateClassSelect = Selector('#template_class');
  const templateClassOption = templateClassSelect.find('option');
  const templateQualitySelect = Selector('#template_quality');
  const templateAmountSelect = Selector('#template_amount');
  const templateAmountUnitSelect = Selector('#template_amount_unit');
  const templateAmountUnitOption = templateAmountUnitSelect.find('option');
  const libraryGenerationMethodSelect = Selector('#library_generation_method');
  const libraryGenerationMethodOption = libraryGenerationMethodSelect.find('option');
  const libraryGenerationProtocolSelect = Selector('#library_generation_protocol');
  const libraryGenerationKitVersionSelect = Selector('#library_generation_kit_version');
  const completeSequencesSelect = Selector('#complete_sequences');
  const completeSequencesOption = completeSequencesSelect.find('option');
  const physicalLinkageSelect = Selector('#physical_linkage');
  const physicalLinkageOption = physicalLinkageSelect.find('option');
  const pcrTargetLocusSelect = Selector('#pcr_target_locus');
  const pcrTargetLocusOption = pcrTargetLocusSelect.find('option');
  const forwardTargetLocationSelect = Selector('#forward_pcr_primer_target_location');
  const reverseTargetLocationSelect = Selector('#reverse_pcr_primer_target_location');
  const sequencingDataIdSelect = Selector('#sequencing_data_id');


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

  await t.click(saveSubjectChangesSelect);
  await new Promise(r => setTimeout(r, 5000));

  await t
    .click(detailsSummarySubjectSelect);

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

 test('Add a Repertoire (with Sample) to the previously created Project and Check Back-end Values', async t => {
  await login(t,config.username,config.password,'CLICK','#home-login');

  await new Promise(r => setTimeout(r, 5000));
  const getPageUrl = ClientFunction(() => window.location.href);

  await t.navigateTo('./'+projectUuidUrl);
  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(repertoiresTabSelect)
    .click(repertoiresTabSelect)

  await t
    .click(newRepertoireSelect)
    .click(newRepertoireAddSelect)

  var sampleCid = await sampleIdSelect.getAttribute('id');
  sampleCid = sampleCid.split('_')[2];
console.log("Sample CID: " + sampleCid);

  const tissueSelect = Selector('#tissue_'+sampleCid);
  const tissueOption = tissueSelect.find('option');
  const tissueOptionSelect = Selector('#ontology-select');

  const cellSubsetSelect = Selector('#cell_subset_'+sampleCid);
  const cellSubsetOption = cellSubsetSelect.find('option');
  const cellSubsetOptionSelect = Selector('#ontology-select');

  const cellSpeciesSelect = Selector('#cell_species_'+sampleCid);
  const cellSpeciesOption = cellSpeciesSelect.find('option');
  const cellSpeciesOptionSelect = Selector('#ontology-select');

  const ontologySelectSelect = Selector('#ontology-search-input');

  await t
    .typeText(repertoireNameSelect, repertoireName)
    .typeText(repertoireDescriptionSelect, repertoireDescription)
    .click(subjectIdSelect)
    .click(subjectIdOption.withAttribute('value',subjectUuid))
    .typeText(sampleIdSelect,sampleId)
    .typeText(sampleTypeSelect,sampleType)
    .click(tissueSelect)
    .typeText(ontologySelectSelect.nth(0),tissue)
    .click(tissueOptionSelect.withText(tissue))
    .typeText(anatomicSiteSelect,anatomicSite)
    .typeText(diseaseStateSampleSelect,diseaseStateSample)
    .typeText(collectionTimeSelect,collectionTime)
    .typeText(collectionTimeReferenceSelect,collectionTimeReference)
    .typeText(biomaterialProviderSelect,biomaterialProvider)
    .typeText(sequencingRunIdSelect,sequencingRunId)
    .typeText(sequencingPlatformSelect,sequencingPlatform)
    .typeText(sequencingFacilitySelect,sequencingFacility)
    .typeText(sequencingDateSelect,sequencingDate)
    .typeText(sequencingKitSelect,sequencingKit)
    .click(collectionTimePointRelativeUnitSelect)
    .click(collectionTimePointRelativeUnitOption.withAttribute('value',collectionTimePointRelativeUnit))
    .click(sequencingFilesSelect)
    .click(sequencingFilesOption.withText(sequencingFiles))
    .typeText(tissueProcessingSelect,tissueProcessing)
    .scrollIntoView(templateQualitySelect)
    .click(cellSubsetSelect)
    .typeText(ontologySelectSelect.nth(1),cellSubset)
    .click(cellSubsetOptionSelect.withText(cellSubset))
    .typeText(cellPhenotypeSelect,cellPhenotype)
    .click(cellSpeciesSelect)
    .typeText(ontologySelectSelect.nth(2),cellSpecies)
    .click(cellSpeciesOptionSelect.withText(cellSpecies))
    .click(singleCellSelect)
    .click(singleCellOption.withAttribute('value',singleCell))
    .typeText(cellNumberSelect,cellNumber)
    .typeText(cellsPerReactionSelect,cellsPerReaction)
    .click(cellStorageSelect)
    .click(cellStorageOption.withAttribute('value',cellStorage))
    .typeText(cellQualitySelect,cellQuality)
    .typeText(cellIsolationSelect,cellIsolation)
    .typeText(cellProcessingProtocolSelect,cellProcessingProtocol)
    .click(templateClassSelect)
    .click(templateClassOption.withAttribute('value',templateClass))
    .typeText(templateQualitySelect,templateQuality)
    .typeText(templateAmountSelect,templateAmount)
    .click(templateAmountUnitSelect)
    .click(templateAmountUnitOption.withAttribute('value',templateAmountUnit))
    .click(libraryGenerationMethodSelect)
    .click(libraryGenerationMethodOption.withAttribute('value',libraryGenerationMethod))
    .typeText(libraryGenerationProtocolSelect,libraryGenerationProtocol)
    .typeText(libraryGenerationKitVersionSelect,libraryGenerationKitVersion)
    .click(completeSequencesSelect)
    .click(completeSequencesOption.withAttribute('value',completeSequences))
    .click(physicalLinkageSelect)
    .click(physicalLinkageOption.withAttribute('value',physicalLinkage))
    .click(pcrTargetLocusSelect)
    .click(pcrTargetLocusOption.withAttribute('value',pcrTargetLocus))
    .typeText(forwardTargetLocationSelect,forwardTargetLocation)
    .typeText(reverseTargetLocationSelect,reverseTargetLocation)
    .typeText(sequencingDataIdSelect,sequencingDataId)

  await t.click(saveRepertoireChangesSelect);
  await new Promise(r => setTimeout(r, 5000));

  await t
    .click(detailsSummaryRepertoireSelect);

  await new Promise(r => setTimeout(r, 10000));

  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var r = await tapisV2.getMetadataForType(token.access_token, projectUuid, 'repertoire');
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/name/repertoire',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var r = await tapisV3.sendRequest(requestSettings);
    //console.log(JSON.stringify(m, null, 2));
    await t.expect(r['status']).eql("success")
        .expect(r['result'].length).eql(1);
    r = r['result'];
  }

  repertoireUuid = r[0]["uuid"];
console.log("Repertoire UUID: " + repertoireUuid);

  sampleUuid = r[0]["value"]["sample"][0]["vdjserver_uuid"];
console.log("Sample UUID: " + sampleUuid);

  if (config.tapis_version == 2) {
    var s = await tapisV2.getMetadataForType(token.access_token, projectUuid, 'sample');
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/uuid/' + sampleUuid,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var s = await tapisV3.sendRequest(requestSettings);
    //console.log(JSON.stringify(m, null, 2));
    await t.expect(s['status']).eql("success")
        .expect(s['result'].length).eql(1);
    s = s['result'];
  }

  var rValue = r[0]["value"];
  var sValue = s[0]["value"];

  //check Repertoire values
  await t
    .expect(rValue["repertoire_name"]).eql(repertoireName)
    .expect(rValue["repertoire_description"]).eql(repertoireDescription)
    .expect(sValue["sample_id"]).eql(sampleId)
    .expect(sValue["sample_type"]).eql(sampleType)
    .expect(sValue["tissue"].label).eql(tissue)
    .expect(sValue["anatomic_site"]).eql(anatomicSite)
    .expect(sValue["disease_state_sample"]).eql(diseaseStateSample)
    .expect(sValue["collection_time_point_relative"]).eql(parseFloat(collectionTime))
    .expect(sValue["collection_time_point_relative_unit"].label).eql(collectionTimePointRelativeUnit)
    .expect(sValue["collection_time_point_reference"]).eql(collectionTimeReference)
    .expect(sValue["biomaterial_provider"]).eql(biomaterialProvider)
    .expect(sValue["sequencing_run_id"]).eql(sequencingRunId)
    .expect(sValue["sequencing_platform"]).eql(sequencingPlatform)
    .expect(sValue["sequencing_facility"]).eql(sequencingFacility)
    .expect(sValue["sequencing_run_date"]).eql(sequencingDate)
    .expect(sValue["sequencing_kit"]).eql(sequencingKit)
    .expect(sValue["tissue_processing"]).eql(tissueProcessing)
    .expect(sValue["cell_subset"].label).eql(cellSubset)
    .expect(sValue["cell_phenotype"]).eql(cellPhenotype)
    .expect(sValue["cell_species"].label).eql(cellSpecies)
    .expect(sValue["single_cell"]).ok()
    .expect(sValue["cell_number"]).eql(parseInt(cellNumber))
    .expect(sValue["cells_per_reaction"]).eql(parseInt(cellsPerReaction))
    .expect(sValue["cell_storage"]).notOk()
    .expect(sValue["cell_quality"]).eql(cellQuality)
    .expect(sValue["cell_isolation"]).eql(cellIsolation)
    .expect(sValue["cell_processing_protocol"]).eql(cellProcessingProtocol)
    .expect(sValue["template_class"]).eql(templateClass)
    .expect(sValue["template_quality"]).eql(templateQuality)
    .expect(sValue["template_amount"]).eql(parseFloat(templateAmount))
    .expect(sValue["template_amount_unit"].label).eql(templateAmountUnit)
    .expect(sValue["library_generation_method"]).eql(libraryGenerationMethod)
    .expect(sValue["library_generation_protocol"]).eql(libraryGenerationProtocol)
    .expect(sValue["library_generation_kit_version"]).eql(libraryGenerationKitVersion)
    .expect(sValue["complete_sequences"]).eql(completeSequences)
    .expect(sValue["physical_linkage"]).eql(physicalLinkage)
    .expect(sValue["pcr_target"][0]["pcr_target_locus"]).eql(pcrTargetLocus)
    .expect(sValue["pcr_target"][0]["forward_pcr_primer_target_location"]).eql(forwardTargetLocation)
    .expect(sValue["pcr_target"][0]["reverse_pcr_primer_target_location"]).eql(reverseTargetLocation)

  if(sequencingFiles == 'null') await t.expect(sValue["sequencing_files"]["filename"] == null).ok()
  else await t.expect(sValue["sequencingFiles"]["filename"] == sequencingFiles).ok()
 });

 test('View existing Repertoire in Summary and Details view mode and confirm the correct values are shown', async t => {
  const tissueSelect = Selector('#tissue_' + sampleUuid);
  const cellSubsetSelect = Selector('#cell_subset_' + sampleUuid);
  const cellSpeciesSelect = Selector('#cell_species_' + sampleUuid);

  //Summary view selectors
  const repertoireNameText = Selector('div').withText(repertoireName).exists;
  const repertoireDescriptionText = Selector('div').withText(repertoireDescription).exists;
  const subjectIdText = Selector('div').withText(subjectId).exists;
  const sexSpeciesText = Selector('div').withText(sex + '/' + species).exists;
  const raceEthnicityText = Selector('div').withText(race + '/'+ ethnicity).exists;
  const ageText = Selector('div').withText(ageMin + '-' + ageMax + ' ' + ageUnit).exists;
  
  const sampleIdText = Selector('div').withText(sampleId).exists;
  const tissueText = Selector('div').withText(tissue.toLowerCase()).exists;
  const diseaseStateText = Selector('div').withText(diseaseStateSample).exists;
  const singleCellText = Selector('div').withText(singleCell).exists;
  const cellSubsetText = Selector('div').withText(cellSubset).exists;
  const templateText = Selector('div').withText(templateClass).exists;
  const targetLociText = Selector('div').withText(pcrTargetLocus).exists;

  //Details view selectors
  const repertoireNameDetailsText = Selector('#repertoire_name_' + repertoireUuid).withText(repertoireName).exists;
  const repertoireDescriptionDetailsText = Selector('#repertoire_description').withText(repertoireDescription).exists;
  const subjectIdDetailsText = Selector('#subject').withText(subjectId).exists;
  const sampleIdDetailsText = Selector('#sample_id_' + sampleUuid).withText(sampleId).exists;

  await login(t,config.username,config.password,'CLICK','#home-login');
  await new Promise(r => setTimeout(r, 5000));

  await t.navigateTo('./'+projectUuidUrl);
  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(repertoiresTabSelect)
    .click(repertoiresTabSelect)

  await new Promise(r => setTimeout(r, 5000));

  //Summary view checks
  await t
    .expect(repertoireNameText).ok()
    .expect(repertoireDescriptionText).ok()
    .expect(subjectIdText).ok()
    .expect(sexSpeciesText).ok()
    .expect(raceEthnicityText).ok()
    .expect(ageText).ok()
    .expect(sampleIdText).ok()
    .expect(tissueText).ok()
    .expect(diseaseStateText).ok()
    .expect(singleCellText).ok()
    .expect(cellSubsetText).ok()
    .expect(templateText).ok()
    .expect(targetLociText).ok()

  await t
    .click(detailsSummaryRepertoireSelect);

  await new Promise(r => setTimeout(r, 5000));

  //Details view checks
  await t
    .expect(repertoireNameSelect.value).eql(repertoireName)
    .expect(repertoireDescriptionSelect.value).eql(repertoireDescription)
    .expect(subjectIdSelect.innerText).eql(subjectId)
    .expect(sexSpeciesText).ok()
    .expect(raceEthnicityText).ok()
    .expect(ageText).ok()
    .expect(sampleIdSelect.value).eql(sampleId)
    .expect(sampleTypeSelect.value).eql(sampleType)
    .expect(tissueSelect.getAttribute('value')).contains(tissue)
    .expect(anatomicSiteSelect.value).eql(anatomicSite)
    .expect(diseaseStateSampleSelect.value).eql(diseaseStateSample)
    .expect(collectionTimeSelect.value).eql(collectionTime)
    .expect(collectionTimePointRelativeUnitSelect.value).eql(collectionTimePointRelativeUnit)
    .expect(collectionTimeReferenceSelect.value).eql(collectionTimeReference)
    .expect(biomaterialProviderSelect.value).eql(biomaterialProvider)
    .expect(sequencingRunIdSelect.value).eql(sequencingRunId)
    .expect(sequencingPlatformSelect.value).eql(sequencingPlatform)
    .expect(sequencingFacilitySelect.value).eql(sequencingFacility)
    .expect(sequencingDateSelect.value).eql(sequencingDate)
    .expect(sequencingKitSelect.value).eql(sequencingKit)
    .expect(sequencingFilesSelect.value).eql(sequencingFiles)
    .expect(tissueProcessingSelect.value).eql(tissueProcessing)
    .expect(cellSubsetSelect.getAttribute('value')).contains(cellSubset)
    .expect(cellPhenotypeSelect.value).eql(cellPhenotype)
    .expect(cellSpeciesSelect.getAttribute('value')).contains(cellSpecies)
    .expect(singleCellSelect.value).eql(singleCell)
    .expect(cellNumberSelect.value).eql(cellNumber)
    .expect(cellsPerReactionSelect.value).eql(cellsPerReaction)
    .expect(cellStorageSelect.value).eql(cellStorage)
    .expect(cellQualitySelect.value).eql(cellQuality)
    .expect(cellIsolationSelect.value).eql(cellIsolation)
    .expect(cellProcessingProtocolSelect.value).eql(cellProcessingProtocol)
    .expect(templateClassSelect.value).eql(templateClass)
    .expect(templateQualitySelect.value).eql(templateQuality)
    .expect(templateAmountSelect.value).eql(templateAmount)
    .expect(templateAmountUnitSelect.value).eql(templateAmountUnit)
    .expect(libraryGenerationMethodSelect.value).eql(libraryGenerationMethod)
    .expect(libraryGenerationProtocolSelect.value).eql(libraryGenerationProtocol)
    .expect(libraryGenerationKitVersionSelect.value).eql(libraryGenerationKitVersion)
    .expect(completeSequencesSelect.value).eql(completeSequences)
    .expect(physicalLinkageSelect.value).eql(physicalLinkage)
    .expect(pcrTargetLocusSelect.value).eql(pcrTargetLocus)
    .expect(forwardTargetLocationSelect.value).eql(forwardTargetLocation)
    .expect(reverseTargetLocationSelect.value).eql(reverseTargetLocation)
    .expect(sequencingDataIdSelect.value).eql(sequencingDataId)
 });

 test('Duplicate the Repertoire, change select values, and confirm back-end changes.', async t => {
  await login(t,config.username,config.password,'CLICK','#home-login');

  await new Promise(r => setTimeout(r, 5000));
  await t.navigateTo('./'+projectUuidUrl);

  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(repertoiresTabSelect)
    .click(repertoiresTabSelect)

  await t
    .click(repertoireDropdownSelect.withAttribute('name',repertoireUuid))
    .click(repertoireDropdownDuplicateSelect.withAttribute('name',repertoireUuid))

  var sampleCid = await sampleIdSelect.getAttribute('id');
  sampleCid = sampleCid.split('_')[2];
console.log("Duplicate Sample CID: " + sampleCid);
  var duplicateSampleIdSelect = Selector('#sample_id_' + sampleCid);
  const cellSubsetSelect = Selector('#cell_subset_'+sampleCid);
  const cellSubsetOption = cellSubsetSelect.find('option');
  const cellSubsetOptionSelect = Selector('#ontology-select');
  const ontologySelectSelect = Selector('#ontology-search-input');
  
  const repertoireNameD = repertoireName + '-2';
  const sampleIdD = sampleId + '-2';
  const cellSubsetD = "plasma cell";
  const singleCellD = "false";
  const libraryGenerationMethodD = "RT(RHP)+PCR";
  const reverseTargetLocationD = reverseTargetLocation + "-2"; 

  await t
    .typeText(repertoireNameSelect, repertoireNameD, {replace: true})
    .typeText(duplicateSampleIdSelect, sampleIdD, {replace:true})
    .click(cellSubsetSelect)
    .typeText(ontologySelectSelect.nth(1),cellSubsetD, {replace:true})
    .click(cellSubsetOptionSelect.withText(cellSubsetD))
    .click(singleCellSelect)
    .click(singleCellOption.withAttribute('value',singleCellD))
    .click(libraryGenerationMethodSelect)
    .click(libraryGenerationMethodOption.withAttribute('value',libraryGenerationMethodD))
    .typeText(reverseTargetLocationSelect,reverseTargetLocationD, {replace:true})

  await t.click(saveRepertoireChangesSelect);
  await new Promise(r => setTimeout(r, 5000));

  await t
    .click(detailsSummaryRepertoireSelect);

  await new Promise(r => setTimeout(r, 10000));

  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var r = await tapisV2.getMetadataForType(token.access_token, projectUuid, 'repertoire');
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/name/repertoire',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var r = await tapisV3.sendRequest(requestSettings);
    //console.log(JSON.stringify(m, null, 2));
    await t.expect(r['status']).eql("success")
        .expect(r['result'].length).eql(2);
    r = r['result'];
  }

  dRepertoireUuid = "";
  var dSampleUuid = "";
  var dRepertoireValue; 
  if(r[0]["uuid"] == repertoireUuid) {
    dRepertoireUuid = r[1]["uuid"];
    dRepertoireValue = r[1]["value"];
  } else {
    dRepertoireUuid = r[0]["uuid"];
    dRepertoireValue = r[0]["value"];
  }

  dSampleUuid = dRepertoireValue["sample"][0]["vdjserver_uuid"];
console.log("Duplicate Sample UUID: " + dSampleUuid);

  if (config.tapis_version == 2) {
    var s = await tapisV2.getMetadataForType(token.access_token, projectUuid, 'sample');
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/uuid/' + dSampleUuid,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var s = await tapisV3.sendRequest(requestSettings);
    //console.log(JSON.stringify(m, null, 2));
    await t.expect(s['status']).eql("success")
        .expect(s['result'].length).eql(1);
    s = s['result'];
  }

  var dSampleValue = s[0]["value"];
  
  //check Back-end values
  await t
    .expect(dRepertoireValue["repertoire_name"]).eql(repertoireName+'-2')
    .expect(dSampleValue["sample_id"]).eql(sampleId+'-2')

 });

 test('Delete the duplicated Repertoire and confirm the correct one was deleted on the Back-end', async t => {
  await login(t,config.username,config.password,'CLICK','#home-login');

  await new Promise(r => setTimeout(r, 5000));
  await t.navigateTo('./'+projectUuidUrl);

  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(repertoiresTabSelect)
    .click(repertoiresTabSelect)

  await t
    .click(repertoireDropdownSelect.withAttribute('name',dRepertoireUuid))
    .click(repertoireDropdownDeleteSelect.withAttribute('name',dRepertoireUuid))

  await t.click(saveRepertoireChangesSelect);
  await new Promise(r => setTimeout(r, 10000));

  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var r = await tapisV2.getProjectMetadata(token.access_token, subjectUuid);
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/name/repertoire',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var r = await tapisV3.sendRequest(requestSettings);
    //console.log(JSON.stringify(m, null, 2));
    await t.expect(r['status']).eql("success")
        .expect(r['result'].length).eql(1);
    r = r['result'][0];
  }

  //confirm the remaining Repertoire is the correct one
  await t
    .expect(r["uuid"]).eql(repertoireUuid)

  //confirm the correct Repertoire was deleted

 });

 test('Duplicate a Sample for the original Repertoire, change select values, and check against the Back-end', async t => {
  await login(t,config.username,config.password,'CLICK','#home-login');

  await new Promise(r => setTimeout(r, 5000));
  await t.navigateTo('./'+projectUuidUrl);

  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(repertoiresTabSelect)
    .click(repertoiresTabSelect)

  await t
    .click(sampleDropdownSelect)
    .click(sampleDropdownDuplicateSelect.withAttribute('name',sampleUuid))
    .typeText(sampleIdSelect,sampleId + "-duplicate",{replace: true})

  var dSampleCid = await sampleIdSelect.getAttribute('id');
  dSampleCid = dSampleCid.split('_')[2];
  const tissueSelect = Selector('#tissue_'+dSampleCid);
  const tissueOption = tissueSelect.find('option');
  const tissueOptionSelect = Selector('#ontology-select');
  const ontologySelectSelect = Selector('#ontology-search-input');

  const tissueD = "hair of scalp";
  const singleCellD = "false";
  const pcrTargetLocusD = "TRG";
  const pcrTargetLocusSelect = Selector('#pcr_target_locus');
  const pcrTargetLocusOption = pcrTargetLocusSelect.find('option');

  await t
    .click(tissueSelect)
    .typeText(ontologySelectSelect.nth(0),tissueD, {replace:true})
    .click(tissueOptionSelect.withText(tissueD))
    .click(singleCellSelect)
    .click(singleCellOption.withAttribute('value',singleCellD))
    .click(pcrTargetLocusSelect)
    .click(pcrTargetLocusOption.withAttribute('value',pcrTargetLocusD))

  await t.click(saveRepertoireChangesSelect);

  await new Promise(r => setTimeout(r, 5000));

  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var m = await tapisV2.getProjectMetadata(token.access_token, subjectUuid);
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/uuid/' + repertoireUuid,
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

  //determine the UUID of the duplicate Sample
  if(m["value"]["sample"][0]["vdjserver_uuid"] == sampleUuid)
    dSampleUuid = m["value"]["sample"][1]["vdjserver_uuid"];
  else
    dSampleUuid = m["value"]["sample"][0]["vdjserver_uuid"];

  //get the value for the duplicate Sample
  if (config.tapis_version == 2) {
    var s = await tapisV2.getMetadataForType(token.access_token, projectUuid, 'sample');
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/uuid/' + dSampleUuid,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var s = await tapisV3.sendRequest(requestSettings);
    //console.log(JSON.stringify(m, null, 2));
    await t.expect(s['status']).eql("success")
        .expect(s['result'].length).eql(1);
    s = s['result'];
  }

  var dSampleValue = s[0]["value"];

  //check Sample values
  await t
    .expect(dSampleValue["sample_id"]).eql(sampleId + "-duplicate")
    .expect(dSampleValue["sample_type"]).eql(sampleType)
    .expect(dSampleValue["tissue"].label).eql(tissueD)
    .expect(dSampleValue["anatomic_site"]).eql(anatomicSite)
    .expect(dSampleValue["disease_state_sample"]).eql(diseaseStateSample)
    .expect(dSampleValue["collection_time_point_relative"]).eql(parseFloat(collectionTime))
    .expect(dSampleValue["collection_time_point_relative_unit"].label).eql(collectionTimePointRelativeUnit)
    .expect(dSampleValue["collection_time_point_reference"]).eql(collectionTimeReference)
    .expect(dSampleValue["biomaterial_provider"]).eql(biomaterialProvider)
    .expect(dSampleValue["sequencing_run_id"]).eql(sequencingRunId)
    .expect(dSampleValue["sequencing_platform"]).eql(sequencingPlatform)
    .expect(dSampleValue["sequencing_facility"]).eql(sequencingFacility)
    .expect(dSampleValue["sequencing_run_date"]).eql(sequencingDate)
    .expect(dSampleValue["sequencing_kit"]).eql(sequencingKit)
    .expect(dSampleValue["tissue_processing"]).eql(tissueProcessing)
    .expect(dSampleValue["cell_subset"].label).eql(cellSubset)
    .expect(dSampleValue["cell_phenotype"]).eql(cellPhenotype)
    .expect(dSampleValue["cell_species"].label).eql(cellSpecies)
    .expect(dSampleValue["single_cell"]).notOk()
    .expect(dSampleValue["cell_number"]).eql(parseInt(cellNumber))
    .expect(dSampleValue["cells_per_reaction"]).eql(parseInt(cellsPerReaction))
    .expect(dSampleValue["cell_storage"]).notOk()
    .expect(dSampleValue["cell_quality"]).eql(cellQuality)
    .expect(dSampleValue["cell_isolation"]).eql(cellIsolation)
    .expect(dSampleValue["cell_processing_protocol"]).eql(cellProcessingProtocol)
    .expect(dSampleValue["template_class"]).eql(templateClass)
    .expect(dSampleValue["template_quality"]).eql(templateQuality)
    .expect(dSampleValue["template_amount"]).eql(parseFloat(templateAmount))
    .expect(dSampleValue["template_amount_unit"].label).eql(templateAmountUnit)
    .expect(dSampleValue["library_generation_method"]).eql(libraryGenerationMethod)
    .expect(dSampleValue["library_generation_protocol"]).eql(libraryGenerationProtocol)
    .expect(dSampleValue["library_generation_kit_version"]).eql(libraryGenerationKitVersion)
    .expect(dSampleValue["complete_sequences"]).eql(completeSequences)
    .expect(dSampleValue["physical_linkage"]).eql(physicalLinkage)
    .expect(dSampleValue["pcr_target"][0]["pcr_target_locus"]).eql(pcrTargetLocusD)
    .expect(dSampleValue["pcr_target"][0]["forward_pcr_primer_target_location"]).eql(forwardTargetLocation)
    .expect(dSampleValue["pcr_target"][0]["reverse_pcr_primer_target_location"]).eql(reverseTargetLocation)
 });

 test('Delete the duplicated Sample and confirm the correct one was deleted on the Back-end', async t => {
  await login(t,config.username,config.password,'CLICK','#home-login');

  await new Promise(r => setTimeout(r, 5000));
  await t.navigateTo('./'+projectUuidUrl);

  await new Promise(r => setTimeout(r, 10000));

  await t
    .scrollIntoView(repertoiresTabSelect)
    .click(repertoiresTabSelect)

  await t
    //.click(sampleDropdownSelect.withText(sampleId+'-duplicate'))
    .click(sampleDropdownSelect)
    .click(sampleDropdownDeleteSelect.withAttribute('name',dSampleUuid))

  await t.click(saveRepertoireChangesSelect);

  await new Promise(r => setTimeout(r, 10000));

  //confirm there is just 1 Sample
  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var sp = await tapisV2.getProjectMetadata(token.access_token, subjectUuid);
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/name/sample_processing',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var sp = await tapisV3.sendRequest(requestSettings);
    //console.log(JSON.stringify(m, null, 2));
    await t.expect(sp['status']).eql("success")
        .expect(sp['result'].length).eql(1);
    sp = sp['result'][0];
  }

  //confirm the remaining Sample is the correct one
  await t
    .expect(sp["uuid"]).eql(sampleUuid)
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
