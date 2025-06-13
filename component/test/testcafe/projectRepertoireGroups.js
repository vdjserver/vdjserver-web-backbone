import config from '../test-config';
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';

const { General, Login, RepertoireGroup } = require('./pages');
const general = new General();
const login = new Login();
const repertoireGroup = new RepertoireGroup();

fixture('Project Repertoire Group Test Cases')
    .page(config.url);

// test('Create new repertoire group', async t => {
//     await login.login(t, config.username, config.password);
//     await t
//         .click('#project-list > div > div:nth-child(2) > div.project-header > h2 > a')
//         .click(general.repertoireGroupsTabSelect)
//         .wait(2500)
//         .click(repertoireGroup.addGroupSelect)
//         .click(repertoireGroup.newGroupSelect);
//     var repertoireGroupCid = await repertoireGroup.repertoireGroupFormSelect.find(repertoireGroup.groupActionsID).getAttribute('name');
//     await t
//         .typeText(repertoireGroup.groupNameBaseID + repertoireGroupCid, repertoireGroup.groupName)
//         .typeText(repertoireGroup.groupDescriptionBaseID + repertoireGroupCid, repertoireGroup.groupDescription)
//         .click(repertoireGroup.filterModeSelect)
//         .click(repertoireGroup.filterModeSelect.find('option').withText('Field'))
//         .expect(repertoireGroup.filterModeSelect.value).eql('Field')
//         .click(repertoireGroup.filterLogicalField1Select)
//         .click(repertoireGroup.filterLogicalField1Select.find('option').withText('Subject Age'))
//         .click(repertoireGroup.filterLogicalOperator1Select)
//         .click(repertoireGroup.filterLogicalOperator1Select.find('option').withText('>'))
//         .typeText(repertoireGroup.filterLogicalValue1Select, repertoireGroup.filterLogicalValue1)
//         .click(repertoireGroup.repertoireGroupSaveChangesSelect)
//         .wait(9999);
// });

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
        .expect(m["value"]["submitted_by"].split(", ")[2]).eql(project.sAddress)
});

test('Add a Subject to the previously created Project and Check Back-end Values', async t => {
    await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

    const getPageUrl = ClientFunction(() => window.location.href);

    await t.navigateTo('./' + general.projectUuidUrl);

    // add subject 1
    await t
        .click(general.subjectsTabSelect)
        .click(subject.newSubjectSelect)

    var subjectCid = await subject.projectSubjectFormSelect.find(subject.projectSubjectDropdownId).getAttribute('name');

    await t
        .typeText(subject.subjectIdBaseId + subjectCid, subject.subjectId)
        .click(subject.speciesSelect)
        .click(subject.speciesOption.withExactText(subject.species))
        .click(subject.saveChangesSelect)
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).ok()
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).notOk()
        .click(subject.detailsSummarySelect);

    // add subject 2
    await t
        .click(general.subjectsTabSelect)
        .click(subject.newSubjectSelect)

    subjectCid = await subject.projectSubjectFormSelect.find(subject.projectSubjectDropdownId).getAttribute('name');

    await t
        .typeText(subject.subjectIdBaseId + subjectCid, subject.subjectId2)
        .click(subject.speciesSelect)
        .click(subject.speciesOption.withExactText(subject.species2))
        .click(subject.saveChangesSelect)
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).ok()
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).notOk()
        .click(subject.detailsSummarySelect);

    // get response from backend
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

    //Check values
    await t
        .expect(m[0]["value"]["subject_id"]).eql(subject.subjectId)
        .expect(m[0]["value"]["species"].label).eql(subject.species);
    
    await t
        .expect(m[1]["value"]["subject_id"]).eql(subject.subjectId2)
        .expect(m[1]["value"]["species"].label).eql(subject.species2);
});

test('Add a Repertoire (with Sample) to the previously created Project and Check Back-end Values', async t => {
  await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

  const getPageUrl = ClientFunction(() => window.location.href);

  await t.navigateTo('./' + general.projectUuidUrl);

  await t
    .click(general.repertoiresTabSelect)
    .click(repertoire.newRepertoireSelect)
    .click(repertoire.newRepertoireAddSelect)

  var repertoireCid = await repertoire.repertoireFormSelect.find(repertoire.repertoireDropdownId).getAttribute('name');
  var sampleCid = await repertoire.sampleFormSelect.find(repertoire.sampleDropdownId).getAttribute('name');

  const tissueSelect = Selector(repertoire.tissueId + sampleCid);
  const cellSubsetSelect = Selector(repertoire.cellSubsetId + sampleCid);
  const cellSpeciesSelect = Selector(repertoire.cellSpeciesId + sampleCid);

  //Expect the created Subject to exist in the Subject ID drop-down
  await t
    .expect(repertoire.subjectIdOption.count).eql(2)
    .expect(repertoire.subjectIdOption.withAttribute('value', general.subjectUuid).exists).ok()

  await t
    .typeText(repertoire.repertoireNameBaseId + repertoireCid, repertoire.repertoireName)
    .typeText(repertoire.repertoireDescriptionSelect, repertoire.repertoireDescription)
    .click(repertoire.subjectIdSelect)
    .click(repertoire.subjectIdOption.withAttribute('value', general.subjectUuid))
    .typeText(Selector(repertoire.sampleIdBaseId + sampleCid), repertoire.sampleId)
    .typeText(repertoire.sampleTypeSelect, repertoire.sampleType)
    .click(tissueSelect)
    .typeText(general.ontologyInputSelect.nth(0), repertoire.tissue)
    .click(general.ontologySelectSelect.withExactText(repertoire.tissue))
    .click(general.navbarStatsIconSelect)
    .typeText(repertoire.anatomicSiteSelect, repertoire.anatomicSite)
    .typeText(repertoire.diseaseStateSampleSelect, repertoire.diseaseStateSample)
    .typeText(repertoire.collectionTimeSelect, repertoire.collectionTime)
    .typeText(repertoire.collectionTimeReferenceSelect, repertoire.collectionTimeReference)
    .typeText(repertoire.biomaterialProviderSelect, repertoire.biomaterialProvider)
    .typeText(repertoire.sequencingRunIdSelect, repertoire.sequencingRunId)
    .typeText(repertoire.sequencingPlatformSelect, repertoire.sequencingPlatform)
    .typeText(repertoire.sequencingFacilitySelect, repertoire.sequencingFacility)
    .typeText(repertoire.sequencingDateSelect, repertoire.sequencingDate)
    .typeText(repertoire.sequencingKitSelect, repertoire.sequencingKit)
    .click(repertoire.collectionTimePointRelativeUnitSelect)
    .click(repertoire.collectionTimePointRelativeUnitOption.withAttribute('value', repertoire.collectionTimePointRelativeUnit))
    .click(repertoire.sequencingFilesSelect)
    .click(repertoire.sequencingFilesOption.withExactText(repertoire.sequencingFiles))
    .typeText(repertoire.tissueProcessingSelect, repertoire.tissueProcessing)
    .click(cellSubsetSelect)
    .typeText(general.ontologyInputSelect.nth(1), repertoire.cellSubset)
    .click(general.ontologySelectSelect.withExactText(repertoire.cellSubset))
    .typeText(repertoire.cellPhenotypeSelect, repertoire.cellPhenotype)
    .click(cellSpeciesSelect)
    .typeText(general.ontologyInputSelect.nth(2), repertoire.cellSpecies)
    .click(general.ontologySelectSelect.withExactText(repertoire.cellSpecies))
    .click(repertoire.singleCellSelect)
    .click(repertoire.singleCellOption.withAttribute('value', repertoire.singleCell))
    .typeText(repertoire.cellNumberSelect, repertoire.cellNumber)
    .typeText(repertoire.cellsPerReactionSelect, repertoire.cellsPerReaction)
    .click(repertoire.cellStorageSelect)
    .click(repertoire.cellStorageOption.withAttribute('value', repertoire.cellStorage))
    .typeText(repertoire.cellQualitySelect, repertoire.cellQuality)
    .typeText(repertoire.cellIsolationSelect, repertoire.cellIsolation)
    .typeText(repertoire.cellProcessingProtocolSelect, repertoire.cellProcessingProtocol)
    .click(repertoire.templateClassSelect)
    .click(repertoire.templateClassOption.withAttribute('value', repertoire.templateClass))
    .typeText(repertoire.templateQualitySelect, repertoire.templateQuality)
    .typeText(repertoire.templateAmountSelect, repertoire.templateAmount)
    .click(repertoire.templateAmountUnitSelect)
    .click(repertoire.templateAmountUnitOption.withAttribute('value', repertoire.templateAmountUnit))
    .click(repertoire.libraryGenerationMethodSelect)
    .click(repertoire.libraryGenerationMethodOption.withAttribute('value', repertoire.libraryGenerationMethod))
    .typeText(repertoire.libraryGenerationProtocolSelect, repertoire.libraryGenerationProtocol)
    .typeText(repertoire.libraryGenerationKitVersionSelect, repertoire.libraryGenerationKitVersion)
    .click(repertoire.completeSequencesSelect)
    .click(repertoire.completeSequencesOption.withAttribute('value', repertoire.completeSequences))
    .click(repertoire.physicalLinkageSelect)
    .click(repertoire.physicalLinkageOption.withAttribute('value', repertoire.physicalLinkage))
    .click(repertoire.pcrTargetLocusSelect)
    .click(repertoire.pcrTargetLocusOption.withAttribute('value', repertoire.pcrTargetLocus))
    .typeText(repertoire.forwardTargetLocationSelect, repertoire.forwardTargetLocation)
    .typeText(repertoire.reverseTargetLocationSelect, repertoire.reverseTargetLocation)
    .typeText(repertoire.sequencingDataIdSelect, repertoire.sequencingDataId)
    .click(repertoire.saveChangesSelect)
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).ok()
    .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(repertoire.saveString).filterVisible().exists).notOk()
    .click(repertoire.detailsSummarySelect)

  var token = await login.getTokenFromLocalStorage();
  if (config.tapis_version == 2) {
    var r = await general.tapisV2.getMetadataForType(token.access_token, general.projectUuid, 'repertoire');
  } else {
    var requestSettings = {
      url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/repertoire',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token['access_token']['access_token']
      }
    };
    var r = await general.tapisV3.sendRequest(requestSettings);
    await t.expect(r['status']).eql("success")
      .expect(r['result'].length).eql(1);
    r = r['result'];
  }

  general.repertoireUuid = r[0]["uuid"];
  //console.log("Repertoire UUID: " + general.repertoireUuid);

  general.sampleUuid = r[0]["value"]["sample"][0]["vdjserver_uuid"];
  //console.log("Sample UUID: " + general.sampleUuid);

  if (config.tapis_version == 2) {
    var s = await general.tapisV2.getMetadataForType(token.access_token, general.projectUuid, 'sample');
  } else {
    var requestSettings = {
      url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/uuid/' + general.sampleUuid,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token['access_token']['access_token']
      }
    };
    var s = await general.tapisV3.sendRequest(requestSettings);
    await t.expect(s['status']).eql("success")
      .expect(s['result'].length).eql(1);
    s = s['result'];
  }

  var rValue = r[0]["value"];
  var sValue = s[0]["value"];

  //Check Repertoire values
  await t
    .expect(rValue["repertoire_name"]).eql(repertoire.repertoireName)
    .expect(rValue["repertoire_description"]).eql(repertoire.repertoireDescription)
    .expect(sValue["sample_id"]).eql(repertoire.sampleId)
    .expect(sValue["sample_type"]).eql(repertoire.sampleType)
    .expect(sValue["tissue"].label).eql(repertoire.tissue)
    .expect(sValue["anatomic_site"]).eql(repertoire.anatomicSite)
    .expect(sValue["disease_state_sample"]).eql(repertoire.diseaseStateSample)
    .expect(sValue["collection_time_point_relative"]).eql(parseFloat(repertoire.collectionTime))
    .expect(sValue["collection_time_point_relative_unit"].label).eql(repertoire.collectionTimePointRelativeUnit)
    .expect(sValue["collection_time_point_reference"]).eql(repertoire.collectionTimeReference)
    .expect(sValue["biomaterial_provider"]).eql(repertoire.biomaterialProvider)
    .expect(sValue["sequencing_run_id"]).eql(repertoire.sequencingRunId)
    .expect(sValue["sequencing_platform"]).eql(repertoire.sequencingPlatform)
    .expect(sValue["sequencing_facility"]).eql(repertoire.sequencingFacility)
    .expect(sValue["sequencing_run_date"]).eql(repertoire.sequencingDate)
    .expect(sValue["sequencing_kit"]).eql(repertoire.sequencingKit)
    .expect(sValue["tissue_processing"]).eql(repertoire.tissueProcessing)
    .expect(sValue["cell_subset"].label).eql(repertoire.cellSubset)
    .expect(sValue["cell_phenotype"]).eql(repertoire.cellPhenotype)
    .expect(sValue["cell_species"].label).eql(repertoire.cellSpecies)
    .expect(sValue["single_cell"]).ok()
    .expect(sValue["cell_number"]).eql(parseInt(repertoire.cellNumber))
    .expect(sValue["cells_per_reaction"]).eql(parseInt(repertoire.cellsPerReaction))
    .expect(sValue["cell_storage"]).notOk()
    .expect(sValue["cell_quality"]).eql(repertoire.cellQuality)
    .expect(sValue["cell_isolation"]).eql(repertoire.cellIsolation)
    .expect(sValue["cell_processing_protocol"]).eql(repertoire.cellProcessingProtocol)
    .expect(sValue["template_class"]).eql(repertoire.templateClass)
    .expect(sValue["template_quality"]).eql(repertoire.templateQuality)
    .expect(sValue["template_amount"]).eql(parseFloat(repertoire.templateAmount))
    .expect(sValue["template_amount_unit"].label).eql(repertoire.templateAmountUnit)
    .expect(sValue["library_generation_method"]).eql(repertoire.libraryGenerationMethod)
    .expect(sValue["library_generation_protocol"]).eql(repertoire.libraryGenerationProtocol)
    .expect(sValue["library_generation_kit_version"]).eql(repertoire.libraryGenerationKitVersion)
    .expect(sValue["complete_sequences"]).eql(repertoire.completeSequences)
    .expect(sValue["physical_linkage"]).eql(repertoire.physicalLinkage)
    .expect(sValue["pcr_target"][0]["pcr_target_locus"]).eql(repertoire.pcrTargetLocus)
    .expect(sValue["pcr_target"][0]["forward_pcr_primer_target_location"]).eql(repertoire.forwardTargetLocation)
    .expect(sValue["pcr_target"][0]["reverse_pcr_primer_target_location"]).eql(repertoire.reverseTargetLocation)

  if (repertoire.sequencingFiles == 'null') await t.expect(sValue["sequencing_files"]["filename"] == null).ok()
  else await t.expect(sValue["sequencing_files"]["filename"] == repertoire.sequencingFiles).ok()
});