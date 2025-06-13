//
// projectFiles.js
// Project Files Page Test Cases
//
// VDJServer
// https://vdjserver.org
//
// Copyright (C) 2023 The University of Texas Southwestern Medical Center
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

const { General, Login, Project, Subject, Repertoire, File } = require('./pages');
const general = new General();
const login = new Login();
const project = new Project();
const subject = new Subject();
const repertoire = new Repertoire();
const file = new File();

fixture('Project Files Page Test Cases')
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
        .click(project.createNewProjectSelect)

    await t
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(project.successfullyCreatedString).exists).ok()
        .click(project.modalCancelButtonSelect)

    await t.click(general.subjectsTabSelect)

    const getPageUrl = ClientFunction(() => window.location.href);
    var url = await getPageUrl();
    general.projectUuid = url.split("/")[4];
    general.projectUuidUrl += general.projectUuid;
    //console.log("Project UUID: " + general.projectUuid);

    await t.navigateTo('./' + general.projectUuidUrl);
    url = await getPageUrl();
    console.log("URL: " + url);
    //console.log(project.studyTitle + "\n");

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

test('Upload files, change select file types, and confirm correct values are stored on the Back-end and displayed correctly in the drop-downs', async t => {
    await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

    await t
        .navigateTo('./' + general.projectUuidUrl)
        .click(general.filesTabSelect)
        .click(file.uploadFilesSelect)
        .click(file.uploadFilesComputerSelect)
        .setFilesToUpload(file.uploadFilesComputerDialogSelect, [file.filesPath + file.FastaSequencesFile])
        .setFilesToUpload(file.uploadFilesComputerDialogSelect, [file.filesPath + file.FastqPairedEndForwardFile])
        .setFilesToUpload(file.uploadFilesComputerDialogSelect, [file.filesPath + file.FastqPairedEndReverseFile])
        .setFilesToUpload(file.uploadFilesComputerDialogSelect, [file.filesPath + file.BarcodeSequencesFile])
        .setFilesToUpload(file.uploadFilesComputerDialogSelect, [file.filesPath + file.PrimerSequencesReverseFile])
        .setFilesToUpload(file.uploadFilesComputerDialogSelect, [file.filesPath + file.PrimerSequencesForwardFile])
        .setFilesToUpload(file.uploadFilesComputerDialogSelect, [file.filesPath + file.FastaQualitySequences1File])
        .setFilesToUpload(file.uploadFilesComputerDialogSelect, [file.filesPath + file.FastaQualitySequences2File])
        .setFilesToUpload(file.uploadFilesComputerDialogSelect, [file.filesPath + file.UnspecifiedFile])
        .setFilesToUpload(file.uploadFilesComputerDialogSelect, [file.filesPath + file.TsvFile])
        .setFilesToUpload(file.uploadFilesComputerDialogSelect, [file.filesPath + file.CsvFile])
        .setFilesToUpload(file.uploadFilesComputerDialogSelect, [file.filesPath + file.VdjmlFile])
        .setFilesToUpload(file.uploadFilesComputerDialogSelect, [file.filesPath + file.AirrTsvFile])
        .setFilesToUpload(file.uploadFilesComputerDialogSelect, [file.filesPath + file.AirrJsonFile])
        .click(file.addStartUploadSelect)
        .click(file.doneUploadSelect)

    //Get the UUID associated with each uploaded File
    var token = await login.getTokenFromLocalStorage();
    if (config.tapis_version == 2) {
        var files = await general.tapisV2.getProjectMetadata(token.access_token, general.projectUuid);
    } else {
        var requestSettings = {
            url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/project_file',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token['access_token']['access_token']
            }
        };
        var files = await general.tapisV3.sendRequest(requestSettings);
        await t.expect(files['status']).eql("success")
            .expect(files['result'].length).eql(14); //Ensure all 14 files were uploaded
        var files = files['result'];
    }

    //Get the UUID for each file
    for (let i = 0; i < files.length; i++) {
        if (files[i]["value"]["name"] == file.FastqPairedEndForwardFile) file.FastqPairedEndForwardFileUuid = files[i]['uuid'];
        else if (files[i]["value"]["name"] == file.FastqPairedEndReverseFile) file.FastqPairedEndReverseFileUuid = files[i]['uuid'];
        else if (files[i]["value"]["name"] == file.FastaSequencesFile) file.FastaSequencesFileUuid = files[i]['uuid'];
        else if (files[i]["value"]["name"] == file.BarcodeSequencesFile) file.BarcodeSequencesFileUuid = files[i]['uuid'];
        else if (files[i]["value"]["name"] == file.PrimerSequencesReverseFile) file.PrimerSequencesReverseFileUuid = files[i]['uuid'];
        else if (files[i]["value"]["name"] == file.PrimerSequencesForwardFile) file.PrimerSequencesForwardFileUuid = files[i]['uuid'];
        else if (files[i]["value"]["name"] == file.FastaQualitySequences1File) file.FastaQualitySequences1FileUuid = files[i]['uuid'];
        else if (files[i]["value"]["name"] == file.FastaQualitySequences2File) file.FastaQualitySequences2FileUuid = files[i]['uuid'];
        else if (files[i]["value"]["name"] == file.UnspecifiedFile) file.UnspecifiedFileUuid = files[i]['uuid'];
        else if (files[i]["value"]["name"] == file.TsvFile) file.TsvFileUuid = files[i]['uuid'];
        else if (files[i]["value"]["name"] == file.CsvFile) file.CsvFileUuid = files[i]['uuid'];
        else if (files[i]["value"]["name"] == file.VdjmlFile) file.VdjmlFileUuid = files[i]['uuid'];
        else if (files[i]["value"]["name"] == file.AirrTsvFile) file.AirrTsvFileUuid = files[i]['uuid'];
        else if (files[i]["value"]["name"] == file.AirrJsonFile) file.AirrJsonFileUuid = files[i]['uuid'];
    }

    const FastqPairedEndForwardFileSelect = Selector(file.formBase + file.FastqPairedEndForwardFileUuid).find(file.typeId);
    const FastqPairedEndReverseFileSelect = Selector(file.formBase + file.FastqPairedEndReverseFileUuid).find(file.typeId);
    const FastaQualitySequences1FileSelect = Selector(file.formBase + file.FastaQualitySequences1FileUuid).find(file.typeId);
    const FastaQualitySequences2FileSelect = Selector(file.formBase + file.FastaQualitySequences2FileUuid).find(file.typeId);
    const FastaSequencesFileSelect = Selector(file.formBase + file.FastaSequencesFileUuid).find(file.typeId);

    const PrimerSequencesForwardFileSelect = Selector(file.formBase + file.PrimerSequencesForwardFileUuid).find(file.typeId);
    const PrimerSequencesForwardFileOption = PrimerSequencesForwardFileSelect.find('option');
    const PrimerSequencesForwardFileValue = "Primer Sequences";

    const PrimerSequencesReverseFileSelect = Selector(file.formBase + file.PrimerSequencesReverseFileUuid).find(file.typeId);
    const PrimerSequencesReverseFileOption = PrimerSequencesReverseFileSelect.find('option');
    const PrimerSequencesReverseFileValue = "Primer Sequences";

    const BarcodeSequencesFileSelect = Selector(file.formBase + file.BarcodeSequencesFileUuid).find(file.typeId);
    const BarcodeSequencesFileOption = BarcodeSequencesFileSelect.find('option');
    const BarcodeSequencesFileValue = "Barcode Sequences";

    const UnspecifiedFileSelect = Selector(file.formBase + file.UnspecifiedFileUuid).find(file.typeId);
    const UnspecifiedFileOption = UnspecifiedFileSelect.find('option');
    const UnspecifiedFileValue = "Unspecified";

    const TsvFileSelect = Selector(file.formBase + file.TsvFileUuid).find(file.typeId);
    const TsvFileOption = TsvFileSelect.find('option');
    const TsvFileValue = "TAB-separated Values";

    const CsvFileSelect = Selector(file.formBase + file.CsvFileUuid).find(file.typeId);
    const CsvFileOption = CsvFileSelect.find('option');
    const CsvFileValue = "Comma-separated Values";

    const VdjmlFileSelect = Selector(file.formBase + file.VdjmlFileUuid).find(file.typeId);
    const VdjmlFileOption = VdjmlFileSelect.find('option');
    const VdjmlFileValue = "VDJML";

    const AirrTsvFileSelect = Selector(file.formBase + file.AirrTsvFileUuid).find(file.typeId);
    const AirrTsvFileOption = AirrTsvFileSelect.find('option');
    const AirrTsvFileValue = "AIRR TSV";

    const AirrJsonFileSelect = Selector(file.formBase + file.AirrJsonFileUuid).find(file.typeId);
    const AirrJsonFileOption = AirrJsonFileSelect.find('option');
    const AirrJsonFileValue = "AIRR JSON";

    //Set file types
    await t
        .click(general.navbarStatsIconSelect)
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
        .click(file.saveChangesSelect)
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(file.saveString).filterVisible().exists).ok()
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(file.saveString).filterVisible().exists).notOk()

    //Ensure the file types are correct on the Back-end and in the drop-downs
    var token = await login.getTokenFromLocalStorage();
    if (config.tapis_version == 2) {
        var files = await general.tapisV2.getProjectMetadata(token.access_token, general.projectUuid);
    } else {
        var requestSettings = {
            url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/project_file',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token['access_token']['access_token']
            }
        };
        var files = await general.tapisV3.sendRequest(requestSettings);
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

    for (let i = 0; i < files.length; i++) {
        if (files[i]["uuid"] == file.FastqPairedEndForwardFileUuid) FastqPairedEndForwardValue = files[i]['value'];
        else if (files[i]["uuid"] == file.FastqPairedEndReverseFileUuid) FastqPairedEndReverseValue = files[i]['value'];
        else if (files[i]["uuid"] == file.FastaQualitySequences1FileUuid) FastaQualitySequences1Value = files[i]['value'];
        else if (files[i]["uuid"] == file.FastaQualitySequences2FileUuid) FastaQualitySequences2Value = files[i]['value'];
        else if (files[i]["uuid"] == file.PrimerSequencesForwardFileUuid) PrimerSequencesForwardValue = files[i]['value'];
        else if (files[i]["uuid"] == file.PrimerSequencesReverseFileUuid) PrimerSequencesReverseValue = files[i]['value'];
        else if (files[i]["uuid"] == file.BarcodeSequencesFileUuid) BarcodeSequencesValue = files[i]['value'];
        else if (files[i]["uuid"] == file.FastaSequencesFileUuid) FastaSequencesValue = files[i]['value'];
        else if (files[i]["uuid"] == file.UnspecifiedFileUuid) UnspecifiedValue = files[i]['value'];
        else if (files[i]["uuid"] == file.TsvFileUuid) TsvValue = files[i]['value'];
        else if (files[i]["uuid"] == file.CsvFileUuid) CsvValue = files[i]['value'];
        else if (files[i]["uuid"] == file.VdjmlFileUuid) VdjmlValue = files[i]['value'];
        else if (files[i]["uuid"] == file.AirrTsvFileUuid) AirrTsvValue = files[i]['value'];
        else if (files[i]["uuid"] == file.AirrJsonFileUuid) AirrJsonValue = files[i]['value'];
    }

    //Confirm the Back-end has stored the correct values
    await t
        .expect(FastqPairedEndForwardValue["fileType"]).eql(parseInt(file.FILE_TYPE_FASTQ_READ))
        .expect(FastqPairedEndReverseValue["fileType"]).eql(parseInt(file.FILE_TYPE_FASTQ_READ))
        .expect(FastaQualitySequences1Value["fileType"]).eql(parseInt(file.FILE_TYPE_FASTA_READ))
        .expect(FastaQualitySequences2Value["fileType"]).eql(parseInt(file.FILE_TYPE_QUALITY))
        .expect(PrimerSequencesForwardValue["fileType"]).eql(parseInt(file.FILE_TYPE_PRIMER))
        .expect(PrimerSequencesReverseValue["fileType"]).eql(parseInt(file.FILE_TYPE_PRIMER))
        .expect(BarcodeSequencesValue["fileType"]).eql(parseInt(file.FILE_TYPE_BARCODE))
        .expect(FastaSequencesValue["fileType"]).eql(parseInt(file.FILE_TYPE_FASTA_READ))
        .expect(UnspecifiedValue["fileType"]).eql(parseInt(file.FILE_TYPE_UNSPECIFIED))
        .expect(TsvValue["fileType"]).eql(parseInt(file.FILE_TYPE_TSV))
        .expect(CsvValue["fileType"]).eql(parseInt(file.FILE_TYPE_CSV))
        .expect(VdjmlValue["fileType"]).eql(parseInt(file.FILE_TYPE_VDJML))
        .expect(AirrTsvValue["fileType"]).eql(parseInt(file.FILE_TYPE_AIRR_TSV))
        .expect(AirrJsonValue["fileType"]).eql(parseInt(file.FILE_TYPE_AIRR_JSON))

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
        .expect(FastqPairedEndForwardFileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_FASTQ_READ_STRING)
        .expect(FastqPairedEndReverseFileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_FASTQ_READ_STRING)
        .expect(FastaQualitySequences1FileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_FASTA_READ_STRING)
        .expect(FastaQualitySequences2FileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_QUALITY_STRING)
        .expect(PrimerSequencesForwardFileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_PRIMER_STRING)
        .expect(PrimerSequencesReverseFileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_PRIMER_STRING)
        .expect(BarcodeSequencesFileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_BARCODE_STRING)
        .expect(FastaSequencesFileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_FASTA_READ_STRING)
        .expect(UnspecifiedFileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_UNSPECIFIED_STRING)
        .expect(TsvFileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_TSV_STRING)
        .expect(CsvFileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_CSV_STRING)
        .expect(VdjmlFileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_VDJML_STRING)
        .expect(AirrTsvFileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_AIRR_TSV_STRING)
        .expect(AirrJsonFileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_AIRR_JSON_STRING)
});

test('Confirm the \'Upload Files\' button is disabled when uploading a file and enabled otherwise', async t => {
    await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

    await t
        .navigateTo('./' + general.projectUuidUrl)
        .click(general.filesTabSelect)

    //Expect the Upload Files button to be available
    await t.expect(file.uploadFilesSelect.withExactText('Upload Files').hasAttribute('disabled')).notOk()

    //Start the process for uploading and confirm the button is now disabled
    await t
        .click(file.uploadFilesSelect)
        .click(file.uploadFilesComputerSelect)
        .expect(file.uploadFilesSelect.withExactText('Upload Files').hasAttribute('disabled')).ok()

    //Cancel the upload and confirm the button is available
    await t
        .click(file.cancelUploadSelect)
        .expect(file.uploadFilesSelect.withExactText('Upload Files').hasAttribute('disabled')).notOk()

    //Complete an upload and click done and confirm the button is available
    await t
        .click(file.uploadFilesSelect)
        .click(file.uploadFilesComputerSelect)
        .setFilesToUpload(file.uploadFilesComputerDialogSelect, [file.filesPath + file.testFile])
        .click(file.addStartUploadSelect)
        .click(file.doneUploadSelect)
        .expect(file.uploadFilesSelect.withExactText('Upload Files').hasAttribute('disabled')).notOk()

    //Delete the uploaded file
    var token = await login.getTokenFromLocalStorage();
    if (config.tapis_version == 2) {
        var files = await general.tapisV2.getProjectMetadata(token.access_token, general.projectUuid);
    } else {
        var requestSettings = {
            url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/project_file',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token['access_token']['access_token']
            }
        };
        var files = await general.tapisV3.sendRequest(requestSettings);
        await t.expect(files['status']).eql("success")
            .expect(files['result'].length).eql(15); //Ensure all 14 files were uploaded
        var files = files['result'];
    }

    //Get the UUID for the new file
    var testFileUuid;
    for (let i = 0; i < files.length; i++)
        if (files[i]["value"]["name"] == file.testFile) testFileUuid = files[i]['uuid'];

    const testFileDeleteSelect = Selector(file.formBase + testFileUuid).find(file.deleteId);

    await t
        .click(testFileDeleteSelect)
        .click(file.saveChangesSelect)
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(file.saveString).filterVisible().exists).ok()
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(file.saveString).filterVisible().exists).notOk()
});

test('Confirm \'Revert Changes\' and \'Save Changes\' buttons are disabled/enabled correctly', async t => {
    await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

    await t
        .navigateTo('./' + general.projectUuidUrl)
        .click(general.filesTabSelect)

    //Expect the buttons to be unavailable when no changes have been made
    await t.expect(file.revertChangesSelect.withExactText('Revert Changes').hasAttribute('disabled')).ok()
    await t.expect(file.saveChangesSelect.withExactText('Save Changes').hasAttribute('disabled')).ok()

    //Delete a file and revert, then add a tag and revert
    const FastqPairedEndForwardFileDeleteSelect = Selector(file.formBase + file.FastqPairedEndForwardFileUuid).find(file.deleteId);
    const FastqPairedEndForwardFileTagsSelect = Selector(file.formBase + file.FastqPairedEndForwardFileUuid).find(file.tagsId);

    await t
        .click(FastqPairedEndForwardFileDeleteSelect)
        .expect(file.revertChangesSelect.withExactText('Revert Changes').hasAttribute('disabled')).notOk()
        .expect(file.saveChangesSelect.withExactText('Save Changes').hasAttribute('disabled')).notOk()
        .click(file.revertChangesSelect)
        .typeText(FastqPairedEndForwardFileTagsSelect, 'string', { replace: true })
        .pressKey('tab') //Change focus
        .expect(file.revertChangesSelect.withExactText('Revert Changes').hasAttribute('disabled')).notOk()
        .expect(file.saveChangesSelect.withExactText('Save Changes').hasAttribute('disabled')).notOk()
        .click(file.revertChangesSelect)

    //Ensure the buttons are disabled after a Save
    await t
        .typeText(FastqPairedEndForwardFileTagsSelect, 'string', { replace: true })
        .click(file.saveChangesSelect)
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(file.saveString).filterVisible().exists).ok()
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(file.saveString).filterVisible().exists).notOk()
        .expect(file.revertChangesSelect.withExactText('Revert Changes').hasAttribute('disabled')).ok()
        .expect(file.saveChangesSelect.withExactText('Save Changes').hasAttribute('disabled')).ok()
        .typeText(FastqPairedEndForwardFileTagsSelect, ' ', { replace: true })
        .click(file.saveChangesSelect)
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(file.saveString).filterVisible().exists).ok()
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(file.saveString).filterVisible().exists).notOk()
});

test('Attempt to upload duplicate files and delete a file after file selection; confirm the correct file uploads', async t => {
    await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

    await t
        .navigateTo('./' + general.projectUuidUrl)
        .click(general.filesTabSelect)
        .click(file.uploadFilesSelect)
        .click(file.uploadFilesComputerSelect)

    const FastaSequencesDeleteSelector = file.filesGeneralTableRowSelect.withText(file.FastaSequencesDeleteFile);
    const FastaSequencesDeleteSelectorByExactName = file.filesGeneralTableRowSelect.find('div').withExactText(file.FastaSequencesDeleteFile);

    await t
        .setFilesToUpload(file.uploadFilesComputerDialogSelect, [file.filesPath + file.FastaSequencesRenamedDuplicateFile]) //Should upload
        .setFilesToUpload(file.uploadFilesComputerDialogSelect, [file.filesPath + file.FastaSequencesDuplicateFile]) //Should not upload

    var errorMessage = Selector('div').withExactText('Duplicate files have been removed: ' + file.FastaSequencesDuplicateFile).filterVisible().exists;
    await t.expect(errorMessage).ok()

    await t
        .setFilesToUpload(file.uploadFilesComputerDialogSelect, [file.filesPath + file.FastaSequencesDeleteFile]) //Should not upload

    //Based on the HTML, neither selector is sufficient alone, so we must confirm we are working with the same group of elements
    await t
        .expect(FastaSequencesDeleteSelector.exists).ok()
        .expect(FastaSequencesDeleteSelectorByExactName.exists).ok()

    var FastaSequencesDeleteSelectorByExactNameInnerText = await FastaSequencesDeleteSelectorByExactName.parent().nth(0).innerText;
    var FastaSequencesDeleteSelectorInnerText = await FastaSequencesDeleteSelector.nth(0).innerText;

    await t.expect(FastaSequencesDeleteSelectorByExactNameInnerText).eql(FastaSequencesDeleteSelectorInnerText);

    //Get the CID now that we have confirmed we have the correct "row"
    var FastaSequencesDeleteCid = await FastaSequencesDeleteSelector.find(file.deleteUploadFileId).getAttribute('name');

    await t
        .click(file.projectFileDeleteUploadFileSelect.withAttribute('name', FastaSequencesDeleteCid))
        .click(general.navbarStatsIconSelect)
        .click(file.addStartUploadSelect)
        .click(file.doneUploadSelect)

    //Ensure there are 15 files
    var token = await login.getTokenFromLocalStorage();
    if (config.tapis_version == 2) {
        var m = await general.tapisV2.getProjectMetadata(token.access_token, general.projectUuid);
    } else {
        var requestSettings = {
            url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/project_file',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token['access_token']['access_token']
            }
        };
        var m = await general.tapisV3.sendRequest(requestSettings);
        await t.expect(m['status']).eql("success")
            .expect(m['result'].length).eql(15); //Ensure there are now 15 files
        var files = m['result'];
    }

    for (let i = 0; i < files.length; i++) if (files[i]["value"]["name"] == file.FastaSequencesRenamedDuplicateFile) file.FastaSequencesRenamedDuplicateFileUuid = files[i]['uuid'];
});

test('Change Files fields and ensure the changes are reflected on the Back-end and in the drop-downs', async t => {
    await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

    await t.navigateTo('./' + general.projectUuidUrl);

    //Get the UUIDs associated with the uploaded Files
    var token = await login.getTokenFromLocalStorage();
    if (config.tapis_version == 2) {
        var files = await general.tapisV2.getProjectMetadata(token.access_token, general.projectUuid);
    } else {
        var requestSettings = {
            url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/project_file',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token['access_token']['access_token']
            }
        };
        var files = await general.tapisV3.sendRequest(requestSettings);
        await t.expect(files['status']).eql("success")
            .expect(files['result'].length).eql(15);
        files = files['result'];
    }

    var FastqPairedEndForwardFileTagsSelect = await Selector(file.formBase + file.FastqPairedEndForwardFileUuid).find(file.tagsId);
    var FastqPairedEndReverseFileTagsSelect = await Selector(file.formBase + file.FastqPairedEndReverseFileUuid).find(file.tagsId);

    var PrimerSequencesForwardFileSelect = await Selector(file.formBase + file.PrimerSequencesForwardFileUuid).find(file.readDirectionId);
    var PrimerSequencesForwardFileOption = await PrimerSequencesForwardFileSelect.find('option');
    var PrimerSequencesForwardFileValue = "F";

    const PrimerSequencesReverseFileSelect = Selector(file.formBase + file.PrimerSequencesReverseFileUuid).find(file.readDirectionId);
    const PrimerSequencesReverseFileOption = PrimerSequencesReverseFileSelect.find('option');
    var PrimerSequencesReverseFileValue = "R";

    const BarcodeSequencesFileSelect = Selector(file.formBase + file.BarcodeSequencesFileUuid).find(file.readDirectionId);
    const BarcodeSequencesFileOption = BarcodeSequencesFileSelect.find('option');
    var BarcodeSequencesFileValue = "FR";

    var FastqPairedEndForwardFileTagsText = "Forward";
    var FastqPairedEndReverseFileTagsText = "         ";

    await t
        .click(general.filesTabSelect)
        .typeText(FastqPairedEndForwardFileTagsSelect, FastqPairedEndForwardFileTagsText, { replace: true })
        .typeText(FastqPairedEndReverseFileTagsSelect, FastqPairedEndReverseFileTagsText, { replace: true })
        .click(PrimerSequencesForwardFileSelect)
        .click(PrimerSequencesForwardFileOption.withExactText(PrimerSequencesForwardFileValue))
        .click(PrimerSequencesReverseFileSelect)
        .click(PrimerSequencesReverseFileOption.withExactText(PrimerSequencesReverseFileValue))
        .click(BarcodeSequencesFileSelect)
        .click(BarcodeSequencesFileOption.withExactText(BarcodeSequencesFileValue))
        .click(file.saveChangesSelect)
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(file.saveString).filterVisible().exists).ok()
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(file.saveString).filterVisible().exists).notOk()

    var token = await login.getTokenFromLocalStorage();
    if (config.tapis_version == 2) {
        var files = await general.tapisV2.getProjectMetadata(token.access_token, general.projectUuid);
    } else {
        var requestSettings = {
            url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/project_file',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token['access_token']['access_token']
            }
        };
        var files = await general.tapisV3.sendRequest(requestSettings);
        await t.expect(files['status']).eql("success")
            .expect(files['result'].length).eql(15);
        files = files['result'];
    }

    var FastqPairedEndForwardValue, FastqPairedEndReverseValue;
    var PrimerSequencesForwardValue, PrimerSequencesReverseValue;
    var BarcodeSequencesValue;

    for (let i = 0; i < files.length; i++) {
        if (files[i]["value"]["name"] == file.FastqPairedEndForwardFile) FastqPairedEndForwardValue = files[i]['value'];
        else if (files[i]["value"]["name"] == file.FastqPairedEndReverseFile) FastqPairedEndReverseValue = files[i]['value'];
        else if (files[i]["value"]["name"] == file.PrimerSequencesForwardFile) PrimerSequencesForwardValue = files[i]['value'];
        else if (files[i]["value"]["name"] == file.PrimerSequencesReverseFile) PrimerSequencesReverseValue = files[i]['value'];
        else if (files[i]["value"]["name"] == file.BarcodeSequencesFile) BarcodeSequencesValue = files[i]['value'];
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
        .click(general.filesTabSelect)
        .click(general.navbarStatsIconSelect)
        .scroll(PrimerSequencesReverseFileSelect, 'center')
        .scrollBy(0, -200)
        .typeText(FastqPairedEndForwardFileTagsSelect, FastqPairedEndForwardFileTagsText, { replace: true })
        .click(file.saveChangesSelect)
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(file.saveString).filterVisible().exists).ok()
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(file.saveString).filterVisible().exists).notOk()
        .click(PrimerSequencesForwardFileSelect)
        .click(PrimerSequencesForwardFileOption.withExactText(PrimerSequencesForwardFileValue))
        .click(file.saveChangesSelect)
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(file.saveString).filterVisible().exists).ok()
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(file.saveString).filterVisible().exists).notOk()

    var token = await login.getTokenFromLocalStorage();
    if (config.tapis_version == 2) {
        var files = await general.tapisV2.getProjectMetadata(token.access_token, general.projectUuid);
    } else {
        var requestSettings = {
            url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/project_file',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token['access_token']['access_token']
            }
        };
        var files = await general.tapisV3.sendRequest(requestSettings);
        await t.expect(files['status']).eql("success")
            .expect(files['result'].length).eql(15);
        files = files['result'];
    }

    for (let i = 0; i < files.length; i++) {
        if (files[i]["value"]["name"] == file.FastqPairedEndForwardFile) { FastqPairedEndForwardValue = files[i]['value']; }
        else if (files[i]["value"]["name"] == file.PrimerSequencesForwardFile) PrimerSequencesForwardValue = files[i]['value'];
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
    await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

    await t
        .navigateTo('./' + general.projectUuidUrl)
        .click(general.filesTabSelect)

    const FastqPairedEndForwardFileTagsSelect = Selector(file.formBase + file.FastqPairedEndForwardFileUuid).find(file.tagsId);
    const FastqPairedEndReverseFileTagsSelect = Selector(file.formBase + file.FastqPairedEndReverseFileUuid).find(file.tagsId);

    const PrimerSequencesForwardFileSelect = Selector(file.formBase + file.PrimerSequencesForwardFileUuid).find(file.typeId);
    const PrimerSequencesForwardFileOption = PrimerSequencesForwardFileSelect.find('option');

    const BarcodeSequencesFileSelect = Selector(file.formBase + file.BarcodeSequencesFileUuid).find(file.typeId);
    const BarcodeSequencesFileOption = BarcodeSequencesFileSelect.find('option');
    const BarcodeSequencesFileValue = "Barcode Sequences";

    const UnspecifiedFileSelect = Selector(file.formBase + file.UnspecifiedFileUuid).find(file.typeId);
    const UnspecifiedFileOption = UnspecifiedFileSelect.find('option');
    const UnspecifiedFileValue = "Unspecified";

    const TsvFileSelect = Selector(file.formBase + file.TsvFileUuid).find(file.typeId);
    const TsvFileOption = TsvFileSelect.find('option');
    const TsvFileValue = "TAB-separated Values";

    const CsvFileSelect = Selector(file.formBase + file.CsvFileUuid).find(file.typeId);
    const CsvFileOption = CsvFileSelect.find('option');
    const CsvFileValue = "Comma-separated Values";

    const AirrJsonFileSelect = Selector(file.formBase + file.AirrJsonFileUuid).find(file.typeId);
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
        .expect(PrimerSequencesForwardFileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_PRIMER_STRING)
        .expect(BarcodeSequencesFileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_BARCODE_STRING)
        .expect(UnspecifiedFileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_UNSPECIFIED_STRING)
        .expect(TsvFileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_TSV_STRING)
        .expect(CsvFileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_CSV_STRING)
        .expect(AirrJsonFileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_AIRR_JSON_STRING)

    const FastqPairedEndForwardFileTagsNewText = "Forward";
    const FastqPairedEndReverseFileTagsNewText = "Reverse Text";
    const PrimerSequencesForwardFileNewValue = "TAB-separated Values"; //file.FILE_TYPE_TSV.toString() (used below in the expect assertions)
    const BarcodeSequencesFileNewValue = "Primer Sequences"; //file.FILE_TYPE_PRIMER.toString()
    const UnspecifiedFileNewValue = "Barcode Sequences"; //file.FILE_TYPE_BARCODE.toString()
    const TsvFileNewValue = "Unspecified"; //file.FILE_TYPE_UNSPECIFIED.toString()
    const CsvFileNewValue = "VDJML"; //file.FILE_TYPE_VDJML.toString()
    const AirrJsonFileNewValue = "AIRR TSV"; //file.FILE_TYPE_AIRR_TSV.toString()
    const FastaSequencesFileDeleteSelect = Selector(file.formBase + file.FastaSequencesFileUuid).find(file.deleteId);

    //Change select values
    await t
        .typeText(FastqPairedEndForwardFileTagsSelect, FastqPairedEndForwardFileTagsNewText, { replace: true })
        .typeText(FastqPairedEndReverseFileTagsSelect, FastqPairedEndReverseFileTagsNewText, { replace: true })
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
        .expect(PrimerSequencesForwardFileSelect.value).eql(file.FILE_TYPE_TSV.toString())
        .expect(BarcodeSequencesFileSelect.value).eql(file.FILE_TYPE_PRIMER.toString())
        .expect(UnspecifiedFileSelect.value).eql(file.FILE_TYPE_BARCODE.toString())
        .expect(TsvFileSelect.value).eql(file.FILE_TYPE_UNSPECIFIED.toString())
        .expect(CsvFileSelect.value).eql(file.FILE_TYPE_VDJML.toString())
        .expect(AirrJsonFileSelect.value).eql(file.FILE_TYPE_AIRR_TSV.toString())

    //Revert Changes
    await t
        .click(file.revertChangesSelect)

    //Confirm the displayed values in the drop-downs are reverted
    await t
        .expect(FastqPairedEndForwardFileTagsSelect.value).eql('')
        .expect(FastqPairedEndReverseFileTagsSelect.value).eql('')
        .expect(PrimerSequencesForwardFileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_PRIMER_STRING)
        .expect(BarcodeSequencesFileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_BARCODE_STRING)
        .expect(UnspecifiedFileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_UNSPECIFIED_STRING)
        .expect(TsvFileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_TSV_STRING)
        .expect(CsvFileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_CSV_STRING)
        .expect(AirrJsonFileSelectUntrimmed.toString().trim()).eql(file.FILE_TYPE_AIRR_JSON_STRING)

    //Confirm the Back-end is unchanged
    var token = await login.getTokenFromLocalStorage();
    if (config.tapis_version == 2) {
        var files = await general.tapisV2.getProjectMetadata(token.access_token, general.projectUuid);
    } else {
        var requestSettings = {
            url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/project_file',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token['access_token']['access_token']
            }
        };
        var files = await general.tapisV3.sendRequest(requestSettings);
        await t.expect(files['status']).eql("success")
            .expect(files['result'].length).eql(15);
        files = files['result'];
    }

    var FastqPairedEndForwardValue, FastqPairedEndReverseValue;
    var PrimerSequencesForwardValue, BarcodeSequencesValue;
    var UnspecifiedValue, TsvValue, CsvValue, AirrJsonValue;

    for (let i = 0; i < files.length; i++) {
        if (files[i]["uuid"] == file.FastqPairedEndForwardFileUuid) FastqPairedEndForwardValue = files[i]['value'];
        else if (files[i]["uuid"] == file.FastqPairedEndReverseFileUuid) FastqPairedEndReverseValue = files[i]['value'];
        else if (files[i]["uuid"] == file.PrimerSequencesForwardFileUuid) PrimerSequencesForwardValue = files[i]['value'];
        else if (files[i]["uuid"] == file.BarcodeSequencesFileUuid) BarcodeSequencesValue = files[i]['value'];
        else if (files[i]["uuid"] == file.UnspecifiedFileUuid) UnspecifiedValue = files[i]['value'];
        else if (files[i]["uuid"] == file.TsvFileUuid) TsvValue = files[i]['value'];
        else if (files[i]["uuid"] == file.CsvFileUuid) CsvValue = files[i]['value'];
        else if (files[i]["uuid"] == file.AirrJsonFileUuid) AirrJsonValue = files[i]['value'];
    }

    await t
        .expect(FastqPairedEndForwardValue["tags"] == null).ok()
        .expect(FastqPairedEndReverseValue["tags"] == null).ok()
        .expect(PrimerSequencesForwardValue["fileType"]).eql(parseInt(file.FILE_TYPE_PRIMER))
        .expect(BarcodeSequencesValue["fileType"]).eql(parseInt(file.FILE_TYPE_BARCODE))
        .expect(UnspecifiedValue["fileType"]).eql(parseInt(file.FILE_TYPE_UNSPECIFIED))
        .expect(TsvValue["fileType"]).eql(parseInt(file.FILE_TYPE_TSV))
        .expect(CsvValue["fileType"]).eql(parseInt(file.FILE_TYPE_CSV))
        .expect(AirrJsonValue["fileType"]).eql(parseInt(file.FILE_TYPE_AIRR_JSON))
});

test('Pair 1\) Paired-end FASTQ read files and 2\) FASTA read files and quality score files; cancel pairing', async t => {
    await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

    await t
        .navigateTo('./' + general.projectUuidUrl)
        .click(general.filesTabSelect)

    //Pair Read Files
    await t
        .click(file.filesPairFilesSelect)
        .click(file.projectFilePairRadioSelect.withAttribute('for', file.readQualityRadioOptionFor))
        .typeText(file.filesReadFileAnchorSelect, '.fna', { replace: true })
        .click(file.filesPerformPairingButtonSelect)
        .expect(project.modalDialogSelect.find(project.modalBodyClass).innerText).contains(file.pairedString1)
        .expect(project.modalDialogSelect.find(project.modalBodyClass).innerText).contains(file.pairedString2)
        .click(file.filesConfirmPairingButtonSelect)
        .click(file.saveChangesSelect)
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(file.saveString).filterVisible().exists).ok()
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(file.saveString).filterVisible().exists).notOk()

    await t
        .click(file.filesPairFilesSelect)
        .click(file.projectFilePairRadioSelect.withAttribute('for', file.pairedEndRadioOptionFor))
        .click(file.filesPerformPairingButtonSelect)
        .expect(project.modalDialogSelect.find(project.modalBodyClass).innerText).contains(file.pairedString1)
        .expect(project.modalDialogSelect.find(project.modalBodyClass).innerText).contains(file.pairedString2)
        .click(file.filesConfirmPairingButtonSelect)
        .click(file.saveChangesSelect)
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(file.saveString).filterVisible().exists).ok()
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(file.saveString).filterVisible().exists).notOk()

    //Ensure the files were paired
    var token = await login.getTokenFromLocalStorage();
    if (config.tapis_version == 2) {
        var files = await general.tapisV2.getProjectMetadata(token.access_token, general.projectUuid);
    } else {
        var requestSettings = {
            url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/project_file',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token['access_token']['access_token']
            }
        };
        var files = await general.tapisV3.sendRequest(requestSettings);
        await t.expect(files['status']).eql("success")
            .expect(files['result'].length).eql(15);
        files = files['result'];
    }

    var FastqPairedEndForwardValue, FastqPairedEndReverseValue;
    var FastaQualitySequences1Value, FastaQualitySequences2Value;

    for (let i = 0; i < files.length; i++) {
        if (files[i]["uuid"] == file.FastqPairedEndForwardFileUuid) FastqPairedEndForwardValue = files[i]['value'];
        else if (files[i]["uuid"] == file.FastqPairedEndReverseFileUuid) FastqPairedEndReverseValue = files[i]['value'];
        else if (files[i]["uuid"] == file.FastaQualitySequences1FileUuid) FastaQualitySequences1Value = files[i]['value'];
        else if (files[i]["uuid"] == file.FastaQualitySequences2FileUuid) FastaQualitySequences2Value = files[i]['value'];
    }

    await t
        .expect(FastqPairedEndForwardValue["pairedReadMetadataUuid"]).eql(file.FastqPairedEndReverseFileUuid)
        .expect(FastqPairedEndReverseValue["pairedReadMetadataUuid"]).eql(file.FastqPairedEndForwardFileUuid)
        .expect(FastaQualitySequences1Value["qualityScoreMetadataUuid"]).eql(file.FastaQualitySequences2FileUuid)
        .expect(FastaQualitySequences2Value["readMetadataUuid"]).eql(file.FastaQualitySequences1FileUuid)
});

test('Confirm Paired files are grouped and have the correct display options', async t => {
    await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

    await t
        .navigateTo('./' + general.projectUuidUrl)
        .click(general.filesTabSelect)

    const PairedEndFastqForwardSelect = Selector(file.formBase + file.FastqPairedEndForwardFileUuid);
    const PairedEndFastqReverseSelect = Selector(file.formBase + file.FastqPairedEndReverseFileUuid);
    const FastaReadQuality1Select = Selector(file.formBase + file.FastaQualitySequences1FileUuid);
    const FastaReadQuality2Select = Selector(file.formBase + file.FastaQualitySequences2FileUuid);

    //Expect a form for the '*_1.fastq' forward paired-end file and the '*.fna' fasta paired-end file and not the others
    await t
        .expect(PairedEndFastqForwardSelect.count).eql(1)
        .expect(PairedEndFastqReverseSelect.count).eql(0)
        .expect(FastaReadQuality1Select.count).eql(1)
        .expect(FastaReadQuality2Select.count).eql(0)

    //Expect the 2 existing paired forms to have 2 rows apiece
    await t
        .expect(PairedEndFastqForwardSelect.find(file.downloadId).count).eql(2)
        .expect(PairedEndFastqForwardSelect.find(file.downloadId).nth(0).innerText).contains(file.FastqPairedEndForwardFile)
        .expect(PairedEndFastqForwardSelect.find(file.downloadId).nth(1).innerText).contains(file.FastqPairedEndReverseFile)
        .expect(FastaReadQuality1Select.find(file.downloadId).count).eql(2)
        .expect(FastaReadQuality1Select.find(file.downloadId).nth(0).innerText).contains(file.FastaQualitySequences1File)
        .expect(FastaReadQuality1Select.find(file.downloadId).nth(1).innerText).contains(file.FastaQualitySequences2File)

    //Expect the 2 existing paired forms have an unpair button and not a delete button
    await t
        .expect(PairedEndFastqForwardSelect.find(file.unpairId).count).eql(1)
        .expect(FastaReadQuality1Select.find(file.unpairId).count).eql(1)
        .expect(PairedEndFastqForwardSelect.find(file.deleteId).count).eql(0)
        .expect(FastaReadQuality1Select.find(file.deleteId).count).eql(0)

    //Get the displayed text for the strings
    var PairedEndFastqForwardString = await PairedEndFastqForwardSelect.find(file.colClass).innerText;
    var FastaReadQualityString = await FastaReadQuality1Select.find(file.colClass).innerText;

    //Remove the file names from the strings
    PairedEndFastqForwardString = PairedEndFastqForwardString.replace(file.FastqPairedEndForwardFile, '');
    PairedEndFastqForwardString = PairedEndFastqForwardString.replace(file.FastqPairedEndReverseFile, '');
    FastaReadQualityString = FastaReadQualityString.replace(file.FastaQualitySequences1File, '');
    FastaReadQualityString = FastaReadQualityString.replace(file.FastaQualitySequences2File, '');

    //The FASTA/quality score string should have "Quality Scores" and "Quality" - remove "Quality Scores" for testing ease
    var FastaReadQualitySubstring = FastaReadQualityString.replace('Quality Scores', '');
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
    await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

    await t
        .navigateTo('./' + general.projectUuidUrl)
        .click(general.filesTabSelect)

    //Get timestamps for each file
    var token = await login.getTokenFromLocalStorage();
    if (config.tapis_version == 2) {
        var files = await general.tapisV2.getProjectMetadata(token.access_token, general.projectUuid);
    } else {
        var requestSettings = {
            url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/project_file',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token['access_token']['access_token']
            }
        };
        var files = await general.tapisV3.sendRequest(requestSettings);
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

    for (let i = 0; i < files.length; i++) {
        if (!files[i]["value"]["pairedReadMetadataUuid"] && !files[i]["value"]["qualityScoreMetadataUuid"]
            && !files[i]["value"]["readMetadataUuid"]) { //Add normally if not paired
            filesDatesMap.set(files[i]["lastUpdated"], [files[i]["value"]["name"], false]);
            filesDates.push(files[i]["lastUpdated"]);
            filesNamesMap.set(files[i]["value"]["name"], [files[i]["value"]["name"], false]);
            filesNames.push(files[i]["value"]["name"]);
            filesSizesMap.set(files[i]["value"]["size"], [files[i]["value"]["name"], false]);
            filesSizes.push(files[i]["value"]["size"]);
        } else {
            if (files[i]["value"]["pairedReadMetadataUuid"] && files[i]["value"]["name"].includes("_1.fastq")) { //Add first
                filesDatesMap.set(files[i]["lastUpdated"], [files[i]["value"]["name"], true]); //true means paired
                filesNamesMap.set(files[i]["value"]["name"], [files[i]["value"]["name"], true]);
                filesSizesMap.set(files[i]["value"]["size"], [files[i]["value"]["name"], true]);
                filesDates.push(files[i]["lastUpdated"]);
                filesNames.push(files[i]["value"]["name"]);
                filesSizes.push(files[i]["value"]["size"]);
            } else if (files[i]["value"]["qualityScoreMetadataUuid"]) {
                filesDatesMap.set(files[i]["lastUpdated"], [files[i]["value"]["name"], true]);
                filesNamesMap.set(files[i]["value"]["name"], [files[i]["value"]["name"], true]);
                filesSizesMap.set(files[i]["value"]["size"], [files[i]["value"]["name"], true]);
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
        .click(file.sortDropdownSelect)
        .click(file.sortDropdownOptionSelect.withAttribute('name', 'name'))

    //Confirm the sorted order matches the expected order
    filesNames.sort(function (a, b) { return a.toLowerCase().localeCompare(b.toLowerCase()); });
    var l = 0;
    for (let k = 0; k < filesNames.length; k++) {
        if (filesNamesMap.get(filesNames[k])[1]) {
            await t.expect(file.filesSortSelect.find(file.downloadId).nth(l).innerText).eql((filesNamesMap.get(filesNames[k]))[0]);
            l += 1; //Skip a gui row after the first in a pair
        } else {
            await t.expect(file.filesSortSelect.find(file.downloadId).nth(l).innerText).eql((filesNamesMap.get(filesNames[k]))[0]);
        }
        l++;
    }

    //Sort by newest
    await t
        .click(general.filesTabSelect)
        .click(file.sortDropdownSelect)
        .click(file.sortDropdownOptionSelect.withAttribute('name', 'newest'))

    //Confirm the sorted order matches the expected order
    l = 0;
    for (let k = 0; k < filesDates.length; k++) {
        if (filesDatesMap.get(filesDates[k])[1]) {
            await t.expect(file.filesSortSelect.find(file.downloadId).nth(l).innerText).eql(filesDatesMap.get(filesDates[k])[0]);
            l += 1; //Skip a gui row after the first in a pair
        } else {
            await t.expect(file.filesSortSelect.find(file.downloadId).nth(l).innerText).eql(filesDatesMap.get(filesDates[k])[0]);
        }
        l++;
    }

    //Sort by oldest
    await t
        .click(file.sortDropdownSelect)
        .click(file.sortDropdownOptionSelect.withAttribute('name', 'oldest'))

    //Confirm the sorted order matches the expected order
    filesDates.reverse();
    l = 0;
    for (let k = 0; k < filesDates.length; k++) {
        if (filesDatesMap.get(filesDates[k])[1]) {
            await t.expect(file.filesSortSelect.find(file.downloadId).nth(l).innerText).eql(filesDatesMap.get(filesDates[k])[0]);
            l += 1; //Skip a gui row after the first in a pair
        } else {
            await t.expect(file.filesSortSelect.find(file.downloadId).nth(l).innerText).eql(filesDatesMap.get(filesDates[k])[0]);
        }
        l++;
    }

    //Sort by size
    await t
        .click(file.sortDropdownSelect)
        .click(file.sortDropdownOptionSelect.withAttribute('name', 'size'))

    //Sort so that the largest files are first and confirm the sorted order matches the expected order
    filesSizes.sort(function (a, b) { return b - a; });
    l = 0
    for (let k = 0; k < filesSizes.length; k++) {
        if (filesSizesMap.get(filesSizes[k])[1]) {
            await t.expect(file.filesSortSelect.find(file.downloadId).nth(l).innerText).eql(filesSizesMap.get(filesSizes[k])[0]);
            l += 1; //Skip a gui row after the first in a pair
        } else {
            await t.expect(file.filesSortSelect.find(file.downloadId).nth(l).innerText).eql(filesSizesMap.get(filesSizes[k])[0]);
        }
        l++;
    }
});

test('Create a Subject, save, and create a Repertoire to ensure only the correct files appear in the Sequencing Files drop-down', async t => {
    await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

    const getPageUrl = ClientFunction(() => window.location.href);

    await t.navigateTo('./' + general.projectUuidUrl);

    await t
        .click(general.subjectsTabSelect)
        .click(subject.newSubjectSelect)

    var subjectCid = await subject.projectSubjectFormSelect.find(subject.projectSubjectDropdownId).getAttribute('name');

    await t
        .typeText(subject.subjectIdBaseId + subjectCid, "Subject ID", { replace: true })
        .click(subject.speciesSelect)
        .click(subject.speciesOption.withExactText(subject.species))
        .click(subject.saveChangesSelect)
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).ok()
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(subject.saveString).filterVisible().exists).notOk()
        .click(general.repertoiresTabSelect)
        .click(repertoire.newRepertoireSelect)
        .click(repertoire.newRepertoireAddSelect)

    //The Sequencing Files drop-down should only have select files
    await t
        .expect(repertoire.sequencingFilesOption.count).eql(6)
        .expect(repertoire.sequencingFilesSelect.find('option').withExactText(file.AirrTsvFile).exists).ok()
        .expect(repertoire.sequencingFilesSelect.find('option').withExactText(file.FastqPairedEndForwardFile + " / " + file.FastqPairedEndReverseFile).exists).ok()
        .expect(repertoire.sequencingFilesSelect.find('option').withExactText(file.FastaQualitySequences1File + " / " + file.FastaQualitySequences2File).exists).ok()
        .expect(repertoire.sequencingFilesSelect.find('option').withExactText(file.FastaSequencesFile).exists).ok()
        .expect(repertoire.sequencingFilesSelect.find('option').withExactText(file.FastaSequencesRenamedDuplicateFile).exists).ok()
        .expect(repertoire.sequencingFilesSelect.find('option').withExactText("null").exists).ok()
});

test('Unpair 1\) Paired-end FASTQ read files and 2\) FASTA read files and quality score files; cancel pairing', async t => {
    await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

    await t
        .navigateTo('./' + general.projectUuidUrl)
        .click(general.filesTabSelect)

    var FastqPairedEndForwardValue, FastqPairedEndReverseValue;
    const FastqPairedEndForwardFileUnpairSelect = Selector(file.formBase + file.FastqPairedEndForwardFileUuid).find(file.unpairId);

    var FastaQualitySequences1Value, FastaQualitySequences2Value;
    const FastaQualitySequences1FileUnpairSelect = Selector(file.formBase + file.FastaQualitySequences1FileUuid).find(file.unpairId);

    //Unpair the forward read
    await t
        .click(FastqPairedEndForwardFileUnpairSelect)
        .click(FastaQualitySequences1FileUnpairSelect)
        .click(file.saveChangesSelect)
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(file.saveString).filterVisible().exists).ok()
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(file.saveString).filterVisible().exists).notOk()

    //Ensure the files were unpaired
    var token = await login.getTokenFromLocalStorage();
    if (config.tapis_version == 2) {
        var files = await general.tapisV2.getProjectMetadata(token.access_token, general.projectUuid);
    } else {
        var requestSettings = {
            url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/project_file',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token['access_token']['access_token']
            }
        };
        var files = await general.tapisV3.sendRequest(requestSettings);
        await t.expect(files['status']).eql("success")
            .expect(files['result'].length).eql(15);
        files = files['result'];
    }

    for (let i = 0; i < files.length; i++) {
        if (files[i]["uuid"] == file.FastqPairedEndForwardFileUuid) FastqPairedEndForwardValue = files[i]['value'];
        else if (files[i]["uuid"] == file.FastqPairedEndReverseFileUuid) FastqPairedEndReverseValue = files[i]['value'];
        else if (files[i]["uuid"] == file.FastaQualitySequences1FileUuid) FastaQualitySequences1Value = files[i]['value'];
        else if (files[i]["uuid"] == file.FastaQualitySequences2FileUuid) FastaQualitySequences2Value = files[i]['value'];
    }

    //Ensure the files are unpaired
    await t
        .expect(FastqPairedEndForwardValue["pairedReadMetadataUuid"] == null).ok()
        .expect(FastqPairedEndReverseValue["pairedReadMetadataUuid"] == null).ok()
        .expect(FastaQualitySequences1Value["qualityScoreMetadataUuid"] == null).ok()
        .expect(FastaQualitySequences2Value["readMetadataUuid"] == null).ok()

    const FastqPairedEndForwardFileSelect = Selector(file.formBase + file.FastqPairedEndForwardFileUuid).find(file.readDirectionId);
    const FastqPairedEndForwardFileOption = FastqPairedEndForwardFileSelect.find('option');
    var PrimerSequencesReverseFileValue = "R";

    //Start pairing then unpair and ensure the files are not paired
    await t
        .click(file.filesPairFilesSelect)
        .click(file.projectFilePairRadioSelect.withAttribute('for', file.pairedEndRadioOptionFor))
        .click(project.modalDialogSelect.find(file.btnCancelClass))
        .click(FastqPairedEndForwardFileSelect) //Change something so we can Save
        .click(FastqPairedEndForwardFileOption.withExactText(PrimerSequencesReverseFileValue))
        .click(file.saveChangesSelect)
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(file.saveString).filterVisible().exists).ok()
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(file.saveString).filterVisible().exists).notOk()

    var token = await login.getTokenFromLocalStorage();
    if (config.tapis_version == 2) {
        var files = await general.tapisV2.getProjectMetadata(token.access_token, general.projectUuid);
    } else {
        var requestSettings = {
            url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/project_file',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token['access_token']['access_token']
            }
        };
        var files = await general.tapisV3.sendRequest(requestSettings);
        await t.expect(files['status']).eql("success")
            .expect(files['result'].length).eql(15);
        files = files['result'];
    }

    for (let i = 0; i < files.length; i++) {
        if (files[i]["uuid"] == file.FastqPairedEndForwardFileUuid) FastqPairedEndForwardValue = files[i]['value'];
        else if (files[i]["uuid"] == file.FastqPairedEndReverseFileUuid) FastqPairedEndReverseValue = files[i]['value'];
    }

    //Check to confirm they are still null
    await t
        .expect(FastqPairedEndForwardValue["pairedReadMetadataUuid"] == null).ok()
        .expect(FastqPairedEndReverseValue["pairedReadMetadataUuid"] == null).ok()
});

test('Sort (while there exists no paired files) according to the 4 \'Sort By\' options and confirm the correct sorting occurred', async t => {
    await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

    await t
        .navigateTo('./' + general.projectUuidUrl)
        .click(general.filesTabSelect)

    //Get timestamps for each file
    var token = await login.getTokenFromLocalStorage();
    if (config.tapis_version == 2) {
        var files = await general.tapisV2.getProjectMetadata(token.access_token, general.projectUuid);
    } else {
        var requestSettings = {
            url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/project_file',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token['access_token']['access_token']
            }
        };
        var files = await general.tapisV3.sendRequest(requestSettings);
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

    for (let i = 0; i < files.length; i++) {
        filesNamesMap.set(files[i]["value"]["name"], files[i]["value"]["name"]);
        filesNames.push(files[i]["value"]["name"]);
        filesDatesMap.set(files[i]["lastUpdated"], files[i]["value"]["name"]);
        filesDates.push(files[i]["lastUpdated"]);
        filesSizesMap.set(files[i]["value"]["name"], files[i]["value"]["size"]);
        filesSizes.push(files[i]["value"]["size"]);
    }

    //Sort A-Z
    filesNames.sort(function (a, b) { return a.toLowerCase().localeCompare(b.toLowerCase()); });

    //Sort oldest to newest
    filesDates.sort();
    //Sort newest to oldest
    filesDates.reverse();

    //Sort largest to smallest
    filesSizes.sort(function (a, b) { return b - a; });

    //Sort by file name, A-Z
    await t
        .click(file.sortDropdownSelect)
        .click(file.sortDropdownOptionSelect.withAttribute('name', 'name'))

    //Confirm the sorted order matches the expected order
    for (let k = 0; k < filesNames.length; k++)
        await t.expect(file.filesSortSelect.find(file.downloadId).nth(k).innerText).eql(filesNames[k]);

    //Sort by newest
    await t
        .click(general.filesTabSelect)
        .click(file.sortDropdownSelect)
        .click(file.sortDropdownOptionSelect.withAttribute('name', 'newest'))

    //Confirm the sorted order matches the expected order
    for (let k = 0; k < filesDates.length; k++)
        await t.expect(file.filesSortSelect.find(file.downloadId).nth(k).innerText).eql(filesDatesMap.get(filesDates[k]));

    //Sort by oldest
    await t
        .click(file.sortDropdownSelect)
        .click(file.sortDropdownOptionSelect.withAttribute('name', 'oldest'))

    //Confirm the sorted order matches the expected order
    filesDates.reverse();
    for (let k = 0; k < filesDates.length; k++)
        await t.expect(file.filesSortSelect.find(file.downloadId).nth(k).innerText).eql(filesDatesMap.get(filesDates[k]));

    //Sort by size
    await t
        .click(file.sortDropdownSelect)
        .click(file.sortDropdownOptionSelect.withAttribute('name', 'size'))

    var filesKey;
    var filesKey2;
    for (let k = 0; k < (filesSizes.length - 1); k++) {
        filesKey = await file.filesSortSelect.find(file.downloadId).nth(k).innerText;
        filesKey2 = await file.filesSortSelect.find(file.downloadId).nth(k + 1).innerText;
        await t.expect(filesSizesMap.get(filesKey)).gte(filesSizesMap.get(filesKey2));
    }
});

test('Again create a Repertoire to ensure only the correct files appear in the Sequencing Files drop-down now that the files are unpaired', async t => {
    await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

    const getPageUrl = ClientFunction(() => window.location.href);
    await t.navigateTo('./' + general.projectUuidUrl)
    const url = await getPageUrl();

    await t
        .click(general.repertoiresTabSelect)
        .click(repertoire.newRepertoireSelect)
        .click(repertoire.newRepertoireAddSelect)

    //The Sequencing Files drop-down should only have select files
    await t
        .expect(repertoire.sequencingFilesOption.count).eql(5)
        .expect(repertoire.sequencingFilesSelect.find('option').withExactText(file.AirrTsvFile).exists).ok()
        .expect(repertoire.sequencingFilesSelect.find('option').withExactText(file.FastaQualitySequences1File).exists).ok()
        .expect(repertoire.sequencingFilesSelect.find('option').withExactText(file.FastaSequencesFile).exists).ok()
        .expect(repertoire.sequencingFilesSelect.find('option').withExactText(file.FastaSequencesRenamedDuplicateFile).exists).ok()
        .expect(repertoire.sequencingFilesSelect.find('option').withExactText("null").exists).ok()
});

test('Delete an uploaded file and confirm the correct file was removed on the Back-end', async t => {
    await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

    await t.navigateTo('./' + general.projectUuidUrl);
    const FastaSequencesFileSelect = Selector(file.formBase + file.FastaSequencesFileUuid).find(file.deleteId);

    await t
        .click(general.filesTabSelect)
        .click(FastaSequencesFileSelect)
        .click(file.saveChangesSelect)
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(file.saveString).filterVisible().exists).ok()
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(file.saveString).filterVisible().exists).notOk()

    var token = await login.getTokenFromLocalStorage();
    if (config.tapis_version == 2) {
        var files = await general.tapisV2.getProjectMetadata(token.access_token, general.projectUuid);
    } else {
        var requestSettings = {
            url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/name/project_file',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token['access_token']['access_token']
            }
        };
        var files = await general.tapisV3.sendRequest(requestSettings);
        await t.expect(files['status']).eql("success")
            .expect(files['result'].length).eql(14); //Expect 14 files now
        files = files['result'];
    }

    //Confirm the correct file was deleted
    var found = false;
    for (let i = 0; i < files.length; i++) {
        if (files[i]["uuid"] == file.FastaSequencesFileUuid) { found = true; }
    }

    await t
        .expect(found).eql(false)
});
