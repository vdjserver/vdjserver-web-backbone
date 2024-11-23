//
// projectRepertoires.js
// Project Repertoires Page Test Cases
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
var repertoireUuid = "";
var dRepertoireUuid = "";
var sampleUuid = "";
var dSampleUuid="";

fixture('Project Repertoires Page Test Cases')
  .page(config.url);

  const loginButtonId = '#home-login';

  //Append a random number less than 1,000,000 to subjectId
  var subjectId = 'Subject ID ' + Math.floor(Math.random()*1000000);
  //console.log("\nSubject ID: " + subjectId);

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
  const projectSubjectDropdownId = '#project-subject-dropdown';
  const synthetic = "true";
  const species = 'Macaca mulatta';
  const strain = 'abcde'
  const sex = 'pooled';
  const ageType = 'range';
  const ageMin = '3';
  const ageMax = '9';
  const ageUnit = 'day';
  const ageUnitDisplay = 'day(s)';
  const ageEvent = 'event';
  const race = 'race';
  const ancestryPopulation = 'ancestry';
  const ethnicity = 'ethnicity';
  const linkedSubjects = 'null';
  const linkType = 'linkType';

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

  //Repertoire Values
  const repertoireFormIdBase = "#edit-repertoire-form_";
  const repertoireName = "Repertoire Name";
  const repertoireDescription = "Repertoire Description";
  const repertoireDescriptionId = "#repertoire_description";
  const repertoireSubjectId = "null";
  const tissueIdBaseId = "#tissue_";
  const repertoireDropdownId = "#project-repertoires-dropdown";
  const subjectBaseId = "#subject";
  const sexSpeciesDetailsId =  "#sex_species_details";
  const raceEthnicityDetailsId = "#race_ethnicity_details";
  const ageDetailsId = "#age_details";
  const subjectIdValidationMessage = "Please select a Subject ID.";
  const sampleIdValidationMessage = "Please enter a unique, non-blank ID.";
  const singleCellValidationMessage = "Please enter a valid Single Cell value.";
  const cellStorageValidationMessage = "Please enter a valid Cell Storage value.";
  const pcrTargetLocusValidationMessage = "Please select a non-null PCR Target Locus.";
  const collectionTimeValidationMessage = "Please enter a valid Collection Time Point Relative number.";
  const collectionTimePointRelativeUnitValidationMessage = "Please enter a Collection Time Point Relative Unit.";
  const templateAmountValidationMessage = "Please enter a valid Template Amount number ≥ 0.";
  const templateAmountUnitValidationMessage = "Please enter a Template Amount Unit.";
  const cellNumberValidationMessage = "Please enter a valid Cell Number integer ≥ 0.";
  const cellsPerReactionValidationMessage = "Please enter a valid Cells Per Reaction integer ≥ 0.";
  const sequencingRunDateValidationMessage = "Please enter a valid Sequencing Run Date (YYYY-MM-DD).";
  const sequencingFilesDataIdValidationMessage = "Please enter Seq. Files or a non-blank Seq. Data ID, not both.";

  //Sample Values
  const sampleDropdownId = "#project-sample-dropdown";
  const tissueId = "#tissue_";
  const cellSubsetId = "#cell_subset_";
  const cellSpeciesId = "#cell_species_";
  const sampleId = "Sample ID_" + Math.floor(Math.random()*1000000);
  const sampleType = "Sample Type";
  const tissue = "epithalamus";
  const anatomicSite = "Anatomic Site";
  const diseaseStateSample = "Disease State Sample";
  const collectionTime = "1234";
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

  //Files Values
  const filesPath = "./uploads/";
  const FastaSequencesFile = "VectorBase-64_Aaquasalis_ESTs.fasta";

  //General Selectors
  const navbarStatsIconSelect = Selector('#navbar-stats-icon');
  const createProjectSelect = Selector('#create-project');
  const subjectsTabSelect = Selector('#subjects-tab');
  const repertoiresTabSelect = Selector('#repertoires-tab');
  const filesTabSelect = Selector('#files-tab');
  const detailsSummarySubjectSelect = Selector('#project-subjects-details-summary');
  const detailsSummaryRepertoireSelect = Selector('#project-repertoires-details-summary');
  const sortRepertoireDropdownSelect = Selector('#project-repertoires-sort-button');
  const sortRepertoireDropdownOptionSelect = Selector('#project-repertoires-sort-select');
  const newSubjectSelect = Selector('#project-subjects-new-subject');
  const saveSubjectChangesSelect = Selector('#project-subjects-save-changes');
  const newRepertoireSelect = Selector('#project-repertoires-add');
  const newRepertoireAddSelect = Selector('#project-repertoires-add-repertoire');
  const revertRepertoireChangesSelect = Selector('#project-repertoires-revert-changes');
  const saveRepertoireChangesSelect = Selector('#project-repertoires-save-changes');
  const repertoireDropdownSelect = Selector(repertoireDropdownId);
  const repertoireDropdownDetailsSummarySelect = Selector('#project-repertoire-show-summary');
  const repertoireDropdownEditSelect = Selector('#project-repertoire-edit-repertoire');
  const repertoireDropdownDuplicateSelect = Selector('#project-repertoire-duplicate-repertoire');
  const repertoireDropdownDeleteSelect = Selector('#project-repertoire-delete-repertoire');
  const repertoireDropdownAddSampleSelect = Selector('#project-sample-add-sample');
  const sampleDropdownSelect = Selector(sampleDropdownId);
  const sampleAddDropdownSelect = Selector('#project-samples-add');
  const sampleDropdownDuplicateSelect = Selector('#project-sample-duplicate-sample');
  const sampleDropdownDeleteSelect = Selector('#project-sample-delete-sample');
  const ontologyInputSelect = Selector('#ontology-search-input');

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
  const repertoireNameBaseId = '#repertoire_name_';
  const repertoireDescriptionSelect = Selector('#repertoire_description');
  const subjectIdSelect = Selector('#subject');
  const subjectIdOption = subjectIdSelect.find('option');
  const sampleFormSelect = Selector('.project-sample-form');
  const repertoireFormSelect = Selector('.project-repertoire-form');
  const invalidFeedbackSelect = Selector('.invalid-feedback');

  //Sample Field Selectors
  const sampleIdBaseId = "#sample_id_";
  const sampleIdSelect = Selector('input').withAttribute("name","sample_id");
  const sampleTypeSelect = Selector('#sample_type');
  const cellSubsetBaseId = "#cell_subset_";
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

  //Files Selectors
  const uploadFilesSelect = Selector('#project-files-upload');
  const uploadFilesComputerSelect = Selector('#project-files-upload-computer');
  const uploadFilesComputerDialogSelect = Selector('#file-upload-from-computer-dialog');
  const addFilesSelect = Selector('#add-upload-files');
  const addStartUploadSelect = Selector('#start-upload-button');
  const doneUploadSelect = Selector('#done-upload-button');

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
    .typeText(ontologyInputSelect,diseaseDiagnosis)
    .click(diseaseDiagnosisOptionSelect.withExactText(diseaseDiagnosis))
    .typeText(diseaseLengthSelect,diseaseLength)
    .typeText(diseaseStageSelect,diseaseStage)
    .typeText(studyGroupDescriptionSelect,studyGroupDescription)
    .typeText(priorTherapiesSelect,priorTherapies)
    .typeText(immunogenSelect,immunogen)
    .typeText(interventionSelect,intervention)
    .typeText(medicalHistorySelect,medicalHistory)
    .click(saveSubjectChangesSelect)
    .wait(config.save_timeout)
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

 test('Add a Repertoire (with Sample) to the previously created Project and Check Back-end Values', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  const getPageUrl = ClientFunction(() => window.location.href);

  await t.navigateTo('./'+projectUuidUrl);

  await t
    .click(repertoiresTabSelect)
    .click(newRepertoireSelect)
    .click(newRepertoireAddSelect)

  var repertoireCid = await repertoireFormSelect.find(repertoireDropdownId).getAttribute('name');
  var sampleCid = await sampleFormSelect.find(sampleDropdownId).getAttribute('name');

  const tissueSelect = Selector(tissueId+sampleCid);
  const tissueOption = tissueSelect.find('option');

  const cellSubsetSelect = Selector(cellSubsetId+sampleCid);
  const cellSubsetOption = cellSubsetSelect.find('option');

  const cellSpeciesSelect = Selector(cellSpeciesId+sampleCid);
  const cellSpeciesOption = cellSpeciesSelect.find('option');


  //Expect the created Subject to exist in the Subject ID drop-down
  await t
    .expect(subjectIdOption.count).eql(2)
    .expect(subjectIdOption.withAttribute('value',subjectUuid).exists).ok()

  await t
    .typeText(repertoireNameBaseId+repertoireCid, repertoireName)
    .typeText(repertoireDescriptionSelect, repertoireDescription)
    .click(subjectIdSelect)
    .click(subjectIdOption.withAttribute('value',subjectUuid))
    .typeText(Selector(sampleIdBaseId + sampleCid),sampleId)
    .typeText(sampleTypeSelect,sampleType)
    .click(tissueSelect)
    .typeText(ontologyInputSelect.nth(0),tissue)
    .click(ontologySelectSelect.withExactText(tissue))
    .click(navbarStatsIconSelect)
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
    .click(sequencingFilesOption.withExactText(sequencingFiles))
    .typeText(tissueProcessingSelect,tissueProcessing)
    .click(cellSubsetSelect)
    .typeText(ontologyInputSelect.nth(1),cellSubset)
    .click(ontologySelectSelect.withExactText(cellSubset))
    .typeText(cellPhenotypeSelect,cellPhenotype)
    .click(cellSpeciesSelect)
    .typeText(ontologyInputSelect.nth(2),cellSpecies)
    .click(ontologySelectSelect.withExactText(cellSpecies))
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
    .click(saveRepertoireChangesSelect)
    .wait(config.save_timeout)
    .click(detailsSummaryRepertoireSelect)

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
    await t.expect(r['status']).eql("success")
        .expect(r['result'].length).eql(1);
    r = r['result'];
  }

  repertoireUuid = r[0]["uuid"];
  //console.log("Repertoire UUID: " + repertoireUuid);

  sampleUuid = r[0]["value"]["sample"][0]["vdjserver_uuid"];
  //console.log("Sample UUID: " + sampleUuid);

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
    await t.expect(s['status']).eql("success")
        .expect(s['result'].length).eql(1);
    s = s['result'];
  }

  var rValue = r[0]["value"];
  var sValue = s[0]["value"];

  //Check Repertoire values
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
  else await t.expect(sValue["sequencing_files"]["filename"] == sequencingFiles).ok()
 });

 test('View existing Repertoire in Summary and Details view mode and confirm the correct values are shown', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t.click(repertoiresTabSelect);

  //Summary view selectors
  const repertoireNameTextUntrimmed = await Selector('div').withExactText("Repertoire Name: " + repertoireName).innerText;
  const repertoireDescriptionTextUntrimmed = await Selector('div').withExactText("Repertoire Description: " + repertoireDescription).innerText;
  const subjectIdTextUntrimmed = await Selector('div').withExactText("Subject ID: " + subjectId).innerText;
  const sexSpeciesTextUntrimmed = await Selector('div').withExactText("Sex/Species: " + sex + '/' + species).innerText;
  const raceEthnicityTextUntrimmed = await Selector('div').withExactText("Race/Ethnicity: " + race + '/'+ ethnicity).innerText;
  const ageTextUntrimmed = await Selector('div').withExactText("Age: " + ageMin + '-' + ageMax + ' ' + ageUnit + "(s)").innerText;
  const sampleIdTextUntrimmed = await Selector('div').withExactText("Sample ID: " + sampleId).innerText;
  const tissueText = Selector('div').withText(tissue.toLowerCase()).exists; //We don't know the exact Ontology
  const diseaseStateSampleTextUntrimmed = await Selector('div').withExactText("Disease State: " + diseaseStateSample).innerText;
  const singleCellTextUntrimmed = await Selector('div').withExactText("Single Cell: " + singleCell).innerText;
  const cellSubsetText = Selector('div').withText(cellSubset).exists; //We don't know exact the Ontology
  const templateTextUntrimmed = await Selector('div').withExactText("Template: " + templateClass).innerText;
  const targetLociTextUntrimmed = await Selector('div').withExactText("Target Loci: " + pcrTargetLocus).innerText;

  const repertoireNameTextTrimmed = await repertoireNameTextUntrimmed.toString().trim();
  const repertoireDescriptionTextTrimmed = await repertoireDescriptionTextUntrimmed.toString().trim();
  const subjectIdTextTrimmed = await subjectIdTextUntrimmed.toString().trim();
  const sexSpeciesTextTrimmed = await sexSpeciesTextUntrimmed.toString().trim();
  const raceEthnicityTextTrimmed = await raceEthnicityTextUntrimmed.toString().trim();
  const ageTextTrimmed = await ageTextUntrimmed.toString().trim();
  const sampleIdTextTrimmed = await sampleIdTextUntrimmed.toString().trim();
  const diseaseStateSampleTextTrimmed = await diseaseStateSampleTextUntrimmed.toString().trim();
  const singleCellTextTrimmed = await singleCellTextUntrimmed.toString().trim();
  const templateTextTrimmed = await templateTextUntrimmed.toString().trim();
  const targetLociTextTrimmed = await targetLociTextUntrimmed.toString().trim();

  //Details view selectors
  const repertoireNameDetailsSelect = Selector(repertoireNameBaseId + repertoireUuid);
  const subjectIdDetailsSelect = Selector(repertoireFormIdBase + repertoireUuid).find(subjectBaseId);
  const subjectIdDetailsOption = subjectIdDetailsSelect.find('option').withAttribute('selected');
  const sexSpeciesDetailsText = Selector(repertoireFormIdBase + repertoireUuid).find(sexSpeciesDetailsId).withAttribute('value',sex + '/' + species).exists;
  const raceEthnicityDetailsText = Selector(repertoireFormIdBase + repertoireUuid).find(raceEthnicityDetailsId).withAttribute('value',race + '/'+ ethnicity).exists;
  const ageDetailsText = Selector(repertoireFormIdBase + repertoireUuid).find(ageDetailsId).withAttribute('value',ageMin + '-' + ageMax + ' ' + ageUnitDisplay).exists;
  const sampleIdDetailsSelect = Selector(sampleIdBaseId + sampleUuid);
  const tissueSelect = Selector(tissueId + sampleUuid);
  const cellSubsetSelect = Selector(cellSubsetId + sampleUuid);
  const cellSpeciesSelect = Selector(cellSpeciesId + sampleUuid);

  //Summary view checks
  await t
    .expect(repertoireNameTextTrimmed).eql("Repertoire Name: " + repertoireName)
    .expect(repertoireDescriptionTextTrimmed).eql("Repertoire Description: " + repertoireDescription)
    .expect(subjectIdTextTrimmed).eql("Subject ID: " + subjectId)
    .expect(sexSpeciesTextTrimmed).eql("Sex/Species: " + sex + '/' + species)
    .expect(raceEthnicityTextTrimmed).eql("Race/Ethnicity: " + race + '/'+ ethnicity)
    .expect(ageTextTrimmed).eql("Age: " + ageMin + '-' + ageMax + ' ' + ageUnit + "(s)")
    .expect(sampleIdTextTrimmed).eql("Sample ID: " + sampleId)
    .expect(tissueText).ok()
    .expect(diseaseStateSampleTextTrimmed).eql("Disease State: " + diseaseStateSample)
    .expect(singleCellTextTrimmed).eql("Single Cell: " + singleCell)
    .expect(cellSubsetText).ok()
    .expect(templateTextTrimmed).eql("Template: " + templateClass)
    .expect(targetLociTextTrimmed).eql("Target Loci: " + pcrTargetLocus)

  await t
    .click(detailsSummaryRepertoireSelect)

  const subjectIdDetailsText = await subjectIdDetailsOption.innerText;

  //Details view checks
  await t
    .expect(Selector(repertoireNameBaseId+repertoireUuid).value).eql(repertoireName)
    .expect(repertoireDescriptionSelect.value).eql(repertoireDescription)

    .expect(subjectIdDetailsText.toString()).eql(subjectId)
    .expect(sexSpeciesDetailsText).ok()
    .expect(raceEthnicityDetailsText).ok()
    .expect(ageDetailsText).ok()

    .expect(sampleIdDetailsSelect.value).eql(sampleId)
    .expect(sampleTypeSelect.value).eql(sampleType)
    .expect(tissueSelect.getAttribute('value')).contains(tissue) //We don't know the exact ontology
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
    .expect(cellSubsetSelect.getAttribute('value')).contains(cellSubset) //We don't know the exact ontology
    .expect(cellPhenotypeSelect.value).eql(cellPhenotype)
    .expect(cellSpeciesSelect.getAttribute('value')).contains(cellSpecies) //We don't know the exact ontology
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

 test('View existing Repertoire in Summary view mode, edit, revert, and confirm the correct values are still shown', async t => {
  await login(t,config.username,config.password,'CLICK','#home-login');

  await t
    .navigateTo('./'+projectUuidUrl)
    .click(repertoiresTabSelect)

  //Temporary Values and Selectors
  const repertoireNameR = "Repertoire Name R";
  const repertoireDescriptionR = "Repertoire Description R";
  const sampleIdR = 'Sample ID R';
  const tissueR = "hair of scalp";
  const tissueSelect = Selector(tissueIdBaseId + sampleUuid);
  const tissueOption = tissueSelect.find('option');

  const repertoireNameTextUntrimmed = await Selector('div').withExactText("Repertoire Name: " + repertoireName).innerText;
  const repertoireDescriptionTextUntrimmed = await Selector('div').withExactText("Repertoire Description: " + repertoireDescription).innerText;
  const sampleIdTextUntrimmed = await Selector('div').withExactText("Sample ID: " + sampleId).innerText;
  const tissueText = Selector('div').withText(tissue.toLowerCase()).exists; //We don't know the exact Ontology

  const repertoireNameTextTrimmed = await repertoireNameTextUntrimmed.toString().trim();
  const repertoireDescriptionTextTrimmed = await repertoireDescriptionTextUntrimmed.toString().trim();
  const sampleIdTextTrimmed = await sampleIdTextUntrimmed.toString().trim();

  //Details view selectors
  const repertoireNameDetailsSelect = Selector(repertoireFormIdBase + repertoireUuid);
  const sampleIdDetailsSelect = Selector(sampleIdBaseId + sampleUuid);

  //Edit values but do not Save
  await t
    .click(repertoireDropdownSelect)
    .click(repertoireDropdownEditSelect)

  const repertoireDescriptionSelectSelect = await Selector(repertoireFormIdBase + repertoireUuid).find(repertoireDescriptionId);

  await t
    .typeText(repertoireNameBaseId + repertoireUuid, repertoireNameR, {replace: true})
    .typeText(Selector(repertoireFormIdBase + repertoireUuid).find(repertoireDescriptionId), repertoireDescriptionR, {replace: true})
    .typeText(sampleIdBaseId + sampleUuid, sampleIdR, {replace: true})
    .click(tissueSelect)
    .typeText(ontologyInputSelect.nth(0),tissueR, {replace:true})
    .click(ontologySelectSelect.withExactText(tissueR))

  await t
    .click(revertRepertoireChangesSelect)

  //Summary view checks
  await t
    .expect(repertoireNameTextTrimmed).eql("Repertoire Name: " + repertoireName)
    .expect(repertoireDescriptionTextTrimmed).eql("Repertoire Description: " + repertoireDescription)
    .expect(sampleIdTextTrimmed).eql("Sample ID: " + sampleId)
    .expect(tissueText).ok()

  await t
    .click(detailsSummaryRepertoireSelect)

  //Details view checks
  await t
    .expect(Selector(repertoireNameBaseId+repertoireUuid).value).eql(repertoireName)
    .expect(repertoireDescriptionSelect.value).eql(repertoireDescription)
    .expect(sampleIdDetailsSelect.value).eql(sampleId)
    .expect(tissueSelect.getAttribute('value')).contains(tissue) //We don't know the exact ontology
 });

 test('Duplicate the Repertoire, confirm Back-end changes, and then delete the duplicated Repertoire', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t
    .click(repertoiresTabSelect)
    .click(repertoireDropdownSelect.withAttribute('name',repertoireUuid))
    .click(repertoireDropdownDuplicateSelect.withAttribute('name',repertoireUuid))
    .click(saveRepertoireChangesSelect)
    .wait(config.save_timeout)
    .click(detailsSummaryRepertoireSelect)

  //Determine the UUIDs for the new Repertoire and new Sample
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
    await t.expect(r['status']).eql("success")
        .expect(r['result'].length).eql(2);
    r = r['result'];
  }

  dRepertoireUuid = "";
  var dSampleUuid = "";
  var dRepertoireValue;
  var repertoireValue;
  if(r[0]["uuid"] == repertoireUuid) {
    dRepertoireUuid = r[1]["uuid"];
    dRepertoireValue = r[1]["value"];
    repertoireValue = r[0]["value"];
  } else {
    dRepertoireUuid = r[0]["uuid"];
    dRepertoireValue = r[0]["value"];
    repertoireValue = r[1]["value"];
  }

  dSampleUuid = dRepertoireValue["sample"][0]["vdjserver_uuid"];

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
    await t.expect(s['status']).eql("success")
        .expect(s['result'].length).eql(1);
    s = s['result'];
  }

  var dSampleValue = s[0]["value"];

  if (config.tapis_version == 2) {
    var s2 = await tapisV2.getMetadataForType(token.access_token, projectUuid, 'sample');
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
    var s2 = await tapisV3.sendRequest(requestSettings);
    await t.expect(s2['status']).eql("success")
        .expect(s2['result'].length).eql(1);
    s2 = s2['result'];
  }

  var sampleValue = s2[0]["value"];

  if (config.tapis_version == 2) {
    var subject = await tapisV2.getMetadataForType(token.access_token, projectUuid, 'subject');
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
    var subject = await tapisV3.sendRequest(requestSettings);
    await t.expect(subject['status']).eql("success")
        .expect(subject['result'].length).eql(1);
    subject = subject['result'];
  }

  var subjectValue = subject[0]["value"];

  //Check the Back-end values
  await t
    .expect(repertoireValue["repertoire_name"]).eql(dRepertoireValue["repertoire_name"])
    .expect(repertoireValue["repertoire_description"]).eql(dRepertoireValue["repertoire_description"])

    .expect(sampleValue["sample_id"]).eql(dSampleValue["sample_id"])
    .expect(sampleValue["sample_type"]).eql(dSampleValue["sample_type"])
    .expect(sampleValue["tissue"].label).eql(dSampleValue["tissue"].label)
    .expect(sampleValue["anatomic_site"]).eql(dSampleValue["anatomic_site"])
    .expect(sampleValue["disease_state_sample"]).eql(dSampleValue["disease_state_sample"])
    .expect(sampleValue["collection_time_point_relative"]).eql(dSampleValue["collection_time_point_relative"])
    .expect(sampleValue["collection_time_point_relative_unit"].label).eql(dSampleValue["collection_time_point_relative_unit"].label)
    .expect(sampleValue["collection_time_point_reference"]).eql(dSampleValue["collection_time_point_reference"])
    .expect(sampleValue["biomaterial_provider"]).eql(dSampleValue["biomaterial_provider"])
    .expect(sampleValue["sequencing_run_id"]).eql(dSampleValue["sequencing_run_id"])
    .expect(sampleValue["sequencing_platform"]).eql(dSampleValue["sequencing_platform"])
    .expect(sampleValue["sequencing_facility"]).eql(dSampleValue["sequencing_facility"])
    .expect(sampleValue["sequencing_run_date"]).eql(dSampleValue["sequencing_run_date"])
    .expect(sampleValue["sequencing_kit"]).eql(dSampleValue["sequencing_kit"])
    .expect(sampleValue["sequencing_files"]["filename"]).eql(dSampleValue["sequencing_files"]["filename"])
    .expect(sampleValue["tissue_processing"]).eql(dSampleValue["tissue_processing"])
    .expect(sampleValue["cell_subset"].label).eql(dSampleValue["cell_subset"].label)
    .expect(sampleValue["cell_phenotype"]).eql(dSampleValue["cell_phenotype"])
    .expect(sampleValue["cell_species"].label).eql(dSampleValue["cell_species"].label)
    .expect(sampleValue["single_cell"]).eql(dSampleValue["single_cell"])
    .expect(sampleValue["cell_number"]).eql(dSampleValue["cell_number"])
    .expect(sampleValue["cells_per_reaction"]).eql(dSampleValue["cells_per_reaction"])
    .expect(sampleValue["cell_storage"]).eql(dSampleValue["cell_storage"])
    .expect(sampleValue["cell_quality"]).eql(dSampleValue["cell_quality"])
    .expect(sampleValue["cell_isolation"]).eql(dSampleValue["cell_isolation"])
    .expect(sampleValue["cell_processing_protocol"]).eql(dSampleValue["cell_processing_protocol"])
    .expect(sampleValue["template_class"]).eql(dSampleValue["template_class"])
    .expect(sampleValue["template_quality"]).eql(dSampleValue["template_quality"])
    .expect(sampleValue["template_amount"]).eql(dSampleValue["template_amount"])
    .expect(sampleValue["template_amount_unit"].label).eql(dSampleValue["template_amount_unit"].label)
    .expect(sampleValue["library_generation_method"]).eql(dSampleValue["library_generation_method"])
    .expect(sampleValue["library_generation_protocol"]).eql(dSampleValue["library_generation_protocol"])
    .expect(sampleValue["library_generation_kit_version"]).eql(dSampleValue["library_generation_kit_version"])
    .expect(sampleValue["complete_sequences"]).eql(dSampleValue["complete_sequences"])
    .expect(sampleValue["physical_linkage"]).eql(dSampleValue["physical_linkage"])
    .expect(sampleValue["pcr_target"][0]["pcr_target_locus"]).eql(dSampleValue["pcr_target"][0]["pcr_target_locus"])
    .expect(sampleValue["pcr_target"][0]["forward_pcr_primer_target_location"]).eql(dSampleValue["pcr_target"][0]["forward_pcr_primer_target_location"])
    .expect(sampleValue["pcr_target"][0]["reverse_pcr_primer_target_location"]).eql(dSampleValue["pcr_target"][0]["reverse_pcr_primer_target_location"])
    .expect(sampleValue["sequencing_data_id"]).eql(dSampleValue["sequencing_data_id"])

  //Delete the duplicated Repertoire
  await t
    .click(repertoiresTabSelect)
    .click(repertoireDropdownSelect.withAttribute('name',dRepertoireUuid))
    .click(repertoireDropdownDeleteSelect.withAttribute('name',dRepertoireUuid))
    .click(saveRepertoireChangesSelect)
    .wait(config.save_timeout)
 });

 test('Duplicate the Repertoire, change select values, and confirm Back-end changes', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t
    .click(repertoiresTabSelect)
    .click(repertoireDropdownSelect.withAttribute('name',repertoireUuid))
    .click(repertoireDropdownDuplicateSelect.withAttribute('name',repertoireUuid))

  var sampleCid = await sampleFormSelect.find(sampleDropdownId).getAttribute('name');

  //console.log("Duplicate Sample CID: " + sampleCid);
  var duplicateSampleIdSelect = Selector(sampleIdBaseId + sampleCid);
  const cellSubsetSelect = Selector(cellSubsetBaseId + sampleCid);
  const cellSubsetOption = cellSubsetSelect.find('option');
  
  const repertoireNameD = repertoireName + '-2';
  const sampleIdD = sampleId + '-2';
  const cellSubsetD = "plasma cell";
  const singleCellD = "false";
  const libraryGenerationMethodD = "RT(RHP)+PCR";
  const reverseTargetLocationD = reverseTargetLocation + "-2"; 

  var repertoireDCid = await repertoireFormSelect.find(repertoireDropdownId).getAttribute('name');

  await t
    .click(navbarStatsIconSelect)
    .typeText(repertoireNameBaseId+repertoireDCid, repertoireNameD, {replace: true})
    .typeText(duplicateSampleIdSelect, sampleIdD, {replace:true})
    .click(cellSubsetSelect)
    .typeText(ontologyInputSelect.nth(1),cellSubsetD, {replace:true})
    .click(ontologySelectSelect.withExactText(cellSubsetD))
    .click(singleCellSelect)
    .click(singleCellOption.withAttribute('value',singleCellD))
    .click(libraryGenerationMethodSelect)
    .click(libraryGenerationMethodOption.withAttribute('value',libraryGenerationMethodD))
    .typeText(reverseTargetLocationSelect,reverseTargetLocationD, {replace:true})
    .click(saveRepertoireChangesSelect)
    .wait(config.save_timeout)
    .click(detailsSummaryRepertoireSelect)

  //Determine the UUIDs for the new Repertoire and new Sample
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
  //console.log("Duplicate Sample UUID: " + dSampleUuid);

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
    await t.expect(s['status']).eql("success")
        .expect(s['result'].length).eql(1);
    s = s['result'];
  }

  var dSampleValue = s[0]["value"];
  
  //Check the Back-end values
  await t
    .expect(dRepertoireValue["repertoire_name"]).eql(repertoireName+'-2')
    .expect(dSampleValue["sample_id"]).eql(sampleId+'-2')
 });

 test('Delete the duplicated Repertoire and confirm the correct one was deleted on the Back-end', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t
    .click(repertoiresTabSelect)
    .click(repertoireDropdownSelect.withAttribute('name',dRepertoireUuid))
    .click(repertoireDropdownDeleteSelect.withAttribute('name',dRepertoireUuid))
    .click(saveRepertoireChangesSelect)
    .wait(config.save_timeout)

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
    await t.expect(r['status']).eql("success")
        .expect(r['result'].length).eql(1);
    r = r['result'][0];
  }

  //Confirm the remaining Repertoire is the correct one
  await t
    .expect(r["uuid"]).eql(repertoireUuid)
 });

 test('Duplicate a Sample for the original Repertoire, change select values, and check against the Back-end', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t
    .click(repertoiresTabSelect)
    .click(sampleAddDropdownSelect)
    .click(sampleDropdownDuplicateSelect.withAttribute('name',sampleUuid))

  var sampleCid = await sampleFormSelect.find(sampleDropdownId).getAttribute('name');

  await t.typeText(Selector(sampleIdBaseId + sampleCid),sampleId + "-duplicate",{replace: true})
  const tissueSelect = Selector(tissueId+sampleCid);
  const tissueOption = tissueSelect.find('option');

  const tissueD = "hair of scalp";
  const singleCellD = "false";
  const pcrTargetLocusD = "TRG";
  const pcrTargetLocusOption = pcrTargetLocusSelect.find('option');

  await t
    .click(tissueSelect)
    .typeText(ontologyInputSelect.nth(0),tissueD, {replace:true})
    .click(ontologySelectSelect.withExactText(tissueD))
    .click(singleCellSelect)
    .click(singleCellOption.withAttribute('value',singleCellD))
    .click(pcrTargetLocusSelect)
    .click(pcrTargetLocusOption.withAttribute('value',pcrTargetLocusD))
    .click(saveRepertoireChangesSelect)
    .wait(config.save_timeout)

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
    await t.expect(m['status']).eql("success")
        .expect(m['result'].length).eql(1);
    m = m['result'][0];
  }

  //Determine the UUID of the duplicate Sample
  if(m["value"]["sample"][0]["vdjserver_uuid"] == sampleUuid)
    dSampleUuid = m["value"]["sample"][1]["vdjserver_uuid"];
  else
    dSampleUuid = m["value"]["sample"][0]["vdjserver_uuid"];

  //Get the value for the duplicate Sample
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
    await t.expect(s['status']).eql("success")
        .expect(s['result'].length).eql(1);
    s = s['result'];
  }

  var dSampleValue = s[0]["value"];

  //Check Sample values
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
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t.click(repertoiresTabSelect);

  await t
    .click(sampleAddDropdownSelect)
    .click(sampleDropdownDeleteSelect.withAttribute('name',dSampleUuid))
    .click(saveRepertoireChangesSelect)
    .wait(config.save_timeout)

  //Confirm there is just 1 Sample in the Samples Object
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
    await t.expect(sp['status']).eql("success")
        .expect(sp['result'].length).eql(1);
    sp = sp['result'][0];
  }

  //Confirm the remaining Sample is the correct one
  await t
    .expect(sp["uuid"]).eql(sampleUuid)

  //Confirm the reference to the Sample was removed from the Repertoire Object and the correct one remains
  token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var r = await tapisV2.getProjectMetadata(token.access_token, repertoireUuid);
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
    await t.expect(r['status']).eql("success")
        .expect(r['result'].length).eql(1);
    r = r['result'][0];
  }

  //Confirm the remaining Sample is the correct one
  await t
    .expect(r["value"]["sample"][0]["vdjserver_uuid"]).eql(sampleUuid)
 });

 test('Confirm \'Revert Changes\' and \'Save Changes\' buttons are disabled/enabled correctly', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t.click(repertoiresTabSelect);

  //Expect the buttons to be unavailable when no changes have been made
  await t.expect(revertRepertoireChangesSelect.withExactText('Revert Changes').hasAttribute('disabled')).ok()
  await t.expect(saveRepertoireChangesSelect.withExactText('Validate/Save Changes').hasAttribute('disabled')).ok()

  //Edit a Repertoire and check buttons; edit a field and check buttons
  await t
    .click(repertoireDropdownSelect.withAttribute('name',repertoireUuid))
    .click(repertoireDropdownEditSelect.withAttribute('name',repertoireUuid))
    .expect(revertRepertoireChangesSelect.withExactText('Revert Changes').hasAttribute('disabled')).notOk()
    .expect(saveRepertoireChangesSelect.withExactText('Validate/Save Changes').hasAttribute('disabled')).notOk()
    .click(revertRepertoireChangesSelect)
    .click(repertoireDropdownSelect)
    .click(repertoireDropdownEditSelect)
    .typeText(repertoireDescriptionSelect, 'RepertoireDescriptionCheck', {replace: true})
    .pressKey('tab') //Change focus
    .expect(revertRepertoireChangesSelect.withExactText('Revert Changes').hasAttribute('disabled')).notOk()
    .expect(saveRepertoireChangesSelect.withExactText('Validate/Save Changes').hasAttribute('disabled')).notOk()
    .click(revertRepertoireChangesSelect)

  //Ensure buttons are disabled after a Save
  await t
    .click(repertoireDropdownSelect.withAttribute('name',repertoireUuid))
    .click(repertoireDropdownEditSelect.withAttribute('name',repertoireUuid))
    .typeText(anatomicSiteSelect, 'AnatomicSiteCheck',  {replace: true})
    .click(saveRepertoireChangesSelect)
    .wait(config.save_timeout)
    .expect(revertRepertoireChangesSelect.withExactText('Revert Changes').hasAttribute('disabled')).ok()
    .expect(saveRepertoireChangesSelect.withExactText('Validate/Save Changes').hasAttribute('disabled')).ok()
    .click(repertoireDropdownSelect.withAttribute('name',repertoireUuid))
    .click(repertoireDropdownEditSelect.withAttribute('name',repertoireUuid))
    .typeText(anatomicSiteSelect, anatomicSite, {replace: true})
    .click(saveRepertoireChangesSelect)
    .wait(config.save_timeout)
 });

 test('Attempt to create a new Repertoire (with a Sample) that has various erroneous fields for the previously created Project, save with permissible values, and check against the Back-end', async t => {
  const subjectIdNull = 'null';
  const sampleIdBlank = '  ';
  const sampleIdTabbed = ' \t\t\t';
  const sampleIdDuplicate = sampleId;
  const sampleIdNew = sampleId + '-new'; //pass
  const singleCellNull = 'null'; //pass
  const cellStorageNull = 'null'; //pass
  const pcrTargetLocusNull = 'null';
  const pcrTargetLocusNew = 'IGL'; //pass
  const collectionTimePointRelativeString = 'Collection Time Point Relative';
  const collectionTimePointRelativeZero= '0'; //pass
  const collectionTimePointRelativeNew= '-1234'; //pass
  const collectionTimePointRelativeBlank= ' ';
  const collectionTimePointRelativeUnitNew= 'hour'; //pass
  const templateAmountNegative = '-1';
  const templateAmountString = 'Template Amount';
  const templateAmountBlank = ' ';
  const templateAmountNew = '0'; //pass
  const templateAmountUnitNull = ' ';
  const templateAmountUnitNew = 'microgram'; //pass
  const cellNumberNegative = '-5';
  const cellNumberFloat = '2.5';
  const cellNumberNew = '0'; //pass
  const cellsPerReactionNegative = '-4';
  const cellsPerReactionFloat = '20.5';
  const cellsPerReactionNew = '0'; //pass
  const sequencingDateBad = '2-22-2022';
  const sequencingDateNew = '2022-02-22'; //pass
  const sequencingDataIdNew = "null";

  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t
    .click(repertoiresTabSelect)
    .click(newRepertoireSelect)
    .click(newRepertoireAddSelect)

  var subjectCid = await repertoireFormSelect.find(repertoireDropdownId).getAttribute('name');
  var sampleCid = await sampleFormSelect.find(sampleDropdownId).getAttribute('name');

  //Check that a null Subject ID is not allowed
  await t
    .click(subjectIdSelect)
    .click(subjectIdOption.withExactText(subjectIdNull))
    .click(saveRepertoireChangesSelect)

  var errorMessage = invalidFeedbackSelect.withExactText(subjectIdValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).ok()

  //Check that a blank Sample ID is not allowed
  await t
    .click(subjectIdSelect)
    .click(subjectIdOption.withExactText(subjectId))
    .typeText(Selector(sampleIdBaseId + sampleCid),sampleIdBlank, {replace: true})
    .click(saveRepertoireChangesSelect)
  errorMessage = invalidFeedbackSelect.withExactText(sampleIdValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).ok()

  //Check that tabbed Sample ID is not allowed
    await t
    .typeText(Selector(sampleIdBaseId + sampleCid),sampleIdTabbed, {replace: true})
    .click(saveRepertoireChangesSelect)
  errorMessage = invalidFeedbackSelect.withExactText(sampleIdValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).ok()

  //Check that a null Single Cell is allowed
  await t
    .typeText(Selector(sampleIdBaseId + sampleCid),sampleIdNew, {replace: true})
    .click(singleCellSelect)
    .click(singleCellOption.withExactText(singleCellNull))
    .click(saveRepertoireChangesSelect)
  errorMessage = invalidFeedbackSelect.withExactText(singleCellValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).notOk()

  //Check that a null Cell Storage is allowed
  await t
    .click(cellStorageSelect)
    .click(cellStorageOption.withExactText(cellStorageNull))
    .click(saveRepertoireChangesSelect)
  errorMessage = invalidFeedbackSelect.withExactText(cellStorageValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).notOk()

  //Check that a null PCR Target Locus is not allowed
  await t
    .click(pcrTargetLocusSelect)
    .click(pcrTargetLocusOption.withExactText(pcrTargetLocusNull))
    .click(saveRepertoireChangesSelect)
  errorMessage = invalidFeedbackSelect.withExactText(pcrTargetLocusValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).ok()

  //Check that a string Collection Time Point Relative is not allowed
  await t
    .typeText(collectionTimeSelect,collectionTimePointRelativeString, {replace: true})
    .click(pcrTargetLocusSelect)
    .click(pcrTargetLocusOption.withAttribute('value',pcrTargetLocusNew))
    .click(saveRepertoireChangesSelect)
  errorMessage = invalidFeedbackSelect.withExactText(collectionTimeValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).ok()

  //Check that a negative Collection Time Point Relative with a valid unit is allowed
  await t
    .typeText(collectionTimeSelect,collectionTimePointRelativeNew, {replace: true})
    .click(collectionTimePointRelativeUnitSelect)
    .click(collectionTimePointRelativeUnitOption.withAttribute('value',collectionTimePointRelativeUnitNew))
    .click(saveRepertoireChangesSelect)
  errorMessage = invalidFeedbackSelect.withExactText(collectionTimeValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).notOk()

  //Check that negative Collection Time Point Relative without a valid unit is not allowed
  await t
    .click(collectionTimePointRelativeUnitSelect)
    .click(collectionTimePointRelativeUnitOption.withExactText('null'))
    .click(saveRepertoireChangesSelect)
  errorMessage = invalidFeedbackSelect.withExactText(collectionTimePointRelativeUnitValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).ok()

  //Check that a 0 Collection Time Point Relative with a valid unit is not allowed
  await t
    .typeText(collectionTimeSelect,collectionTimePointRelativeZero, {replace: true})
    .click(collectionTimePointRelativeUnitSelect)
    .click(collectionTimePointRelativeUnitOption.withAttribute('value',collectionTimePointRelativeUnitNew))
    .click(saveRepertoireChangesSelect)
  errorMessage = invalidFeedbackSelect.withExactText(collectionTimeValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).notOk()

  //Check that a blank Collection Time Point Relative with a valid unit is not allowed
  await t
    .typeText(collectionTimeSelect,collectionTimePointRelativeBlank, {replace: true})
    .click(collectionTimePointRelativeUnitSelect)
    .click(collectionTimePointRelativeUnitOption.withAttribute('value',collectionTimePointRelativeUnitNew))
    .click(saveRepertoireChangesSelect)
  errorMessage = invalidFeedbackSelect.withExactText(collectionTimeValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).ok()

  //Check that a string Template Amount is not allowed
  await t
    .typeText(collectionTimeSelect,collectionTimePointRelativeNew, {replace: true})
    .click(collectionTimePointRelativeUnitSelect)
    .click(collectionTimePointRelativeUnitOption.withAttribute('value',collectionTimePointRelativeUnitNew))
    .typeText(templateAmountSelect,templateAmountString, {replace: true})
    .click(saveRepertoireChangesSelect)
  errorMessage = invalidFeedbackSelect.withExactText(templateAmountValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).ok()

  //Check that a negative Template Amount is not allowed
  await t
    .typeText(templateAmountSelect,templateAmountNegative, {replace: true})
    .click(saveRepertoireChangesSelect)
  errorMessage = invalidFeedbackSelect.withExactText(templateAmountValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).ok()

  //Check that a string Template Amount with a valid unit is not allowed
  await t
    .typeText(templateAmountSelect,templateAmountString, {replace: true})
    .click(templateAmountUnitSelect)
    .click(templateAmountUnitOption.withAttribute('value',templateAmountUnitNew))
    .click(saveRepertoireChangesSelect)
  errorMessage = invalidFeedbackSelect.withExactText(templateAmountValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).ok()

  //Check that a blank Template Amount with a valid unit is not allowed
  await t
    .typeText(templateAmountSelect,templateAmountBlank, {replace: true})
    .click(templateAmountUnitSelect)
    .click(templateAmountUnitOption.withAttribute('value',templateAmountUnitNew))
    .click(saveRepertoireChangesSelect)
  errorMessage = invalidFeedbackSelect.withExactText(templateAmountValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).ok()

  //Check that a 0 Template Amount with a null unit is not allowed
  await t
    .typeText(templateAmountSelect,templateAmountNew, {replace: true})
    .click(templateAmountUnitSelect)
    .click(templateAmountUnitOption.withExactText('null'))
    .click(saveRepertoireChangesSelect)
  errorMessage = invalidFeedbackSelect.withExactText(templateAmountUnitValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).ok()

  //Check that a 0 Template Amount with a valid unit is allowed
  await t
    .typeText(templateAmountSelect,templateAmountNew, {replace: true})
    .click(templateAmountUnitSelect)
    .click(templateAmountUnitOption.withAttribute('value',templateAmountUnitNew))
    .click(saveRepertoireChangesSelect)
  errorMessage = invalidFeedbackSelect.withExactText(templateAmountUnitValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).notOk()

  //Check that a negative Cell Number is not allowed
  await t
    .typeText(cellNumberSelect,cellNumberNegative, {replace: true})
    .click(saveRepertoireChangesSelect)
  errorMessage = invalidFeedbackSelect.withExactText(cellNumberValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).ok()

  //Check that a float Cell Number is not allowed
  await t
    .typeText(cellNumberSelect,cellNumberFloat, {replace: true})
    .click(saveRepertoireChangesSelect)
  errorMessage = invalidFeedbackSelect.withExactText(cellNumberValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).ok()

  //Check that a negative Cells Per Reaction is not allowed
  await t
    .typeText(cellNumberSelect,cellNumberNew, {replace: true})
    .typeText(cellsPerReactionSelect,cellsPerReactionNegative, {replace: true})
    .click(saveRepertoireChangesSelect)
  errorMessage = invalidFeedbackSelect.withExactText(cellsPerReactionValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).ok()

  //Check that a float Cells Per Reaction is not allowed
  await t
    .typeText(cellsPerReactionSelect,cellsPerReactionFloat, {replace: true})
    .click(saveRepertoireChangesSelect)
  errorMessage = invalidFeedbackSelect.withExactText(cellsPerReactionValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).ok()

  //Check that a badly formatted Sequencing Date is not allowed
  await t
    .click(navbarStatsIconSelect)
    .typeText(cellsPerReactionSelect,cellsPerReactionNew, {replace: true})
    .typeText(sequencingDateSelect,sequencingDateBad, {replace: true})
    .click(saveRepertoireChangesSelect)
  errorMessage = invalidFeedbackSelect.withExactText(sequencingRunDateValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).ok()

  //Check that a correctly formatted Sequencing Date is allowed
  await t
    .typeText(sequencingDateSelect,sequencingDateNew, {replace: true})
    .click(saveRepertoireChangesSelect)
  errorMessage = invalidFeedbackSelect.withExactText(sequencingRunDateValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).notOk()

  //Save the Repertoire and Sample with valid values
  await t
    .typeText(sequencingDataIdSelect,sequencingDataIdNew, {replace: true})
    .click(saveRepertoireChangesSelect)
    .wait(config.save_timeout)
    .click(detailsSummaryRepertoireSelect);

  //Check Back-end values; first determine the UUID values for the new Repertoire and Sample objects
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
    await t.expect(r['status']).eql("success")
        .expect(r['result'].length).eql(2);
    r = r['result'];
  }

  var newRepertoireUuid = "";
  var newSampleUuid = "";
  var newRepertoireValue; 
  if(r[0]["uuid"] == repertoireUuid) {
    newRepertoireUuid = r[1]["uuid"];
    newRepertoireValue = r[1]["value"];
  } else {
    newRepertoireUuid = r[0]["uuid"];
    newRepertoireValue = r[0]["value"];
  }

  newSampleUuid = newRepertoireValue["sample"][0]["vdjserver_uuid"];
  //console.log("New Sample UUID: " + newSampleUuid);

  if (config.tapis_version == 2) {
    var s = await tapisV2.getMetadataForType(token.access_token, projectUuid, 'sample');
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/uuid/' + newSampleUuid,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var s = await tapisV3.sendRequest(requestSettings);
    await t.expect(s['status']).eql("success")
        .expect(s['result'].length).eql(1);
    s = s['result'];
  }

  var newSampleValue = s[0]["value"];
  var repertoireSubjectUuidReference = newRepertoireValue["subject"]["vdjserver_uuid"];

  if (config.tapis_version == 2) {
    var subj = await tapisV2.getMetadataForType(token.access_token, projectUuid, 'sample');
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/uuid/' + repertoireSubjectUuidReference,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var subj = await tapisV3.sendRequest(requestSettings);
    await t.expect(subj['status']).eql("success")
        .expect(subj['result'].length).eql(1);
    subj = subj['result'];
  }

  var subjectValue = subj[0]['value'];

  //Check the Back-end values
  await t
    .expect(subjectValue["subject_id"]).eql(subjectId)
    .expect(newSampleValue["sample_id"]).eql(sampleIdNew)
    .expect(newSampleValue["single_cell"] == null).ok()
    .expect(newSampleValue["cell_storage"] == null).ok()
    .expect(newSampleValue["pcr_target"][0]["pcr_target_locus"]).eql(pcrTargetLocusNew)
    .expect(newSampleValue["collection_time_point_relative"]).eql(parseFloat(collectionTimePointRelativeNew))
    .expect(newSampleValue["collection_time_point_relative_unit"].label).eql(collectionTimePointRelativeUnitNew)
    .expect(newSampleValue["template_amount"]).eql(parseFloat(templateAmountNew))
    .expect(newSampleValue["template_amount_unit"].label).eql(templateAmountUnitNew)
    .expect(newSampleValue["cell_number"]).eql(parseInt(cellNumberNew))
    .expect(newSampleValue["cells_per_reaction"]).eql(parseInt(cellsPerReactionNew))
    .expect(newSampleValue["sequencing_data_id"] == null).ok()

  //Duplicate a Repertoire and attempt to Save with a duplicate Sample ID
  await t
    .click(navbarStatsIconSelect)
    .click(sampleDropdownSelect.withAttribute('name',newSampleUuid))
    .click(sampleDropdownDuplicateSelect.withAttribute('name',newSampleUuid))

  var sampleCid2;

  //Expect 3 Samples
  await t.expect(sampleIdSelect.count).eql(3)

  var ids = [];
  var numIds = await sampleIdSelect.count;
  for(let i=0; i<numIds; i++) ids.push(await sampleIdSelect.nth(i).getAttribute('id'));
  var cids = [];
  for(let i=0; i<ids.length; i++) {
    if(!(ids[i].includes(sampleUuid)) && !(ids[i].includes(newSampleUuid))) {
      cids.push(ids[i].split('_')[2]);
    }
  }
  sampleCid2 = cids[0];

  await t
    .typeText(Selector(sampleIdBaseId + sampleCid2),sampleId+'-new', {replace: true})
    .click(saveRepertoireChangesSelect)

  var errorMessage = invalidFeedbackSelect.withExactText(sampleIdValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).ok()

  //Ensure the error disappears when the Sample ID is unique and successfully Save
  await t
    .typeText(Selector(sampleIdBaseId + sampleCid2),sampleId+'-unique', {replace: true})
    .click(saveRepertoireChangesSelect)
    .wait(config.save_timeout)
  errorMessage = invalidFeedbackSelect.withExactText(sampleIdValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).notOk()
 });

 test('Upload a File to test the Sequencing Files and Sequencing Data ID fields', async t => {
  const repertoireNameFiles = repertoireName + '-files';
  const subjectIdNull = "null";
  const subjectIdFiles = 'null';
  const sampleIdFiles = sampleId + '-files';
  const pcrTargetLocusFiles = 'TRG';
  const sequencingDataIdFilesBlank = '   ';
  const sequencingDataIdFiles = sequencingDataId + '-files';
  const sequencingFilesFilesNull = "null";
  var sequencingFilesFiles = "";

  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  await t
    .click(filesTabSelect)
    .click(uploadFilesSelect)
    .click(uploadFilesComputerSelect)

  await t
    .setFilesToUpload(uploadFilesComputerDialogSelect, [filesPath + FastaSequencesFile])
    .click(addStartUploadSelect)

  await t
    .click(doneUploadSelect)

  //Get the UUID associated with the uploaded File
  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var m = await tapisV2.getProjectMetadata(token.access_token, projectUuid);
  } else {
    var requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/name/project_file',
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
  var fileUuid = m['uuid'];
  //console.log("File UUID: " + fileUuid);

  sequencingFilesFiles = fileUuid;

  await t.click(repertoiresTabSelect);

  await t
    .click(newRepertoireSelect)
    .click(newRepertoireAddSelect)

  //Expect 2 options in the Sequencing Files drop-down
  await t.expect(sequencingFilesOption.count).eql(2)

  var repertoireCid = await repertoireFormSelect.find(repertoireDropdownId).getAttribute('name');
  var sampleCid = await sampleFormSelect.find(sampleDropdownId).getAttribute('name');

  //Check that valid values for both Sequencing Files and Sequencing Data ID are not allowed concurrently
  await t
    .typeText(repertoireNameBaseId+repertoireCid, repertoireNameFiles, {replace: true})
    .click(subjectIdSelect)
    .click(subjectIdOption.withExactText(subjectIdNull))
    .typeText(Selector(sampleIdBaseId + sampleCid),sampleIdFiles, {replace: true})
    .click(sequencingFilesSelect)
    .click(sequencingFilesOption.withAttribute('id',sequencingFilesFiles))
    .click(pcrTargetLocusSelect)
    .click(pcrTargetLocusOption.withExactText(pcrTargetLocusFiles))
    .typeText(sequencingDataIdSelect, sequencingDataIdFiles, {replace: true})
    .click(saveRepertoireChangesSelect)
    .wait(config.save_timeout) //need to account for the automatic scroll to the top
  var errorMessage = invalidFeedbackSelect.withExactText(sequencingFilesDataIdValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).ok()

  //Check that null for Sequencing Files and a blank Sequencing Data ID is not allowed
  await t
    .click(navbarStatsIconSelect)
    .click(sequencingFilesSelect)
    .click(sequencingFilesOption.withExactText(sequencingFilesFilesNull))
    .typeText(sequencingDataIdSelect, sequencingDataIdFilesBlank, {replace: true})
    .click(saveRepertoireChangesSelect)
    .wait(config.save_timeout) //needed to account for the automatic scroll to the top
  errorMessage = invalidFeedbackSelect.withExactText(sequencingFilesDataIdValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).ok()

  //Check that null for Sequencing Files and a valid non-blank Sequencing Data ID is allowed
  await t
    .click(sequencingFilesSelect)
    .click(sequencingFilesOption.withExactText(sequencingFilesFilesNull))
    .typeText(sequencingDataIdSelect, sequencingDataIdFiles, {replace: true})
    .click(saveRepertoireChangesSelect)
    .wait(config.save_timeout) //needed to account for the automatic scroll to the top
  errorMessage = invalidFeedbackSelect.withExactText(sequencingFilesDataIdValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).notOk()

  //Check that a valid Sequencing Files and a blank Sequencing Data ID is allowed and successfully Save
  await t
    .click(sequencingFilesSelect)
    .click(sequencingFilesOption.withAttribute('id',sequencingFilesFiles))
    .typeText(sequencingDataIdSelect, sequencingDataIdFilesBlank, {replace: true})
    .click(saveRepertoireChangesSelect)
    .click(subjectIdSelect)
    .click(subjectIdOption.withAttribute('value',subjectUuid))
    .click(saveRepertoireChangesSelect)
    .wait(config.save_timeout)
  errorMessage = invalidFeedbackSelect.withExactText(sequencingFilesDataIdValidationMessage).filterVisible().exists;
  await t.expect(errorMessage).notOk()

  //Check Sequencing Files on the Back-end
  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var r = await tapisV2.getMetadataForType(token.access_token, projectUuid, 'repertoire');
  } else {
    requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/name/repertoire',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var r = await tapisV3.sendRequest(requestSettings);
    await t.expect(r['status']).eql("success")
        .expect(r['result'].length).eql(3);
    r = r['result'];
  }

  var repertoireUuidFiles = "";
  var sampleUuidFiles = "";
  for(let index = 0; index < 3; index++)
    if(r[index]["value"]["repertoire_name"] == repertoireNameFiles) {
      repertoireUuidFiles = r[index]["uuid"];
      sampleUuidFiles = r[index]["value"]["sample"][0]["vdjserver_uuid"]
    }

  if (config.tapis_version == 2) {
    var s = await tapisV2.getMetadataForType(token.access_token, projectUuid, 'sample');
  } else {
    requestSettings = {
        url: config.api + 'api/v2/project/' + projectUuid + '/metadata/uuid/' + sampleUuidFiles,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token['access_token']['access_token']
        }
    };
    var s = await tapisV3.sendRequest(requestSettings);
    await t.expect(s['status']).eql("success")
        .expect(s['result'].length).eql(1);
    s = s['result'];
  }

  var sValue = s[0]["value"];

  if(sequencingFilesFiles == 'null') await t.expect(sValue["sequencing_files"]["filename"] == null).ok()
  else await t.expect(sValue["sequencing_files"]["filename"]).eql(FastaSequencesFile)
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
