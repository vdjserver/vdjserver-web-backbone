//
// project-subjects.js
// Project subjects management
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
import SubjectsListView from 'Scripts/views/project/subjects/subjects-list';

// Project subjects header view
import template from 'Templates/project/subjects/subjects-list-header.html';
var SubjectsHeaderView = Marionette.View.extend({
    template: Handlebars.compile(template),

    initialize: function(parameters) {
        if (parameters && parameters.controller) {
            this.controller = parameters.controller;
        }
    },

});


// this manages project subjects layout
// shows all the subjects in a list
// content display is handled by sub views
var SubjectsView = Marionette.View.extend({
    template: Handlebars.compile('<div id="project-subjects-header"></div><div id="project-subjects-list"></div>'),
    className: 'project-subjects-list',

    // one region for any header content
    // one region for the files collection
    regions: {
        headerRegion: '#project-subjects-header',
        listRegion: '#project-subjects-list'
    },

    events: {
    },

    initialize(parameters) {
        // our controller
        if (parameters && parameters.controller) {
            this.controller = parameters.controller;
        }

        var collections = this.controller.getCollections();
        this.showChildView('headerRegion', new SubjectsHeaderView({controller: this.controller}));
this.showChildView('listRegion', new SubjectsListView({collection: collections.subjectList, controller: this.controller, view_mode: 'detail'}));
    },

    showSubjectsList(subjectsList) {
        //this.showChildView('headerRegion', new SubjectsHeaderView());
        //this.showChildView('listRegion', new SubjectsListView({collection: this.subjectList, controller: this.controller}));
    },

});

export default SubjectsView;
