
'use strict';

//
// file-transfer-mixins.js
// Backbone model mixins for downloading files
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2020 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
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

import { Agave } from 'Scripts/backbone/backbone-agave';

export var FileTransfers = {};

FileTransfers.downloadUrlByPostit = function(project_uuid, url) {

    var jqxhr = Agave.ajax({
        headers: _.extend(
            {},
            Agave.oauthHeader(),
            {
                'Content-Type': 'application/json',
            }
        ),
        type: 'POST',
        url: EnvironmentConfig.vdjApi.hostname + '/project/' + project_uuid + '/file/postit',
        data: JSON.stringify({
            'path': url,
            'allowedUses': 1,
            'validSeconds': 3600
        }),
    })
    .then(function(response) {

        var targetUrl = response.result.redeemUrl;
        // rewrite URL to go through proxy
        //targetUrl = targetUrl.replace(EnvironmentConfig.agave.internal, EnvironmentConfig.agave.hostname);

        return targetUrl;
    })
    /*
        Create an invisible link on the DOM, and programmatically click it

        I realize that this seems like something that the view controller should do,
        but I feel like this is worth handling in the model because:

        * we're only using it for file downloads
        * it has no visible effect on the DOM
        * it's temporary
        * it is only concerned with initiating data transfer, which is what the user is trying to do anyway
    */
    .then(function(targetUrl) {

        var link = document.createElement('a');
        link.setAttribute('download', null);
        link.setAttribute('data-bypass', 'true');
        link.setAttribute('href', targetUrl);
        link.style.display = 'none';
        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
    })
    ;

    return jqxhr;
};

FileTransfers.downloadPublicFileByPostit = function(projectUuid, fileUuid) {

    var jqxhr = $.ajax({
        type: 'GET',
        url: EnvironmentConfig.vdjApi.hostname
            + '/projects/' + projectUuid + '/postit/' + fileUuid,
    })
    .then(function(response) {

        var targetUrl = response.result._links.self.href;
        // rewrite URL to go through proxy
        targetUrl = targetUrl.replace(EnvironmentConfig.agave.internal, EnvironmentConfig.agave.hostname);

        return targetUrl;
    })
    /*
        Create an invisible link on the DOM, and programmatically click it

        I realize that this seems like something that the view controller should do,
        but I feel like this is worth handling in the model because:

        * we're only using it for file downloads
        * it has no visible effect on the DOM
        * it's temporary
        * it is only concerned with initiating data transfer, which is what the user is trying to do anyway
    */
    .then(function(targetUrl) {

        var link = document.createElement('a');
        link.setAttribute('download', null);
        link.setAttribute('data-bypass', 'true');
        link.setAttribute('href', targetUrl);
        link.style.display = 'none';
        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
    })
    ;

    return jqxhr;
};
