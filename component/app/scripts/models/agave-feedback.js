
'use strict';

//
// agave-feedback.js
// Feedback models
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2021 The University of Texas Southwestern Medical Center
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

export var PublicFeedback = Agave.Model.extend({
    defaults: {
        feedback: '',
        email: '',
    },
    apiHost: EnvironmentConfig.vdjApi.hostname,
    url: function() {
        return '/feedback/public';
    },
    requiresAuth: false,
    validate: function(attributes) {
        var errors = [];

        // Missing attributes
        if (!attributes.email) {
            errors.push({
                'message': 'No email provided.',
                'type': 'feedback'
            });
        }

        if (!attributes.feedback) {
            errors.push({
                'message': 'No feedback provided.',
                'type': 'feedback'
            });
        }

        if (errors.length) {
            return errors;
        }
    },
});

export var UserFeedback = Agave.Model.extend({
    defaults: function() {

        var defaultValues = {
            'feedback': '',
            'username': Agave.instance.token().get('username'),
        };

        return defaultValues;
    },
    apiHost: EnvironmentConfig.vdjApi.hostname,
    url: function() {
        return '/feedback';
    },
    validate: function(attributes) {
        var errors = [];

        // Missing attributes
        if (!attributes.feedback) {
            errors.push({
                'message': 'No feedback provided.',
                'type': 'feedback'
            });
        }

        if (errors.length) {
            return errors;
        }
    },
});
