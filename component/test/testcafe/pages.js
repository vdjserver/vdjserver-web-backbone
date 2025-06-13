//
// pages.js
// Test Cases Configuration
//
// VDJServer
// https://vdjserver.org
//
// Copyright (C) 2024 The University of Texas Southwestern Medical Center
//
// Author: Ryan C. Kennedy
// Date: October - December 2024
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

import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';

import config from '../test-config';

export class General {
    constructor() {
        //General Values
        this.tapisV2 = require('vdj-tapis-js/tapis');
        this.tapisV3 = require('vdj-tapis-js/tapisV3');
        this.tapisIO = null;
        if (config.tapis_version == 2) this.tapisIO = this.tapisV2;
        if (config.tapis_version == 3) this.tapisIO = this.tapisV3;

        this.projectUuid = "";
        this.projectUuidUrl = "project/";
        this.projectUuidUrl += this.projectUuid;
        this.subjectUuid = "";
        this.subjectUuid2 = "";
        this.repertoireUuid = "";
        this.dRepertoireUuid = "";
        this.sampleUuid = "";
        this.dSampleUuid="";

        this.username = config.username;
        this.username2 = config.username2;

        //General Selectors
        this.navbarStatsIconSelect = Selector('#navbar-stats-icon');
        this.createProjectSelect = Selector('#create-project');
        this.subjectsTabSelect = Selector('#subjects-tab');
        this.repertoiresTabSelect = Selector('#repertoires-tab');
        this.repertoireGroupsTabSelect = Selector('#groups-tab');
        this.filesTabSelect = Selector('#files-tab');
        this.invalidFeedbackSelect = Selector('.invalid-feedback');
        this.ontologySelectSelect = Selector('#ontology-select');
        this.ontologyInputSelect = Selector('#ontology-search-input');
    }
}

export class Login {
    constructor () {
        //Login Values
        this.loginButtonId = "#home-login";
        this.loginSuccessfulString = "Welcome to your \"My Projects\" home page. Here, you'll find a listing of all of your projects.";
        this.loginFailedString = "Login failed...";
        this.loginString = "Welcome!";
        this.emailString = "Email";
        this.communityDataPortalLinkId = "#community-link";
        this.airrDataCommonsLinkId = "#AIRRDC-link";
        this.sendFeedbackLinkId = "#sendFeedback-link";
        this.taccLinkId = "#TACC-link";
        this.adcUrl = "https://docs.airr-community.org/en/stable/api/adc.html";
        this.taccUrl = "https://tacc.utexas.edu";

        //Login Selectors
        this.usernameSelect = Selector('#username');
        this.passwordSelect = Selector('#password');
        this.loginSelect = Selector("#login");
        this.loginSuccessfulSelect = Selector("#loginSuccessful");
        this.loginFailedSelect = Selector("#loginFailed");
        this.emailSelector = Selector('a[href="mailto:vdjserver@utsouthwestern.edu?subject=Share my data in VDJServer"]');
    }

    setTokenInLocalStorage = ClientFunction((user, jwt) => {
        const token = {
            access_token: {
                access_token: jwt,
                expires: 99999999999999,
                expires_at: "2342-01-31T07:44:02.755653+00:00",
                expires_in: 14400,
                id_token: jwt,
                jti: ""
            },
            client_id: "localhost9001",
            code: "",
            token_type: "oauth2",
            username: user
        };
        localStorage.setItem('Agave.Token', JSON.stringify(token));
    });
    
    getTokenFromLocalStorage = ClientFunction(() => {
        return JSON.parse(localStorage.getItem('Agave.Token'));
    });

    //method is either ENTERKEY or CLICK (depricated)
    //clickItem is the id of the item (optional) (depricated)
    async login(t,username,jwt,method='',clickItem='') {
        if(username)
            if(jwt)
                await this.setTokenInLocalStorage(username, jwt);
        await t.eval(() => location.reload(true));
        // await t.wait(config.timeout);  //wait to complete the login process
    };

    async logout(t) {
        await t
            .click('#navbarDropdown')
            .click('#navbarSupportedContent > ul.navbar-nav.ml-auto > li.nav-item.dropdown.show > div > a:nth-child(4)');
    }
}

export class Project {
    constructor () {
        //Project Values
        this.studyId = "Test Study ID";
        //Append a random number less than 1,000,000 to studyTitle
        this.studyTitle = "Test Study Title_" + Math.floor(Math.random()*1000000);
        this.studyType = "NCIT:C16084";
        this.studyTypeEdit = "NCIT:C15273";
        this.studyDescription = "Test Study Description";
        this.inclusionExclusionCriteria = "Criteria";
        this.grants = "1234";
        this.keywords = ["contains_tr","contains_paired_chain","contains_ig"];
        this.publications = "1;2;3;4";
        this.labName = "UTSW";
        this.labAddress = "11 S. Main St";
        this.cName = "Joe";
        this.cEmail = "joe@email.com";
        this.cAddress = Math.floor(Math.random()*100) + " N. Main St";
        this.sName = "Jim";
        this.sEmail = "jim@email.com";
        this.sAddress = "13 W. Main St";

        this.studyId2 = "Test Study ID2";
        this.studyTitle2 = "Test Study Title2_" + Math.floor(Math.random()*1000000);
        this.studyDescription2 = "Test Study Description2";
        this.inclusionExclusionCriteria2 = "Criteria2";
        this.grants2 = "12342";
        this.publications2 = "1;2;3;42";
        this.labName2 = "UTSW2";
        this.labAddress2 = "11 S. Main St2";
        this.cName2 = "Joe2";
        this.cEmail2 = "joe@email.com2";
        this.cAddress2 = Math.floor(Math.random()*100) + " N. Main St2";
        this.collectedBy = this.cName2 + ", " + this.cEmail2 + ", " + this.cAddress2;
        this.sName2 = "Jim2";
        this.sEmail2 = "jim@email.com2";
        this.sAddress2 = "13 W. Main St2";
        this.submittedBy = this.sName2 + ", " + this.sEmail2 + ", " + this.sAddress2;
        this.studyTitleValidationMessage = "Please enter a non-blank Project/Study Title.";
        this.successfullyCreatedString = "Project successfully created!";
        this.saveString = "Saving Project Metadata";
        this.archiveString = 'Are you sure you want to archive this project?';

        //Project Selectors
        this.addUserButtonSelect = Selector('#add-project-user');
        this.deleteUserButtonSelect = Selector('#delete-project-user');

        this.studyIdSelect = Selector('#NCBI');
        this.studyIdEditSelect = Selector('#study_id');
        this.studyTitleSelect = Selector('#study_title');
        this.descriptionSelect = Selector('#description');
        this.criteriaSelect = Selector('#criteria');
        this.grantsSelect = Selector('#grants');
        this.studyTypeSelect = Selector('#dropdownOntology');
        this.publicationsSelect = Selector('#publications');
        this.labNameSelect = Selector('#lab_name');
        this.labAddressSelect = Selector('#lab_address');
        this.collectedByNameSelect = Selector('#collectedby_name');
        this.collectedByEmailSelect = Selector('#collectedby_email');
        this.collectedByAddressSelect = Selector('#collectedby_address');
        this.submittedByNameSelect = Selector('#submittedby_name');
        this.submittedByEmailSelect = Selector('#submittedby_email');
        this.submittedByAddressSelect = Selector('#submittedby_address');
        this.createNewProjectSelect = Selector('#create-new-project');

        this.editProjectSelect = Selector('#edit-project');
        this.editProjectSaveSelect = Selector('#save-edit-project');
        this.collectedBySelect = Selector('#collected_by');
        this.submittedBySelect = Selector('#submitted_by');
        this.modalDialogSelect = Selector('.modal-dialog');
        this.modalBodyClass = '.modal-body';
        this.modalConfirmButtonSelect = Selector('#confirm-message-button');
        this.modalCancelButtonSelect = Selector('#cancel-message-button');
        this.archiveSelect = Selector('#archive-project');
        this.userSelect = Selector("#user-name");

    }
}

export class Subject {
    constructor () {
        //Subject Values
        //Append a random number less than 1,000,000 to subjectId
        this.subjectId = 'Subject ID ' + Math.floor(Math.random()*1000000);
        this.subjectIdBaseId = '#subject_id_';
        this.projectSubjectFormIdBase = '#project-subject-form_';
        this.projectSubjectDropdownId = '#project-subject-dropdown';
        this.linkedSubjectsId = '#linked_subjects';
        this.synthetic = "true";
        this.species = 'Macaca mulatta';
        this.strain = 'abcde'
        this.sex = 'pooled';
        this.ageType = 'range';
        this.ageMin = '3';
        this.ageMax = '9';
        this.ageUnit = 'day';
        this.ageUnitDisplay = 'day(s)';
        this.ageEvent = 'event';
        this.race = 'race';
        this.ancestryPopulation = 'ancestry';
        this.ethnicity = 'ethnicity';
        this.linkedSubjects = 'null';
        this.linkType = 'linkType';
        this.speciesValidationMessage = "Please select a non-null Species.";
        this.saveString = "Saving Project Subjects Changes";

        // Subject 2
        this.subjectId2 = 'Subject ID ' + Math.floor(Math.random()*1000000);
        this.species2 = 'Homo sapiens';

        //Diagnosis Values
        this.diagnosisOntologyId = '#ontology-search-input';
        this.diseaseDiagnosis = 'malaria';
        this.diseaseLength = 'Disease Length';
        this.diseaseStage = 'Disease Stage';
        this.studyGroupDescription = 'Study Group Description';
        this.priorTherapies = 'Prior Therapies';
        this.immunogen = 'Immunogen';
        this.intervention = 'Intervention';
        this.medicalHistory = 'Medical History';

        this.diseaseDiagnosis2 = 'influenza';
        this.diseaseLength2 = 'Disease Length2';
        this.diseaseStage2 = 'Disease Stage' + Math.floor(Math.random()*1000000);
        this.studyGroupDescription2 = 'Study Group Description2';
        this.priorTherapies2 = 'Prior Therapies2';
        this.immunogen2 = 'Immunogen2';
        this.intervention2 = 'Intervention2';
        this.medicalHistory2 = 'Medical History2';

        this.diseaseLength3 = 'Disease Length3';

        //Subject Selectors
        this.projectSubjectFormSelect = Selector('.project-subject-form');
        this.detailsSummarySelect = Selector('#project-subjects-details-summary');
        this.sortDropdownSelect = Selector('#project-subjects-sort-button');
        this.sortDropdownOptionSelect = Selector('#project-subjects-sort-select');
        this.newSubjectSelect = Selector('#project-subjects-new-subject');
        this.revertChangesSelect = Selector('#project-subjects-revert-changes');
        this.saveChangesSelect = Selector('#project-subjects-save-changes');
        this.subjectsDropdownSelect = Selector('#project-subject-dropdown');
        this.subjectsDropdownEditSelect = Selector('#project-subject-edit');
        this.subjectsDropdownDuplicateSelect = Selector('#project-subject-duplicate');
        this.subjectsDropdownDeleteSelect = Selector('#project-subject-delete');
        this.subjectsDropdownAddDiagnosisSelect = Selector('#project-subject-add-diagnosis');
        this.diagnosisDropdownSelect = Selector('#project-subject-diagnosis-dropdown');
        this.diagnosisDropdownDuplicateSelect = Selector('#project-subject-duplicate-diagnosis');
        this.diagnosisDropdownDeleteSelect = Selector('#project-subject-delete-diagnosis');

        this.syntheticSelect = Selector('#synthetic');
        this.syntheticOption = this.syntheticSelect.find('option');
        this.speciesSelect = Selector('#species');
        this.speciesOption = this.speciesSelect.find('option');
        this.strainSelect = Selector('#strain_name');
        this.sexSelect = Selector('#sex');
        this.sexOption = this.sexSelect.find('option');
        this.ageTypeSelect = Selector('#age_type');
        this.ageTypeOption = this.ageTypeSelect.find('option');
        this.ageMinSelect = Selector('#age_min');
        this.ageMaxSelect = Selector('#age_max');
        this.agePointSelect = Selector('#age_point');
        this.ageUnitSelect = Selector('#age_unit');
        this.ageUnitOption = this.ageUnitSelect.find('option');
        this.ageEventSelect = Selector('#age_event');
        this.raceSelect = Selector('#race');
        this.ancestryPopulationSelect = Selector('#ancestry_population');
        this.ethnicitySelect = Selector('#ethnicity');
        this.linkedSubjectsSelect = Selector("#linked_subjects");
        this.linkedSubjectsOption = this.linkedSubjectsSelect.find('option');
        this.linkTypeSelect = Selector('#link_type');

        //Diagnosis Field Selectors
        this.diseaseDiagnosisRegion1Select = Selector('#disease-diagnosis-region-1')
        this.diseaseDiagnosisSelect = Selector('#diagnosisOntology_0');
        this.diseaseDiagnosisOptionSelect = Selector('#ontology-select');
        this.diseaseDiagnosis2Select = Selector('#diagnosisOntology_1');

        this.diseaseLengthSelect = Selector('#disease_length_0');
        this.diseaseStageSelect = Selector('#disease_stage_0');
        this.studyGroupDescriptionSelect = Selector('#study_group_description_0');
        this.priorTherapiesSelect = Selector('#prior_therapies_0');
        this.immunogenSelect = Selector('#immunogen_0');
        this.interventionSelect = Selector('#intervention_0');
        this.medicalHistorySelect = Selector('#medical_history_0');

        this.diseaseLength2Select = Selector('#disease_length_1');
        this.diseaseStage2Select = Selector('#disease_stage_1');
        this.studyGroupDescription2Select = Selector('#study_group_description_1');
        this.priorTherapies2Select = Selector('#prior_therapies_1');
        this.immunogen2Select = Selector('#immunogen_1');
        this.intervention2Select = Selector('#intervention_1');
        this.medicalHistory2Select = Selector('#medical_history_1');

        this.diseaseDiagnosisDetailsText = Selector('#disease_diagnosis_0');
        this.diseaseDiagnosisDetailsText2 = Selector('#disease_diagnosis_1');
    }
}

export class Repertoire {
    constructor () {
        //Repertoire Values
        this.repertoireFormIdBase = "#edit-repertoire-form_";
        this.repertoireName = "Repertoire Name";
        this.repertoireDescription = "Repertoire Description";
        this.repertoireDescriptionId = "#repertoire_description";
        this.tissueIdBaseId = "#tissue_";
        this.repertoireDropdownId = "#project-repertoires-dropdown";
        this.subjectBaseId = "#subject";
        this.sexSpeciesDetailsId =  "#sex_species_details";
        this.raceEthnicityDetailsId = "#race_ethnicity_details";
        this.ageDetailsId = "#age_details";
        this.subjectIdValidationMessage = "Please select a Subject ID.";
        this.sampleIdValidationMessage = "Please enter a unique, non-blank ID.";
        this.singleCellValidationMessage = "Please enter a valid Single Cell value.";
        this.cellStorageValidationMessage = "Please enter a valid Cell Storage value.";
        this.pcrTargetLocusValidationMessage = "Please select a non-null PCR Target Locus.";
        this.collectionTimeValidationMessage = "Please enter a valid Collection Time Point Relative number.";
        this.collectionTimePointRelativeUnitValidationMessage = "Please enter a Collection Time Point Relative Unit.";
        this.templateAmountValidationMessage = "Please enter a valid Template Amount number ≥ 0.";
        this.templateAmountUnitValidationMessage = "Please enter a Template Amount Unit.";
        this.cellNumberValidationMessage = "Please enter a valid Cell Number integer ≥ 0.";
        this.cellsPerReactionValidationMessage = "Please enter a valid Cells Per Reaction integer ≥ 0.";
        this.sequencingRunDateValidationMessage = "Please enter a valid Sequencing Run Date (YYYY-MM-DD).";
        this.sequencingFilesDataIdValidationMessage = "Please enter Seq. Files or a non-blank Seq. Data ID, not both.";
        this.saveString = "Saving Project Repertoires Changes";

        //Sample Values
        this.sampleDropdownId = "#project-sample-dropdown";
        this.tissueId = "#tissue_";
        this.cellSubsetId = "#cell_subset_";
        this.cellSpeciesId = "#cell_species_";
        this.sampleId = "Sample ID_" + Math.floor(Math.random()*1000000);
        this.sampleType = "Sample Type";
        this.tissue = "epithalamus";
        this.anatomicSite = "Anatomic Site";
        this.diseaseStateSample = "Disease State Sample";
        this.collectionTime = "1234";
        this.collectionTimePointRelativeUnit = "day";
        this.collectionTimeReference = "Collection Time Reference";
        this.biomaterialProvider = "Biomaterial Provider";
        this.sequencingRunId = "Sequencing Run ID";
        this.sequencingPlatform = "Sequencing Platform";
        this.sequencingFacility = "Sequencing Facility";
        this.sequencingDate = "2016-12-16";
        this.sequencingKit = "Sequencing Kit";
        this.sequencingFiles = 'null';
        this.tissueProcessing = "Tissue Processing";
        this.cellSubset = "T cell";
        this.cellPhenotype = "Cell Phenotype";
        this.cellSpecies = "Homo sapiens";
        this.singleCell = "true";
        this.cellNumber = "44";
        this.cellsPerReaction = "22";
        this.cellStorage = "false";
        this.cellQuality = "Cell Quality";
        this.cellIsolation = "Cell Isolation";
        this.cellProcessingProtocol = "Cell Processing Protocol";
        this.templateClass = "DNA";
        this.templateQuality = "Template Quality";
        this.templateAmount = "4321";
        this.templateAmountUnit = "milligram";
        this.libraryGenerationMethod = "PCR";
        this.libraryGenerationProtocol = "Library Generation Protocol";
        this.libraryGenerationKitVersion = "Library Generation Kit Version";
        this.completeSequences = "complete";
        this.physicalLinkage = "hetero_prelinked";
        this.pcrTargetLocus = "TRA";
        this.forwardTargetLocation = "Forward Target Location";
        this.reverseTargetLocation = "Reverse Target Location";
        this.sequencingDataId = "Sequencing Data ID";

        //Repertoire Selectors
        this.detailsSummarySelect = Selector('#project-repertoires-details-summary');
        this.newRepertoireSelect = Selector('#project-repertoires-add');
        this.newRepertoireAddSelect = Selector('#project-repertoires-add-repertoire');
        this.revertChangesSelect = Selector('#project-repertoires-revert-changes');
        this.saveChangesSelect = Selector('#project-repertoires-save-changes');
        this.repertoireDropdownSelect = Selector(this.repertoireDropdownId);
        this.repertoireDropdownEditSelect = Selector('#project-repertoire-edit-repertoire');
        this.repertoireDropdownDuplicateSelect = Selector('#project-repertoire-duplicate-repertoire');
        this.repertoireDropdownDeleteSelect = Selector('#project-repertoire-delete-repertoire');
        this.sampleDropdownSelect = Selector(this.sampleDropdownId);
        this.sampleAddDropdownSelect = Selector('#project-samples-add');
        this.sampleDropdownDuplicateSelect = Selector('#project-sample-duplicate-sample');
        this.sampleDropdownDeleteSelect = Selector('#project-sample-delete-sample');

        this.repertoireNameBaseId = '#repertoire_name_';
        this.repertoireDescriptionSelect = Selector('#repertoire_description');
        this.subjectIdSelect = Selector('#subject');
        this.subjectIdOption = this.subjectIdSelect.find('option');
        this.sampleFormSelect = Selector('.project-sample-form');
        this.repertoireFormSelect = Selector('.project-repertoire-form');

        //Sample Selectors
        this.sampleIdBaseId = "#sample_id_";
        this.sampleIdSelect = Selector('input').withAttribute("name","sample_id");
        this.sampleTypeSelect = Selector('#sample_type');
        this.cellSubsetBaseId = "#cell_subset_";
        this.anatomicSiteSelect = Selector('#anatomic_site');
        this.diseaseStateSampleSelect = Selector('#disease_state_sample');
        this.collectionTimeSelect = Selector('#collection_time_point_relative');
        this.collectionTimePointRelativeUnitSelect = Selector('#collection_time_point_relative_unit');
        this.collectionTimePointRelativeUnitOption = this.collectionTimePointRelativeUnitSelect.find('option');
        this.collectionTimeReferenceSelect = Selector('#collection_time_point_reference');
        this.biomaterialProviderSelect = Selector('#biomaterial_provider');
        this.sequencingRunIdSelect = Selector('#sequencing_run_id');
        this.sequencingPlatformSelect = Selector('#sequencing_platform');
        this.sequencingFacilitySelect = Selector('#sequencing_facility');
        this.sequencingDateSelect = Selector('#sequencing_run_date');
        this.sequencingKitSelect = Selector('#sequencing_kit');
        this.sequencingFilesSelect = Selector('#sequencing_files');
        this.sequencingFilesOption = this.sequencingFilesSelect.find('option');
        this.tissueProcessingSelect = Selector('#tissue_processing');
        this.cellPhenotypeSelect = Selector('#cell_phenotype');
        this.singleCellSelect = Selector('#single_cell')
        this.singleCellOption = this.singleCellSelect.find('option');
        this.cellNumberSelect = Selector('#cell_number');
        this.cellsPerReactionSelect = Selector('#cells_per_reaction')
        this.cellStorageSelect = Selector('#cell_storage')
        this.cellStorageOption = this.cellStorageSelect.find('option');
        this.cellQualitySelect = Selector('#cell_quality');
        this.cellIsolationSelect = Selector('#cell_isolation');
        this.cellProcessingProtocolSelect = Selector('#cell_processing_protocol');
        this.templateClassSelect = Selector('#template_class');
        this.templateClassOption = this.templateClassSelect.find('option');
        this.templateQualitySelect = Selector('#template_quality');
        this.templateAmountSelect = Selector('#template_amount');
        this.templateAmountUnitSelect = Selector('#template_amount_unit');
        this.templateAmountUnitOption = this.templateAmountUnitSelect.find('option');
        this.libraryGenerationMethodSelect = Selector('#library_generation_method');
        this.libraryGenerationMethodOption = this.libraryGenerationMethodSelect.find('option');
        this.libraryGenerationProtocolSelect = Selector('#library_generation_protocol');
        this.libraryGenerationKitVersionSelect = Selector('#library_generation_kit_version');
        this.completeSequencesSelect = Selector('#complete_sequences');
        this.completeSequencesOption = this.completeSequencesSelect.find('option');
        this.physicalLinkageSelect = Selector('#physical_linkage');
        this.physicalLinkageOption = this.physicalLinkageSelect.find('option');
        this.pcrTargetLocusSelect = Selector('#pcr_target_locus').parent('.bootstrap-select').find('.dropdown-toggle');
        this.pcrTargetLocusOption = Selector('#pcr_target_locus').parent('.bootstrap-select').find('.dropdown-menu .dropdown-item');
        this.forwardTargetLocationSelect = Selector('#forward_pcr_primer_target_location');
        this.reverseTargetLocationSelect = Selector('#reverse_pcr_primer_target_location');
        this.sequencingDataIdSelect = Selector('#sequencing_data_id');
    }
}

export class RepertoireGroup {
    constructor () {
        this.addGroupSelect = Selector('#project-groups-add');
        this.newGroupSelect = Selector('#project-groups-new-group');

        this.repertoireGroupFormSelect = Selector('.project-repertoire-group-form');
        this.repertoireGroupRevertChangesSelect = Selector('#project-groups-revert-changes');
        this.repertoireGroupSaveChangesSelect = Selector('#project-groups-save-changes');

        // Group fields
        this.groupNameBaseID = '#repertoire_group_name_';
        this.groupDescriptionBaseID = '#repertoire_group_description_';
        this.filterModeSelect = Selector('#filter_mode');
        this.filterLogicalField1Select = Selector('#repertoire-groups-logical_field1_select');
        this.filterLogicalOperator1Select = Selector('#repertoire-groups-logical_operator1_select');
        this.filterLogicalValue1Select = Selector('#repertoire-groups-logical_value1_input');
        this.filterLogicalSelect = Selector('#repertoire-groups-logical_select');
        this.filterLogicalField2Select = Selector('#repertoire-groups-logical_field2_select');
        this.filterLogicalOperator2Select = Selector('#repertoire-groups-logical_operator2_select');
        this.filterLogicalValue2Select = Selector('#repertoire-groups-logical_value2_input');
        this.manualRepertoireSelect = Selector('#repertoires');

        // Actions Button
        this.groupActionsID = '#project-repertoire-group-dropdown';
        this.groupActionsSelect = Selector(this.groupActionsID);
        this.groupActionGroupDetailSelect = Selector('#project-repertoire-group-show-detail');
        this.groupActionGroupSummarySelect = Selector('#project-repertoire-group-show-summary');
        this.groupActionCopyUUIDSelect = Selector('#project-repertoire-group-copy-uuid');
        this.groupActionEditGroupSelect = Selector('#project-repertoire-group-edit');
        this.groupActionDuplicateGroupSelect = Selector('#project-repertoire-group-duplicate');
        this.groupActionAddRearrangmentFilterSelect = Selector('#project-repertoire-group-add-rearrangement-filter');
        this.groupActionDeleteRearrangmentFilterSelect = Selector('#project-repertoire-group-delete-rearrangement-filter');
        this.groupActionDeleteGroupSelect = Selector('#project-repertoire-group-delete');
    
        // Test Values
        this.groupName = 'Group Name';
        this.groupDescription = 'Group Description';
        this.filterLogicalValue1 = 25;
    }
}

export class File {
    constructor () {
        //File Values
        this.formBase = '#project-files-form_';
        this.typeId = '#project-file-type';
        this.deleteId = '#project-file-delete';
        this.tagsId = '#project-file-tags';
        this.downloadId = '#project-file-download';
        this.readDirectionId = '#project-file-read-direction';
        this.unpairId = '#project-file-unpair';
        this.btnCancelClass = '.btn-cancel';
        this.deleteUploadFileId = '#delete-upload-file';
        this.colClass = '.col-md-11';
        this.pairedEndRadioOptionFor = 'select-paired-end-files';
        this.readQualityRadioOptionFor = 'select-read-quality-files';
        this.pairedString1 = '2 files were matched.';
        this.pairedString2 = '2 files were paired together.';
        this.saveString = "Saving Project File Changes";

        this.filesPath = "./uploads/";
        this.FastqPairedEndForwardFile = "ERR346600_1.fastq";
        this.FastqPairedEndReverseFile = "ERR346600_2.fastq";
        this.FastaSequencesFile = "VectorBase-64_Aaquasalis_ESTs.fasta";
        this.BarcodeSequencesFile = "SRR765688_MIDs.fasta";
        this.PrimerSequencesReverseFile = "Greiff2014_CPrimers_rev.fasta";
        this.PrimerSequencesForwardFile = "Greiff2014_VPrimers.fasta";
        this.FastaQualitySequences1File = "Sample00013.fna";
        this.FastaQualitySequences2File = "Sample00013.qual";
        this.FastaSequencesDuplicateFile = "VectorBase-64_Aaquasalis_ESTs.fasta";
        this.FastaSequencesRenamedDuplicateFile = "VectorBase-64_Aaquasalis_ESTs2.fasta";
        this.FastaSequencesDeleteFile = "VectorBase-64_Aaquasalis_ESTs3.fasta";
        this.UnspecifiedFile = "test.unspecified";
        this.TsvFile = "subject_metadata.tsv";
        this.CsvFile = "subject_metadata.csv";
        this.VdjmlFile = "test.vdjml";
        this.AirrTsvFile = "656b9351190f680f22dc212e.airr.tsv";
        this.AirrJsonFile = "repertoires.airr.json";
        this.testFile = "test2.vdjml";

        this.FastqPairedEndForwardFileUuid = "";
        this.FastqPairedEndReverseFileUuid = "";
        this.FastaSequencesFileUuid = "";
        this.BarcodeSequencesFileUuid = "";
        this.PrimerSequencesReverseFileUuid = "";
        this.PrimerSequencesForwardFileUuid = "";
        this.FastaQualitySequences1FileUuid = "";
        this.FastaQualitySequences2FileUuid = "";
        this.FastaSequencesRenamedDuplicateFileUuid = "";
        this.UnspecifiedFileUuid = "";
        this.TsvFileUuid = "";
        this.CsvFileUuid = "";
        this.VdjmlFileUuid = "";
        this.AirrTsvFileUuid = "";
        this.AirrJsonFileUuid = "";

        this.FILE_TYPE_UNSPECIFIED = '0';
        this.FILE_TYPE_PRIMER = '1';
        this.FILE_TYPE_FASTQ_READ = '2';
        this.FILE_TYPE_FASTA_READ = '3';
        this.FILE_TYPE_BARCODE = '4';
        this.FILE_TYPE_QUALITY = '5';
        this.FILE_TYPE_TSV = '6';
        this.FILE_TYPE_CSV = '7';
        this.FILE_TYPE_VDJML = '8';
        this.FILE_TYPE_AIRR_TSV = '9';
        this.FILE_TYPE_AIRR_JSON = '10';

        this.FILE_TYPE_UNSPECIFIED_STRING = 'Unspecified';
        this.FILE_TYPE_PRIMER_STRING = 'Primer Sequences';
        this.FILE_TYPE_FASTQ_READ_STRING = 'FASTQ Read Data';
        this.FILE_TYPE_FASTA_READ_STRING = 'FASTA Sequences';
        this.FILE_TYPE_BARCODE_STRING = 'Barcode Sequences';
        this.FILE_TYPE_QUALITY_STRING = 'Quality Scores';
        this.FILE_TYPE_TSV_STRING = 'TAB-separated Values';
        this.FILE_TYPE_CSV_STRING = 'Comma-separated Values';
        this.FILE_TYPE_VDJML_STRING = 'VDJML';
        this.FILE_TYPE_AIRR_TSV_STRING = 'AIRR TSV';
        this.FILE_TYPE_AIRR_JSON_STRING = 'AIRR JSON';

        //File Selectors
        this.uploadFilesSelect = Selector('#project-files-upload');
        this.uploadFilesComputerSelect = Selector('#project-files-upload-computer');
        this.uploadFilesComputerDialogSelect = Selector('#file-upload-from-computer-dialog');
        //this.addFilesSelect = Selector('#add-upload-files'); //For testing, we use the dialog to upload, not the button
        this.addStartUploadSelect = Selector('#start-upload-button');
        this.doneUploadSelect = Selector('#done-upload-button');

        this.cancelUploadSelect = Selector('#cancel-upload-button');
        this.revertChangesSelect = Selector('#project-files-revert-changes');
        this.saveChangesSelect = Selector('#project-files-save-changes');
        this.sortDropdownSelect = Selector('#project-files-sort-button');
        this.sortDropdownOptionSelect = Selector('#project-files-sort-select');
        this.filesSortSelect = Selector('.project-files-form');
        this.filesPairFilesSelect = Selector('#project-files-pair-files');
        this.projectFilePairRadioSelect = Selector('.custom-control-label');
        this.filesReadFileAnchorSelect = Selector('#read-file-anchor');
        this.filesPerformPairingButtonSelect = Selector('#perform-pairing-button');
        this.filesConfirmPairingButtonSelect = Selector('#confirm-message-button');
        this.projectFileDeleteUploadFileSelect = Selector('#delete-upload-file');
        this.filesGeneralTableRowSelect = Selector('.general-table-row');
    }
}

