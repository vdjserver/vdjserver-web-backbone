//
// project-subjects-main.js
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
import SubjectsListView from 'Scripts/views/project/subjects/project-subjects-list';

// Project subjects buttons
import button_template from 'Templates/project/subjects/project-subjects-buttons.html';
var SubjectsButtonView = Marionette.View.extend({
    template: Handlebars.compile(button_template),

    initialize: function(parameters) {
        if (parameters && parameters.controller) {
            this.controller = parameters.controller;
        }
    },

});


// this manages project subjects layout
// shows all the subjects in a list
// header bar for toggling view mode and button bar with actions
// content display is handled by sub views
var SubjectsView = Marionette.View.extend({
    template: Handlebars.compile('<div id="project-subjects-buttons"></div><div id="project-subjects-list"></div>'),

    // one region for any header content
    // one region for the files collection
    regions: {
        buttonRegion: '#project-subjects-buttons',
        listRegion: '#project-subjects-list'
    },

    events: {
        'click #project-subjects-header-button' : 'toggleSubjectsView',

        'click #project-subjects-import': 'importSubjectTable',
        'click #project-subjects-export': 'exportSubjectTable',
        'click #project-diagnosis-import': 'importDiagnosisTable',
        'click #project-diagnosis-export': 'exportDiagnosisTable',
    },

    initialize(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },

    showProjectSubjectsList(subjectList) {
        this.showChildView('buttonRegion', new SubjectsButtonView({controller: this.controller}));
        this.showChildView('listRegion', new SubjectsListView({collection: subjectList, controller: this.controller}));
    },

    importSubjectTable: function(e) {
        e.preventDefault();
    },

    exportSubjectTable: function(e) {
        console.log('exportSubjectTable');
        e.preventDefault();
        this.model.exportTableToDisk('subject');
    },

    importDiagnosisTable: function(e) {
        e.preventDefault();
    },

    exportDiagnosisTable: function(e) {
        console.log('exportDiagnosisTable');
        e.preventDefault();
        this.model.exportMetadataToDisk();
    },
});

export default SubjectsView;
