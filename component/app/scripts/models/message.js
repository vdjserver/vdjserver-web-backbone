//
// message.js
// Message model for modals
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2020 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
// Author: Olivia Dorsey <olivia.dorsey@utsouthwestern.edu>
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

export default Backbone.Model.extend({
    defaults: {
        header: '',
        body: '',
        cancelText: null,
        cancelClass: 'btn btn-cancel',
        cancelID: 'cancel-button',
        confirmText: null,
        confirmClass: 'btn btn-cancel',
        confirmID: null,
        serverError: null,
        serverErrorBody: ''
    },

    initialize: function(parameters) {
        if (parameters) {
            if (parameters.header) this.set('header', parameters.header);
            if (parameters.body) this.set('body', parameters.body);
            if (parameters.cancelText) this.set('cancelText', parameters.cancelText);
            if (parameters.cancelClass) this.set('cancelClass', parameters.cancelClass);
            if (parameters.cancelID) this.set('cancelID', parameters.cancelID);
            if (parameters.confirmText) this.set('confirmText', parameters.confirmText);
            if (parameters.confirmClass) this.set('confirmClass', parameters.confirmClass);
            if (parameters.confirmID) this.set('confirmID', parameters.confirmID);

            // if server error, show formatted error and button to send feedback
            if (parameters.serverError) {
                var body = '<p>Server returned error code: ' + parameters.serverError.status + ' ' + parameters.serverError.statusText + '<p>';
                try {
                    // make the JSON pretty
                    var t = JSON.parse(parameters.serverError.responseText);
                    body += '<pre>' + JSON.stringify(t,null,2) + '</pre>';
                } catch (e) {
                    // if response is not JSON, stick in the raw text
                    body += '<pre>' + parameters.serverError.responseText + '</pre>';
                }
                this.set('serverError', true);
                this.set('serverErrorBody', body);
            }
        }
    },
});
