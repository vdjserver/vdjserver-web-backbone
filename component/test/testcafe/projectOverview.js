//
// projectOverview.js
// Project Pages Test Cases
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

const { General, Login, Project } = require('./pages');
const general = new General();
const login = new Login();
const project = new Project();

fixture('Project Pages Test Cases')
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

test('Confirm a blank Study Title is not allowed', async t => {
    await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

    await t
        .click(general.createProjectSelect)
        .typeText(project.studyIdSelect, project.studyId)
        .typeText(project.studyTitleSelect, '  ', { replace: true })
        .typeText(project.descriptionSelect, project.studyDescription)
        .click(project.createNewProjectSelect);

    var errorMessage = general.invalidFeedbackSelect.withExactText(project.studyTitleValidationMessage).filterVisible().exists;
    await t.expect(errorMessage).ok()
});

test('Add a new user to the Project, confirm the user was added, delete the user, and confirm the user was deleted', async t => {
    await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

    const getPageUrl = ClientFunction(() => window.location.href);

    await t.navigateTo('./' + general.projectUuidUrl);

    //Add the user
    await t
        .typeText(project.userSelect, general.username2)
        .click(Selector('#user-list-region > table > tbody:nth-child(3) > tr > td.user-name-email > div > a > b'))
        .click(project.addUserButtonSelect);

    await t
        .click(project.modalConfirmButtonSelect)
        .click(project.modalCancelButtonSelect)
        .wait(config.timeout);
    
    await t.eval(() => location.reload(true)); //Reload the page to update the user list

    //Check the Back-end
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

    //Check the number of users on the Project
    var numUsers = m['permission'].length;

    await t
        .expect(numUsers).eql(2)
        .expect(m['permission'][1]['username']==general.username2).ok()
        .expect(m['permission'][1]['permission']['read']==true).ok()
        .expect(m['permission'][1]['permission']['write']==true).ok();

    //Delete the user
    await t
        .click(project.deleteUserButtonSelect.withAttribute('name', general.username2))
        .click(project.modalConfirmButtonSelect)
        .click(project.modalCancelButtonSelect)
        .wait(config.timeout);

    //Check the Back-end
    token = await login.getTokenFromLocalStorage();
    if (config.tapis_version == 2) {
        var m = await general.tapisV2.getProjectMetadata(token.access_token, general.projectUuid);
    } else {
        var m = await general.tapisV3.sendRequest(requestSettings);
        await t.expect(m['status']).eql("success")
            .expect(m['result'].length).eql(1);
        m = m['result'][0];
    }

    numUsers = 0;
    numUsers = m['permission'].length;

    await t
        .expect(numUsers).eql(1)
        .expect(m['permission'][0]['username']==general.username).ok()
        .expect(m['permission'][0]['permission']['read']==true).ok()
        .expect(m['permission'][0]['permission']['write']==true).ok();
});

test('Edit the Project and Check Back-end Values', async t => {
    await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

    await t.navigateTo('./' + general.projectUuidUrl);

    await t
        .click(project.editProjectSelect)
        .click(general.navbarStatsIconSelect)
        .typeText(project.studyIdEditSelect, project.studyId2, { replace: true })
        .typeText(project.studyTitleSelect, project.studyTitle2, { replace: true })
        .click(project.studyTypeSelect)
        .click(Selector(general.ontologySelectSelect.withAttribute('name', project.studyTypeEdit)))
        .typeText(project.criteriaSelect, project.inclusionExclusionCriteria2, { replace: true })
        .click('#' + project.keywords[0])
        .click('#' + project.keywords[1])
        .click('#' + project.keywords[2])
        .typeText(project.publicationsSelect, project.publications2, { replace: true })
        .typeText(project.grantsSelect, project.grants2, { replace: true })
        .typeText(project.labNameSelect, project.labName2, { replace: true })
        .typeText(project.labAddressSelect, project.labAddress2, { replace: true })
        .typeText(project.collectedBySelect, project.collectedBy, { replace: true })
        .typeText(project.submittedBySelect, project.submittedBy, { replace: true })
        .typeText(project.descriptionSelect, project.studyDescription2, { replace: true })
        .click(project.editProjectSaveSelect)
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(project.saveString).filterVisible().exists).ok()
        .expect(project.modalDialogSelect.find(project.modalBodyClass).withExactText(project.saveString).filterVisible().exists).notOk()

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
        .expect(m["value"]["study_id"]).eql(project.studyId2)
        .expect(m["value"]["study_title"]).eql(project.studyTitle2)
        .expect(m["value"]["study_description"]).eql(project.studyDescription2)
        .expect(m["value"]["inclusion_exclusion_criteria"]).eql(project.inclusionExclusionCriteria2)
        .expect(m["value"]["grants"]).eql(project.grants2)
        .expect(m["value"]["keywords_study"][0]).eql(project.keywords[2])
        .expect(m["value"]["study_type"]["id"]).eql(project.studyTypeEdit)
        .expect(m["value"]["pub_ids"]).eql(project.publications2)
        .expect(m["value"]["lab_name"]).eql(project.labName2)
        .expect(m["value"]["lab_address"]).eql(project.labAddress2)
        .expect(m["value"]["collected_by"].split(", ")[0]).eql(project.cName2)
        .expect(m["value"]["collected_by"].split(", ")[1]).eql(project.cEmail2)
        .expect(m["value"]["collected_by"].split(", ")[2]).eql(project.cAddress2)
        .expect(m["value"]["submitted_by"].split(", ")[0]).eql(project.sName2)
        .expect(m["value"]["submitted_by"].split(", ")[1]).eql(project.sEmail2)
        .expect(m["value"]["submitted_by"].split(", ")[2]).eql(project.sAddress2)
});

// TODO- Delete is not implemented on the Back-end, yet
test('Archive the Project and Check Back-end Values', async t => {
    await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

    await t.navigateTo('./' + general.projectUuidUrl);

    await t
        .click(project.archiveSelect)
        .expect(project.modalDialogSelect.find(`${project.modalBodyClass} div`).withExactText(project.archiveString).exists).ok()
        .click(project.modalConfirmButtonSelect);

    //Check that the Project is deleted on the Back-end
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
            .expect(m['result'].length).eql(1); // should equal 1 since we are archiving and not deleting 
    }
});

test('Attempt to create a Project with a blank Study ID', async t => {
    const blankStudyTitle = "    ";
    const tabbedStudyTitle = "\t\t";

    await login.login(t, config.username, config.password, 'CLICK', login.loginButtonId);

    await t
        .click(general.createProjectSelect)
        .typeText(project.studyTitleSelect, blankStudyTitle)
        .click(project.createNewProjectSelect)

    const errorMessage = general.invalidFeedbackSelect.withExactText(project.studyTitleValidationMessage).filterVisible().exists;

    await t
        .expect(errorMessage).ok()
        .typeText(project.studyTitleSelect, tabbedStudyTitle)
        .click(project.createNewProjectSelect)

    const errorMessage2 = general.invalidFeedbackSelect.withExactText(project.studyTitleValidationMessage).filterVisible().exists;

    await t
        .expect(errorMessage2).ok()
});
