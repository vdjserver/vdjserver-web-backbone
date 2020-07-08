//
// agave-permission.js
// Permission model
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

export default Agave.Model.extend({
    defaults: {
        username:   '',
        permission: ''
    },
    idAttribute: 'username',
    initialize: function(attributes) {
        Agave.Model.prototype.initialize.apply(this, [attributes]);

        if (this.attributes.uuid) {
            this.uuid = this.attributes.uuid;
            delete this.attributes.uuid;
        }

        return attributes;
    },
    setUuid: function(uuid) {
        this.uuid = uuid;
    },
    url: function() {
        return '/meta/v2/data/' + this.uuid + '/pems/' + this.get('username');
    },
    sync: function(method, model, options) {

        switch (method) {

            case 'create':
                options.type = 'POST';
                break;

            case 'update':
                options.type = 'POST';
                break;

        }

        return Agave.sync(method, model, options);
    },
    addUserToProject: function() {

        var jqxhr = $.ajax({
            contentType: 'application/json',
            data: JSON.stringify({
                projectUuid: this.uuid,
                username: this.get('username')
            }),
            headers: Agave.basicAuthHeader(),
            type: 'POST',
            url: EnvironmentConfig.vdjApi.hostname + '/permissions/username',
        });

        return jqxhr;
    },
    removeUserFromProject: function() {

        var jqxhr = $.ajax({
            contentType: 'application/json',
            data: JSON.stringify({
                projectUuid: this.uuid,
                username: this.get('username')
            }),
            headers: Agave.basicAuthHeader(),
            type: 'DELETE',
            url: EnvironmentConfig.vdjApi.hostname + '/permissions/username',
        });

        return jqxhr;
    },
});

