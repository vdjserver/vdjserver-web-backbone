
'use strict';

//
// agave-password-change.js
// Account change password model
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2022 The University of Texas Southwestern Medical Center
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

export var PasswordChange = Agave.Model.extend({
    defaults: {
        username:  '',
        password: '',   // old password
        newPassword: '',
        passwordCheck: ''
    },
    apiHost: EnvironmentConfig.vdjApi.hostname,
    url: function() {
        return '/user/change-password';
    },
    callSave: function() {
        var jqxhr = $.ajax({
            contentType: 'application/json',
            data: JSON.stringify({
                new_password: encodeURIComponent(this.get('newPassword')),
                password: encodeURIComponent(this.get('password')),
            }),
            headers: Agave.oauthHeader(),
            type: 'POST',
            url: EnvironmentConfig.vdjApi.hostname + this.url(),
        });

        return jqxhr;
    },
    validate: function(attributes, options) {

        console.log('model validate called.');
        var errors = [];

        // Missing attributes
        if (!attributes.password) {
            errors.push({
                'message': 'Missing current password.',
                'type': 'password'
            });
        }

        if (!attributes.newPassword) {
            errors.push({
                'message': 'Missing new password.',
                'type': 'newPassword'
            });
        }

        if (!attributes.passwordCheck) {
            errors.push({
                'message': 'Missing new password verification.',
                'type': 'passwordCheck'
            });
        }

        // Incorrect attributes
        if (attributes.newPassword.length > 0 && attributes.newPassword.length < 5) {
            errors.push({
                'message': 'Password is too short.',
                'type': 'newPassword'
            });
        }

        if (attributes.password == attributes.newPassword) {
            errors.push({
                'message': 'New password cannot match existing password.',
                'type': 'newPassword'
            });
        }

        if (attributes.newPassword !== attributes.passwordCheck) {
            errors.push({
                'message': 'Passwords do not match.',
                'type': 'passwordCheck'
            });
        }

        if (errors.length) {
            return errors;
        }
        // else valid so return undefined
    }
});
