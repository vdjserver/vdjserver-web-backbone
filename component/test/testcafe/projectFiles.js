//
// projectFiles.js
// Project Files Page Test Cases
//
// VDJServer
// https://vdjserver.org
//
// Copyright (C) 2024 The University of Texas Southwestern Medical Center
//
// Author: Ryan C. Kennedy
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
// Date: August - November 2024
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
var sampleUuid = "";

fixture('Project Files Page Test Cases')
  .page(config.url);

  const loginButtonId = '#home-login';
  //Append a random number less than 1,000,000 to subjectId
  var subjectId = 'Subject ID ' + Math.floor(Math.random()*1000000);

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
  const projectSuccessfullyCreatedString = "Project successfully created!";

  //Subject Values
  const projectSubjectDropdownId = '#project-subject-dropdown';
  const species = 'Macaca mulatta';

  //File Values
  const projectFilesFormBase = '#project-files-form_';
  const projectFileTypeId = '#project-file-type';
  const projectFileDeleteId = '#project-file-delete';
  const projectFileTagsId = '#project-file-tags';
  const projectFileDownloadId = '#project-file-download';
  const projectFileReadDirectionId = '#project-file-read-direction';
  const projectFileUnpairId = '#project-file-unpair';
  const projectFilesBtnCancelClass = '.btn-cancel';
  const projectFileDeleteUploadFileClass = '.delete-upload-file';
  const projectFileDeleteUploadFileId = '#delete-upload-file';
  const projectFileColClass = '.col-md-11';
  const projectFilePairedEndRadioOptionFor = 'select-paired-end-files';
  const projectFileReadQualityRadioOptionFor = 'select-read-quality-files';
  const pairedString1 = '2 files were matched.'; 
  const pairedString2 = '2 files were paired together.';
  const duplicateFilesRemovedString = 'Duplicate files have been removed: ';

  const filesPath = "./uploads/";
  const FastqPairedEndForwardFile = "ERR346600_1.fastq";
  const FastqPairedEndReverseFile = "ERR346600_2.fastq";
  const FastaSequencesFile = "VectorBase-64_Aaquasalis_ESTs.fasta";
  const BarcodeSequencesFile = "SRR765688_MIDs.fasta";
  const PrimerSequencesReverseFile = "Greiff2014_CPrimers_rev.fasta";
  const PrimerSequencesForwardFile = "Greiff2014_VPrimers.fasta";
  const FastaQualitySequences1File = "Sample00013.fna";
  const FastaQualitySequences2File = "Sample00013.qual";
  const FastaSequencesDuplicateFile = "VectorBase-64_Aaquasalis_ESTs.fasta";
  const FastaSequencesRenamedDuplicateFile = "VectorBase-64_Aaquasalis_ESTs2.fasta";
  const FastaSequencesDeleteFile = "VectorBase-64_Aaquasalis_ESTs3.fasta";
  const UnspecifiedFile = "test.unspecified";
  const TsvFile = "subject_metadata.tsv";
  const CsvFile = "subject_metadata.csv";
  const VdjmlFile = "test.vdjml";
  const AirrTsvFile = "656b9351190f680f22dc212e.airr.tsv";
  const AirrJsonFile = "repertoires.airr.json";
  const testFile = "test2.vdjml";

  var FastqPairedEndForwardFileUuid, FastqPairedEndReverseFileUuid;
  var FastaSequencesFileUuid, BarcodeSequencesFileUuid;
  var PrimerSequencesReverseFileUuid, PrimerSequencesForwardFileUuid;
  var FastaQualitySequences1FileUuid, FastaQualitySequences2FileUuid;
  var FastaSequencesRenamedDuplicateFileUuid;
  var UnspecifiedFileUuid;
  var TsvFileUuid, CsvFileUuid;
  var VdjmlFileUuid, AirrTsvFileUuid, AirrJsonFileUuid;

  //General Selectors
  const usernameSelect = Selector('#username');
  const passwordSelect = Selector('#password');
  const createNewProjectSelect = Selector('#create-project');
  const navbarStatsIconSelect = Selector('#navbar-stats-icon');
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
  const revertFileChangesSelect = Selector('#project-files-revert-changes');
  const saveRepertoireChangesSelect = Selector('#project-repertoires-save-changes');
  const repertoireDropdownSelect = Selector('#project-repertoires-dropdown');
  const repertoireDropdownDetailsSummarySelect = Selector('#project-repertoire-show-summary');
  const repertoireDropdownEditSelect = Selector('#project-repertoire-edit-repertoire');
  const repertoireDropdownDuplicateSelect = Selector('#project-repertoire-duplicate-repertoire');
  const repertoireDropdownDeleteSelect = Selector('#project-repertoire-delete-repertoire');
  const repertoireDropdownAddSampleSelect = Selector('#project-sample-add-sample');
  const sampleDropdownSelect = Selector('#project-samples-add');
  const sampleDropdownDuplicateSelect = Selector('#project-sample-duplicate-sample');
  const sampleDropdownDeleteSelect = Selector('#project-sample-delete-sample');

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
  const createProjectSelect = Selector('#create-new-project');
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

  //Sample Field Selectors
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
  const cancelUploadSelect = Selector('#cancel-upload-button');
  const saveFilesChangesSelect = Selector('#project-files-save-changes');
  const sortDropdownSelect = Selector('#project-files-sort-button');
  const sortDropdownOptionSelect = Selector('#project-files-sort-select');
  const filesSortSelect = Selector('.project-files-form');
  const filesPairFilesSelect = Selector('#project-files-pair-files');
  const projectFilePairRadioSelect = Selector('.custom-control-label');
  const filesReadFileAnchorSelect = Selector('#read-file-anchor');
  const filesPerformPairingButtonSelect = Selector('#perform-pairing-button');
  const filesConfirmPairingButtonSelect = Selector('#confirm-message-button');
  const projectFileDeleteUploadFileSelect = Selector('#delete-upload-file');
  const filesGeneralTableRowSelect = Selector('.general-table-row');

  const FILE_TYPE_UNSPECIFIED = '0';
  const FILE_TYPE_PRIMER = '1';
  const FILE_TYPE_FASTQ_READ = '2';
  const FILE_TYPE_FASTA_READ = '3';
  const FILE_TYPE_BARCODE = '4';
  const FILE_TYPE_QUALITY = '5';
  const FILE_TYPE_TSV = '6';
  const FILE_TYPE_CSV = '7';
  const FILE_TYPE_VDJML = '8';
  const FILE_TYPE_AIRR_TSV = '9';
  const FILE_TYPE_AIRR_JSON = '10';

  const FILE_TYPE_UNSPECIFIED_STRING = 'Unspecified';
  const FILE_TYPE_PRIMER_STRING = 'Primer Sequences';
  const FILE_TYPE_FASTQ_READ_STRING = 'FASTQ Read Data';
  const FILE_TYPE_FASTA_READ_STRING = 'FASTA Sequences';
  const FILE_TYPE_BARCODE_STRING = 'Barcode Sequences';
  const FILE_TYPE_QUALITY_STRING = 'Quality Scores';
  const FILE_TYPE_TSV_STRING = 'TAB-separated Values';
  const FILE_TYPE_CSV_STRING = 'Comma-separated Values';
  const FILE_TYPE_VDJML_STRING = 'VDJML';
  const FILE_TYPE_AIRR_TSV_STRING = 'AIRR TSV';
  const FILE_TYPE_AIRR_JSON_STRING = 'AIRR JSON';

 test('Create a Project and Check Back-end Values', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.click(createNewProjectSelect);

  await t
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
    .click(createProjectSelect)

  await t.expect(projectModalDialogSelect.find(projectModalBodyClass).withExactText(projectSuccessfullyCreatedString).exists).ok();
  await t.click(projectModalCancelButtonSelect);

  await t.click(subjectsTabSelect)

  const getPageUrl = ClientFunction(() => window.location.href);
  var url = await getPageUrl();
  projectUuid = url.split("/")[4];
  projectUuidUrl += projectUuid;
  //console.log("Project UUID: " + projectUuid);

  await t.navigateTo('./'+projectUuidUrl);
  url = await getPageUrl();
  console.log("URL: " + url);
  //console.log(studyTitle + "\n");

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

 test('Upload files, change select file types, and confirm correct values are stored on the Back-end and displayed correctly in the drop-downs', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t
    .navigateTo('./'+projectUuidUrl)
    .click(filesTabSelect)
    .click(uploadFilesSelect)
    .click(uploadFilesComputerSelect)
    .setFilesToUpload(uploadFilesComputerDialogSelect, [filesPath + FastaSequencesFile])
    .setFilesToUpload(uploadFilesComputerDialogSelect, [filesPath + FastqPairedEndForwardFile])
    .setFilesToUpload(uploadFilesComputerDialogSelect, [filesPath + FastqPairedEndReverseFile])
    .setFilesToUpload(uploadFilesComputerDialogSelect, [filesPath + BarcodeSequencesFile])
    .setFilesToUpload(uploadFilesComputerDialogSelect, [filesPath + PrimerSequencesReverseFile])
    .setFilesToUpload(uploadFilesComputerDialogSelect, [filesPath + PrimerSequencesForwardFile])
    .setFilesToUpload(uploadFilesComputerDialogSelect, [filesPath + FastaQualitySequences1File])
    .setFilesToUpload(uploadFilesComputerDialogSelect, [filesPath + FastaQualitySequences2File])
    .setFilesToUpload(uploadFilesComputerDialogSelect, [filesPath + UnspecifiedFile])
    .setFilesToUpload(uploadFilesComputerDialogSelect, [filesPath + TsvFile])
    .setFilesToUpload(uploadFilesComputerDialogSelect, [filesPath + CsvFile])
    .setFilesToUpload(uploadFilesComputerDialogSelect, [filesPath + VdjmlFile])
    .setFilesToUpload(uploadFilesComputerDialogSelect, [filesPath + AirrTsvFile])
    .setFilesToUpload(uploadFilesComputerDialogSelect, [filesPath + AirrJsonFile])
    .click(addStartUploadSelect)
    .wait(config.upload_wait) //Wait for the uploads to complete
    .click(doneUploadSelect)

  //Get the UUID associated with each uploaded File
  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var files = await tapisV2.getProjectMetadata(token.access_token, projectUuid);
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
    var files = await tapisV3.sendRequest(requestSettings);
    await t.expect(files['status']).eql("success")
        .expect(files['result'].length).eql(14); //Ensure all 14 files were uploaded
    var files = files['result'];
  }

  //Get the UUID for each file
  for(let i=0; i<files.length; i++) {
    if(files[i]["value"]["name"] == FastqPairedEndForwardFile) FastqPairedEndForwardFileUuid = files[i]['uuid'];
    else if(files[i]["value"]["name"] == FastqPairedEndReverseFile) FastqPairedEndReverseFileUuid = files[i]['uuid'];
    else if(files[i]["value"]["name"] == FastaSequencesFile) FastaSequencesFileUuid = files[i]['uuid'];
    else if(files[i]["value"]["name"] == BarcodeSequencesFile) BarcodeSequencesFileUuid = files[i]['uuid'];
    else if(files[i]["value"]["name"] == PrimerSequencesReverseFile) PrimerSequencesReverseFileUuid = files[i]['uuid'];
    else if(files[i]["value"]["name"] == PrimerSequencesForwardFile) PrimerSequencesForwardFileUuid = files[i]['uuid'];
    else if(files[i]["value"]["name"] == FastaQualitySequences1File) FastaQualitySequences1FileUuid = files[i]['uuid'];
    else if(files[i]["value"]["name"] == FastaQualitySequences2File) FastaQualitySequences2FileUuid = files[i]['uuid'];
    else if(files[i]["value"]["name"] == UnspecifiedFile) UnspecifiedFileUuid = files[i]['uuid'];
    else if(files[i]["value"]["name"] == TsvFile) TsvFileUuid = files[i]['uuid'];
    else if(files[i]["value"]["name"] == CsvFile) CsvFileUuid = files[i]['uuid'];
    else if(files[i]["value"]["name"] == VdjmlFile) VdjmlFileUuid = files[i]['uuid'];
    else if(files[i]["value"]["name"] == AirrTsvFile) AirrTsvFileUuid = files[i]['uuid'];
    else if(files[i]["value"]["name"] == AirrJsonFile) AirrJsonFileUuid = files[i]['uuid'];
  }

  const FastqPairedEndForwardFileSelect = Selector(projectFilesFormBase + FastqPairedEndForwardFileUuid).find(projectFileTypeId);
  const FastqPairedEndReverseFileSelect = Selector(projectFilesFormBase + FastqPairedEndReverseFileUuid).find(projectFileTypeId);
  const FastaQualitySequences1FileSelect = Selector(projectFilesFormBase + FastaQualitySequences1FileUuid).find(projectFileTypeId);
  const FastaQualitySequences2FileSelect = Selector(projectFilesFormBase + FastaQualitySequences2FileUuid).find(projectFileTypeId);
  const FastaSequencesFileSelect = Selector(projectFilesFormBase + FastaSequencesFileUuid).find(projectFileTypeId);

  const PrimerSequencesForwardFileSelect = Selector(projectFilesFormBase + PrimerSequencesForwardFileUuid).find(projectFileTypeId);
  const PrimerSequencesForwardFileOption = PrimerSequencesForwardFileSelect.find('option');
  const PrimerSequencesForwardFileValue = "Primer Sequences";

  const PrimerSequencesReverseFileSelect = Selector(projectFilesFormBase + PrimerSequencesReverseFileUuid).find(projectFileTypeId);
  const PrimerSequencesReverseFileOption = PrimerSequencesReverseFileSelect.find('option');
  const PrimerSequencesReverseFileValue = "Primer Sequences";

  const BarcodeSequencesFileSelect = Selector(projectFilesFormBase + BarcodeSequencesFileUuid).find(projectFileTypeId);
  const BarcodeSequencesFileOption = BarcodeSequencesFileSelect.find('option');
  const BarcodeSequencesFileValue = "Barcode Sequences";

  const UnspecifiedFileSelect = Selector(projectFilesFormBase + UnspecifiedFileUuid).find(projectFileTypeId);
  const UnspecifiedFileOption = UnspecifiedFileSelect.find('option');
  const UnspecifiedFileValue = "Unspecified";

  const TsvFileSelect = Selector(projectFilesFormBase + TsvFileUuid).find(projectFileTypeId);
  const TsvFileOption = TsvFileSelect.find('option');
  const TsvFileValue = "TAB-separated Values";

  const CsvFileSelect = Selector(projectFilesFormBase + CsvFileUuid).find(projectFileTypeId);
  const CsvFileOption = CsvFileSelect.find('option');
  const CsvFileValue = "Comma-separated Values";

  const VdjmlFileSelect = Selector(projectFilesFormBase + VdjmlFileUuid).find(projectFileTypeId);
  const VdjmlFileOption = VdjmlFileSelect.find('option');
  const VdjmlFileValue = "VDJML";

  const AirrTsvFileSelect = Selector(projectFilesFormBase + AirrTsvFileUuid).find(projectFileTypeId);
  const AirrTsvFileOption = AirrTsvFileSelect.find('option');
  const AirrTsvFileValue = "AIRR TSV";

  const AirrJsonFileSelect = Selector(projectFilesFormBase + AirrJsonFileUuid).find(projectFileTypeId);
  const AirrJsonFileOption = AirrJsonFileSelect.find('option');
  const AirrJsonFileValue = "AIRR JSON";

  //Set file types
  await t
    .click(navbarStatsIconSelect)
    .click(AirrTsvFileSelect)
    .click(AirrTsvFileOption.withExactText(AirrTsvFileValue))
    .click(PrimerSequencesForwardFileSelect)
    .click(PrimerSequencesForwardFileOption.withExactText(PrimerSequencesForwardFileValue))
    .click(PrimerSequencesReverseFileSelect)
    .click(PrimerSequencesReverseFileOption.withExactText(PrimerSequencesReverseFileValue))
    .click(AirrJsonFileSelect)
    .click(AirrJsonFileOption.withExactText(AirrJsonFileValue))
    .click(UnspecifiedFileSelect)
    .click(UnspecifiedFileOption.withExactText(UnspecifiedFileValue))
    .click(BarcodeSequencesFileSelect)
    .click(BarcodeSequencesFileOption.withExactText(BarcodeSequencesFileValue))
    .click(TsvFileSelect)
    .click(TsvFileOption.withExactText(TsvFileValue))
    .click(CsvFileSelect)
    .click(CsvFileOption.withExactText(CsvFileValue))
    .click(VdjmlFileSelect)
    .click(VdjmlFileOption.withExactText(VdjmlFileValue))
    .click(saveFilesChangesSelect)
    .wait(config.save_timeout)

  //Ensure the file types are correct on the Back-end and in the drop-downs
  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var files = await tapisV2.getProjectMetadata(token.access_token, projectUuid);
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
    var files = await tapisV3.sendRequest(requestSettings);
    await t.expect(files['status']).eql("success")
        .expect(files['result'].length).eql(14);
    files = files['result'];
  }

  var FastqPairedEndForwardValue, FastqPairedEndReverseValue;
  var PrimerSequencesForwardValue, PrimerSequencesReverseValue;
  var BarcodeSequencesValue;
  var FastaSequencesValue;
  var FastaQualitySequences1Value, FastaQualitySequences2Value;
  var UnspecifiedValue;
  var TsvValue, CsvValue;
  var VdjmlValue, AirrTsvValue, AirrJsonValue;

  for(let i=0; i<files.length; i++) {
    if(files[i]["uuid"] == FastqPairedEndForwardFileUuid) FastqPairedEndForwardValue = files[i]['value'];
    else if(files[i]["uuid"] == FastqPairedEndReverseFileUuid) FastqPairedEndReverseValue = files[i]['value'];
    else if(files[i]["uuid"] == FastaQualitySequences1FileUuid) FastaQualitySequences1Value = files[i]['value'];
    else if(files[i]["uuid"] == FastaQualitySequences2FileUuid) FastaQualitySequences2Value = files[i]['value'];
    else if(files[i]["uuid"] == PrimerSequencesForwardFileUuid) PrimerSequencesForwardValue = files[i]['value'];
    else if(files[i]["uuid"] == PrimerSequencesReverseFileUuid) PrimerSequencesReverseValue = files[i]['value'];
    else if(files[i]["uuid"] == BarcodeSequencesFileUuid) BarcodeSequencesValue = files[i]['value'];
    else if(files[i]["uuid"] == FastaSequencesFileUuid) FastaSequencesValue = files[i]['value'];
    else if(files[i]["uuid"] == UnspecifiedFileUuid) UnspecifiedValue = files[i]['value'];
    else if(files[i]["uuid"] == TsvFileUuid) TsvValue = files[i]['value'];
    else if(files[i]["uuid"] == CsvFileUuid) CsvValue = files[i]['value'];
    else if(files[i]["uuid"] == VdjmlFileUuid) VdjmlValue = files[i]['value'];
    else if(files[i]["uuid"] == AirrTsvFileUuid) AirrTsvValue = files[i]['value'];
    else if(files[i]["uuid"] == AirrJsonFileUuid) AirrJsonValue = files[i]['value'];
  }

  //Confirm the Back-end has stored the correct values
  await t
    .expect(FastqPairedEndForwardValue["fileType"]).eql(parseInt(FILE_TYPE_FASTQ_READ))
    .expect(FastqPairedEndReverseValue["fileType"]).eql(parseInt(FILE_TYPE_FASTQ_READ))
    .expect(FastaQualitySequences1Value["fileType"]).eql(parseInt(FILE_TYPE_FASTA_READ))
    .expect(FastaQualitySequences2Value["fileType"]).eql(parseInt(FILE_TYPE_QUALITY))
    .expect(PrimerSequencesForwardValue["fileType"]).eql(parseInt(FILE_TYPE_PRIMER))
    .expect(PrimerSequencesReverseValue["fileType"]).eql(parseInt(FILE_TYPE_PRIMER))
    .expect(BarcodeSequencesValue["fileType"]).eql(parseInt(FILE_TYPE_BARCODE))
    .expect(FastaSequencesValue["fileType"]).eql(parseInt(FILE_TYPE_FASTA_READ))
    .expect(UnspecifiedValue["fileType"]).eql(parseInt(FILE_TYPE_UNSPECIFIED))
    .expect(TsvValue["fileType"]).eql(parseInt(FILE_TYPE_TSV))
    .expect(CsvValue["fileType"]).eql(parseInt(FILE_TYPE_CSV))
    .expect(VdjmlValue["fileType"]).eql(parseInt(FILE_TYPE_VDJML))
    .expect(AirrTsvValue["fileType"]).eql(parseInt(FILE_TYPE_AIRR_TSV))
    .expect(AirrJsonValue["fileType"]).eql(parseInt(FILE_TYPE_AIRR_JSON))

  const FastqPairedEndForwardFileSelectUntrimmed = await FastqPairedEndForwardFileSelect.find('option').withAttribute("selected").innerText; 
  const FastqPairedEndReverseFileSelectUntrimmed = await FastqPairedEndReverseFileSelect.find('option').withAttribute("selected").innerText; 
  const FastaQualitySequences1FileSelectUntrimmed = await FastaQualitySequences1FileSelect.find('option').withAttribute("selected").innerText;
  const FastaQualitySequences2FileSelectUntrimmed = await FastaQualitySequences2FileSelect.find('option').withAttribute("selected").innerText;
  const PrimerSequencesForwardFileSelectUntrimmed = await PrimerSequencesForwardFileSelect.find('option').withAttribute("selected").innerText;
  const PrimerSequencesReverseFileSelectUntrimmed = await PrimerSequencesReverseFileSelect.find('option').withAttribute("selected").innerText;
  const BarcodeSequencesFileSelectUntrimmed = await BarcodeSequencesFileSelect.find('option').withAttribute("selected").innerText;
  const FastaSequencesFileSelectUntrimmed = await FastaSequencesFileSelect.find('option').withAttribute("selected").innerText;
  const UnspecifiedFileSelectUntrimmed = await UnspecifiedFileSelect.find('option').withAttribute("selected").innerText;
  const TsvFileSelectUntrimmed = await TsvFileSelect.find('option').withAttribute("selected").innerText;
  const CsvFileSelectUntrimmed = await CsvFileSelect.find('option').withAttribute("selected").innerText;
  const VdjmlFileSelectUntrimmed = await VdjmlFileSelect.find('option').withAttribute("selected").innerText;
  const AirrTsvFileSelectUntrimmed = await AirrTsvFileSelect.find('option').withAttribute("selected").innerText;
  const AirrJsonFileSelectUntrimmed = await AirrJsonFileSelect.find('option').withAttribute("selected").innerText;

  //Confirm the displayed values in the drop-downs are correct
  await t
    .expect(FastqPairedEndForwardFileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_FASTQ_READ_STRING)
    .expect(FastqPairedEndReverseFileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_FASTQ_READ_STRING)
    .expect(FastaQualitySequences1FileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_FASTA_READ_STRING)
    .expect(FastaQualitySequences2FileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_QUALITY_STRING)
    .expect(PrimerSequencesForwardFileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_PRIMER_STRING)
    .expect(PrimerSequencesReverseFileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_PRIMER_STRING)
    .expect(BarcodeSequencesFileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_BARCODE_STRING)
    .expect(FastaSequencesFileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_FASTA_READ_STRING)
    .expect(UnspecifiedFileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_UNSPECIFIED_STRING)
    .expect(TsvFileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_TSV_STRING)
    .expect(CsvFileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_CSV_STRING)
    .expect(VdjmlFileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_VDJML_STRING)
    .expect(AirrTsvFileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_AIRR_TSV_STRING)
    .expect(AirrJsonFileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_AIRR_JSON_STRING)
 });

 test('Confirm the \'Upload Files\' button is disabled when uploading a file and enabled otherwise', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t
    .navigateTo('./'+projectUuidUrl)
    .click(filesTabSelect)

  //Expect the Upload Files button to be available
  await t.expect(uploadFilesSelect.withExactText('Upload Files').hasAttribute('disabled')).notOk()

  //Start the process for uploading and confirm the button is now disabled
  await t
    .click(uploadFilesSelect)
    .click(uploadFilesComputerSelect)
    .expect(uploadFilesSelect.withExactText('Upload Files').hasAttribute('disabled')).ok()

  //Cancel the upload and confirm the button is available
  await t
    .click(cancelUploadSelect)
    .expect(uploadFilesSelect.withExactText('Upload Files').hasAttribute('disabled')).notOk()

  //Complete an upload and click done and confirm the button is available
  await t
    .click(uploadFilesSelect)
    .click(uploadFilesComputerSelect)
    .setFilesToUpload(uploadFilesComputerDialogSelect, [filesPath + testFile])
    .click(addStartUploadSelect)
    .wait(config.short_upload_wait) //Wait for the upload to complete
    .click(doneUploadSelect)
    .expect(uploadFilesSelect.withExactText('Upload Files').hasAttribute('disabled')).notOk()

  //Delete the uploaded file
  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var files = await tapisV2.getProjectMetadata(token.access_token, projectUuid);
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
    var files = await tapisV3.sendRequest(requestSettings);
    await t.expect(files['status']).eql("success")
        .expect(files['result'].length).eql(15); //Ensure all 14 files were uploaded
    var files = files['result'];
  }

  //Get the UUID for the new file
  var testFileUuid;
  for(let i=0; i<files.length; i++)
    if(files[i]["value"]["name"] == testFile) testFileUuid = files[i]['uuid'];

  const testFileDeleteSelect = Selector(projectFilesFormBase + testFileUuid).find(projectFileDeleteId);

  await t
    .click(testFileDeleteSelect)
    .click(saveFilesChangesSelect)
    .wait(config.save_timeout)
 });

 test('Confirm \'Revert Changes\' and \'Save Changes\' buttons are disabled/enabled correctly', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t
    .navigateTo('./'+projectUuidUrl)
    .click(filesTabSelect)

  //Expect the buttons to be unavailable when no changes have been made
  await t.expect(revertFileChangesSelect.withExactText('Revert Changes').hasAttribute('disabled')).ok()
  await t.expect(saveFilesChangesSelect.withExactText('Save Changes').hasAttribute('disabled')).ok()

  //Delete a file and revert, then add a tag and revert
  const FastqPairedEndForwardFileDeleteSelect = Selector(projectFilesFormBase + FastqPairedEndForwardFileUuid).find(projectFileDeleteId);
  const FastqPairedEndForwardFileTagsSelect = Selector(projectFilesFormBase + FastqPairedEndForwardFileUuid).find(projectFileTagsId);

  await t
    .click(FastqPairedEndForwardFileDeleteSelect)
    .expect(revertFileChangesSelect.withExactText('Revert Changes').hasAttribute('disabled')).notOk()
    .expect(saveFilesChangesSelect.withExactText('Save Changes').hasAttribute('disabled')).notOk()
    .click(revertFileChangesSelect)
    .typeText(FastqPairedEndForwardFileTagsSelect, 'string',  {replace: true})
    .pressKey('tab') //Change focus
    .expect(revertFileChangesSelect.withExactText('Revert Changes').hasAttribute('disabled')).notOk()
    .expect(saveFilesChangesSelect.withExactText('Save Changes').hasAttribute('disabled')).notOk()
    .click(revertFileChangesSelect)

  //Ensure the buttons are disabled after a save
  await t
    .typeText(FastqPairedEndForwardFileTagsSelect, 'string',  {replace: true})
    .click(saveFilesChangesSelect)
    .wait(config.save_timeout)
    .expect(revertFileChangesSelect.withExactText('Revert Changes').hasAttribute('disabled')).ok()
    .expect(saveFilesChangesSelect.withExactText('Save Changes').hasAttribute('disabled')).ok()
    .typeText(FastqPairedEndForwardFileTagsSelect, ' ', {replace: true})
    .click(saveFilesChangesSelect)
    .wait(config.save_timeout)
 });

 test('Attempt to upload duplicate files and delete a file after file selection; confirm the correct file uploads', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t
    .navigateTo('./'+projectUuidUrl)
    .click(filesTabSelect)
    .click(uploadFilesSelect)
    .click(uploadFilesComputerSelect)

  const FastaSequencesDeleteSelector = filesGeneralTableRowSelect.withText(FastaSequencesDeleteFile);
  const FastaSequencesDeleteSelectorByExactName = filesGeneralTableRowSelect.find('div').withExactText(FastaSequencesDeleteFile);

  await t
    .setFilesToUpload(uploadFilesComputerDialogSelect, [filesPath + FastaSequencesRenamedDuplicateFile]) //Should upload
    .setFilesToUpload(uploadFilesComputerDialogSelect, [filesPath + FastaSequencesDuplicateFile]) //Should not upload

  var errorMessage = Selector('div').withExactText(duplicateFilesRemovedString + FastaSequencesDuplicateFile).filterVisible().exists;
  await t.expect(errorMessage).ok()

  await t
    .setFilesToUpload(uploadFilesComputerDialogSelect, [filesPath + FastaSequencesDeleteFile]) //Should not upload

  //Based on the HTML, neither selector is sufficient alone, so we must confirm we are working with the same group of elements
  await t
    .expect(FastaSequencesDeleteSelector.exists).ok()
    .expect(FastaSequencesDeleteSelectorByExactName.exists).ok()

  var FastaSequencesDeleteSelectorByExactNameInnerText = await FastaSequencesDeleteSelectorByExactName.parent().nth(0).innerText;
  var FastaSequencesDeleteSelectorInnerText = await FastaSequencesDeleteSelector.nth(0).innerText;

  await t.expect(FastaSequencesDeleteSelectorByExactNameInnerText).eql(FastaSequencesDeleteSelectorInnerText);

  //Get the CID now that we have confirmed we have the correct "row"
  var FastaSequencesDeleteCid = await FastaSequencesDeleteSelector.find(projectFileDeleteUploadFileId).getAttribute('name');

  await t
    .click(projectFileDeleteUploadFileSelect.withAttribute('name',FastaSequencesDeleteCid))
    .click(navbarStatsIconSelect)
    .click(addStartUploadSelect)
    .wait(config.upload_wait) //Wait for the upload to complete
    .click(doneUploadSelect)

  //Ensure there are 15 files
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
        .expect(m['result'].length).eql(15); //Ensure there are now 15 files
    var files = m['result'];
  }

  for(let i=0; i<files.length; i++) if(files[i]["value"]["name"] == FastaSequencesRenamedDuplicateFile) FastaSequencesRenamedDuplicateFileUuid = files[i]['uuid'];
 });

 test('Change Files fields and ensure the changes are reflected on the Back-end and in the drop-downs', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);

  //Get the UUIDs associated with the uploaded Files
  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var files = await tapisV2.getProjectMetadata(token.access_token, projectUuid);
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
    var files = await tapisV3.sendRequest(requestSettings);
    await t.expect(files['status']).eql("success")
        .expect(files['result'].length).eql(15);
    files = files['result'];
  }

  var FastqPairedEndForwardFileTagsSelect = await Selector(projectFilesFormBase + FastqPairedEndForwardFileUuid).find(projectFileTagsId);
  var FastqPairedEndReverseFileTagsSelect = await Selector(projectFilesFormBase + FastqPairedEndReverseFileUuid).find(projectFileTagsId);

  var PrimerSequencesForwardFileSelect = await Selector(projectFilesFormBase + PrimerSequencesForwardFileUuid).find(projectFileReadDirectionId);
  var PrimerSequencesForwardFileOption = await PrimerSequencesForwardFileSelect.find('option');
  var PrimerSequencesForwardFileValue = "F";

  const PrimerSequencesReverseFileSelect = Selector(projectFilesFormBase + PrimerSequencesReverseFileUuid).find(projectFileReadDirectionId);
  const PrimerSequencesReverseFileOption = PrimerSequencesReverseFileSelect.find('option');
  var PrimerSequencesReverseFileValue = "R";

  const BarcodeSequencesFileSelect = Selector(projectFilesFormBase + BarcodeSequencesFileUuid).find(projectFileReadDirectionId);
  const BarcodeSequencesFileOption = BarcodeSequencesFileSelect.find('option');
  var BarcodeSequencesFileValue = "FR";

  var FastqPairedEndForwardFileTagsText = "Forward";
  var FastqPairedEndReverseFileTagsText = "         ";

  await t
    .click(filesTabSelect)
    .typeText(FastqPairedEndForwardFileTagsSelect, FastqPairedEndForwardFileTagsText, {replace: true})
    .typeText(FastqPairedEndReverseFileTagsSelect, FastqPairedEndReverseFileTagsText, {replace: true})
    .click(PrimerSequencesForwardFileSelect)
    .click(PrimerSequencesForwardFileOption.withExactText(PrimerSequencesForwardFileValue))
    .click(PrimerSequencesReverseFileSelect)
    .click(PrimerSequencesReverseFileOption.withExactText(PrimerSequencesReverseFileValue))
    .click(BarcodeSequencesFileSelect)
    .click(BarcodeSequencesFileOption.withExactText(BarcodeSequencesFileValue))
    .click(saveFilesChangesSelect)
    .wait(config.save_timeout)

  token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var files = await tapisV2.getProjectMetadata(token.access_token, projectUuid);
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
    var files = await tapisV3.sendRequest(requestSettings);
    await t.expect(files['status']).eql("success")
        .expect(files['result'].length).eql(15);
    files = files['result'];
  }

  var FastqPairedEndForwardValue, FastqPairedEndReverseValue;
  var PrimerSequencesForwardValue, PrimerSequencesReverseValue;
  var BarcodeSequencesValue;

  for(let i=0; i<files.length; i++) {
    if(files[i]["value"]["name"] == FastqPairedEndForwardFile) FastqPairedEndForwardValue = files[i]['value'];
    else if(files[i]["value"]["name"] == FastqPairedEndReverseFile) FastqPairedEndReverseValue = files[i]['value'];
    else if(files[i]["value"]["name"] == PrimerSequencesForwardFile) PrimerSequencesForwardValue = files[i]['value'];
    else if(files[i]["value"]["name"] == PrimerSequencesReverseFile) PrimerSequencesReverseValue = files[i]['value'];
    else if(files[i]["value"]["name"] == BarcodeSequencesFile) BarcodeSequencesValue = files[i]['value'];
  }

  //Confirm the Back-end values are correct
  await t 
    .expect(FastqPairedEndForwardValue["tags"]).eql(FastqPairedEndForwardFileTagsText)
    .expect(FastqPairedEndReverseValue["tags"] == null).ok()
    .expect(PrimerSequencesForwardValue["readDirection"]).eql(PrimerSequencesForwardFileValue)
    .expect(PrimerSequencesReverseValue["readDirection"]).eql(PrimerSequencesReverseFileValue)
    .expect(BarcodeSequencesValue["readDirection"]).eql(BarcodeSequencesFileValue)

  //Confirm the displayed values in the drop-downs are correct
  await t
    .expect(FastqPairedEndForwardFileTagsSelect.value).eql(FastqPairedEndForwardFileTagsText)
    .expect(FastqPairedEndReverseFileTagsSelect.value).eql('')
    .expect(PrimerSequencesForwardFileSelect.find('option').withAttribute("selected").innerText).eql(PrimerSequencesForwardFileValue)
    .expect(PrimerSequencesReverseFileSelect.find('option').withAttribute("selected").innerText).eql(PrimerSequencesReverseFileValue)
    .expect(BarcodeSequencesFileSelect.find('option').withAttribute("selected").innerText).eql(BarcodeSequencesFileValue)

  //Change select field and drop-down to blank and null, respectively, and confirm the changes are made
  FastqPairedEndForwardFileTagsText = "    "; //Both are explicit null on the Back-end, so use null in the expect assertions below
  PrimerSequencesForwardFileValue = "null"; 

  await t
    .click(filesTabSelect)
    .click(navbarStatsIconSelect)
    .scroll(PrimerSequencesReverseFileSelect,'center')
    .scrollBy(0,-200)
    .typeText(FastqPairedEndForwardFileTagsSelect, FastqPairedEndForwardFileTagsText, {replace: true})
    .click(saveFilesChangesSelect)
    .wait(config.save_timeout)
    .click(PrimerSequencesForwardFileSelect)
    .click(PrimerSequencesForwardFileOption.withExactText(PrimerSequencesForwardFileValue))
    .click(saveFilesChangesSelect)
    .wait(config.save_timeout)

  token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var files = await tapisV2.getProjectMetadata(token.access_token, projectUuid);
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
    var files = await tapisV3.sendRequest(requestSettings);
    await t.expect(files['status']).eql("success")
        .expect(files['result'].length).eql(15);
    files = files['result'];
  }

  for(let i=0; i<files.length; i++) {
    if(files[i]["value"]["name"] == FastqPairedEndForwardFile) { FastqPairedEndForwardValue = files[i]['value']; }
    else if(files[i]["value"]["name"] == PrimerSequencesForwardFile) PrimerSequencesForwardValue = files[i]['value'];
  }

  //Confirm the Back-end values are correct
  await t
    .expect(FastqPairedEndForwardValue["tags"] == null).ok()
    .expect(PrimerSequencesForwardValue["readDirection"] == null).ok()

  //Confirm the displayed values in the drop-downs are correct
  await t
    .expect(FastqPairedEndForwardFileTagsSelect.value).eql('') //ok
    .expect(FastqPairedEndReverseFileTagsSelect.value).eql('') //ok
    .expect(PrimerSequencesForwardFileSelect.find('option').withAttribute("selected").innerText).eql(PrimerSequencesForwardFileValue)
 });

 test('Change select Files fields, revert, and confirm original values are shown', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t
    .navigateTo('./'+projectUuidUrl)
    .click(filesTabSelect)

  const FastqPairedEndForwardFileTagsSelect = Selector(projectFilesFormBase + FastqPairedEndForwardFileUuid).find(projectFileTagsId);
  const FastqPairedEndReverseFileTagsSelect = Selector(projectFilesFormBase + FastqPairedEndReverseFileUuid).find(projectFileTagsId);

  const PrimerSequencesForwardFileSelect = Selector(projectFilesFormBase + PrimerSequencesForwardFileUuid).find(projectFileTypeId);
  const PrimerSequencesForwardFileOption = PrimerSequencesForwardFileSelect.find('option');

  const BarcodeSequencesFileSelect = Selector(projectFilesFormBase + BarcodeSequencesFileUuid).find(projectFileTypeId);
  const BarcodeSequencesFileOption = BarcodeSequencesFileSelect.find('option');
  const BarcodeSequencesFileValue = "Barcode Sequences";

  const UnspecifiedFileSelect = Selector(projectFilesFormBase + UnspecifiedFileUuid).find(projectFileTypeId);
  const UnspecifiedFileOption = UnspecifiedFileSelect.find('option');
  const UnspecifiedFileValue = "Unspecified";

  const TsvFileSelect = Selector(projectFilesFormBase + TsvFileUuid).find(projectFileTypeId);
  const TsvFileOption = TsvFileSelect.find('option');
  const TsvFileValue = "TAB-separated Values";

  const CsvFileSelect = Selector(projectFilesFormBase + CsvFileUuid).find(projectFileTypeId);
  const CsvFileOption = CsvFileSelect.find('option');
  const CsvFileValue = "Comma-separated Values";

  const AirrJsonFileSelect = Selector(projectFilesFormBase + AirrJsonFileUuid).find(projectFileTypeId);
  const AirrJsonFileOption = AirrJsonFileSelect.find('option');
  const AirrJsonFileValue = "AIRR JSON";

  var PrimerSequencesForwardFileSelectUntrimmed = await PrimerSequencesForwardFileSelect.find('option').withAttribute("selected").innerText;
  var BarcodeSequencesFileSelectUntrimmed = await BarcodeSequencesFileSelect.find('option').withAttribute("selected").innerText;
  var UnspecifiedFileSelectUntrimmed = await UnspecifiedFileSelect.find('option').withAttribute("selected").innerText;
  var TsvFileSelectUntrimmed = await TsvFileSelect.find('option').withAttribute("selected").innerText;
  var CsvFileSelectUntrimmed = await CsvFileSelect.find('option').withAttribute("selected").innerText;
  var AirrJsonFileSelectUntrimmed = await AirrJsonFileSelect.find('option').withAttribute("selected").innerText;

  //Confirm the displayed values in the drop-downs are correct
  await t
    .expect(FastqPairedEndForwardFileTagsSelect.value).eql('')
    .expect(FastqPairedEndReverseFileTagsSelect.value).eql('')
    .expect(PrimerSequencesForwardFileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_PRIMER_STRING)
    .expect(BarcodeSequencesFileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_BARCODE_STRING)
    .expect(UnspecifiedFileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_UNSPECIFIED_STRING)
    .expect(TsvFileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_TSV_STRING)
    .expect(CsvFileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_CSV_STRING)
    .expect(AirrJsonFileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_AIRR_JSON_STRING)

  const FastqPairedEndForwardFileTagsNewText = "Forward";
  const FastqPairedEndReverseFileTagsNewText = "Reverse Text";
  const PrimerSequencesForwardFileNewValue = "TAB-separated Values"; //FILE_TYPE_TSV.toString() (used below in the expect assertions)
  const BarcodeSequencesFileNewValue = "Primer Sequences"; //FILE_TYPE_PRIMER.toString()
  const UnspecifiedFileNewValue = "Barcode Sequences"; //FILE_TYPE_BARCODE.toString()
  const TsvFileNewValue = "Unspecified"; //FILE_TYPE_UNSPECIFIED.toString()
  const CsvFileNewValue = "VDJML"; //FILE_TYPE_VDJML.toString()
  const AirrJsonFileNewValue = "AIRR TSV"; //FILE_TYPE_AIRR_TSV.toString()
  const FastaSequencesFileDeleteSelect = Selector(projectFilesFormBase + FastaSequencesFileUuid).find(projectFileDeleteId);

  //Change select values
  await t
    .typeText(FastqPairedEndForwardFileTagsSelect, FastqPairedEndForwardFileTagsNewText, {replace: true})
    .typeText(FastqPairedEndReverseFileTagsSelect, FastqPairedEndReverseFileTagsNewText, {replace: true})
    .click(PrimerSequencesForwardFileSelect)
    .click(PrimerSequencesForwardFileOption.withExactText(PrimerSequencesForwardFileNewValue))
    .click(AirrJsonFileSelect)
    .click(AirrJsonFileOption.withExactText(AirrJsonFileNewValue))
    .click(UnspecifiedFileSelect)
    .click(UnspecifiedFileOption.withExactText(UnspecifiedFileNewValue))
    .click(BarcodeSequencesFileSelect)
    .click(BarcodeSequencesFileOption.withExactText(BarcodeSequencesFileNewValue))
    .click(TsvFileSelect)
    .click(TsvFileOption.withExactText(TsvFileNewValue))
    .click(CsvFileSelect)
    .click(CsvFileOption.withExactText(CsvFileNewValue))
    .click(FastaSequencesFileDeleteSelect)

  //Confirm the displayed values are updated
  await t
    .expect(FastqPairedEndForwardFileTagsSelect.value).eql(FastqPairedEndForwardFileTagsNewText)
    .expect(FastqPairedEndReverseFileTagsSelect.value).eql(FastqPairedEndReverseFileTagsNewText)
    .expect(PrimerSequencesForwardFileSelect.value).eql(FILE_TYPE_TSV.toString())
    .expect(BarcodeSequencesFileSelect.value).eql(FILE_TYPE_PRIMER.toString())
    .expect(UnspecifiedFileSelect.value).eql(FILE_TYPE_BARCODE.toString())
    .expect(TsvFileSelect.value).eql(FILE_TYPE_UNSPECIFIED.toString())
    .expect(CsvFileSelect.value).eql(FILE_TYPE_VDJML.toString())
    .expect(AirrJsonFileSelect.value).eql(FILE_TYPE_AIRR_TSV.toString())

  //Revert Changes
  await t
    .click(revertFileChangesSelect)

  //Confirm the displayed values in the drop-downs are reverted
  await t
    .expect(FastqPairedEndForwardFileTagsSelect.value).eql('')
    .expect(FastqPairedEndReverseFileTagsSelect.value).eql('')
    .expect(PrimerSequencesForwardFileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_PRIMER_STRING)
    .expect(BarcodeSequencesFileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_BARCODE_STRING)
    .expect(UnspecifiedFileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_UNSPECIFIED_STRING)
    .expect(TsvFileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_TSV_STRING)
    .expect(CsvFileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_CSV_STRING)
    .expect(AirrJsonFileSelectUntrimmed.toString().trim()).eql(FILE_TYPE_AIRR_JSON_STRING)

  //Confirm the Back-end is unchanged
    var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var files = await tapisV2.getProjectMetadata(token.access_token, projectUuid);
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
    var files = await tapisV3.sendRequest(requestSettings);
    await t.expect(files['status']).eql("success")
        .expect(files['result'].length).eql(15);
    files = files['result'];
  }

  var FastqPairedEndForwardValue, FastqPairedEndReverseValue;
  var PrimerSequencesForwardValue, BarcodeSequencesValue;
  var UnspecifiedValue, TsvValue, CsvValue, AirrJsonValue;

  for(let i=0; i<files.length; i++) {
    if(files[i]["uuid"] == FastqPairedEndForwardFileUuid) FastqPairedEndForwardValue = files[i]['value'];
    else if(files[i]["uuid"] == FastqPairedEndReverseFileUuid) FastqPairedEndReverseValue = files[i]['value'];
    else if(files[i]["uuid"] == PrimerSequencesForwardFileUuid) PrimerSequencesForwardValue = files[i]['value'];
    else if(files[i]["uuid"] == BarcodeSequencesFileUuid) BarcodeSequencesValue = files[i]['value'];
    else if(files[i]["uuid"] == UnspecifiedFileUuid) UnspecifiedValue = files[i]['value'];
    else if(files[i]["uuid"] == TsvFileUuid) TsvValue = files[i]['value'];
    else if(files[i]["uuid"] == CsvFileUuid) CsvValue = files[i]['value'];
    else if(files[i]["uuid"] == AirrJsonFileUuid) AirrJsonValue = files[i]['value'];
  }

  await t
    .expect(FastqPairedEndForwardValue["tags"] == null).ok()
    .expect(FastqPairedEndReverseValue["tags"] == null).ok()
    .expect(PrimerSequencesForwardValue["fileType"]).eql(parseInt(FILE_TYPE_PRIMER))
    .expect(BarcodeSequencesValue["fileType"]).eql(parseInt(FILE_TYPE_BARCODE))
    .expect(UnspecifiedValue["fileType"]).eql(parseInt(FILE_TYPE_UNSPECIFIED))
    .expect(TsvValue["fileType"]).eql(parseInt(FILE_TYPE_TSV))
    .expect(CsvValue["fileType"]).eql(parseInt(FILE_TYPE_CSV))
    .expect(AirrJsonValue["fileType"]).eql(parseInt(FILE_TYPE_AIRR_JSON))
 });

 test('Pair 1\) Paired-end FASTQ read files and 2\) FASTA read files and quality score files; cancel pairing', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t
    .navigateTo('./'+projectUuidUrl)
    .click(filesTabSelect)

  //Pair Read Files
  await t
    .click(filesPairFilesSelect)
    .click(projectFilePairRadioSelect.withAttribute('for',projectFileReadQualityRadioOptionFor))
    .typeText(filesReadFileAnchorSelect,'.fna', {replace:true})
    .click(filesPerformPairingButtonSelect)
    .expect(projectModalDialogSelect.find(projectModalBodyClass).innerText).contains(pairedString1)
    .expect(projectModalDialogSelect.find(projectModalBodyClass).innerText).contains(pairedString2)
    .click(filesConfirmPairingButtonSelect)
    .click(saveFilesChangesSelect)
    .wait(config.save_timeout)

  await t
    .click(filesPairFilesSelect)
    .click(projectFilePairRadioSelect.withAttribute('for',projectFilePairedEndRadioOptionFor))
    .click(filesPerformPairingButtonSelect)
    .expect(projectModalDialogSelect.find(projectModalBodyClass).innerText).contains(pairedString1)
    .expect(projectModalDialogSelect.find(projectModalBodyClass).innerText).contains(pairedString2)
    .click(filesConfirmPairingButtonSelect)
    .click(saveFilesChangesSelect)
    .wait(config.save_timeout)

  //Ensure the files were paired
  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var files = await tapisV2.getProjectMetadata(token.access_token, projectUuid);
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
    var files = await tapisV3.sendRequest(requestSettings);
    await t.expect(files['status']).eql("success")
        .expect(files['result'].length).eql(15);
    files = files['result'];
  }

  var FastqPairedEndForwardValue, FastqPairedEndReverseValue;
  var FastaQualitySequences1Value, FastaQualitySequences2Value;

  for(let i=0; i<files.length; i++) {
    if(files[i]["uuid"] == FastqPairedEndForwardFileUuid) FastqPairedEndForwardValue = files[i]['value'];
    else if(files[i]["uuid"] == FastqPairedEndReverseFileUuid) FastqPairedEndReverseValue = files[i]['value'];
    else if(files[i]["uuid"] == FastaQualitySequences1FileUuid) FastaQualitySequences1Value = files[i]['value'];
    else if(files[i]["uuid"] == FastaQualitySequences2FileUuid) FastaQualitySequences2Value = files[i]['value'];
  }

  await t
    .expect(FastqPairedEndForwardValue["pairedReadMetadataUuid"]).eql(FastqPairedEndReverseFileUuid)
    .expect(FastqPairedEndReverseValue["pairedReadMetadataUuid"]).eql(FastqPairedEndForwardFileUuid)
    .expect(FastaQualitySequences1Value["qualityScoreMetadataUuid"]).eql(FastaQualitySequences2FileUuid)
    .expect(FastaQualitySequences2Value["readMetadataUuid"]).eql(FastaQualitySequences1FileUuid)
 });

 test('Confirm Paired files are grouped and have the correct display options', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t
    .navigateTo('./'+projectUuidUrl)
    .click(filesTabSelect)

  const PairedEndFastqForwardSelect = Selector(projectFilesFormBase + FastqPairedEndForwardFileUuid);
  const PairedEndFastqReverseSelect = Selector(projectFilesFormBase + FastqPairedEndReverseFileUuid);
  const FastaReadQuality1Select = Selector(projectFilesFormBase + FastaQualitySequences1FileUuid);
  const FastaReadQuality2Select = Selector(projectFilesFormBase + FastaQualitySequences2FileUuid);

  //Expect a form for the '*_1.fastq' forward paired-end file and the '*.fna' fasta paired-end file and not the others
  await t
    .expect(PairedEndFastqForwardSelect.count).eql(1)
    .expect(PairedEndFastqReverseSelect.count).eql(0)
    .expect(FastaReadQuality1Select.count).eql(1)
    .expect(FastaReadQuality2Select.count).eql(0)

  //Expect the 2 existing paired forms to have 2 rows apiece
  await t
    .expect(PairedEndFastqForwardSelect.find(projectFileDownloadId).count).eql(2)
    .expect(PairedEndFastqForwardSelect.find(projectFileDownloadId).nth(0).innerText).contains(FastqPairedEndForwardFile)
    .expect(PairedEndFastqForwardSelect.find(projectFileDownloadId).nth(1).innerText).contains(FastqPairedEndReverseFile)
    .expect(FastaReadQuality1Select.find(projectFileDownloadId).count).eql(2)
    .expect(FastaReadQuality1Select.find(projectFileDownloadId).nth(0).innerText).contains(FastaQualitySequences1File)
    .expect(FastaReadQuality1Select.find(projectFileDownloadId).nth(1).innerText).contains(FastaQualitySequences2File)

  //Expect the 2 existing paired forms have an unpair button and not a delete button
  await t
    .expect(PairedEndFastqForwardSelect.find(projectFileUnpairId).count).eql(1)
    .expect(FastaReadQuality1Select.find(projectFileUnpairId).count).eql(1)
    .expect(PairedEndFastqForwardSelect.find(projectFileDeleteId).count).eql(0)
    .expect(FastaReadQuality1Select.find(projectFileDeleteId).count).eql(0)

  //Get the displayed text for the strings
  var PairedEndFastqForwardString = await PairedEndFastqForwardSelect.find(projectFileColClass).innerText;
  var FastaReadQualityString = await FastaReadQuality1Select.find(projectFileColClass).innerText;

  //Remove the file names from the strings
  PairedEndFastqForwardString = PairedEndFastqForwardString.replace(FastqPairedEndForwardFile,'');
  PairedEndFastqForwardString = PairedEndFastqForwardString.replace(FastqPairedEndReverseFile,'');
  FastaReadQualityString = FastaReadQualityString.replace(FastaQualitySequences1File,'');
  FastaReadQualityString = FastaReadQualityString.replace(FastaQualitySequences2File,'');

  //The FASTA/quality score string should have "Quality Scores" and "Quality" - remove "Quality Scores" for testing ease
  var FastaReadQualitySubstring = FastaReadQualityString.replace('Quality Scores','');
  var FastqReadDataMatch = "FASTQ Read Data";
  const FastqReadDataRegExp = new RegExp(FastqReadDataMatch, "g"); 
 
  //Expect the 2 existing paired forms to have directions specified and the correct types
  await t
    .expect(PairedEndFastqForwardString).contains('Forward')
    .expect(PairedEndFastqForwardString).contains('Reverse')
    //Both sequences should have "Fastq Read Data" as their type; expect 2 matches
    .expect(PairedEndFastqForwardString.match(FastqReadDataRegExp).length).eql(2)
    .expect(FastaReadQualityString).contains('Read')
    .expect(FastaReadQualitySubstring).contains('Quality')
    .expect(FastaReadQualityString).contains('FASTA Sequences')
    .expect(FastaReadQualityString).contains('Quality Scores')
 });

 test('Sort (while there exists paired files) according to the 4 \'Sort By\' options and confirm the correct sorting occurred', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t
    .navigateTo('./'+projectUuidUrl)
    .click(filesTabSelect)

  //Get timestamps for each file
  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var files = await tapisV2.getProjectMetadata(token.access_token, projectUuid);
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
    var files = await tapisV3.sendRequest(requestSettings);
    await t.expect(files['status']).eql("success")
        .expect(files['result'].length).eql(15);
    files = files['result'];
  }

  var filesNamesMap = new Map();
  var filesNames = [];
  var filesDatesMap = new Map();
  var filesDates = [];
  var filesSizesMap = new Map();
  var filesSizes = [];

  for(let i=0; i<files.length; i++) {
    if(!files[i]["value"]["pairedReadMetadataUuid"] && !files[i]["value"]["qualityScoreMetadataUuid"] 
        && !files[i]["value"]["readMetadataUuid"]) { //add normally if not paired
      filesDatesMap.set(files[i]["lastUpdated"],[files[i]["value"]["name"], false]);
      filesDates.push(files[i]["lastUpdated"]);
      filesNamesMap.set(files[i]["value"]["name"], [files[i]["value"]["name"], false]);
      filesNames.push(files[i]["value"]["name"]);
      filesSizesMap.set(files[i]["value"]["size"], [files[i]["value"]["name"], false]);
      filesSizes.push(files[i]["value"]["size"]);
    } else {
      if(files[i]["value"]["pairedReadMetadataUuid"] && files[i]["value"]["name"].includes("_1.fastq")) { //add first
        filesDatesMap.set(files[i]["lastUpdated"],[files[i]["value"]["name"], true]); //true means paired
        filesNamesMap.set(files[i]["value"]["name"],[files[i]["value"]["name"], true]);
        filesSizesMap.set(files[i]["value"]["size"],[files[i]["value"]["name"], true]);
        filesDates.push(files[i]["lastUpdated"]);
        filesNames.push(files[i]["value"]["name"]);
        filesSizes.push(files[i]["value"]["size"]);
      } else if (files[i]["value"]["qualityScoreMetadataUuid"]) {
        filesDatesMap.set(files[i]["lastUpdated"],[files[i]["value"]["name"], true]);
        filesNamesMap.set(files[i]["value"]["name"],[files[i]["value"]["name"], true]);
        filesSizesMap.set(files[i]["value"]["size"],[files[i]["value"]["name"], true]);
        filesDates.push(files[i]["lastUpdated"]);
        filesNames.push(files[i]["value"]["name"]);
        filesSizes.push(files[i]["value"]["size"]);
      }
    }
  }

  filesDates.sort();
  filesDates.reverse(); //Newest first

  //Sort by file name
  await t
    .click(sortDropdownSelect)
    .click(sortDropdownOptionSelect.withAttribute('name','name'))

  //Confirm the sorted order matches the expected order
  filesNames.sort(function (a,b) { return a.toLowerCase().localeCompare(b.toLowerCase()); });
  var l=0;
  for(let k=0; k<filesNames.length; k++) {
    if(filesNamesMap.get(filesNames[k])[1]) {
      await t.expect(filesSortSelect.find(projectFileDownloadId).nth(l).innerText).eql((filesNamesMap.get(filesNames[k]))[0]);
      l+=1; //Skip a gui row after the first in a pair
    } else {
      await t.expect(filesSortSelect.find(projectFileDownloadId).nth(l).innerText).eql((filesNamesMap.get(filesNames[k]))[0]);
    }
    l++;
  }

  //Sort by newest
  await t
    .click(filesTabSelect)
    .click(sortDropdownSelect)
    .click(sortDropdownOptionSelect.withAttribute('name','newest'))

  //Confirm the sorted order matches the expected order
  l=0;
  for(let k=0; k<filesDates.length; k++) {
    if(filesDatesMap.get(filesDates[k])[1]) {
      await t.expect(filesSortSelect.find(projectFileDownloadId).nth(l).innerText).eql(filesDatesMap.get(filesDates[k])[0]);
      l+=1; //Skip a gui row after the first in a pair
    } else {
      await t.expect(filesSortSelect.find(projectFileDownloadId).nth(l).innerText).eql(filesDatesMap.get(filesDates[k])[0]);
    }
    l++;
  }

  //Sort by oldest
  await t
    .click(sortDropdownSelect)
    .click(sortDropdownOptionSelect.withAttribute('name','oldest'))

  //Confirm the sorted order matches the expected order
  filesDates.reverse();
  l=0;
  for(let k=0; k<filesDates.length; k++) {
    if(filesDatesMap.get(filesDates[k])[1]) {
      await t.expect(filesSortSelect.find(projectFileDownloadId).nth(l).innerText).eql(filesDatesMap.get(filesDates[k])[0]);
      l+=1; //Skip a gui row after the first in a pair
    } else {
      await t.expect(filesSortSelect.find(projectFileDownloadId).nth(l).innerText).eql(filesDatesMap.get(filesDates[k])[0]);
    }
    l++;
  }

  //Sort by size
  await t
    .click(sortDropdownSelect)
    .click(sortDropdownOptionSelect.withAttribute('name','size'))

  //Sort so that the largest files are first and confirm the sorted order matches the expected order
  filesSizes.sort(function (a,b) { return b-a; });
  l=0
  for(let k=0; k<filesSizes.length; k++) {
    if(filesSizesMap.get(filesSizes[k])[1]) {
      await t.expect(filesSortSelect.find(projectFileDownloadId).nth(l).innerText).eql(filesSizesMap.get(filesSizes[k])[0]);
      l+=1; //Skip a gui row after the first in a pair
    } else {
      await t.expect(filesSortSelect.find(projectFileDownloadId).nth(l).innerText).eql(filesSizesMap.get(filesSizes[k])[0]);
    }
    l++;
  }
 });

 test('Create a Subject, save, and create a Repertoire to ensure only the correct files appear in the Sequencing Files drop-down', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  const getPageUrl = ClientFunction(() => window.location.href);

  await t.navigateTo('./'+projectUuidUrl);
  const url = await getPageUrl();

  await t
    .click(subjectsTabSelect)
    .click(newSubjectSelect)

  var subjectCid = await projectSubjectFormSelect.find(projectSubjectDropdownId).getAttribute('name');

  await t
    .typeText(subjectIdBaseId + subjectCid, "Subject ID", {replace:true})
    .click(speciesSelect)
    .click(speciesOption.withExactText(species))
    .click(saveSubjectChangesSelect)
    .wait(config.save_timeout)
    .click(repertoiresTabSelect)
    .click(newRepertoireSelect)
    .click(newRepertoireAddSelect)

  //The Sequencing Files drop-down should only have select files
  await t
    .expect(sequencingFilesOption.count).eql(6)
    .expect(sequencingFilesSelect.find('option').withExactText(AirrTsvFile).exists).ok()
    .expect(sequencingFilesSelect.find('option').withExactText(FastqPairedEndForwardFile + " / " + FastqPairedEndReverseFile).exists).ok()
    .expect(sequencingFilesSelect.find('option').withExactText(FastaQualitySequences1File + " / " + FastaQualitySequences2File).exists).ok()
    .expect(sequencingFilesSelect.find('option').withExactText(FastaSequencesFile).exists).ok()
    .expect(sequencingFilesSelect.find('option').withExactText(FastaSequencesRenamedDuplicateFile).exists).ok()
    .expect(sequencingFilesSelect.find('option').withExactText("null").exists).ok()
 });

 test('Unpair 1\) Paired-end FASTQ read files and 2\) FASTA read files and quality score files; cancel pairing', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t
    .navigateTo('./'+projectUuidUrl)
    .click(filesTabSelect)

  var FastqPairedEndForwardValue, FastqPairedEndReverseValue;
  const FastqPairedEndForwardFileUnpairSelect = Selector(projectFilesFormBase + FastqPairedEndForwardFileUuid).find(projectFileUnpairId);

  var FastaQualitySequences1Value, FastaQualitySequences2Value;
  const FastaQualitySequences1FileUnpairSelect = Selector(projectFilesFormBase + FastaQualitySequences1FileUuid).find(projectFileUnpairId);

  //Unpair the forward read
  await t
    .click(FastqPairedEndForwardFileUnpairSelect)
    .click(FastaQualitySequences1FileUnpairSelect)
    .click(saveFilesChangesSelect)
    .wait(config.save_timeout)

  //Ensure the files were unpaired
  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var files = await tapisV2.getProjectMetadata(token.access_token, projectUuid);
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
    var files = await tapisV3.sendRequest(requestSettings);
    await t.expect(files['status']).eql("success")
        .expect(files['result'].length).eql(15);
    files = files['result'];
  }

  for(let i=0; i<files.length; i++) {
    if(files[i]["uuid"] == FastqPairedEndForwardFileUuid) FastqPairedEndForwardValue = files[i]['value'];
    else if(files[i]["uuid"] == FastqPairedEndReverseFileUuid) FastqPairedEndReverseValue = files[i]['value'];
    else if(files[i]["uuid"] == FastaQualitySequences1FileUuid) FastaQualitySequences1Value = files[i]['value'];
    else if(files[i]["uuid"] == FastaQualitySequences2FileUuid) FastaQualitySequences2Value = files[i]['value'];
  }

  //Ensure the files are unpaired
  await t
    .expect(FastqPairedEndForwardValue["pairedReadMetadataUuid"] == null).ok()
    .expect(FastqPairedEndReverseValue["pairedReadMetadataUuid"] == null).ok()
    .expect(FastaQualitySequences1Value["qualityScoreMetadataUuid"] == null).ok()
    .expect(FastaQualitySequences2Value["readMetadataUuid"] == null).ok()

  const FastqPairedEndForwardFileSelect = Selector(projectFilesFormBase + FastqPairedEndForwardFileUuid).find(projectFileReadDirectionId);
  const FastqPairedEndForwardFileOption = FastqPairedEndForwardFileSelect.find('option');
  var PrimerSequencesReverseFileValue = "R";

  //Start pairing then unpair and ensure the files are not paired
  await t
    .click(filesPairFilesSelect)
    .click(projectFilePairRadioSelect.withAttribute('for',projectFilePairedEndRadioOptionFor))
    .click(projectModalDialogSelect.find(projectFilesBtnCancelClass))
    .click(FastqPairedEndForwardFileSelect) //Change something so we can save
    .click(FastqPairedEndForwardFileOption.withExactText(PrimerSequencesReverseFileValue))
    .click(saveFilesChangesSelect)
    .wait(config.save_timeout)

  token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var files = await tapisV2.getProjectMetadata(token.access_token, projectUuid);
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
    var files = await tapisV3.sendRequest(requestSettings);
    await t.expect(files['status']).eql("success")
        .expect(files['result'].length).eql(15);
    files = files['result'];
  }

  for(let i=0; i<files.length; i++) {
    if(files[i]["uuid"] == FastqPairedEndForwardFileUuid) FastqPairedEndForwardValue = files[i]['value'];
    else if(files[i]["uuid"] == FastqPairedEndReverseFileUuid) FastqPairedEndReverseValue = files[i]['value'];
  }

  //Check to confirm they are still null
  await t
    .expect(FastqPairedEndForwardValue["pairedReadMetadataUuid"] == null).ok()
    .expect(FastqPairedEndReverseValue["pairedReadMetadataUuid"] == null).ok()
 });

 test('Sort (while there exists no paired files) according to the 4 \'Sort By\' options and confirm the correct sorting occurred', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t
    .navigateTo('./'+projectUuidUrl)
    .click(filesTabSelect)

  //Get timestamps for each file
  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var files = await tapisV2.getProjectMetadata(token.access_token, projectUuid);
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
    var files = await tapisV3.sendRequest(requestSettings);
    await t.expect(files['status']).eql("success")
        .expect(files['result'].length).eql(15);
    files = files['result'];
  }

  var filesNamesMap = new Map();
  var filesNames = [];
  var filesDatesMap = new Map();
  var filesDates = [];
  var filesSizesMap = new Map();
  var filesSizes = [];

  for(let i=0; i<files.length; i++) {
    filesNamesMap.set(files[i]["value"]["name"], files[i]["value"]["name"]);
    filesNames.push(files[i]["value"]["name"]);
    filesDatesMap.set(files[i]["lastUpdated"], files[i]["value"]["name"]);
    filesDates.push(files[i]["lastUpdated"]);
    filesSizesMap.set(files[i]["value"]["name"], files[i]["value"]["size"]);
    filesSizes.push(files[i]["value"]["size"]);
  }

  //Sort A-Z
  filesNames.sort(function (a,b) { return a.toLowerCase().localeCompare(b.toLowerCase()); });

  //Sort oldest to newest
  filesDates.sort();
  //Sort newest to oldest
  filesDates.reverse();

  //Sort largest to smallest
  filesSizes.sort(function (a,b) { return b-a; });

  //Sort by file name, A-Z
  await t
    .click(sortDropdownSelect)
    .click(sortDropdownOptionSelect.withAttribute('name','name'))

  //Confirm the sorted order matches the expected order
  for(let k=0; k<filesNames.length; k++)
    await t.expect(filesSortSelect.find(projectFileDownloadId).nth(k).innerText).eql(filesNames[k]);

  //Sort by newest
  await t
    .click(filesTabSelect)
    .click(sortDropdownSelect)
    .click(sortDropdownOptionSelect.withAttribute('name','newest'))

  //Confirm the sorted order matches the expected order
  for(let k=0; k<filesDates.length; k++)
    await t.expect(filesSortSelect.find(projectFileDownloadId).nth(k).innerText).eql(filesDatesMap.get(filesDates[k]));

  //Sort by oldest
  await t
    .click(sortDropdownSelect)
    .click(sortDropdownOptionSelect.withAttribute('name','oldest'))

  //Confirm the sorted order matches the expected order
  filesDates.reverse();
  for(let k=0; k<filesDates.length; k++)
    await t.expect(filesSortSelect.find(projectFileDownloadId).nth(k).innerText).eql(filesDatesMap.get(filesDates[k]));

  //Sort by size
  await t
    .click(sortDropdownSelect)
    .click(sortDropdownOptionSelect.withAttribute('name','size'))

  var filesKey;
  var filesKey2;
  for(let k=0; k<(filesSizes.length-1); k++) {
    filesKey = await filesSortSelect.find(projectFileDownloadId).nth(k).innerText;
    filesKey2 = await filesSortSelect.find(projectFileDownloadId).nth(k+1).innerText;
    await t.expect(filesSizesMap.get(filesKey)).gte(filesSizesMap.get(filesKey2));
  }
 });

 test('Again create a Repertoire to ensure only the correct files appear in the Sequencing Files drop-down now that the files are unpaired', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  const getPageUrl = ClientFunction(() => window.location.href);
  await t.navigateTo('./'+projectUuidUrl)
  const url = await getPageUrl();

  await t
    .click(repertoiresTabSelect)
    .click(newRepertoireSelect)
    .click(newRepertoireAddSelect)

  //The Sequencing Files drop-down should only have select files
  await t
    .expect(sequencingFilesOption.count).eql(5)
    .expect(sequencingFilesSelect.find('option').withExactText(AirrTsvFile).exists).ok()
    .expect(sequencingFilesSelect.find('option').withExactText(FastaQualitySequences1File).exists).ok()
    .expect(sequencingFilesSelect.find('option').withExactText(FastaSequencesFile).exists).ok()
    .expect(sequencingFilesSelect.find('option').withExactText(FastaSequencesRenamedDuplicateFile).exists).ok()
    .expect(sequencingFilesSelect.find('option').withExactText("null").exists).ok()
 });

 test('Delete an uploaded file and confirm the correct file was removed on the Back-end', async t => {
  await login(t,config.username,config.password,'CLICK',loginButtonId);

  await t.navigateTo('./'+projectUuidUrl);
  const FastaSequencesFileSelect = Selector(projectFilesFormBase + FastaSequencesFileUuid).find(projectFileDeleteId);

  await t
    .click(filesTabSelect)
    .click(FastaSequencesFileSelect)
    .click(saveFilesChangesSelect)
    .wait(config.save_timeout)

  var token = await tapisIO.getToken({username: config.username, password: config.password});
  if (config.tapis_version == 2) {
    var files = await tapisV2.getProjectMetadata(token.access_token, projectUuid);
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
    var files = await tapisV3.sendRequest(requestSettings);
    await t.expect(files['status']).eql("success")
        .expect(files['result'].length).eql(14); //Expect 14 files now
    files = files['result'];
  } 

  //Confirm the correct file was deleted
  var found = false;
  for(let i=0; i<files.length; i++) {
    if(files[i]["uuid"] == FastaSequencesFileUuid) { found = true; }
  }

  await t
    .expect(found).eql(false)
 });

//method is either ENTERKEY or CLICK
//clickItem is the id of the item (optional)
async function login(t,username,password,method,clickItem) {
    if(username!='') await t.typeText(usernameSelect, username);
    if(password!='') await t.typeText(passwordSelect, password);
        if(method == "ENTERKEY") await t.pressKey('enter');
        else if(method == 'CLICK') await t.click(Selector(clickItem));
        await t
        await t.wait(config.login_timeout);  //Wait to complete the login process
}
