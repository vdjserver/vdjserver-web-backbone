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
import OntologySearchView from 'Scripts/views/utilities/ontology-search-view';
import { airr } from 'airr-js';

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
        'click #project-subject-show-details': function(e) {
            e.preventDefault();
            this.model.view_mode = 'detail';
            this.controller.showProjectSubjectsList();
        },
        'click #project-subject-copy-uuid': function(e) {
            var text = this.model.get('uuid');
            if (text) navigator.clipboard.writeText(text);
        },
        'click #project-subject-edit': function(e) {
            e.preventDefault();
            this.model.view_mode = 'edit';
            this.controller.flagSubjectsEdits();
            this.controller.showProjectSubjectsList();
        },
        'click #project-subject-duplicate': function(e) { this.controller.duplicateSubject(e, this.model); },
        'click #project-subject-add-diagnosis': function(e) { this.controller.addDiagnosis(e, this.model); },
        'click #project-subject-duplicate-diagnosis': function(e) { this.controller.duplicateDiagnosis(e, this.model); },
        'click #project-subject-delete-diagnosis': function(e) { this.controller.deleteDiagnosis(e, this.model); },
        'click #project-subject-delete': function(e) { this.controller.deleteSubject(e, this.model); },
    },

});

// subject detail/edit view
import detail_template from 'Templates/project/subjects/project-subjects-detail.html';
var SubjectDetailView = Marionette.View.extend({
    template: Handlebars.compile(detail_template),

    regions: {
        diseaseDiagnosisRegion: '#disease-diagnosis-region'
    },

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        // setup ontology search views for disease diagnosis
        if (this.model.view_mode == 'edit') {
            var value = this.model.get('value');
            for (let i = 0; i < value['diagnosis'].length; i++) {
                let null_label = 'Choose a Diagnosis';
                let button_label = null;
                if (value['diagnosis'][i].disease_diagnosis)
                    button_label = value['diagnosis'][i].disease_diagnosis.label;
                var view = new OntologySearchView({schema: 'Diagnosis', field: 'disease_diagnosis',
                    null_label: null_label, button_label: button_label, field_label: 'Disease Diagnosis',
                    context: this, selectFunction: this.selectDisease, dropdown_id: 'diagnosisOntology_'+i});
                let regionName = "diseaseDiagnosisRegion" + i;
                let regionID = "#disease-diagnosis-region-" + i;
                this.addRegion(regionName, regionID);
                this.showChildView(regionName, view);
            }
        }

    },

    templateContext() {
        var editMode = false;
        var pointMode = false;
        let value = this.model.get('value');
        if (value['age_max'] == value['age_min']) pointMode = true;
        var sex = this.model.schema.spec('sex');

        var collections = this.controller.getCollections();
        if (collections.subjectList) {
            var subject_ids = [];
            for(let i=0; i<collections.subjectList.length; i++) {
                let subj = collections.subjectList.at(i);
                let value2 = subj.get('value');
                if(value2.subject_id != value['subject_id']) subject_ids.push(value2.subject_id);
            }
        }

        return {
            view_mode: this.model.view_mode,
            pointMode: pointMode,
            sex_enum: sex.enum,
            subject_ids: subject_ids
        }
    },

    events: {
        'change .form-control-subject': 'updateField',
        'change .value-select': 'updateDropDown',
        'change .ontology-select': 'updateOntology',
        'change .form-control-diagnosis': 'updateFieldDiagnosis',

        'click #project-subject-show-summary': function(e) {
            e.preventDefault();
            this.model.view_mode = 'summary';
            this.controller.showProjectSubjectsList();
        },
        'click #project-subject-copy-uuid': function(e) {
            var text = this.model.get('uuid');
            if (text) navigator.clipboard.writeText(text);
console.log(JSON.stringify(this.model));
        },
        'click #project-subject-edit': function(e) {
            e.preventDefault();
            this.model.view_mode = 'edit';
console.log(JSON.stringify(this.model));
            this.controller.flagSubjectsEdits();
            this.controller.showProjectSubjectsList();
        },
        'click #project-subject-duplicate': function(e) { this.controller.duplicateSubject(e, this.model); },
        'click #project-subject-add-diagnosis': function(e) { this.controller.addDiagnosis(e, this.model); },
        'click #project-subject-detail-duplicate-diagnosis': function(e) { this.controller.duplicateDiagnosis(e, this.model); },
        'click #project-subject-detail-delete-diagnosis': function(e) { this.controller.deleteDiagnosis(e, this.model); },
        'click #project-subject-delete': function(e) { this.controller.deleteSubject(e, this.model); },
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

    updateDropDown: function(e) {
        // age type dropdown, hide/unhide appropriate fields
        if (e.target.name == 'age_type') {
            if (e.target.value == "point") {
                let doc = $(this.el);
                doc.find('#age_min_div').attr('hidden', true);
                doc.find('#age_max_div').attr('hidden', true);
                doc.find('#age_point_div').attr('hidden', false);
                // update age from html
                this.model.updateField('age_point', doc.find('#age_point').val());
            }
            if (e.target.value == "range") {
                let doc = $(this.el);
                doc.find('#age_min_div').attr('hidden', false);
                doc.find('#age_max_div').attr('hidden', false);
                doc.find('#age_point_div').attr('hidden', true);
                // update age from html
                this.model.updateField('age_min', doc.find('#age_min').val());
                this.model.updateField('age_max', doc.find('#age_max').val());
            }
            return;
        }
        if (e.target.name == 'linked_subjects') {
            if (e.target.value == "") {
                this.model.updateField('linked_subjects', null);
            } else {
                this.model.updateField('linked_subjects', e.target.value);
            }
            return;
        }
        // update field
        this.model.updateField(e.target.name, e.target.value);
    },

    updateOntology: function(e) {
        this.model.updateField(e.target.name, { id: e.target.selectedOptions[0]['id'], label: e.target.value });
    },

    // special handling to update disease diagnosis
    // called by ontology search view, "this" points to search view
    selectDisease(context, value) {
        let index = this.dropdown_id.split("_").slice(-1);
        context.model.updateDiagnosisField(index, 'disease_diagnosis', value);
    },

    // special handling to update diagnosis fields
    updateFieldDiagnosis: function(e) {
        let index = e.target.id.split("_").slice(-1);
        this.model.updateDiagnosisField(index, e.target.name, e.target.value);
    },

});

// Container view for subject detail
// There are three subject views: summary, detail and edit
// detail and edit are the same layout, but either in read or edit mode
var SubjectContainerView = Marionette.View.extend({
    template: Handlebars.compile('<div id="project-subject-container"></div>'),

    // one region for contents
    regions: {
        containerRegion: '#project-subject-container',
    },

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        // save state in model
        // if editing, leave in edit
        // get default view mode from controller
        if (! this.model.view_mode)
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
