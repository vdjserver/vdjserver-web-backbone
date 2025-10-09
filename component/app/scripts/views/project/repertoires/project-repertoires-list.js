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

        this.preview_mode = false;
        if (parameters && parameters.preview_mode)
            this.preview_mode = true;

        if (this.model) {
            if (this.model.sample)
                this.showChildView('sampleRegion', new SamplesListView({collection: this.model.sample, controller: this.controller}));
        }
    },

    templateContext() {
        //console.log(this.model);
        //var value = this.model.get('value');
        var subject = this.model.subject;
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
            view_mode: this.model.view_mode,
            preview_mode: this.preview_mode
        }
    },

    events: {
        'click #project-repertoire-show-details': function(e) {
            e.preventDefault();
            if (this.model.view_mode != 'edit') {
                this.model.view_mode = 'detail';
                let samples = this.model.sample;
                if (samples) {
                    for (let i = 0; i < samples.length; ++i) {
                        let s = samples.at(i);
                        s.view_mode = 'detail';
                    }
                }
                this.controller.showProjectRepertoiresList();
            }
        },
        'click #project-repertoire-copy-uuid': function(e) {
            var text = this.model.get('uuid');
            if (text) navigator.clipboard.writeText(text);
        },
        'click #project-repertoire-edit-repertoire': function(e) {
            e.preventDefault();
            this.model.view_mode = 'edit';
            // propagate edit mode down to the individual sample models
            let samples = this.model.sample;
            if (samples) {
                for (let i = 0; i < samples.length; ++i) {
                    let s = samples.at(i);
                    s.view_mode = 'edit';
                }
            }
            this.controller.flagRepertoiresEdits();
            this.controller.showProjectRepertoiresList();
        },
        'click #project-repertoire-duplicate-repertoire': function(e) { this.controller.duplicateRepertoire(e, this.model); },
        'click #project-repertoire-delete-repertoire': function(e) { this.controller.deleteRepertoire(e, this.model); },
        'click #project-sample-add-sample': function(e) { this.controller.addSample(e, this.model); },
        'click #project-sample-duplicate-sample': function(e) { this.controller.duplicateSample(e, this.model); },
        'click #project-sample-delete-sample': function(e) { this.controller.deleteSample(e, this.model); },
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
            if (this.model.sample)
                this.showChildView('sampleRegionDetail', new SamplesListView({collection: this.model.sample, controller: this.controller}));
        }
    },

    templateContext() {
        var editMode = false;
        var collections = this.controller.getCollections();
        var value = this.model.get('value');
        var subject = this.model.subject;
        var subject_value = null;
        var species_display = null;
        var age_display = null;
        if (subject) {
            subject_value = subject.get('value');
            species_display = subject.getSpeciesDisplay();
            age_display = subject.getAgeDisplay();
        }

        if (collections.subjectList) {
            var subject_ids = [];
            for(let i=0; i<collections.subjectList.length; i++) {
                let subj = collections.subjectList.at(i);
                let value2 = subj.get('value');
                if(value2.subject_id != value['subject_id']) {
                    let subject_display = {};
                    subject_display['id'] = value2.subject_id;
                    subject_display['uuid'] = subj.get('uuid');
                    subject_ids.push(subject_display);
                }
            }
        }
        //subject_ids.push(null);

        return {
            subject: subject_value,
            species_display: species_display,
            age_display: age_display,
            view_mode: this.model.view_mode,
            subject_ids: subject_ids
        }
    },

    events: {
        'change .form-control-repertoire': 'updateField',
        'change .form-control-repertoire-subject': function(e) {
            this.controller.updateSubject(e, this.model);
            this.controller.showProjectRepertoiresList();
        },
        'click #project-repertoire-show-summary': function(e) {
            e.preventDefault();
            if (this.model.view_mode != 'edit') {
                this.model.view_mode = 'summary';
                let samples = this.model.sample;
                if (samples) {
                    for (let i = 0; i < samples.length; ++i) {
                        let s = samples.at(i);
                        s.view_mode = 'summary';
                    }
                }
                this.controller.showProjectRepertoiresList();
            }
        },
        'click #project-repertoire-copy-uuid': function(e) {
            var text = this.model.get('uuid');
            if (text) navigator.clipboard.writeText(text);
        },
        'click #project-repertoire-edit-repertoire': function(e) {
            e.preventDefault();
            this.model.view_mode = 'edit';
            // propagate edit mode down to the individual sample models
            let samples = this.model.sample;
            if (samples) {
                for (let i = 0; i < samples.length; ++i) {
                    let s = samples.at(i);
                    s.view_mode = 'edit';
                }
            }
            this.controller.flagRepertoiresEdits();
            this.controller.showProjectRepertoiresList();
        },
        'click #project-repertoire-duplicate-repertoire': function(e) { this.controller.duplicateRepertoire(e, this.model); },
        'click #project-repertoire-delete-repertoire': function(e) { this.controller.deleteRepertoire(e, this.model); },
        'click #project-sample-add-sample': function(e) { this.controller.addSample(e, this.model); },
        'click #project-sample-duplicate-sample': function(e) { this.controller.duplicateSample(e, this.model); },
        'click #project-sample-delete-sample': function(e) { this.controller.deleteSample(e, this.model); }
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
    }

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
            case 'preview':
                this.showChildView('containerRegion', new RepertoireSummaryView({controller: this.controller, model: this.model, preview_mode: true}));
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
