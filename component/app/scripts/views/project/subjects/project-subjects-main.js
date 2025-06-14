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
import SubjectsListView from 'Scripts/views/project/subjects/project-subjects-list';
import Syphon from 'backbone.syphon';
import { Subject } from 'Scripts/models/agave-metadata';
import { airr } from 'airr-js';


// Project subjects buttons
import button_template from 'Templates/project/subjects/project-subjects-buttons.html';
var SubjectsButtonView = Marionette.View.extend({
    template: Handlebars.compile(button_template),

    initialize: function(parameters) {
        if (parameters && parameters.controller) {
            this.controller = parameters.controller;
        }
    },

    templateContext() {
        var detailsMode = false;
        if(this.controller.getSubjectsViewMode() == 'detail' || this.controller.getSubjectsViewMode() == 'edit') {
            this.detailsMode = true;
        } else { this.detailsMode = false; }

        var editMode = false;
        if(this.controller.getSubjectsViewMode() == 'edit') {
            this.editMode = true;
        } else { this.editMode = false; }

        var colls = this.controller.getCollections();
        var current_sort = colls['subjectList']['sort_by'];

        return {
            detailsMode: this.detailsMode,
            editMode: this.editMode,
            has_edits: this.controller.has_edits,
            current_sort: current_sort,
        }
    },

    events: {
        'click #project-subjects-details-summary' : function(e) {
            e.preventDefault();
            this.controller.toggleSubjectsViewMode();
        },

        'click #project-subjects-import': function(e) {
            e.preventDefault();
            this.controller.importSubjectTable();
        },
        'click #project-subjects-export': function(e) {
            e.preventDefault();
            this.controller.exportSubjectTable();
        },

        'click #project-subjects-new-subject': function(e) {
            e.preventDefault();
            this.controller.addSubject(e);
        },

        'click #project-subjects-save-changes': function(e) {
            e.preventDefault();
            this.controller.saveSubjectsChanges(e);
        },
        'click #project-subjects-revert-changes': function(e) {
            e.preventDefault();
            this.controller.revertSubjectsChanges();
        },
        'click #project-subjects-sort-select': function(e) {
            // check it is a new sort
            var colls = this.controller.getCollections();
            var current_sort = colls['subjectList']['sort_by'];
            colls['subjectList']['sort_by'] = e.target.name;
            if (e.target.name != current_sort) {
                this.controller.applySort(e.target.name);
                //this.updateHeader();
            }
        },
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

    initialize(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },

    templateContext() {
        var editMode = false;
        if(this.controller.getSubjectsViewMode() == 'edit') {
            this.editMode = true;
        } else {
            this.editMode = false;
        }

        var colls = this.controller.getCollections();
        var current_sort = colls['subjectList']['sort_by'];

        return {
            editMode: this.editMode,
            current_sort: current_sort,
        }
    },

    updateHeader: function() {
        this.buttonsView = new SubjectsButtonView({controller: this.controller});
        App.AppController.navController.showButtonsBar(this.buttonsView);
        //this.showChildView('buttonRegion', new SubjectsButtonView({controller: this.controller}));
    },

    showProjectSubjectsList(subjectList) {
        this.buttonsView = new SubjectsButtonView({controller: this.controller});
        App.AppController.navController.showButtonsBar(this.buttonsView);

        //this.showChildView('buttonRegion', new SubjectsButtonView({controller: this.controller}));
        this.showChildView('listRegion', new SubjectsListView({collection: subjectList, controller: this.controller}));
    },

});

export default SubjectsView;
