//
// project-repertoires.js
// Project repertoires management
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2021 The University of Texas Southwestern Medical Center
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
import Handlebars from 'handlebars';
import Bootstrap from 'bootstrap';
import Project from 'Scripts/models/agave-project';
import RepertoiresListView from 'Scripts/views/project/repertoires/project-repertoires-list';

// Project repertoires buttons
import button_template from 'Templates/project/repertoires/project-repertoires-buttons.html';
var RepertoiresButtonView = Marionette.View.extend({
    template: Handlebars.compile(button_template),

    initialize: function(parameters) {
        if (parameters && parameters.controller) {
            this.controller = parameters.controller;
        }
    },

    templateContext() {
        return {
            view_mode: this.controller.getViewMode()
        }
    },

    events: {
        'click #project-repertoires-view-mode' : function(e) { this.controller.toggleViewMode() },
    }
});

// this manages project repertoires layout
// shows all the repertoires in a list
// content display is handled by sub views
var RepertoiresView = Marionette.View.extend({
    template: Handlebars.compile('<div id="project-repertoires-buttons"></div><div id="project-repertoires-list"></div>'),

    // one region for any header content
    // one region for the files collection
    regions: {
        buttonRegion: '#project-repertoires-buttons',
        listRegion: '#project-repertoires-list'
    },

    events: {
    },

    initialize(parameters) {
        // our controller
        if (parameters && parameters.controller) {
            this.controller = parameters.controller;
        }
    },

    showProjectRepertoiresList(repertoireList) {
        this.showChildView('buttonRegion', new RepertoiresButtonView({controller: this.controller}));
        this.showChildView('listRegion', new RepertoiresListView({collection: repertoireList, controller: this.controller}));
    },

});

export default RepertoiresView;
