//
// projectRepertoires.js
// Project Repertoires Page Test Cases
//
// VDJServer
// https://vdjserver.org
//
// Copyright (C) 2023 The University of Texas Southwestern Medical Center
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

const { General, Login, Project, Subject, Repertoire, File } = require('./pages');
const general = new General();
const login = new Login();
const project = new Project();
const subject = new Subject();
const repertoire = new Repertoire();
const file = new File();

fixture('Project Repertoires Page Test Cases')
    .page(config.url);

test('Create a Project and Check Back-end Values', async t => {
    await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

    await t
        .click(general.createProjectSelect)
        .typeText(project.studyIdSelect, project.studyId)
        .typeText(project.studyTitleSelect, project.studyTitle)
        .typeText(project.descriptionSelect, project.studyDescription)
        .typeText(project.criteriaSelect, project.inclusionExclusionCriteria)
        .typeText(project.grantsSelect, project.grants)
        .click('#' + project.keywords[0])
        .click('#' + project.keywords[1])
        .click(project.studyTypeSelect)
        .click(Selector(general.ontologySelectSelect.withAttribute('name', project.studyType)))
        .typeText(project.publicationsSelect, project.publications)
        .typeText(project.labNameSelect, project.labName)
        .typeText(project.labAddressSelect, project.labAddress)
        .typeText(project.collectedByNameSelect, project.cName)
        .typeText(project.collectedByEmailSelect, project.cEmail)
        .typeText(project.collectedByAddressSelect, project.cAddress)
        .typeText(project.submittedByNameSelect, project.sName)
        .typeText(project.submittedByEmailSelect, project.sEmail)
        .typeText(project.submittedByAddressSelect, project.sAddress)
        .click(project.createNewProjectSelect);

    await t
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(project.successfullyCreatedString).exists).ok()
        .click(project.modalCancelButtonSelect);

    await t.click(general.subjectsTabSelect);

    const getPageUrl = ClientFunction(() => window.location.href);
    var url = await getPageUrl();

    general.projectUuid = url.split("/")[4];
    general.projectUuidUrl += general.projectUuid;
    //console.log("Project UUID: " + general.projectUuid);

    await t.navigateTo('./' + general.projectUuidUrl);
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
        .expect(m["value"]["submitted_by"].split(", ")[2]).eql(project.sAddress);
});

test('Add a Subject (with Diagnosis) to the previously created Project and Check Back-end Values', async t => {
    await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

    const getPageUrl = ClientFunction(() => window.location.href);

    await t.navigateTo('./' + general.projectUuidUrl);

    await t
        .click(general.subjectsTabSelect)
        .click(subject.newSubjectSelect)

    var subjectCid = await subject.projectSubjectFormSelect.find(subject.projectSubjectDropdownId).getAttribute('name');

    await t
        .typeText(subject.subjectIdBaseId + subjectCid, subject.subjectId)
        .click(subject.syntheticSelect)
        .click(subject.syntheticOption.withAttribute('value', subject.synthetic))
        .click(subject.speciesSelect)
        .click(subject.speciesOption.withExactText(subject.species))
        .typeText(subject.strainSelect, subject.strain)
        .click(subject.sexSelect)
        .click(subject.sexOption.withExactText(subject.sex))
        .click(subject.ageTypeSelect)
        .click(subject.ageTypeOption.withExactText(subject.ageType))
        .typeText(subject.ageMinSelect, subject.ageMin)
        .typeText(subject.ageMaxSelect, subject.ageMax)
        .click(subject.ageUnitSelect)
        .click(subject.ageUnitOption.withAttribute('value', subject.ageUnit))
        .typeText(subject.ageEventSelect, subject.ageEvent)
        .typeText(subject.raceSelect, subject.race)
        .typeText(subject.ancestryPopulationSelect, subject.ancestryPopulation)
        .typeText(subject.ethnicitySelect, subject.ethnicity)
        .click(subject.linkedSubjectsSelect)
        .click(subject.linkedSubjectsOption.withExactText(subject.linkedSubjects))
        .typeText(subject.linkTypeSelect, subject.linkType)
        .click(subject.diseaseDiagnosisSelect)
        .typeText(general.ontologyInputSelect, subject.diseaseDiagnosis)
        .click(general.ontologySelectSelect.withExactText(subject.diseaseDiagnosis))
        .typeText(subject.diseaseLengthSelect, subject.diseaseLength)
        .typeText(subject.diseaseStageSelect, subject.diseaseStage)
        .typeText(subject.studyGroupDescriptionSelect, subject.studyGroupDescription)
        .typeText(subject.priorTherapiesSelect, subject.priorTherapies)
        .typeText(subject.immunogenSelect, subject.immunogen)
        .typeText(subject.interventionSelect, subject.intervention)
        .typeText(subject.medicalHistorySelect, subject.medicalHistory)
        .click(subject.saveChangesSelect)
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).ok()
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).notOk()
        .click(subject.detailsSummarySelect);

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
        .expect(m[0]["value"]["link_type"]).eql(subject.linkType);

    if (subject.linkedSubjects == 'null') await t.expect(m[0]["value"]["linked_subjects"] == null).ok()
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
        .expect(m[0]["value"]["diagnosis"][0]["medical_history"]).eql(subject.medicalHistory);
});

// test('Add a Repertoire (with Sample) to the previously created Project and Check Back-end Values', async t => {
//   await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

//   const getPageUrl = ClientFunction(() => window.location.href);

//   await t.navigateTo('./' + general.projectUuidUrl);

//   await t
//     .click(general.repertoiresTabSelect)
//     .click(repertoire.newRepertoireSelect)
//     .click(repertoire.newRepertoireAddSelect)

//   var repertoireCid = await repertoire.repertoireFormSelect.find(repertoire.repertoireDropdownId).getAttribute('name');
//   var sampleCid = await repertoire.sampleFormSelect.find(repertoire.sampleDropdownId).getAttribute('name');

//   const tissueSelect = Selector(repertoire.tissueId + sampleCid);
//   const cellSubsetSelect = Selector(repertoire.cellSubsetId + sampleCid);
//   const cellSpeciesSelect = Selector(repertoire.cellSpeciesId + sampleCid);

//   //Expect the created Subject to exist in the Subject ID drop-down
//   await t
//     .expect(repertoire.subjectIdOption.count).eql(2)
//     .expect(repertoire.subjectIdOption.withAttribute('value', general.subjectUuid).exists).ok()

//   await t
//     .typeText(repertoire.repertoireNameBaseId + repertoireCid, repertoire.repertoireName)
//     .typeText(repertoire.repertoireDescriptionSelect, repertoire.repertoireDescription)
//     .click(repertoire.subjectIdSelect)
//     .click(repertoire.subjectIdOption.withAttribute('value', general.subjectUuid))
//     .typeText(Selector(repertoire.sampleIdBaseId + sampleCid), repertoire.sampleId)
//     .typeText(repertoire.sampleTypeSelect, repertoire.sampleType)
//     .click(tissueSelect)
//     .typeText(general.ontologyInputSelect.nth(0), repertoire.tissue)
//     .click(general.ontologySelectSelect.withExactText(repertoire.tissue))
//     .click(general.navbarStatsIconSelect)
//     .typeText(repertoire.anatomicSiteSelect, repertoire.anatomicSite)
//     .typeText(repertoire.diseaseStateSampleSelect, repertoire.diseaseStateSample)
//     .typeText(repertoire.collectionTimeSelect, repertoire.collectionTime)
//     .typeText(repertoire.collectionTimeReferenceSelect, repertoire.collectionTimeReference)
//     .typeText(repertoire.biomaterialProviderSelect, repertoire.biomaterialProvider)
//     .typeText(repertoire.sequencingRunIdSelect, repertoire.sequencingRunId)
//     .typeText(repertoire.sequencingPlatformSelect, repertoire.sequencingPlatform)
//     .typeText(repertoire.sequencingFacilitySelect, repertoire.sequencingFacility)
//     .typeText(repertoire.sequencingDateSelect, repertoire.sequencingDate)
//     .typeText(repertoire.sequencingKitSelect, repertoire.sequencingKit)
//     .click(repertoire.collectionTimePointRelativeUnitSelect)
//     .click(repertoire.collectionTimePointRelativeUnitOption.withAttribute('value', repertoire.collectionTimePointRelativeUnit))
//     .click(repertoire.sequencingFilesSelect)
//     .click(repertoire.sequencingFilesOption.withExactText(repertoire.sequencingFiles))
//     .typeText(repertoire.tissueProcessingSelect, repertoire.tissueProcessing)
//     .click(cellSubsetSelect)
//     .typeText(general.ontologyInputSelect.nth(1), repertoire.cellSubset)
//     .click(general.ontologySelectSelect.withExactText(repertoire.cellSubset))
//     .typeText(repertoire.cellPhenotypeSelect, repertoire.cellPhenotype)
//     .click(cellSpeciesSelect)
//     .typeText(general.ontologyInputSelect.nth(2), repertoire.cellSpecies)
//     .click(general.ontologySelectSelect.withExactText(repertoire.cellSpecies))
//     .click(repertoire.singleCellSelect)
//     .click(repertoire.singleCellOption.withAttribute('value', repertoire.singleCell))
//     .typeText(repertoire.cellNumberSelect, repertoire.cellNumber)
//     .typeText(repertoire.cellsPerReactionSelect, repertoire.cellsPerReaction)
//     .click(repertoire.cellStorageSelect)
//     .click(repertoire.cellStorageOption.withAttribute('value', repertoire.cellStorage))
//     .typeText(repertoire.cellQualitySelect, repertoire.cellQuality)
//     .typeText(repertoire.cellIsolationSelect, repertoire.cellIsolation)
//     .typeText(repertoire.cellProcessingProtocolSelect, repertoire.cellProcessingProtocol)
//     .click(repertoire.templateClassSelect)
//     .click(repertoire.templateClassOption.withAttribute('value', repertoire.templateClass))
//     .typeText(repertoire.templateQualitySelect, repertoire.templateQuality)
//     .typeText(repertoire.templateAmountSelect, repertoire.templateAmount)
//     .click(repertoire.templateAmountUnitSelect)
//     .click(repertoire.templateAmountUnitOption.withAttribute('value', repertoire.templateAmountUnit))
//     .click(repertoire.libraryGenerationMethodSelect)
//     .click(repertoire.libraryGenerationMethodOption.withAttribute('value', repertoire.libraryGenerationMethod))
//     .typeText(repertoire.libraryGenerationProtocolSelect, repertoire.libraryGenerationProtocol)
//     .typeText(repertoire.libraryGenerationKitVersionSelect, repertoire.libraryGenerationKitVersion)
//     .click(repertoire.completeSequencesSelect)
//     .click(repertoire.completeSequencesOption.withAttribute('value', repertoire.completeSequences))
//     .click(repertoire.physicalLinkageSelect)
//     .click(repertoire.physicalLinkageOption.withAttribute('value', repertoire.physicalLinkage))
//     .click(repertoire.pcrTargetLocusSelect)
//     .click(repertoire.pcrTargetLocusOption.withText(repertoire.pcrTargetLocus))
//     .typeText(repertoire.forwardTargetLocationSelect, repertoire.forwardTargetLocation)
//     .typeText(repertoire.reverseTargetLocationSelect, repertoire.reverseTargetLocation)
//     .typeText(repertoire.sequencingDataIdSelect, repertoire.sequencingDataId)
//     .click(repertoire.saveChangesSelect)
//     .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).ok()
//     .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).notOk()
//     .click(repertoire.detailsSummarySelect)

//   var token = await login.getTokenFromLocalStorage();
//   if (config.tapis_version == 2) {
//     var r = await general.tapisV2.getMetadataForType(token.access_token, general.projectUuid, 'repertoire');
//   } else {
//     var requestSettings = {
//       url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/repertoire',
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + token['access_token']['access_token']
//       }
//     };
//     var r = await general.tapisV3.sendRequest(requestSettings);
//     await t.expect(r['status']).eql("success")
//       .expect(r['result'].length).eql(1);
//     r = r['result'];
//   }

//   general.repertoireUuid = r[0]["uuid"];
//   //console.log("Repertoire UUID: " + general.repertoireUuid);

//   general.sampleUuid = r[0]["value"]["sample"][0]["vdjserver_uuid"];
//   //console.log("Sample UUID: " + general.sampleUuid);

//   if (config.tapis_version == 2) {
//     var s = await general.tapisV2.getMetadataForType(token.access_token, general.projectUuid, 'sample');
//   } else {
//     var requestSettings = {
//       url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/uuid/' + general.sampleUuid,
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + token['access_token']['access_token']
//       }
//     };
//     var s = await general.tapisV3.sendRequest(requestSettings);
//     await t.expect(s['status']).eql("success")
//       .expect(s['result'].length).eql(1);
//     s = s['result'];
//   }

//   var rValue = r[0]["value"];
//   var sValue = s[0]["value"];

//   //Check Repertoire values
//   await t
//     .expect(rValue["repertoire_name"]).eql(repertoire.repertoireName)
//     .expect(rValue["repertoire_description"]).eql(repertoire.repertoireDescription)
//     .expect(sValue["sample_id"]).eql(repertoire.sampleId)
//     .expect(sValue["sample_type"]).eql(repertoire.sampleType)
//     .expect(sValue["tissue"].label).eql(repertoire.tissue)
//     .expect(sValue["anatomic_site"]).eql(repertoire.anatomicSite)
//     .expect(sValue["disease_state_sample"]).eql(repertoire.diseaseStateSample)
//     .expect(sValue["collection_time_point_relative"]).eql(parseFloat(repertoire.collectionTime))
//     .expect(sValue["collection_time_point_relative_unit"].label).eql(repertoire.collectionTimePointRelativeUnit)
//     .expect(sValue["collection_time_point_reference"]).eql(repertoire.collectionTimeReference)
//     .expect(sValue["biomaterial_provider"]).eql(repertoire.biomaterialProvider)
//     .expect(sValue["sequencing_run_id"]).eql(repertoire.sequencingRunId)
//     .expect(sValue["sequencing_platform"]).eql(repertoire.sequencingPlatform)
//     .expect(sValue["sequencing_facility"]).eql(repertoire.sequencingFacility)
//     .expect(sValue["sequencing_run_date"]).eql(repertoire.sequencingDate)
//     .expect(sValue["sequencing_kit"]).eql(repertoire.sequencingKit)
//     .expect(sValue["tissue_processing"]).eql(repertoire.tissueProcessing)
//     .expect(sValue["cell_subset"].label).eql(repertoire.cellSubset)
//     .expect(sValue["cell_phenotype"]).eql(repertoire.cellPhenotype)
//     .expect(sValue["cell_species"].label).eql(repertoire.cellSpecies)
//     .expect(sValue["single_cell"]).ok()
//     .expect(sValue["cell_number"]).eql(parseInt(repertoire.cellNumber))
//     .expect(sValue["cells_per_reaction"]).eql(parseInt(repertoire.cellsPerReaction))
//     .expect(sValue["cell_storage"]).notOk()
//     .expect(sValue["cell_quality"]).eql(repertoire.cellQuality)
//     .expect(sValue["cell_isolation"]).eql(repertoire.cellIsolation)
//     .expect(sValue["cell_processing_protocol"]).eql(repertoire.cellProcessingProtocol)
//     .expect(sValue["template_class"]).eql(repertoire.templateClass)
//     .expect(sValue["template_quality"]).eql(repertoire.templateQuality)
//     .expect(sValue["template_amount"]).eql(parseFloat(repertoire.templateAmount))
//     .expect(sValue["template_amount_unit"].label).eql(repertoire.templateAmountUnit)
//     .expect(sValue["library_generation_method"]).eql(repertoire.libraryGenerationMethod)
//     .expect(sValue["library_generation_protocol"]).eql(repertoire.libraryGenerationProtocol)
//     .expect(sValue["library_generation_kit_version"]).eql(repertoire.libraryGenerationKitVersion)
//     .expect(sValue["complete_sequences"]).eql(repertoire.completeSequences)
//     .expect(sValue["physical_linkage"]).eql(repertoire.physicalLinkage)
//     .expect(sValue["pcr_target"][0]["pcr_target_locus"]).eql(repertoire.pcrTargetLocus)
//     .expect(sValue["pcr_target"][0]["forward_pcr_primer_target_location"]).eql(repertoire.forwardTargetLocation)
//     .expect(sValue["pcr_target"][0]["reverse_pcr_primer_target_location"]).eql(repertoire.reverseTargetLocation)

//   if (repertoire.sequencingFiles == 'null') await t.expect(sValue["sequencing_files"]["filename"] == null).ok()
//   else await t.expect(sValue["sequencing_files"]["filename"] == repertoire.sequencingFiles).ok()
// });

// test('View existing Repertoire in Summary and Details view mode and confirm the correct values are shown', async t => {
//   await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

//   await t.navigateTo('./' + general.projectUuidUrl);

//   await t
//     .click(general.repertoiresTabSelect)

//   //Summary view selectors
//   const repertoireNameTextUntrimmed = await Selector('div').withExactText("Repertoire Name: " + repertoire.repertoireName).innerText;
//   const repertoireDescriptionTextUntrimmed = await Selector('div').withExactText("Repertoire Description: " + repertoire.repertoireDescription).innerText;
//   const subjectIdTextUntrimmed = await Selector('div').withExactText("Subject ID: " + subject.subjectId).innerText;
//   const sexSpeciesTextUntrimmed = await Selector('div').withExactText("Sex/Species: " + subject.sex + '/' + subject.species).innerText;
//   const raceEthnicityTextUntrimmed = await Selector('div').withExactText("Race/Ethnicity: " + subject.race + '/' + subject.ethnicity).innerText;
//   const ageTextUntrimmed = await Selector('div').withExactText("Age: " + subject.ageMin + '-' + subject.ageMax + ' ' + subject.ageUnit + "(s)").innerText;
//   const sampleIdTextUntrimmed = await Selector('div').withExactText("Sample ID: " + repertoire.sampleId).innerText;
//   const tissueText = Selector('div').withText(repertoire.tissue.toLowerCase()).exists; //We don't know the exact Ontology
//   const diseaseStateSampleTextUntrimmed = await Selector('div').withExactText("Disease State: " + repertoire.diseaseStateSample).innerText;
//   const singleCellTextUntrimmed = await Selector('div').withExactText("Single Cell: " + repertoire.singleCell).innerText;
//   const cellSubsetText = Selector('div').withText(repertoire.cellSubset).exists; //We don't know exact the Ontology
//   const templateTextUntrimmed = await Selector('div').withExactText("Template: " + repertoire.templateClass).innerText;
//   const targetLociTextUntrimmed = await Selector('div').withExactText("Target Loci: " + repertoire.pcrTargetLocus).innerText;

//   const repertoireNameTextTrimmed = await repertoireNameTextUntrimmed.toString().trim();
//   const repertoireDescriptionTextTrimmed = await repertoireDescriptionTextUntrimmed.toString().trim();
//   const subjectIdTextTrimmed = await subjectIdTextUntrimmed.toString().trim();
//   const sexSpeciesTextTrimmed = await sexSpeciesTextUntrimmed.toString().trim();
//   const raceEthnicityTextTrimmed = await raceEthnicityTextUntrimmed.toString().trim();
//   const ageTextTrimmed = await ageTextUntrimmed.toString().trim();
//   const sampleIdTextTrimmed = await sampleIdTextUntrimmed.toString().trim();
//   const diseaseStateSampleTextTrimmed = await diseaseStateSampleTextUntrimmed.toString().trim();
//   const singleCellTextTrimmed = await singleCellTextUntrimmed.toString().trim();
//   const templateTextTrimmed = await templateTextUntrimmed.toString().trim();
//   const targetLociTextTrimmed = await targetLociTextUntrimmed.toString().trim();

//   //Details view selectors
//   const repertoireNameDetailsSelect = Selector(repertoire.repertoireNameBaseId + general.repertoireUuid);
//   const subjectIdDetailsSelect = Selector(repertoire.repertoireFormIdBase + general.repertoireUuid).find(repertoire.subjectBaseId);
//   const subjectIdDetailsOption = subjectIdDetailsSelect.find('option').withAttribute('selected');
//   const sexSpeciesDetailsText = Selector(repertoire.repertoireFormIdBase + general.repertoireUuid).find(repertoire.sexSpeciesDetailsId).withAttribute('value', subject.sex + '/' + subject.species).exists;
//   const raceEthnicityDetailsText = Selector(repertoire.repertoireFormIdBase + general.repertoireUuid).find(repertoire.raceEthnicityDetailsId).withAttribute('value', subject.race + '/' + subject.ethnicity).exists;
//   const ageDetailsText = Selector(repertoire.repertoireFormIdBase + general.repertoireUuid).find(repertoire.ageDetailsId).withAttribute('value', subject.ageMin + '-' + subject.ageMax + ' ' + subject.ageUnitDisplay).exists;
//   const sampleIdDetailsSelect = Selector(repertoire.sampleIdBaseId + general.sampleUuid);
//   const tissueSelect = Selector(repertoire.tissueId + general.sampleUuid);
//   const cellSubsetSelect = Selector(repertoire.cellSubsetId + general.sampleUuid);
//   const cellSpeciesSelect = Selector(repertoire.cellSpeciesId + general.sampleUuid);

//   //Summary view checks
//   await t
//     .expect(repertoireNameTextTrimmed).eql("Repertoire Name: " + repertoire.repertoireName)
//     .expect(repertoireDescriptionTextTrimmed).eql("Repertoire Description: " + repertoire.repertoireDescription)
//     .expect(subjectIdTextTrimmed).eql("Subject ID: " + subject.subjectId)
//     .expect(sexSpeciesTextTrimmed).eql("Sex/Species: " + subject.sex + '/' + subject.species)
//     .expect(raceEthnicityTextTrimmed).eql("Race/Ethnicity: " + subject.race + '/' + subject.ethnicity)
//     .expect(ageTextTrimmed).eql("Age: " + subject.ageMin + '-' + subject.ageMax + ' ' + subject.ageUnit + "(s)")
//     .expect(sampleIdTextTrimmed).eql("Sample ID: " + repertoire.sampleId)
//     .expect(tissueText).ok()
//     .expect(diseaseStateSampleTextTrimmed).eql("Disease State: " + repertoire.diseaseStateSample)
//     .expect(singleCellTextTrimmed).eql("Single Cell: " + repertoire.singleCell)
//     .expect(cellSubsetText).ok()
//     .expect(templateTextTrimmed).eql("Template: " + repertoire.templateClass)
//     .expect(targetLociTextTrimmed).eql("Target Loci: " + repertoire.pcrTargetLocus)

//   await t
//     .click(repertoire.detailsSummarySelect)

//   const subjectIdDetailsText = await subjectIdDetailsOption.innerText;

//   //Details view checks
//   await t
//     .expect(Selector(repertoire.repertoireNameBaseId + general.repertoireUuid).value).eql(repertoire.repertoireName)
//     .expect(repertoire.repertoireDescriptionSelect.value).eql(repertoire.repertoireDescription)

//     .expect(subjectIdDetailsText.toString()).eql(subject.subjectId)
//     .expect(sexSpeciesDetailsText).ok()
//     .expect(raceEthnicityDetailsText).ok()
//     .expect(ageDetailsText).ok()

//     .expect(sampleIdDetailsSelect.value).eql(repertoire.sampleId)
//     .expect(repertoire.sampleTypeSelect.value).eql(repertoire.sampleType)
//     .expect(tissueSelect.getAttribute('value')).contains(repertoire.tissue) //We don't know the exact ontology
//     .expect(repertoire.anatomicSiteSelect.value).eql(repertoire.anatomicSite)
//     .expect(repertoire.diseaseStateSampleSelect.value).eql(repertoire.diseaseStateSample)
//     .expect(repertoire.collectionTimeSelect.value).eql(repertoire.collectionTime)
//     .expect(repertoire.collectionTimePointRelativeUnitSelect.value).eql(repertoire.collectionTimePointRelativeUnit)
//     .expect(repertoire.collectionTimeReferenceSelect.value).eql(repertoire.collectionTimeReference)
//     .expect(repertoire.biomaterialProviderSelect.value).eql(repertoire.biomaterialProvider)
//     .expect(repertoire.sequencingRunIdSelect.value).eql(repertoire.sequencingRunId)
//     .expect(repertoire.sequencingPlatformSelect.value).eql(repertoire.sequencingPlatform)
//     .expect(repertoire.sequencingFacilitySelect.value).eql(repertoire.sequencingFacility)
//     .expect(repertoire.sequencingDateSelect.value).eql(repertoire.sequencingDate)
//     .expect(repertoire.sequencingKitSelect.value).eql(repertoire.sequencingKit)
//     .expect(repertoire.sequencingFilesSelect.value).eql(repertoire.sequencingFiles)
//     .expect(repertoire.tissueProcessingSelect.value).eql(repertoire.tissueProcessing)
//     .expect(cellSubsetSelect.getAttribute('value')).contains(repertoire.cellSubset) //We don't know the exact ontology
//     .expect(repertoire.cellPhenotypeSelect.value).eql(repertoire.cellPhenotype)
//     .expect(cellSpeciesSelect.getAttribute('value')).contains(repertoire.cellSpecies) //We don't know the exact ontology
//     .expect(repertoire.singleCellSelect.value).eql(repertoire.singleCell)
//     .expect(repertoire.cellNumberSelect.value).eql(repertoire.cellNumber)
//     .expect(repertoire.cellsPerReactionSelect.value).eql(repertoire.cellsPerReaction)
//     .expect(repertoire.cellStorageSelect.value).eql(repertoire.cellStorage)
//     .expect(repertoire.cellQualitySelect.value).eql(repertoire.cellQuality)
//     .expect(repertoire.cellIsolationSelect.value).eql(repertoire.cellIsolation)
//     .expect(repertoire.cellProcessingProtocolSelect.value).eql(repertoire.cellProcessingProtocol)
//     .expect(repertoire.templateClassSelect.value).eql(repertoire.templateClass)
//     .expect(repertoire.templateQualitySelect.value).eql(repertoire.templateQuality)
//     .expect(repertoire.templateAmountSelect.value).eql(repertoire.templateAmount)
//     .expect(repertoire.templateAmountUnitSelect.value).eql(repertoire.templateAmountUnit)
//     .expect(repertoire.libraryGenerationMethodSelect.value).eql(repertoire.libraryGenerationMethod)
//     .expect(repertoire.libraryGenerationProtocolSelect.value).eql(repertoire.libraryGenerationProtocol)
//     .expect(repertoire.libraryGenerationKitVersionSelect.value).eql(repertoire.libraryGenerationKitVersion)
//     .expect(repertoire.completeSequencesSelect.value).eql(repertoire.completeSequences)
//     .expect(repertoire.physicalLinkageSelect.value).eql(repertoire.physicalLinkage)
//     .expect(repertoire.pcrTargetLocusSelect.value).eql(repertoire.pcrTargetLocus)
//     .expect(repertoire.forwardTargetLocationSelect.value).eql(repertoire.forwardTargetLocation)
//     .expect(repertoire.reverseTargetLocationSelect.value).eql(repertoire.reverseTargetLocation)
//     .expect(repertoire.sequencingDataIdSelect.value).eql(repertoire.sequencingDataId)
// });

// test('View existing Repertoire in Summary view mode, edit, revert, and confirm the correct values are still shown', async t => {
//   await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

//   await t
//     .navigateTo('./' + general.projectUuidUrl)
//     .click(general.repertoiresTabSelect)

//   //Temporary Values and Selectors
//   const repertoireNameR = "Repertoire Name R";
//   const repertoireDescriptionR = "Repertoire Description R";
//   const sampleIdR = 'Sample ID R';
//   const tissueR = "hair of scalp";
//   const tissueSelect = Selector(repertoire.tissueIdBaseId + general.sampleUuid);

//   const repertoireNameTextUntrimmed = await Selector('div').withExactText("Repertoire Name: " + repertoire.repertoireName).innerText;
//   const repertoireDescriptionTextUntrimmed = await Selector('div').withExactText("Repertoire Description: " + repertoire.repertoireDescription).innerText;
//   const sampleIdTextUntrimmed = await Selector('div').withExactText("Sample ID: " + repertoire.sampleId).innerText;
//   const tissueText = Selector('div').withText(repertoire.tissue.toLowerCase()).exists; //We don't know the exact Ontology

//   const repertoireNameTextTrimmed = await repertoireNameTextUntrimmed.toString().trim();
//   const repertoireDescriptionTextTrimmed = await repertoireDescriptionTextUntrimmed.toString().trim();
//   const sampleIdTextTrimmed = await sampleIdTextUntrimmed.toString().trim();

//   //Details view selectors
//   const repertoireNameDetailsSelect = Selector(repertoire.repertoireFormIdBase + general.repertoireUuid);
//   const sampleIdDetailsSelect = Selector(repertoire.sampleIdBaseId + general.sampleUuid);

//   //Edit values but do not Save
//   await t
//     .click(repertoire.repertoireDropdownSelect)
//     .click(repertoire.repertoireDropdownEditSelect)

//   await t
//     .typeText(repertoire.repertoireNameBaseId + general.repertoireUuid, repertoireNameR, { replace: true })
//     .typeText(Selector(repertoire.repertoireFormIdBase + general.repertoireUuid).find(repertoire.repertoireDescriptionId), repertoireDescriptionR, { replace: true })
//     .typeText(repertoire.sampleIdBaseId + general.sampleUuid, sampleIdR, { replace: true })
//     .click(tissueSelect)
//     .typeText(general.ontologyInputSelect.nth(0), tissueR, { replace: true })
//     .click(general.ontologySelectSelect.withExactText(tissueR))

//   await t
//     .click(repertoire.revertChangesSelect)

//   //Summary view checks
//   await t
//     .expect(repertoireNameTextTrimmed).eql("Repertoire Name: " + repertoire.repertoireName)
//     .expect(repertoireDescriptionTextTrimmed).eql("Repertoire Description: " + repertoire.repertoireDescription)
//     .expect(sampleIdTextTrimmed).eql("Sample ID: " + repertoire.sampleId)
//     .expect(tissueText).ok()

//   await t
//     .click(repertoire.detailsSummarySelect)

//   //Details view checks
//   await t
//     .expect(Selector(repertoire.repertoireNameBaseId + general.repertoireUuid).value).eql(repertoire.repertoireName)
//     .expect(repertoire.repertoireDescriptionSelect.value).eql(repertoire.repertoireDescription)
//     .expect(sampleIdDetailsSelect.value).eql(repertoire.sampleId)
//     .expect(tissueSelect.getAttribute('value')).contains(repertoire.tissue) //We don't know the exact ontology
// });

// test('Duplicate the Repertoire, confirm Back-end changes, and then delete the duplicated Repertoire', async t => {
//   await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

//   await t.navigateTo('./' + general.projectUuidUrl);

//   await t
//     .click(general.repertoiresTabSelect)
//     .click(repertoire.repertoireDropdownSelect.withAttribute('name', general.repertoireUuid))
//     .click(repertoire.repertoireDropdownDuplicateSelect.withAttribute('name', general.repertoireUuid))
//     .click(repertoire.saveChangesSelect)
//     .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).ok()
//     .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).notOk()
//     .click(repertoire.detailsSummarySelect)

//   //Determine the UUIDs for the new Repertoire and new Sample
//   var token = await login.getTokenFromLocalStorage();
//   if (config.tapis_version == 2) {
//     var r = await general.tapisV2.getMetadataForType(token.access_token, general.projectUuid, 'repertoire');
//   } else {
//     var requestSettings = {
//       url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/repertoire',
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + token['access_token']['access_token']
//       }
//     };
//     var r = await general.tapisV3.sendRequest(requestSettings);
//     await t.expect(r['status']).eql("success")
//       .expect(r['result'].length).eql(2);
//     r = r['result'];
//   }

//   general.dRepertoireUuid = "";
//   var dSampleUuid = "";
//   var dRepertoireValue;
//   var repertoireValue;
//   if (r[0]["uuid"] == general.repertoireUuid) {
//     general.dRepertoireUuid = r[1]["uuid"];
//     dRepertoireValue = r[1]["value"];
//     repertoireValue = r[0]["value"];
//   } else {
//     general.dRepertoireUuid = r[0]["uuid"];
//     dRepertoireValue = r[0]["value"];
//     repertoireValue = r[1]["value"];
//   }

//   dSampleUuid = dRepertoireValue["sample"][0]["vdjserver_uuid"];

//   if (config.tapis_version == 2) {
//     var s = await general.tapisV2.getMetadataForType(token.access_token, general.projectUuid, 'sample');
//   } else {
//     var requestSettings = {
//       url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/uuid/' + dSampleUuid,
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + token['access_token']['access_token']
//       }
//     };
//     var s = await general.tapisV3.sendRequest(requestSettings);
//     await t.expect(s['status']).eql("success")
//       .expect(s['result'].length).eql(1);
//     s = s['result'];
//   }

//   var dSampleValue = s[0]["value"];

//   if (config.tapis_version == 2) {
//     var s2 = await general.tapisV2.getMetadataForType(token.access_token, general.projectUuid, 'sample');
//   } else {
//     var requestSettings = {
//       url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/uuid/' + general.sampleUuid,
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + token['access_token']['access_token']
//       }
//     };
//     var s2 = await general.tapisV3.sendRequest(requestSettings);
//     await t.expect(s2['status']).eql("success")
//       .expect(s2['result'].length).eql(1);
//     s2 = s2['result'];
//   }

//   var sampleValue = s2[0]["value"];

//   if (config.tapis_version == 2) {
//     var subject = await general.tapisV2.getMetadataForType(token.access_token, general.projectUuid, 'subject');
//   } else {
//     var requestSettings = {
//       url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/subject',
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + token['access_token']['access_token']
//       }
//     };
//     var subject = await general.tapisV3.sendRequest(requestSettings);
//     await t.expect(subject['status']).eql("success")
//       .expect(subject['result'].length).eql(1);
//     subject = subject['result'];
//   }

//   var subjectValue = subject[0]["value"];

//   //Check the Back-end values
//   await t
//     .expect(repertoireValue["repertoire_name"]).eql(dRepertoireValue["repertoire_name"])
//     .expect(repertoireValue["repertoire_description"]).eql(dRepertoireValue["repertoire_description"])

//     .expect(sampleValue["sample_id"]).eql(dSampleValue["sample_id"])
//     .expect(sampleValue["sample_type"]).eql(dSampleValue["sample_type"])
//     .expect(sampleValue["tissue"].label).eql(dSampleValue["tissue"].label)
//     .expect(sampleValue["anatomic_site"]).eql(dSampleValue["anatomic_site"])
//     .expect(sampleValue["disease_state_sample"]).eql(dSampleValue["disease_state_sample"])
//     .expect(sampleValue["collection_time_point_relative"]).eql(dSampleValue["collection_time_point_relative"])
//     .expect(sampleValue["collection_time_point_relative_unit"].label).eql(dSampleValue["collection_time_point_relative_unit"].label)
//     .expect(sampleValue["collection_time_point_reference"]).eql(dSampleValue["collection_time_point_reference"])
//     .expect(sampleValue["biomaterial_provider"]).eql(dSampleValue["biomaterial_provider"])
//     .expect(sampleValue["sequencing_run_id"]).eql(dSampleValue["sequencing_run_id"])
//     .expect(sampleValue["sequencing_platform"]).eql(dSampleValue["sequencing_platform"])
//     .expect(sampleValue["sequencing_facility"]).eql(dSampleValue["sequencing_facility"])
//     .expect(sampleValue["sequencing_run_date"]).eql(dSampleValue["sequencing_run_date"])
//     .expect(sampleValue["sequencing_kit"]).eql(dSampleValue["sequencing_kit"])
//     .expect(sampleValue["sequencing_files"]["filename"]).eql(dSampleValue["sequencing_files"]["filename"])
//     .expect(sampleValue["tissue_processing"]).eql(dSampleValue["tissue_processing"])
//     .expect(sampleValue["cell_subset"].label).eql(dSampleValue["cell_subset"].label)
//     .expect(sampleValue["cell_phenotype"]).eql(dSampleValue["cell_phenotype"])
//     .expect(sampleValue["cell_species"].label).eql(dSampleValue["cell_species"].label)
//     .expect(sampleValue["single_cell"]).eql(dSampleValue["single_cell"])
//     .expect(sampleValue["cell_number"]).eql(dSampleValue["cell_number"])
//     .expect(sampleValue["cells_per_reaction"]).eql(dSampleValue["cells_per_reaction"])
//     .expect(sampleValue["cell_storage"]).eql(dSampleValue["cell_storage"])
//     .expect(sampleValue["cell_quality"]).eql(dSampleValue["cell_quality"])
//     .expect(sampleValue["cell_isolation"]).eql(dSampleValue["cell_isolation"])
//     .expect(sampleValue["cell_processing_protocol"]).eql(dSampleValue["cell_processing_protocol"])
//     .expect(sampleValue["template_class"]).eql(dSampleValue["template_class"])
//     .expect(sampleValue["template_quality"]).eql(dSampleValue["template_quality"])
//     .expect(sampleValue["template_amount"]).eql(dSampleValue["template_amount"])
//     .expect(sampleValue["template_amount_unit"].label).eql(dSampleValue["template_amount_unit"].label)
//     .expect(sampleValue["library_generation_method"]).eql(dSampleValue["library_generation_method"])
//     .expect(sampleValue["library_generation_protocol"]).eql(dSampleValue["library_generation_protocol"])
//     .expect(sampleValue["library_generation_kit_version"]).eql(dSampleValue["library_generation_kit_version"])
//     .expect(sampleValue["complete_sequences"]).eql(dSampleValue["complete_sequences"])
//     .expect(sampleValue["physical_linkage"]).eql(dSampleValue["physical_linkage"])
//     .expect(sampleValue["pcr_target"][0]["pcr_target_locus"]).eql(dSampleValue["pcr_target"][0]["pcr_target_locus"])
//     .expect(sampleValue["pcr_target"][0]["forward_pcr_primer_target_location"]).eql(dSampleValue["pcr_target"][0]["forward_pcr_primer_target_location"])
//     .expect(sampleValue["pcr_target"][0]["reverse_pcr_primer_target_location"]).eql(dSampleValue["pcr_target"][0]["reverse_pcr_primer_target_location"])
//     .expect(sampleValue["sequencing_data_id"]).eql(dSampleValue["sequencing_data_id"])

//   //Delete the duplicated Repertoire
//   await t
//     .click(general.repertoiresTabSelect)
//     .click(repertoire.repertoireDropdownSelect.withAttribute('name', general.dRepertoireUuid))
//     .click(repertoire.repertoireDropdownDeleteSelect.withAttribute('name', general.dRepertoireUuid))
//     .click(repertoire.saveChangesSelect)
//     .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).ok()
//     .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).notOk()
// });

// test('Duplicate the Repertoire, change select values, and confirm Back-end changes', async t => {
//   await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

//   await t.navigateTo('./' + general.projectUuidUrl);

//   await t
//     .click(general.repertoiresTabSelect)
//     .click(repertoire.repertoireDropdownSelect.withAttribute('name', general.repertoireUuid))
//     .click(repertoire.repertoireDropdownDuplicateSelect.withAttribute('name', general.repertoireUuid))

//   var sampleCid = await repertoire.sampleFormSelect.find(repertoire.sampleDropdownId).getAttribute('name');

//   //console.log("Duplicate Sample CID: " + sampleCid);
//   var duplicateSampleIdSelect = Selector(repertoire.sampleIdBaseId + sampleCid);
//   const cellSubsetSelect = Selector(repertoire.cellSubsetBaseId + sampleCid);

//   const repertoireNameD = repertoire.repertoireName + '-2';
//   const sampleIdD = repertoire.sampleId + '-2';
//   const cellSubsetD = "plasma cell";
//   const singleCellD = "false";
//   const libraryGenerationMethodD = "RT(RHP)+PCR";
//   const reverseTargetLocationD = repertoire.reverseTargetLocation + "-2";

//   var repertoireDCid = await repertoire.repertoireFormSelect.find(repertoire.repertoireDropdownId).getAttribute('name');

//   await t
//     .click(general.navbarStatsIconSelect)
//     .typeText(repertoire.repertoireNameBaseId + repertoireDCid, repertoireNameD, { replace: true })
//     .typeText(duplicateSampleIdSelect, sampleIdD, { replace: true })
//     .click(cellSubsetSelect)
//     .typeText(general.ontologyInputSelect.nth(1), cellSubsetD, { replace: true })
//     .click(general.ontologySelectSelect.withExactText(cellSubsetD))
//     .click(repertoire.singleCellSelect)
//     .click(repertoire.singleCellOption.withAttribute('value', singleCellD))
//     .click(repertoire.libraryGenerationMethodSelect)
//     .click(repertoire.libraryGenerationMethodOption.withAttribute('value', libraryGenerationMethodD))
//     .typeText(repertoire.reverseTargetLocationSelect, reverseTargetLocationD, { replace: true })
//     .click(repertoire.saveChangesSelect)
//     .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).ok()
//     .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).notOk()
//     .click(repertoire.detailsSummarySelect)

//   //Determine the UUIDs for the new Repertoire and new Sample
//   var token = await login.getTokenFromLocalStorage();
//   if (config.tapis_version == 2) {
//     var r = await general.tapisV2.getMetadataForType(token.access_token, general.projectUuid, 'repertoire');
//   } else {
//     var requestSettings = {
//       url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/repertoire',
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + token['access_token']['access_token']
//       }
//     };
//     var r = await general.tapisV3.sendRequest(requestSettings);
//     await t.expect(r['status']).eql("success")
//       .expect(r['result'].length).eql(2);
//     r = r['result'];
//   }

//   general.dRepertoireUuid = "";
//   var dSampleUuid = "";
//   var dRepertoireValue;
//   if (r[0]["uuid"] == general.repertoireUuid) {
//     general.dRepertoireUuid = r[1]["uuid"];
//     dRepertoireValue = r[1]["value"];
//   } else {
//     general.dRepertoireUuid = r[0]["uuid"];
//     dRepertoireValue = r[0]["value"];
//   }

//   dSampleUuid = dRepertoireValue["sample"][0]["vdjserver_uuid"];
//   //console.log("Duplicate Sample UUID: " + dSampleUuid);

//   if (config.tapis_version == 2) {
//     var s = await general.tapisV2.getMetadataForType(token.access_token, general.projectUuid, 'sample');
//   } else {
//     var requestSettings = {
//       url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/uuid/' + dSampleUuid,
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + token['access_token']['access_token']
//       }
//     };
//     var s = await general.tapisV3.sendRequest(requestSettings);
//     await t.expect(s['status']).eql("success")
//       .expect(s['result'].length).eql(1);
//     s = s['result'];
//   }

//   var dSampleValue = s[0]["value"];

//   //Check the Back-end values
//   await t
//     .expect(dRepertoireValue["repertoire_name"]).eql(repertoire.repertoireName + '-2')
//     .expect(dSampleValue["sample_id"]).eql(repertoire.sampleId + '-2')
// });

// test('Delete the duplicated Repertoire and confirm the correct one was deleted on the Back-end', async t => {
//   await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

//   await t.navigateTo('./' + general.projectUuidUrl);

//   await t
//     .click(general.repertoiresTabSelect)
//     .click(repertoire.repertoireDropdownSelect.withAttribute('name', general.dRepertoireUuid))
//     .click(repertoire.repertoireDropdownDeleteSelect.withAttribute('name', general.dRepertoireUuid))
//     .click(repertoire.saveChangesSelect)
//     .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).ok()
//     .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).notOk()

//   var token = await login.getTokenFromLocalStorage();
//   if (config.tapis_version == 2) {
//     var r = await general.tapisV2.getProjectMetadata(token.access_token, general.subjectUuid);
//   } else {
//     var requestSettings = {
//       url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/repertoire',
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + token['access_token']['access_token']
//       }
//     };
//     var r = await general.tapisV3.sendRequest(requestSettings);
//     await t.expect(r['status']).eql("success")
//       .expect(r['result'].length).eql(1);
//     r = r['result'][0];
//   }

//   //Confirm the remaining Repertoire is the correct one
//   await t
//     .expect(r["uuid"]).eql(general.repertoireUuid)
// });

// test('Duplicate a Sample for the original Repertoire, change select values, and check against the Back-end', async t => {
//   await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

//   await t.navigateTo('./' + general.projectUuidUrl);

//   await t
//     .click(general.repertoiresTabSelect)
//     .click(repertoire.sampleAddDropdownSelect)
//     .click(repertoire.sampleDropdownDuplicateSelect.withAttribute('name', general.sampleUuid))

//   var sampleCid = await repertoire.sampleFormSelect.find(repertoire.sampleDropdownId).getAttribute('name');

//   await t.typeText(Selector(repertoire.sampleIdBaseId + sampleCid), repertoire.sampleId + "-duplicate", { replace: true })
//   const tissueSelect = Selector(repertoire.tissueId + sampleCid);

//   const tissueD = "hair of scalp";
//   const singleCellD = "false";
//   const pcrTargetLocusD = "TRG";

//   await t
//     .click(tissueSelect)
//     .typeText(general.ontologyInputSelect.nth(0), tissueD, { replace: true })
//     .click(general.ontologySelectSelect.withExactText(tissueD))
//     .click(repertoire.singleCellSelect)
//     .click(repertoire.singleCellOption.withAttribute('value', singleCellD))
//     .click(repertoire.pcrTargetLocusSelect)
//     .click(repertoire.pcrTargetLocusOption.withAttribute('value', pcrTargetLocusD))
//     .click(repertoire.saveChangesSelect)
//     .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).ok()
//     .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).notOk()

//   var token = await login.getTokenFromLocalStorage();
//   if (config.tapis_version == 2) {
//     var m = await general.tapisV2.getProjectMetadata(token.access_token, general.subjectUuid);
//   } else {
//     var requestSettings = {
//       url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/uuid/' + general.repertoireUuid,
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + token['access_token']['access_token']
//       }
//     };
//     var m = await general.tapisV3.sendRequest(requestSettings);
//     await t.expect(m['status']).eql("success")
//       .expect(m['result'].length).eql(1);
//     m = m['result'][0];
//   }

//   //Determine the UUID of the duplicate Sample
//   if (m["value"]["sample"][0]["vdjserver_uuid"] == general.sampleUuid)
//     general.dSampleUuid = m["value"]["sample"][1]["vdjserver_uuid"];
//   else
//     general.dSampleUuid = m["value"]["sample"][0]["vdjserver_uuid"];

//   //Get the value for the duplicate Sample
//   if (config.tapis_version == 2) {
//     var s = await general.tapisV2.getMetadataForType(token.access_token, general.projectUuid, 'sample');
//   } else {
//     var requestSettings = {
//       url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/uuid/' + general.dSampleUuid,
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + token['access_token']['access_token']
//       }
//     };
//     var s = await general.tapisV3.sendRequest(requestSettings);
//     await t.expect(s['status']).eql("success")
//       .expect(s['result'].length).eql(1);
//     s = s['result'];
//   }

//   var dSampleValue = s[0]["value"];

//   //Check Sample values
//   await t
//     .expect(dSampleValue["sample_id"]).eql(repertoire.sampleId + "-duplicate")
//     .expect(dSampleValue["sample_type"]).eql(repertoire.sampleType)
//     .expect(dSampleValue["tissue"].label).eql(tissueD)
//     .expect(dSampleValue["anatomic_site"]).eql(repertoire.anatomicSite)
//     .expect(dSampleValue["disease_state_sample"]).eql(repertoire.diseaseStateSample)
//     .expect(dSampleValue["collection_time_point_relative"]).eql(parseFloat(repertoire.collectionTime))
//     .expect(dSampleValue["collection_time_point_relative_unit"].label).eql(repertoire.collectionTimePointRelativeUnit)
//     .expect(dSampleValue["collection_time_point_reference"]).eql(repertoire.collectionTimeReference)
//     .expect(dSampleValue["biomaterial_provider"]).eql(repertoire.biomaterialProvider)
//     .expect(dSampleValue["sequencing_run_id"]).eql(repertoire.sequencingRunId)
//     .expect(dSampleValue["sequencing_platform"]).eql(repertoire.sequencingPlatform)
//     .expect(dSampleValue["sequencing_facility"]).eql(repertoire.sequencingFacility)
//     .expect(dSampleValue["sequencing_run_date"]).eql(repertoire.sequencingDate)
//     .expect(dSampleValue["sequencing_kit"]).eql(repertoire.sequencingKit)
//     .expect(dSampleValue["tissue_processing"]).eql(repertoire.tissueProcessing)
//     .expect(dSampleValue["cell_subset"].label).eql(repertoire.cellSubset)
//     .expect(dSampleValue["cell_phenotype"]).eql(repertoire.cellPhenotype)
//     .expect(dSampleValue["cell_species"].label).eql(repertoire.cellSpecies)
//     .expect(dSampleValue["single_cell"]).notOk()
//     .expect(dSampleValue["cell_number"]).eql(parseInt(repertoire.cellNumber))
//     .expect(dSampleValue["cells_per_reaction"]).eql(parseInt(repertoire.cellsPerReaction))
//     .expect(dSampleValue["cell_storage"]).notOk()
//     .expect(dSampleValue["cell_quality"]).eql(repertoire.cellQuality)
//     .expect(dSampleValue["cell_isolation"]).eql(repertoire.cellIsolation)
//     .expect(dSampleValue["cell_processing_protocol"]).eql(repertoire.cellProcessingProtocol)
//     .expect(dSampleValue["template_class"]).eql(repertoire.templateClass)
//     .expect(dSampleValue["template_quality"]).eql(repertoire.templateQuality)
//     .expect(dSampleValue["template_amount"]).eql(parseFloat(repertoire.templateAmount))
//     .expect(dSampleValue["template_amount_unit"].label).eql(repertoire.templateAmountUnit)
//     .expect(dSampleValue["library_generation_method"]).eql(repertoire.libraryGenerationMethod)
//     .expect(dSampleValue["library_generation_protocol"]).eql(repertoire.libraryGenerationProtocol)
//     .expect(dSampleValue["library_generation_kit_version"]).eql(repertoire.libraryGenerationKitVersion)
//     .expect(dSampleValue["complete_sequences"]).eql(repertoire.completeSequences)
//     .expect(dSampleValue["physical_linkage"]).eql(repertoire.physicalLinkage)
//     .expect(dSampleValue["pcr_target"][0]["pcr_target_locus"]).eql(pcrTargetLocusD)
//     .expect(dSampleValue["pcr_target"][0]["forward_pcr_primer_target_location"]).eql(repertoire.forwardTargetLocation)
//     .expect(dSampleValue["pcr_target"][0]["reverse_pcr_primer_target_location"]).eql(repertoire.reverseTargetLocation)
// });

// test('Delete the duplicated Sample and confirm the correct one was deleted on the Back-end', async t => {
//   await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

//   await t.navigateTo('./' + general.projectUuidUrl);

//   await t
//     .click(general.repertoiresTabSelect)

//   await t
//     .click(repertoire.sampleAddDropdownSelect)
//     .click(repertoire.sampleDropdownDeleteSelect.withAttribute('name', general.dSampleUuid))
//     .click(repertoire.saveChangesSelect)
//     .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).ok()
//     .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).notOk()

//   //Confirm there is just 1 Sample in the Samples Object
//   var token = await login.getTokenFromLocalStorage();
//   if (config.tapis_version == 2) {
//     var sp = await general.tapisV2.getProjectMetadata(token.access_token, general.subjectUuid);
//   } else {
//     var requestSettings = {
//       url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/sample_processing',
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + token['access_token']['access_token']
//       }
//     };
//     var sp = await general.tapisV3.sendRequest(requestSettings);
//     await t.expect(sp['status']).eql("success")
//       .expect(sp['result'].length).eql(1);
//     sp = sp['result'][0];
//   }

//   //Confirm the remaining Sample is the correct one
//   await t
//     .expect(sp["uuid"]).eql(general.sampleUuid)

//   //Confirm the reference to the Sample was removed from the Repertoire Object and the correct one remains
//   token = await login.getTokenFromLocalStorage();
//   if (config.tapis_version == 2) {
//     var r = await general.tapisV2.getProjectMetadata(token.access_token, general.repertoireUuid);
//   } else {
//     var requestSettings = {
//       url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/repertoire',
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + token['access_token']['access_token']
//       }
//     };
//     var r = await general.tapisV3.sendRequest(requestSettings);
//     await t.expect(r['status']).eql("success")
//       .expect(r['result'].length).eql(1);
//     r = r['result'][0];
//   }

//   //Confirm the remaining Sample is the correct one
//   await t
//     .expect(r["value"]["sample"][0]["vdjserver_uuid"]).eql(general.sampleUuid)
// });

// test('Confirm \'Revert Changes\' and \'Save Changes\' buttons are disabled/enabled correctly', async t => {
//   await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

//   await t.navigateTo('./' + general.projectUuidUrl);

//   await t
//     .click(general.repertoiresTabSelect)

//   //Expect the buttons to be unavailable when no changes have been made
//   await t.expect(repertoire.revertChangesSelect.withExactText('Revert Changes').hasAttribute('disabled')).ok()
//   await t.expect(repertoire.saveChangesSelect.withExactText('Validate/Save Changes').hasAttribute('disabled')).ok()

//   //Edit a Repertoire and check buttons; edit a field and check buttons
//   await t
//     .click(repertoire.repertoireDropdownSelect.withAttribute('name', general.repertoireUuid))
//     .click(repertoire.repertoireDropdownEditSelect.withAttribute('name', general.repertoireUuid))
//     .expect(repertoire.revertChangesSelect.withExactText('Revert Changes').hasAttribute('disabled')).notOk()
//     .expect(repertoire.saveChangesSelect.withExactText('Validate/Save Changes').hasAttribute('disabled')).notOk()
//     .click(repertoire.revertChangesSelect)
//     .click(repertoire.repertoireDropdownSelect)
//     .click(repertoire.repertoireDropdownEditSelect)
//     .typeText(repertoire.repertoireDescriptionSelect, 'RepertoireDescriptionCheck', { replace: true })
//     .pressKey('tab') //Change focus
//     .expect(repertoire.revertChangesSelect.withExactText('Revert Changes').hasAttribute('disabled')).notOk()
//     .expect(repertoire.saveChangesSelect.withExactText('Validate/Save Changes').hasAttribute('disabled')).notOk()
//     .click(repertoire.revertChangesSelect)

//   //Ensure buttons are disabled after a Save
//   await t
//     .click(repertoire.repertoireDropdownSelect.withAttribute('name', general.repertoireUuid))
//     .click(repertoire.repertoireDropdownEditSelect.withAttribute('name', general.repertoireUuid))
//     .typeText(repertoire.anatomicSiteSelect, 'AnatomicSiteCheck', { replace: true })
//     .click(repertoire.saveChangesSelect)
//     .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).ok()
//     .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).notOk()
//     .expect(repertoire.revertChangesSelect.withExactText('Revert Changes').hasAttribute('disabled')).ok()
//     .expect(repertoire.saveChangesSelect.withExactText('Validate/Save Changes').hasAttribute('disabled')).ok()
//     .click(repertoire.repertoireDropdownSelect.withAttribute('name', general.repertoireUuid))
//     .click(repertoire.repertoireDropdownEditSelect.withAttribute('name', general.repertoireUuid))
//     .typeText(repertoire.anatomicSiteSelect, repertoire.anatomicSite, { replace: true })
//     .click(repertoire.saveChangesSelect)
//     .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).ok()
//     .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).notOk()
// });

// test('Attempt to create a new Repertoire (with a Sample) that has various erroneous fields for the previously created Project, save with permissible values, and check against the Back-end', async t => {
//   const subjectIdNull = 'null';
//   const sampleIdBlank = '  ';
//   const sampleIdTabbed = ' \t\t\t';
//   const sampleIdDuplicate = repertoire.sampleId;
//   const sampleIdNew = repertoire.sampleId + '-new'; //pass
//   const singleCellNull = 'null'; //pass
//   const cellStorageNull = 'null'; //pass
//   const pcrTargetLocusNull = 'null';
//   const pcrTargetLocusNew = 'IGL'; //pass
//   const collectionTimePointRelativeString = 'Collection Time Point Relative';
//   const collectionTimePointRelativeZero = '0'; //pass
//   const collectionTimePointRelativeNew = '-1234'; //pass
//   const collectionTimePointRelativeBlank = ' ';
//   const collectionTimePointRelativeUnitNew = 'hour'; //pass
//   const templateAmountNegative = '-1';
//   const templateAmountString = 'Template Amount';
//   const templateAmountBlank = ' ';
//   const templateAmountNew = '0'; //pass
//   const templateAmountUnitNull = ' ';
//   const templateAmountUnitNew = 'microgram'; //pass
//   const cellNumberNegative = '-5';
//   const cellNumberFloat = '2.5';
//   const cellNumberNew = '0'; //pass
//   const cellsPerReactionNegative = '-4';
//   const cellsPerReactionFloat = '20.5';
//   const cellsPerReactionNew = '0'; //pass
//   const sequencingDateBad = '2-22-2022';
//   const sequencingDateNew = '2022-02-22'; //pass
//   const sequencingDataIdNew = "null";

//   await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

//   await t.navigateTo('./' + general.projectUuidUrl);

//   await t
//     .click(general.repertoiresTabSelect)
//     .click(repertoire.newRepertoireSelect)
//     .click(repertoire.newRepertoireAddSelect)

//   var subjectCid = await repertoire.repertoireFormSelect.find(repertoire.repertoireDropdownId).getAttribute('name');
//   var sampleCid = await repertoire.sampleFormSelect.find(repertoire.sampleDropdownId).getAttribute('name');

//   //Check that a null Subject ID is not allowed
//   await t
//     .click(repertoire.subjectIdSelect)
//     .click(repertoire.subjectIdOption.withExactText(subjectIdNull))
//     .click(repertoire.saveChangesSelect)

//   var errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.subjectIdValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).ok()

//   //Check that a blank Sample ID is not allowed
//   await t
//     .click(repertoire.subjectIdSelect)
//     .click(repertoire.subjectIdOption.withExactText(subject.subjectId))
//     .typeText(Selector(repertoire.sampleIdBaseId + sampleCid), sampleIdBlank, { replace: true })
//     .click(repertoire.saveChangesSelect)
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.sampleIdValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).ok()

//   //Check that tabbed Sample ID is not allowed
//   await t
//     .typeText(Selector(repertoire.sampleIdBaseId + sampleCid), sampleIdTabbed, { replace: true })
//     .click(repertoire.saveChangesSelect)
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.sampleIdValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).ok()

//   //Check that a null Single Cell is allowed
//   await t
//     .typeText(Selector(repertoire.sampleIdBaseId + sampleCid), sampleIdNew, { replace: true })
//     .click(repertoire.singleCellSelect)
//     .click(repertoire.singleCellOption.withExactText(singleCellNull))
//     .click(repertoire.saveChangesSelect)
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.singleCellValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).notOk()

//   //Check that a null Cell Storage is allowed
//   await t
//     .click(repertoire.cellStorageSelect)
//     .click(repertoire.cellStorageOption.withExactText(cellStorageNull))
//     .click(repertoire.saveChangesSelect)
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.cellStorageValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).notOk()

//   //Check that a null PCR Target Locus is not allowed
//   await t
//     .click(repertoire.pcrTargetLocusSelect)
//     .click(repertoire.pcrTargetLocusOption.withExactText(pcrTargetLocusNull))
//     .click(repertoire.saveChangesSelect)
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.pcrTargetLocusValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).ok()

//   //Check that a string Collection Time Point Relative is not allowed
//   await t
//     .typeText(repertoire.collectionTimeSelect, collectionTimePointRelativeString, { replace: true })
//     .click(repertoire.pcrTargetLocusSelect)
//     .click(repertoire.pcrTargetLocusOption.withAttribute('value', pcrTargetLocusNew))
//     .click(repertoire.saveChangesSelect)
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.collectionTimeValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).ok()

//   //Check that a negative Collection Time Point Relative with a valid unit is allowed
//   await t
//     .typeText(repertoire.collectionTimeSelect, collectionTimePointRelativeNew, { replace: true })
//     .click(repertoire.collectionTimePointRelativeUnitSelect)
//     .click(repertoire.collectionTimePointRelativeUnitOption.withAttribute('value', collectionTimePointRelativeUnitNew))
//     .click(repertoire.saveChangesSelect)
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.collectionTimeValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).notOk()

//   //Check that negative Collection Time Point Relative without a valid unit is not allowed
//   await t
//     .click(repertoire.collectionTimePointRelativeUnitSelect)
//     .click(repertoire.collectionTimePointRelativeUnitOption.withExactText('null'))
//     .click(repertoire.saveChangesSelect)
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.collectionTimePointRelativeUnitValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).ok()

//   //Check that a 0 Collection Time Point Relative with a valid unit is not allowed
//   await t
//     .typeText(repertoire.collectionTimeSelect, collectionTimePointRelativeZero, { replace: true })
//     .click(repertoire.collectionTimePointRelativeUnitSelect)
//     .click(repertoire.collectionTimePointRelativeUnitOption.withAttribute('value', collectionTimePointRelativeUnitNew))
//     .click(repertoire.saveChangesSelect)
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.collectionTimeValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).notOk()

//   //Check that a blank Collection Time Point Relative with a valid unit is not allowed
//   await t
//     .typeText(repertoire.collectionTimeSelect, collectionTimePointRelativeBlank, { replace: true })
//     .click(repertoire.collectionTimePointRelativeUnitSelect)
//     .click(repertoire.collectionTimePointRelativeUnitOption.withAttribute('value', collectionTimePointRelativeUnitNew))
//     .click(repertoire.saveChangesSelect)
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.collectionTimeValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).ok()

//   //Check that a string Template Amount is not allowed
//   await t
//     .typeText(repertoire.collectionTimeSelect, collectionTimePointRelativeNew, { replace: true })
//     .click(repertoire.collectionTimePointRelativeUnitSelect)
//     .click(repertoire.collectionTimePointRelativeUnitOption.withAttribute('value', collectionTimePointRelativeUnitNew))
//     .typeText(repertoire.templateAmountSelect, templateAmountString, { replace: true })
//     .click(repertoire.saveChangesSelect)
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.templateAmountValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).ok()

//   //Check that a negative Template Amount is not allowed
//   await t
//     .typeText(repertoire.templateAmountSelect, templateAmountNegative, { replace: true })
//     .click(repertoire.saveChangesSelect)
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.templateAmountValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).ok()

//   //Check that a string Template Amount with a valid unit is not allowed
//   await t
//     .typeText(repertoire.templateAmountSelect, templateAmountString, { replace: true })
//     .click(repertoire.templateAmountUnitSelect)
//     .click(repertoire.templateAmountUnitOption.withAttribute('value', templateAmountUnitNew))
//     .click(repertoire.saveChangesSelect)
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.templateAmountValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).ok()

//   //Check that a blank Template Amount with a valid unit is not allowed
//   await t
//     .typeText(repertoire.templateAmountSelect, templateAmountBlank, { replace: true })
//     .click(repertoire.templateAmountUnitSelect)
//     .click(repertoire.templateAmountUnitOption.withAttribute('value', templateAmountUnitNew))
//     .click(repertoire.saveChangesSelect)
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.templateAmountValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).ok()

//   //Check that a 0 Template Amount with a null unit is not allowed
//   await t
//     .typeText(repertoire.templateAmountSelect, templateAmountNew, { replace: true })
//     .click(repertoire.templateAmountUnitSelect)
//     .click(repertoire.templateAmountUnitOption.withExactText('null'))
//     .click(repertoire.saveChangesSelect)
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.templateAmountUnitValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).ok()

//   //Check that a 0 Template Amount with a valid unit is allowed
//   await t
//     .typeText(repertoire.templateAmountSelect, templateAmountNew, { replace: true })
//     .click(repertoire.templateAmountUnitSelect)
//     .click(repertoire.templateAmountUnitOption.withAttribute('value', templateAmountUnitNew))
//     .click(repertoire.saveChangesSelect)
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.templateAmountUnitValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).notOk()

//   //Check that a negative Cell Number is not allowed
//   await t
//     .typeText(repertoire.cellNumberSelect, cellNumberNegative, { replace: true })
//     .click(repertoire.saveChangesSelect)
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.cellNumberValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).ok()

//   //Check that a float Cell Number is not allowed
//   await t
//     .typeText(repertoire.cellNumberSelect, cellNumberFloat, { replace: true })
//     .click(repertoire.saveChangesSelect)
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.cellNumberValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).ok()

//   //Check that a negative Cells Per Reaction is not allowed
//   await t
//     .typeText(repertoire.cellNumberSelect, cellNumberNew, { replace: true })
//     .typeText(repertoire.cellsPerReactionSelect, cellsPerReactionNegative, { replace: true })
//     .click(repertoire.saveChangesSelect)
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.cellsPerReactionValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).ok()

//   //Check that a float Cells Per Reaction is not allowed
//   await t
//     .typeText(repertoire.cellsPerReactionSelect, cellsPerReactionFloat, { replace: true })
//     .click(repertoire.saveChangesSelect)
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.cellsPerReactionValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).ok()

//   //Check that a badly formatted Sequencing Date is not allowed
//   await t
//     .click(general.navbarStatsIconSelect)
//     .typeText(repertoire.cellsPerReactionSelect, cellsPerReactionNew, { replace: true })
//     .typeText(repertoire.sequencingDateSelect, sequencingDateBad, { replace: true })
//     .click(repertoire.saveChangesSelect)
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.sequencingRunDateValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).ok()

//   //Check that a correctly formatted Sequencing Date is allowed
//   await t
//     .typeText(repertoire.sequencingDateSelect, sequencingDateNew, { replace: true })
//     .click(repertoire.saveChangesSelect)
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.sequencingRunDateValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).notOk()

//   //Save the Repertoire and Sample with valid values
//   await t
//     .typeText(repertoire.sequencingDataIdSelect, sequencingDataIdNew, { replace: true })
//     .click(repertoire.saveChangesSelect)
//     .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).ok()
//     .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).notOk()
//     .click(repertoire.detailsSummarySelect);

//   //Check Back-end values; first determine the UUID values for the new Repertoire and Sample objects
//   var token = await login.getTokenFromLocalStorage();
//   if (config.tapis_version == 2) {
//     var r = await general.tapisV2.getMetadataForType(token.access_token, general.projectUuid, 'repertoire');
//   } else {
//     var requestSettings = {
//       url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/repertoire',
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + token['access_token']['access_token']
//       }
//     };
//     var r = await general.tapisV3.sendRequest(requestSettings);
//     await t.expect(r['status']).eql("success")
//       .expect(r['result'].length).eql(2);
//     r = r['result'];
//   }

//   var newRepertoireUuid = "";
//   var newSampleUuid = "";
//   var newRepertoireValue;
//   if (r[0]["uuid"] == general.repertoireUuid) {
//     newRepertoireUuid = r[1]["uuid"];
//     newRepertoireValue = r[1]["value"];
//   } else {
//     newRepertoireUuid = r[0]["uuid"];
//     newRepertoireValue = r[0]["value"];
//   }

//   newSampleUuid = newRepertoireValue["sample"][0]["vdjserver_uuid"];
//   //console.log("New Sample UUID: " + newSampleUuid);

//   if (config.tapis_version == 2) {
//     var s = await general.tapisV2.getMetadataForType(token.access_token, general.projectUuid, 'sample');
//   } else {
//     var requestSettings = {
//       url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/uuid/' + newSampleUuid,
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + token['access_token']['access_token']
//       }
//     };
//     var s = await general.tapisV3.sendRequest(requestSettings);
//     await t.expect(s['status']).eql("success")
//       .expect(s['result'].length).eql(1);
//     s = s['result'];
//   }

//   var newSampleValue = s[0]["value"];
//   var repertoireSubjectUuidReference = newRepertoireValue["subject"]["vdjserver_uuid"];

//   if (config.tapis_version == 2) {
//     var subj = await general.tapisV2.getMetadataForType(token.access_token, general.projectUuid, 'sample');
//   } else {
//     var requestSettings = {
//       url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/uuid/' + repertoireSubjectUuidReference,
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + token['access_token']['access_token']
//       }
//     };
//     var subj = await general.tapisV3.sendRequest(requestSettings);
//     await t.expect(subj['status']).eql("success")
//       .expect(subj['result'].length).eql(1);
//     subj = subj['result'];
//   }

//   var subjectValue = subj[0]['value'];

//   //Check the Back-end values
//   await t
//     .expect(subjectValue["subject_id"]).eql(subject.subjectId)
//     .expect(newSampleValue["sample_id"]).eql(sampleIdNew)
//     .expect(newSampleValue["single_cell"] == null).ok()
//     .expect(newSampleValue["cell_storage"] == null).ok()
//     .expect(newSampleValue["pcr_target"][0]["pcr_target_locus"]).eql(pcrTargetLocusNew)
//     .expect(newSampleValue["collection_time_point_relative"]).eql(parseFloat(collectionTimePointRelativeNew))
//     .expect(newSampleValue["collection_time_point_relative_unit"].label).eql(collectionTimePointRelativeUnitNew)
//     .expect(newSampleValue["template_amount"]).eql(parseFloat(templateAmountNew))
//     .expect(newSampleValue["template_amount_unit"].label).eql(templateAmountUnitNew)
//     .expect(newSampleValue["cell_number"]).eql(parseInt(cellNumberNew))
//     .expect(newSampleValue["cells_per_reaction"]).eql(parseInt(cellsPerReactionNew))
//     .expect(newSampleValue["sequencing_data_id"] == null).ok()

//   //Duplicate a Repertoire and attempt to Save with a duplicate Sample ID
//   await t
//     .click(general.navbarStatsIconSelect)
//     .click(repertoire.sampleDropdownSelect.withAttribute('name', newSampleUuid))
//     .click(repertoire.sampleDropdownDuplicateSelect.withAttribute('name', newSampleUuid))

//   var sampleCid2;

//   //Expect 3 Samples
//   await t.expect(repertoire.sampleIdSelect.count).eql(3)

//   var ids = [];
//   var numIds = await repertoire.sampleIdSelect.count;
//   for (let i = 0; i < numIds; i++) ids.push(await repertoire.sampleIdSelect.nth(i).getAttribute('id'));
//   var cids = [];
//   for (let i = 0; i < ids.length; i++) {
//     if (!(ids[i].includes(general.sampleUuid)) && !(ids[i].includes(newSampleUuid))) {
//       cids.push(ids[i].split('_')[2]);
//     }
//   }
//   sampleCid2 = cids[0];

//   await t
//     .typeText(Selector(repertoire.sampleIdBaseId + sampleCid2), repertoire.sampleId + '-new', { replace: true })
//     .click(repertoire.saveChangesSelect)

//   var errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.sampleIdValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).ok()

//   //Ensure the error disappears when the Sample ID is unique and successfully Save
//   await t
//     .typeText(Selector(repertoire.sampleIdBaseId + sampleCid2), repertoire.sampleId + '-unique', { replace: true })
//     .click(repertoire.saveChangesSelect)
//     .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).ok()
//     .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).notOk()
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.sampleIdValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).notOk()
// });

// test('Upload a File to test the Sequencing Files and Sequencing Data ID fields', async t => {
//   const repertoireNameFiles = repertoire.repertoireName + '-files';
//   const subjectIdNull = "null";
//   const subjectIdFiles = 'null';
//   const sampleIdFiles = repertoire.sampleId + '-files';
//   const pcrTargetLocusFiles = 'TRG';
//   const sequencingDataIdFilesBlank = '   ';
//   const sequencingDataIdFiles = repertoire.sequencingDataId + '-files';
//   const sequencingFilesFilesNull = "null";
//   var sequencingFilesFiles = "";

//   await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

//   await t.navigateTo('./' + general.projectUuidUrl);

//   await t
//     .click(general.filesTabSelect)
//     .click(file.uploadFilesSelect)
//     .click(file.uploadFilesComputerSelect)

//   await t
//     .setFilesToUpload(file.uploadFilesComputerDialogSelect, [file.filesPath + file.FastaSequencesFile])
//     .click(file.addStartUploadSelect)

//   await t
//     .click(file.doneUploadSelect)

//   //Get the UUID associated with the uploaded File
//   var token = await login.getTokenFromLocalStorage();
//   if (config.tapis_version == 2) {
//     var m = await general.tapisV2.getProjectMetadata(token.access_token, general.projectUuid);
//   } else {
//     var requestSettings = {
//       url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/project_file',
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + token['access_token']['access_token']
//       }
//     };
//     var m = await general.tapisV3.sendRequest(requestSettings);
//     await t.expect(m['status']).eql("success")
//       .expect(m['result'].length).eql(1);
//     m = m['result'][0];
//   }
//   var fileUuid = m['uuid'];
//   //console.log("File UUID: " + fileUuid);

//   sequencingFilesFiles = fileUuid;

//   await t
//     .click(general.repertoiresTabSelect)
//     .click(repertoire.newRepertoireSelect)
//     .click(repertoire.newRepertoireAddSelect)

//   //Expect 2 options in the Sequencing Files drop-down
//   await t.expect(repertoire.sequencingFilesOption.count).eql(2)

//   var repertoireCid = await repertoire.repertoireFormSelect.find(repertoire.repertoireDropdownId).getAttribute('name');
//   var sampleCid = await repertoire.sampleFormSelect.find(repertoire.sampleDropdownId).getAttribute('name');

//   //Check that valid values for both Sequencing Files and Sequencing Data ID are not allowed concurrently
//   await t
//     .typeText(repertoire.repertoireNameBaseId + repertoireCid, repertoireNameFiles, { replace: true })
//     .click(repertoire.subjectIdSelect)
//     .click(repertoire.subjectIdOption.withExactText(subjectIdNull))
//     .typeText(Selector(repertoire.sampleIdBaseId + sampleCid), sampleIdFiles, { replace: true })
//     .click(repertoire.sequencingFilesSelect)
//     .click(repertoire.sequencingFilesOption.withAttribute('id', sequencingFilesFiles))
//     .click(repertoire.pcrTargetLocusSelect)
//     .click(repertoire.pcrTargetLocusOption.withExactText(pcrTargetLocusFiles))
//     .typeText(repertoire.sequencingDataIdSelect, sequencingDataIdFiles, { replace: true })
//     .click(repertoire.saveChangesSelect)
//     .wait(config.timeout) //needed to account for the automatic scroll to the top
//   var errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.sequencingFilesDataIdValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).ok()

//   //Check that null for Sequencing Files and a blank Sequencing Data ID is not allowed
//   await t
//     .click(general.navbarStatsIconSelect)
//     .click(repertoire.sequencingFilesSelect)
//     .click(repertoire.sequencingFilesOption.withExactText(sequencingFilesFilesNull))
//     .typeText(repertoire.sequencingDataIdSelect, sequencingDataIdFilesBlank, { replace: true })
//     .click(repertoire.saveChangesSelect)
//     .wait(config.timeout) //needed to account for the automatic scroll to the top
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.sequencingFilesDataIdValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).ok()

//   //Check that null for Sequencing Files and a valid non-blank Sequencing Data ID is allowed
//   await t
//     .click(repertoire.sequencingFilesSelect)
//     .click(repertoire.sequencingFilesOption.withExactText(sequencingFilesFilesNull))
//     .typeText(repertoire.sequencingDataIdSelect, sequencingDataIdFiles, { replace: true })
//     .click(repertoire.saveChangesSelect)
//     .wait(config.timeout) //needed to account for the automatic scroll to the top
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.sequencingFilesDataIdValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).notOk()

//   //Check that a valid Sequencing Files and a blank Sequencing Data ID is allowed and successfully Save
//   await t
//     .click(repertoire.sequencingFilesSelect)
//     .click(repertoire.sequencingFilesOption.withAttribute('id', sequencingFilesFiles))
//     .typeText(repertoire.sequencingDataIdSelect, sequencingDataIdFilesBlank, { replace: true })
//     .click(repertoire.saveChangesSelect)
//     .click(repertoire.subjectIdSelect)
//     .click(repertoire.subjectIdOption.withAttribute('value', general.subjectUuid))
//     .click(repertoire.saveChangesSelect)
//     .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).ok()
//     .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).notOk()
//   errorMessage = general.invalidFeedbackSelect.withExactText(repertoire.sequencingFilesDataIdValidationMessage).filterVisible().exists;
//   await t.expect(errorMessage).notOk()

//   //Check Sequencing Files on the Back-end
//   var token = await login.getTokenFromLocalStorage();
//   if (config.tapis_version == 2) {
//     var r = await general.tapisV2.getMetadataForType(token.access_token, general.projectUuid, 'repertoire');
//   } else {
//     requestSettings = {
//       url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/repertoire',
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + token['access_token']['access_token']
//       }
//     };
//     var r = await general.tapisV3.sendRequest(requestSettings);
//     await t.expect(r['status']).eql("success")
//       .expect(r['result'].length).eql(3);
//     r = r['result'];
//   }

//   var repertoireUuidFiles = "";
//   var sampleUuidFiles = "";
//   for (let index = 0; index < 3; index++)
//     if (r[index]["value"]["repertoire_name"] == repertoireNameFiles) {
//       repertoireUuidFiles = r[index]["uuid"];
//       sampleUuidFiles = r[index]["value"]["sample"][0]["vdjserver_uuid"]
//     }

//   if (config.tapis_version == 2) {
//     var s = await general.tapisV2.getMetadataForType(token.access_token, general.projectUuid, 'sample');
//   } else {
//     requestSettings = {
//       url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/uuid/' + sampleUuidFiles,
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + token['access_token']['access_token']
//       }
//     };
//     var s = await general.tapisV3.sendRequest(requestSettings);
//     await t.expect(s['status']).eql("success")
//       .expect(s['result'].length).eql(1);
//     s = s['result'];
//   }

//   var sValue = s[0]["value"];

//   if (repertoire.sequencingFilesFiles == 'null') await t.expect(sValue["sequencing_files"]["filename"] == null).ok()
//   else await t.expect(sValue["sequencing_files"]["filename"]).eql(file.FastaSequencesFile)
// });
