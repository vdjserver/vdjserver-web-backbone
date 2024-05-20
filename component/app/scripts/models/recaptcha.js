
'use strict';

//
// recaptcha.js
// Google recaptcha model
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

import Backbone from 'backbone';

export default Backbone.Model.extend(
    {
        validate: function(attributes) {
            var errors = [];

            // Missing attributes
            if (!attributes['g-recaptcha-response']) {
                errors.push({
                    'message': 'Missing reCAPTCHA Challenge',
                    'type': 'recaptcha',
                });
            }

            if (errors.length) {
                return errors;
            }
        },
    },
    {
        RECAPTCHA_ERROR_MESSAGE: 'Recaptcha response invalid: incorrect-captcha-sol',
    }
);

/*
define(
    [
        'app',
    ],
function(
    App
) {

    'use strict';

    var Recaptcha = {};

    Recaptcha = Backbone.Model.extend(
        {
            validate: function(attributes) {
                var errors = [];

                // Missing attributes
                if (!attributes['g-recaptcha-response']) {
                    errors.push({
                        'message': 'Missing reCAPTCHA Challenge',
                        'type': 'recaptcha',
                    });
                }

                if (errors.length) {
                    return errors;
                }
            },
        },
        {
            RECAPTCHA_ERROR_MESSAGE: 'Recaptcha response invalid: incorrect-captcha-sol',
        }
    );

    App.Models.Recaptcha = Recaptcha;
    return Recaptcha;
});
*/
