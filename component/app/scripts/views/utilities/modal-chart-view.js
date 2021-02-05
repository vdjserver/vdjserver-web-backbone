//
// modal-view.js
// Generic modal view
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

import Marionette from 'backbone.marionette';
import template from 'Templates/util/modal-chart-message.html';
import Handlebars from 'handlebars';

// use Message as the model

export default Marionette.View.extend({
    template: Handlebars.compile(template),
    region: '#modal',

    events: {
        'click #server-error': function(e) {
            console.log('route to send feedback page');
        },
        'click #cancel-message-button': function(e) {
            e.preventDefault();
            this.model.set('status','cancel');
        },
        'click #confirm-message-button': function(e) {
            e.preventDefault();
            this.model.set('status','confirm');
        }
    }

});
