
'use strict';

//
// tenant-user.js
// Tapis user account
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

//
// Tapis can store limited information within the user record (TenantUser)
// so we maintain an additional user profile metadata record
//

// Tapis user account

export var TenantUser = Agave.Model.extend({
    defaults: {
        username: '',
        email:       '',
        name:  ''
    },
    idAttribute: 'username'
});

// VDJServer user profile
export var UserProfile = Agave.MetadataModel.extend({
    defaults: function() {
        return _.extend(
            {},
            Agave.MetadataModel.prototype.defaults,
            {
                name: 'profile',
                value: {
                    firstName: '',
                    lastName:  '',
                    email:     '',
                    city:      '',
                    state:     '',
                },
            }
        );
    },
    apiHost: EnvironmentConfig.vdjApi.hostname,
    url: function() {
        return '/user/profile/' + Agave.instance.token().get('username');
    }
});
