//
// pass-create-project.js
// project creation
//
// VDJServer
// https://vdjserver.org
//
// Copyright (C) 2023 The University of Texas Southwestern Medical Center
//
// Author: Ryan Kennedy
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
// Date: Oct 25, 2023
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

const { General, Login, Project } = require('./pages');
const general = new General();
const login = new Login();
const project = new Project();

fixture('Getting Started')
    .page(config.url);

test('Create a Project and Check Backend Values', async t => {
    await login.login(t, config.username, config.password);

    // await t.click(Selector('#create-project', { timeout: config.timeout }));
    await t.click(general.createProjectSelect);

    await t
        .typeText(project.studyIdSelect, project.studyId)
        .typeText(project.studyTitleSelect, project.studyTitle)
        .typeText(project.descriptionSelect, project.studyDescription)
        .typeText(project.criteriaSelect, project.inclusionExclusionCriteria)
        .typeText(project.grantsSelect, project.grants)
        //.click('#contains_single_cell') //Keywords
        .click(project.studyTypeSelect) //Study Type
        .click(Selector(general.ontologySelectSelect.withAttribute('name', project.studyType)))
        .typeText(project.publicationsSelect, project.publications)
        .typeText(project.labNameSelect, project.labName)
        .typeText(project.labAddressSelect,  project.labAddress)
        .typeText(project.collectedByNameSelect, project.cName)
        .typeText(project.collectedByEmailSelect, project.cEmail)
        .typeText(project.collectedByAddressSelect, project.cAddress)
        .typeText(project.submittedByNameSelect, project.sName)
        .typeText(project.submittedByEmailSelect, project.sEmail)
        .typeText(project.submittedByAddressSelect, project.sAddress)
        .click(project.createNewProjectSelect);

    await t.expect(Selector('.modal-body > p:nth-child(1)').innerText).contains('successfully', 'Project successfully created', { timeout: config.timeout });
    // await t.expect(Selector('#modal-message p').withText('Project successfully created!'));
    // await t.click(Selector('#cancel-message-button', { timeout: config.timeout }));
    await t.click(project.modalCancelButtonSelect);

    await t
        .scrollIntoView(Selector('.fa-user-alt'))
        .click('.fa-user-alt');

    const getPageUrl = ClientFunction(() => window.location.href);
    const url = await getPageUrl();

    general.projectUuid = url.split("/")[4];
    console.log("uuid: " + general.projectUuid);

    var token = await login.getTokenFromLocalStorage();
    if (config.tapis_version == 2)
        var m = await tapisV2.getProjectMetadata(token.access_token, general.projectUuid);
    else {
        var requestSettings = {
            url: config.api + 'api/v2/project/' + general.projectUuid + '/metadata/uuid/' + general.projectUuid,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token['access_token']['access_token']
            }
        };
        var m = await tapisV3.sendRequest(requestSettings);
        // console.log(JSON.stringify(m, null, 2));
        await t.expect(m['status']).eql("success")
            .expect(m['result'].length).eql(1);
        m = m['result'][0];
    }
    //console.log(m["value"]["study_id"]);

    await t
        .expect(m["value"]["study_id"]).eql(project.studyId)
        .expect(m["value"]["study_title"]).eql(project.studyTitle)
        .expect(m["value"]["study_description"]).eql(project.studyDescription)
        //fails because an extra space is added preceding the string
        .expect(m["value"]["inclusion_exclusion_criteria"]).eql(project.inclusionExclusionCriteria)
        .expect(m["value"]["grants"]).eql(project.grants)
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


