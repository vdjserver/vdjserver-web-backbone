
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

export var VerifyAccount = Agave.Model.extend({
    apiHost: EnvironmentConfig.vdjApi.hostname,
    url: function() {
        return '/user'
               + '/verify'
               + '/' + this.get('verificationId')
               ;
    },
    requiresAuth: false,
});

export var ResendVerificationEmail = Agave.Model.extend({
    apiHost: EnvironmentConfig.vdjApi.hostname,
    url: function() {
        return '/user/verify/email'
               + '/' + this.get('username')
               ;
    },
    requiresAuth: false,
});

export var NewAccount = Agave.Model.extend({
    defaults: {
        username:  '',
        password:  '',
        passwordCheck: '',
        email:     '',
    },
    apiHost: EnvironmentConfig.vdjApi.hostname,
    sync: Agave.sync,
    url: function() {
        return '/user';
    },
    requiresAuth: false,
    validate: function(attributes) {

        var errors = [];

        // Missing attributes
        if (!attributes.username) {
            errors.push({
                'message': 'Missing username.',
                'type': 'username',
            });
        }

        if (!attributes.email) {
            errors.push({
                'message': 'Missing email.',
                'type': 'email',
            });
        }

        if (!attributes.password) {
            errors.push({
                'message': 'Missing password.',
                'type': 'password',
            });
        }

        if (!attributes.passwordCheck) {
            errors.push({
                'message': 'Missing password verification.',
                'type': 'passwordCheck',
            });
        }

        // Incorrect username attributes
        if (attributes.username !== attributes.username.toLowerCase()) {
            errors.push({
                'message': 'Usernames can not include capital letters.',
                'type': 'username',
            });
        }

        if (attributes.username.indexOf(' ') >= 0) {
            errors.push({
                'message': 'Usernames can not include spaces.',
                'type': 'username',
            });
        }

        // Incorrect password attributes
        if (attributes.password.length > 0 && attributes.password.length < 5) {
            errors.push({
                'message': 'Password is too short.',
                'type': 'password',
            });
        }

        if (attributes.username.length > 0 &&
            attributes.password.length > 0 &&
            attributes.username.indexOf(attributes.password) >= 0
        ) {
            errors.push({
                'message': 'Password can\'t be part of username.',
                'type': 'password',
            });
        }

        if (attributes.password.indexOf('%') > -1) {
            errors.push({
                'message': 'Passwords can not contain the \'%\' character.',
                'type': 'password',
            });
        }

        if (attributes.password !== attributes.passwordCheck) {
            errors.push({
                'message': 'Passwords do not match.',
                'type': 'passwordCheck',
            });
        }

        if (errors.length) {
            return errors;
        }
    },
    parseApiErrorMessage: function(errorMessage) {

        var parsedMessage = {
            'message': '',
            'type': '',
        };

        switch (errorMessage) {
            case '1': {
                parsedMessage.message = 'This username has already been reserved. Please try a different one.';
                parsedMessage.type = 'username';
                break;
            }

            case '2': {
                parsedMessage.message = 'Unable to create account at this time. Please try again later.';
                parsedMessage.type = '';
                break;
            }

            case '3': {
                parsedMessage.message = 'Unable to create account at this time. Please try again later.';
                parsedMessage.type = '';
                break;
            }

            case '4': {
                parsedMessage.message = 'Unable to create account at this time. Please try again later.';
                parsedMessage.type = '';
                break;
            }

            case '5': {
                parsedMessage.message = 'Unable to create account at this time. Please try again later.';
                parsedMessage.type = '';
                break;
            }

            default: {
                break;
            }
        }

        return parsedMessage;
    },
});
