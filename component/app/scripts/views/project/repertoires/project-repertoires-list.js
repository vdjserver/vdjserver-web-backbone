//
// project-repertoires-list.js
// List of repertoires for projects
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
import SamplesListView from 'Scripts/views/project/samples/project-samples-list';

// repertoire summary view
import summary_template from 'Templates/project/repertoires/project-repertoires-summary.html';
var RepertoireSummaryView = Marionette.View.extend({
    template: Handlebars.compile(summary_template),

    // one region for sample list
    regions: {
        sampleRegion: '#project-sample-list'
    },

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        if (this.model) {
            var value = this.model.get('value');
            this.showChildView('sampleRegion', new SamplesListView({collection: value['sample'], controller: this.controller}));
        }
    },

    templateContext() {
        //console.log(this.model);
        var value = this.model.get('value');
        var subject = value['subject'];
        var subject_value = null;
        var species_display = null;
        var age_display = null;
        if (subject) {
            subject_value = subject.get('value');
            species_display = subject.getSpeciesDisplay();
            age_display = subject.getAgeDisplay();
        }
        var editMode = false;


        return {
            subject: subject_value,
            species_display: species_display,
            age_display: age_display,
            view_mode: this.model.view_mode
        }
    },

    events: {
        'click #project-repertoire-show-details': function(e) {
            e.preventDefault();
            this.model.view_mode = 'detail';
            this.controller.showProjectRepertoiresList();
        },
        'click #project-repertoire-copy-uuid': function(e) {
            var text = this.model.get('uuid');
            if (text) navigator.clipboard.writeText(text);
        },
        'click #project-repertoire-edit-repertoire': function(e) {
            e.preventDefault();
            this.model.view_mode = 'edit';
            // propagate edit mode down to the individual sample models
            var value = this.model.get('value');
            if (value['sample']) {
                for (let i = 0; i < value['sample'].length; ++i)
                    value['sample'].at(i).view_mode = 'edit';
            }
            this.controller.flagRepertoiresEdits();
            this.controller.showProjectRepertoiresList();
        },
        'click #project-repertoire-add-repertoire': function(e) { this.controller.addRepertoire(e, this.model); },
        'click #project-repertoire-duplicate-repertoire': function(e) { this.controller.duplicateRepertoire(e, this.model); },
        'click #project-repertoire-delete-repertoire': function(e) { this.controller.deleteRepertoire(e, this.model); },
    }

});

import detail_template from 'Templates/project/repertoires/project-repertoires-detail.html';
var RepertoireDetailView = Marionette.View.extend({
    template: Handlebars.compile(detail_template),

    regions: {
        sampleRegionDetail: '#project-sample-list-detail'
    },

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        if (this.model) {
            var collections = this.controller.getCollections();
            var value = this.model.get('value');
            this.showChildView('sampleRegionDetail', new SamplesListView({collection: value['sample'], controller: this.controller}));
        }
    },

    templateContext() {
        var editMode = false;
    //console.log(this.model);
        var collections = this.controller.getCollections();
        var value = this.model.get('value');
        var subject = value['subject'];
        var subject_value = null;
        var species_display = null;
        var age_display = null;
        if (subject) {
            subject_value = subject.get('value');
            species_display = subject.getSpeciesDisplay();
            age_display = subject.getAgeDisplay();
        }
        var sample = value['sample'];
        var sample_value = sample.get('value');

        return {
            subject: subject_value,
            species_display: species_display,
            age_display: age_display,
            sample: sample_value,
            view_mode: this.model.view_mode
        }
    },

    events: {
        'change .form-control-repertoire': 'updateField',
        'click #project-repertoire-show-summary': function(e) {
            e.preventDefault();
            this.model.view_mode = 'summary';
            this.controller.showProjectRepertoiresList();
        },
        'click #project-repertoire-copy-uuid': function(e) {
            var text = this.model.get('uuid');
            if (text) navigator.clipboard.writeText(text);
        },
        'click #project-repertoire-edit-repertoire': function(e) {
            e.preventDefault();
            this.model.view_mode = 'edit';
            // propagate edit mode down to the individual sample models
            var value = this.model.get('value');
            if (value['sample']) {
                for (let i = 0; i < value['sample'].length; ++i)
                    value['sample'].at(i).view_mode = 'edit';
            }
            this.controller.flagRepertoiresEdits();
            this.controller.showProjectRepertoiresList();
        },
        'click #project-repertoire-add-repertoire': function(e) { this.controller.addRepertoire(e, this.model); },
        'click #project-repertoire-duplicate-repertoire': function(e) { this.controller.duplicateRepertoire(e, this.model); },
        'click #project-repertoire-delete-repertoire': function(e) { this.controller.deleteRepertoire(e, this.model); },
    },

    onAttach() {
        // setup popovers and tooltips
        $('[data-toggle="popover"]').popover({
            animation: true, //fade, boolean
            placement: 'top',
        });

        $('[data-toggle="tooltip"]').tooltip();
    },

    updateField: function(e) {
        this.model.updateField(e.target.name, e.target.value);
    },

});

// Container view for repertoire detail
// There are three repertoire views: summary, detail and edit
// detail and edit are the same layout, but either in read or edit mode
var RepertoireContainerView = Marionette.View.extend({
    template: Handlebars.compile('<div id="project-repertoire-container"></div>'),

    // one region for contents
    regions: {
        containerRegion: '#project-repertoire-container'
    },

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        // save state in model
        // if editing, leave in edit
        // get default view mode from controller
        //if (this.model.view_mode != 'edit')
        if (! this.model.view_mode)
            this.model.view_mode = this.controller.getViewMode();
        this.showSubjectView();
    },

    showSubjectView() {
        //console.log("passing edit_mode...");
        // Choose which view class to render
        switch (this.model.view_mode) {
            case 'detail':
            case 'edit':
                this.showChildView('containerRegion', new RepertoireDetailView({controller: this.controller, model: this.model}));
                break;
            case 'summary':
            default:
                this.showChildView('containerRegion', new RepertoireSummaryView({controller: this.controller, model: this.model}));
                break;
        }
    },

});

var RepertoiresListView = Marionette.CollectionView.extend({
    template: Handlebars.compile("<div></div>"),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        this.childView = RepertoireContainerView;
        this.childViewOptions = { controller: this.controller };
    },
});

export default RepertoiresListView;
