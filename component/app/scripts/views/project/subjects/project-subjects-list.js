//
// project-subjects-list.js
// List of subjects for projects
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

// subject summary view
import summary_template from 'Templates/project/subjects/project-subjects-summary.html';
var SubjectSummaryView = Marionette.View.extend({
    template: Handlebars.compile(summary_template),

    initialize(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },

    templateContext() {
        var editMode = false;
        return {
            age_display: this.model.getAgeDisplay(),
            species_display: this.model.getSpeciesDisplay(),
            view_mode: this.model.view_mode,
        }
    },

    events: {
        'click #project-subject-edit': function(e) {
            e.preventDefault();
            this.model.view_mode = 'edit';
            this.controller.flagSubjectsEdits();
            this.controller.showProjectSubjectsList();
        },
    },

});

// subject detail/edit view
import detail_template from 'Templates/project/subjects/project-subjects-detail.html';
var SubjectDetailView = Marionette.View.extend({
    template: Handlebars.compile(detail_template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

    },

    templateContext() {
        var editMode = false;
        return {
            view_mode: this.model.view_mode,
        }
    },

    events: {
        'click #project-subject-edit': function(e) {
            e.preventDefault();
            this.model.view_mode = 'edit';
            this.controller.flagSubjectsEdits();
            this.controller.showProjectSubjectsList();
        },
        'change .form-control': 'updateField',
        'change .custom-select': 'updateDropDown',
        'change #species': 'updateSpecies',

    },

    onAttach() {
        // setup popovers and tooltips
        $('[data-toggle="popover"]').popover({
//            trigger: 'hover',
adaptive: false,
animation: false,
//animation-reset: true,
/*placement: 'top',
html: true,
positionFixed: true,
//offset: '100, 100',
//fallbackPlacement : ['left', 'right', 'top', 'bottom'],
container: 'body',
animate: false,
transform: false,
//animation: false,*/
transform: 'none',
        });

        $('[data-toggle="tooltip"]').tooltip({
placement: 'top',
animation: false,
transform: 'none',
willChange: 'unset',
});
    },

    updateField: function(e) {
        let value = this.model.get('value');
        value[e.target.name] = e.target.value;
        this.model.set('value', value);
    },

    updateDropDown: function(e) {
        let value = this.model.get('value');
        value[e.target.name] = e.target.value;
        this.model.set('value', value);
    },

    updateSpecies: function(e) {
        let value = this.model.get('value');
        value[e.target.name] = { id: e.target.id, label: e.target.value };
        var parentSpecies = document.getElementById("species"); var childSpecies;
        for(var i = 0; i < parentSpecies.childNodes.length; i++) {
            childSpecies = parentSpecies.childNodes[i];
            if(childSpecies.nodeName == "OPTION" && childSpecies.value == e.target.value) {
                value[e.target.name] = { id: childSpecies.id, label: childSpecies.value };
                this.model.set('value', value);
            }
        }
    },
});

// Container view for subject detail
// There are three subject views: summary, detail and edit
// detail and edit are the same layout, but either in read or edit mode
var SubjectContainerView = Marionette.View.extend({
    template: Handlebars.compile('<div id="project-subject-container"></div>'),

    // one region for contents
    regions: {
        containerRegion: '#project-subject-container'
    },

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        // save state in model
        // if editing, leave in edit
        // get default view mode from controller
        if (this.model.view_mode != 'edit')
            this.model.view_mode = this.controller.getSubjectsViewMode();

        this.showSubjectView();
    },

    showSubjectView() {
        switch (this.model.view_mode) {
            case 'detail':
            case 'edit':
                this.showChildView('containerRegion',new SubjectDetailView({controller: this.controller, model: this.model}));
                break;
            case 'summary':
            default:
                this.showChildView('containerRegion', new SubjectSummaryView({controller: this.controller, model: this.model}));
                break;
        }
    },

});

// list of subjects
var SubjectsListView = Marionette.CollectionView.extend({
    template: Handlebars.compile("<div></div>"),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        this.childView = SubjectContainerView;
        this.childViewOptions = { controller: this.controller };
    }
});

export default SubjectsListView;
