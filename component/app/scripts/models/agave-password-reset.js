
'use strict';

//
// agave-account.js
// Account creation models
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

export var ResetPasswordEmail = Agave.Model.extend({
    defaults: {
        username:  ''
    },
    apiHost: EnvironmentConfig.vdjApi.hostname,
    url: function() {
        return '/user/reset-password';
    },
    requiresAuth: false
});

export var ResetPassword = Agave.Model.extend({
    defaults: {
        username:  '',
        reset_code:  ''
    },
    apiHost: EnvironmentConfig.vdjApi.hostname,
    url: function() {
        return '/user/reset-password/verify';
    },
    requiresAuth: false,
    validate: function(attributes) {

        var errors = [];

        // Missing attributes
        if (!attributes.username) {
            errors.push({
                'message': 'Missing username.',
                'type': 'username'
            });
        }

        // only validate password if reset code ks present
        if (attributes.reset_code) {
            if (!attributes.new_password || attributes.new_password.length == 0) {
                errors.push({
                    'message': 'Missing password.',
                    'type': 'new_password'
                });
            }

            if (!attributes.passwordCheck || attributes.passwordCheck.length == 0) {
                errors.push({
                    'message': 'Missing password verification.',
                    'type': 'passwordCheck'
                });
            }

            // Incorrect attributes
            if (attributes.new_password.length > 0 && attributes.new_password.length < 5) {
                errors.push({
                    'message': 'Password is too short.',
                    'type': 'new_password'
                });
            }

            if (attributes.username.length > 0 &&
                attributes.new_password.length > 0 &&
                attributes.username.indexOf(attributes.new_password) >= 0
            ) {
                errors.push({
                    'message': 'Password can\'t be part of username.',
                    'type': 'new_password'
                });
            }

            if (attributes.new_password !== attributes.passwordCheck) {
                errors.push({
                    'message': 'Passwords do not match.',
                    'type': 'passwordCheck'
                });
            }
        }

        if (errors.length) {
            return errors;
        }
    }
});

