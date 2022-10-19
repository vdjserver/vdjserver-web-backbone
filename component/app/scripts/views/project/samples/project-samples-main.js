//
// project-samples.js
// Project samples management
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
import SamplesListView from 'Scripts/views/project/samples/project-samples-list';

// Project samples buttons
import button_template from 'Templates/project/samples/project-samples-buttons.html';
var SamplesButtonView = Marionette.View.extend({
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
        'click #project-samples-view-mode' : function(e) { this.controller.toggleViewMode() },
    }
});

// this manages project samples layout
// shows all the samples in a list
// content display is handled by sub views
var SamplesView = Marionette.View.extend({
    template: Handlebars.compile('<div id="project-samples-buttons"></div><div id="project-samples-list"></div>'),

    // one region for any header content
    // one region for the files collection
    regions: {
        buttonRegion: '#project-samples-buttons',
        listRegion: '#project-samples-list'
    },

    events: {
    },

    initialize(parameters) {
        // our controller
        if (parameters && parameters.controller) {
            this.controller = parameters.controller;
        }
    },

    showProjectSamplesList(sampleList) {
        this.showChildView('buttonRegion', new SamplesButtonView({controller: this.controller}));
        this.showChildView('listRegion', new SamplesListView({collection: sampleList, controller: this.controller}));
    },

});

export default SamplesView;
