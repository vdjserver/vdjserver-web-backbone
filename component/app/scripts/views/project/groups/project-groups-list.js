//
// project-groups-list.js
// List of repertoire groups for projects
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2022 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
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
import 'bootstrap-select';

// Groups summary view
import summary_template from 'Templates/project/groups/project-groups-summary.html';
var GroupsSummaryView = Marionette.View.extend({
    template: Handlebars.compile(summary_template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },

    templateContext() {
        var filterName = "";
        var value = this.model.get('value');
        if (value.filter) {
            if (value.filter.Repertoire.op === 'and' || value.filter.Repertoire.op === 'or') {
                value.filter.Repertoire.content.forEach(rep => {
                    filterName += this.capitalizeField(rep.content.field) + " " + 
                                  rep.op + " " +
                                  rep.content.value + " " +
                                  value.filter.Repertoire.op + " ";
                });
                filterName = filterName.substring(0, filterName.length-value.filter.Repertoire.op.length-1);
            } else {
                filterName = this.capitalizeField(value.filter.Repertoire.content.field) + " " + 
                             value.filter.Repertoire.op + " " +
                             value.filter.Repertoire.content.value;
            }
        } else {
            filterName = 'Manual';
        }

        return {
            filter_name: filterName,
            view_mode: this.model.view_mode,
        }
    },

    events: {
        'click #project-repertoire-group-show-detail': function(e) {
            e.preventDefault();
            this.model.view_mode = 'detail';
            this.controller.showProjectGroupsList();
        },
        'click #project-repertoire-group-copy-uuid': function(e) {
            e.preventDefault();
            var text = this.model.get('uuid');
            if (text) navigator.clipboard.writeText(text);
        },
        'click #project-repertoire-group-edit': function(e) {
            e.preventDefault();
            this.model.view_mode = 'edit';
            this.controller.flagGroupEdits();
            this.controller.showProjectGroupsList();
        },
        'click #project-repertoire-group-duplicate': function(e) { this.controller.duplicateGroup(e, this.model); },
        'click #project-repertoire-group-delete': function(e) { this.controller.deleteGroup(e, this.model); },

    },

    capitalizeField: function(field) {
        // capitalize field names
        var capField = ""
        field.split('.').forEach(word => { 
            capField += word.substring(0,1).toUpperCase() + word.substring(1).toLowerCase() + " ";
        });
        return capField.substring(0,capField.length-1);
    }
});

// Groups detail/edit view
import detail_template from 'Templates/project/groups/project-groups-detail.html';
import { filter } from 'underscore';
var GroupsDetailView = Marionette.View.extend({
    template: Handlebars.compile(detail_template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },

    templateContext() {
        var colls = this.controller.getCollections();
        var value = this.model.get('value');

        // find filter in environment config
        if (! EnvironmentConfig['filters']) {
            console.error('Internal ERROR: Cannot find filters in EnvironmentConfig.');
            return;
        }
        if (! EnvironmentConfig['filters']['vdjserver_group_subject']) {
            console.error('Internal ERROR: Cannot find filter name (vdjserver_group_subject) in EnvironmentConfig filters.');
            return;
        }
        if (! EnvironmentConfig['filters']['vdjserver_group_sample']) {
            console.error('Internal ERROR: Cannot find filter name (vdjserver_group_sample) in EnvironmentConfig filters.');
            return;
        }

        var subjectFieldNames = [];
        for (let i in EnvironmentConfig['filters']['vdjserver_group_subject']) {
            subjectFieldNames.push({ title: EnvironmentConfig['filters']['vdjserver_group_subject'][i]['title'], field: EnvironmentConfig['filters']['vdjserver_group_subject'][i]['field'] });
        }
        var sampleFieldNames = [];
        for (let i in EnvironmentConfig['filters']['vdjserver_group_sample']) {
            sampleFieldNames.push({ title: EnvironmentConfig['filters']['vdjserver_group_sample'][i]['title'], field: EnvironmentConfig['filters']['vdjserver_group_sample'][i]['field'] });
        }

        console.log("pgl templateContext model:", this.model);
        var rep_list = [];

        colls.repertoireList.models.forEach(repertoire => {
            // Define the display name
            var displayName = "";

            // Add repertoire name
            var repertoireName = repertoire.get('value').repertoire_name;
            if(repertoireName) {displayName += "Repertoire: " + repertoireName + ",";}

            // Add subject name
            var subjectName = repertoire.subject.get('value').subject_id;
            if(subjectName) {
                if(displayName) {displayName += " ";}
                displayName += "Subject: " + subjectName + ",";
            }

            // Add sample names
            var sampleNames = [];
            repertoire.sample.models.forEach(sample => {
                sampleNames.push(sample.get('value').sample_id);
            })
            if(sampleNames) {
                if(displayName) {displayName += " ";}
                displayName += "Sample";
                if(sampleNames.length > 1) {displayName += "s";}
                displayName += ":";
                sampleNames.forEach(sampleName => {
                    displayName += " " + sampleName + ",";
                });
            }

            // Remove dangling ","
            if(displayName) {displayName = displayName.slice(0,-1);}
            
            
            var selected = false;
            for (let i in value['repertoires'])
                if (value['repertoires'][i]['repertoire_id'] == repertoire.get('uuid'))
                    selected = true;
            rep_list.push({ uuid:repertoire.get('uuid'), displayName:displayName, selected:selected });
        });

        // check if the model has a Repertoire filter, otherwise assume manual
        var filter_mode = false;
        var fullFilter;
        var repertoire_filter;
        if (value.filter) {
            filter_mode = true;
            fullFilter = this.model.get('value').filter.Repertoire;
            
            if(fullFilter.op == 'and' || fullFilter.op == 'or') {
                repertoire_filter = {
                    field1: fullFilter.content[0].content.field,
                    operator1: fullFilter.content[0].op,
                    value1: fullFilter.content[0].content.value,
                    logical: fullFilter.op,
                    field2: fullFilter.content[1].content.field,
                    operator2: fullFilter.content[1].op,
                    value2: fullFilter.content[1].content.value,
                }
            } else {
                repertoire_filter = {
                    field1: fullFilter.content.field,
                    operator1: fullFilter.op,
                    value1: fullFilter.content.value, 
                }
            }
        }
        //console.log("templateContext filter_mode: ", this.filter_mode);

        var filterName = "";
        if (value.filter) {
            if (value.filter.Repertoire.op === 'and' || value.filter.Repertoire.op === 'or') {
                value.filter.Repertoire.content.forEach(rep => {
                    filterName += this.capitalizeField(rep.content.field) + " " + 
                                  rep.op + " " +
                                  rep.content.value + " " +
                                  value.filter.Repertoire.op + " ";
                });
                filterName = filterName.substring(0, filterName.length-value.filter.Repertoire.op.length-1);
            } else {
                filterName = this.capitalizeField(value.filter.Repertoire.content.field) + " " + 
                             value.filter.Repertoire.op + " " +
                             value.filter.Repertoire.content.value;
            }
        } else {
            filterName = 'Manual';
        }

        return {
            view_mode: this.model.view_mode,
            filter_mode: filter_mode,
            rep_list: rep_list,
            repertoire_filter: repertoire_filter,
            subject_field_names: subjectFieldNames,
            sample_field_names: sampleFieldNames,
            filter_name: filterName,
        }
    },

    onAttach() {
        // setup popovers and tooltips
        $('[data-toggle="popover"]').popover({
            trigger: 'hover'
        });
        $('[data-toggle="tooltip"]').tooltip();

        // init boostrap-select
        $('.selectpicker').selectpicker();
    },

    events: {
        'change .form-control-repertoire-group': 'updateField',
        'change .value-select': 'updateDropDown',
        'change .form-control-filter': 'updateFilter',
        // 'change .ontology-select': 'updateOntology',
        'click #project-repertoire-group-show-summary': function(e) {
            e.preventDefault();
            this.model.view_mode = 'summary';
            this.controller.showProjectGroupsList();
        },
        'click #project-repertoire-group-copy-uuid': function(e) {
            e.preventDefault();
            var text = this.model.get('uuid');
            if (text) navigator.clipboard.writeText(text);
        },
        'click #project-repertoire-group-edit': function(e) {
            e.preventDefault();
            this.model.view_mode = 'edit';
            this.controller.flagGroupEdits();
            this.controller.showProjectGroupsList();
        },
        'click #project-repertoire-group-duplicate': function(e) { this.controller.duplicateGroup(e, this.model); },
        'click #project-repertoire-group-delete': function(e) { this.controller.deleteGroup(e, this.model); },
        'change #repertoire-groups-cdr3_aa_input, #repertoire-groups-cdr3_nt_input': function(e) { 
            e.preventDefault();
            this.toggleDependentInput($('#repertoire-groups-cdr3_aa_input'), $('#repertoire-groups-cdr3_nt_input'));
        },
    },

    toggleDependentInput: function(inputEl1, inputEl2) {
        if (inputEl1.val().trim()) {
            inputEl2.prop('disabled', true);
        } else {
            inputEl2.prop('disabled', false);
        }
    
        if (inputEl2.val().trim()) {
            inputEl1.prop('disabled', true);
        } else {
            inputEl1.prop('disabled', false);
        }
    },

    updateField: function(e) {
        this.model.updateField(e.target.name, e.target.value);
    },

    updateDropDown: function(e) {
        console.log("updateDropDown");

        // swap displayed fields when switching modes
        if (e.target.name == 'filter_mode') {
            console.log("udd filter_mode");

            if (e.target.value == "Filter"|| e.target.value == null) {
                console.log("udd e.target.value: ", e.target.value);
                let doc = $(this.el);

                doc.find('#repertoire-groups-repertoires').attr('hidden', true);
                doc.find('#repertoire-groups-logical_field1').attr('hidden', false);
                doc.find('#repertoire-groups-logical_operator1').attr('hidden', false);
                doc.find('#repertoire-groups-logical_value1').attr('hidden', false);
                doc.find('#repertoire-groups-logical').attr('hidden', false);
                doc.find('#repertoire-groups-logical_field2').attr('hidden', false);
                doc.find('#repertoire-groups-logical_operator2').attr('hidden', false);
                doc.find('#repertoire-groups-logical_value2').attr('hidden', false);
                doc.find('#repertoire-groups-count').attr('hidden', false);
                doc.find('#repertoire-groups-cdr3_aa').attr('hidden', false);
                doc.find('#repertoire-groups-cdr3_nt').attr('hidden', false);
                doc.find('#repertoire-groups-junction_aa_length').attr('hidden', false);
                doc.find('.repertoire-groups-row-rearrangment').attr('hidden', false);
            }
            if (e.target.value == "Manual") {
                console.log("udd e.target.value: ", e.target.value);
                let doc = $(this.el);
                doc.find('#repertoire-groups-repertoires').attr('hidden', false);
                doc.find('#repertoire-groups-logical_field1').attr('hidden', true);
                doc.find('#repertoire-groups-logical_operator1').attr('hidden', true);
                doc.find('#repertoire-groups-logical_value1').attr('hidden', true);
                doc.find('#repertoire-groups-logical').attr('hidden', true);
                doc.find('#repertoire-groups-logical_field2').attr('hidden', true);
                doc.find('#repertoire-groups-logical_operator2').attr('hidden', true);
                doc.find('#repertoire-groups-logical_value2').attr('hidden', true);
                doc.find('#repertoire-groups-count').attr('hidden', true);
                doc.find('.repertoire-groups-row-rearrangment').attr('hidden', true);

                // remove filter
                this.model.updateRepertoireFilter(null);
            }

            return;
        }

        if (e.target.name == "repertoires") {
            let ops = e.target.selectedOptions;
            if (ops.length == 0) this.model.updateField(e.target.name, null);
            else {
                let reps = [];
                for (let i=0; i < ops.length; ++i) reps.push({ repertoire_id: ops[i]['id'] });
                this.model.updateField(e.target.name, reps);
            }
            return;
        }

        // update field
        this.model.updateField(e.target.name, e.target.value);
    },

    // custom processing of filter
    updateFilter: function(e) {
        console.log("updateFilter");

        // toggle second logical
        if (e.target.name == "repertoire-groups-logical") {
            console.log(e.target.name);
            let doc = $(this.el);

            if (e.target.value) {
                console.log(e.target.value);
                doc.find("#repertoire-groups-logical_field2_select").prop("disabled", false);
                doc.find("#repertoire-groups-logical_operator2_select").prop("disabled", false);
                doc.find("#repertoire-groups-logical_value2_input").prop("disabled", false);
            } else {
                console.log(e.target.value);
                doc.find("#repertoire-groups-logical_field2_select").prop("disabled", true);
                doc.find("#repertoire-groups-logical_operator2_select").prop("disabled", true);
                doc.find("#repertoire-groups-logical_value2_input").prop("disabled", true);
            }
            $('.selectpicker').selectpicker('refresh');
        }

        // the filter needs to be stored in the group as an ADC API-style filter
        // gather the field values and let the object handle it
        let doc = $(this.el);
        let obj = {
            'field1': doc.find('#repertoire-groups-logical_field1_select')[0].selectedOptions[0].id,
            'operator1': doc.find('#repertoire-groups-logical_operator1_select')[0].selectedOptions[0].value,
            'value1': doc.find('#repertoire-groups-logical_value1_input').val(),
            'logical': doc.find('#repertoire-groups-logical_select')[0].selectedOptions[0].value,
            'field2': doc.find('#repertoire-groups-logical_field2_select')[0].selectedOptions[0].id,
            'operator2': doc.find('#repertoire-groups-logical_operator2_select')[0].selectedOptions[0].value,
            'value2': doc.find('#repertoire-groups-logical_value2_input').val()
        }
        this.model.updateRepertoireFilter(obj);
    },
    
    capitalizeField: function(field) {
        // capitalize field names
        var capField = ""
        field.split('.').forEach(word => { 
            capField += word.substring(0,1).toUpperCase() + word.substring(1).toLowerCase() + " ";
        });
        return capField.substring(0,capField.length-1);
    }
});

// Container view for Groups detail
// There are three Groups views: summary, detail and edit
// detail and edit are the same layout, but either in read or edit mode
var GroupsContainerView = Marionette.View.extend({
    template: Handlebars.compile('<div id="project-groups-container"></div>'),

    // one region for contents
    regions: {
        containerRegion: '#project-groups-container'
    },

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        // save state in model
        // if editing, leave in edit
        // get default view mode from controller
        if (!this.model.view_mode)
            this.model.view_mode = this.controller.getGroupsViewMode();

        this.showGroupsView();
    },

    showGroupsView() {
        //console.log("passing edit_mode...");
        // Choose which view class to render
        switch (this.model.view_mode) {
            case 'detail':
            case 'edit':
                this.showChildView('containerRegion',new GroupsDetailView({controller: this.controller, model: this.model}));
                break;
            case 'summary':
            default:
                this.showChildView('containerRegion', new GroupsSummaryView({controller: this.controller, model: this.model}));
                break;
        }
    },

});

// list of repertoire groups
var GroupsListView = Marionette.CollectionView.extend({
    template: Handlebars.compile("<div></div>"),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        this.childView = GroupsContainerView;
        this.childViewOptions = { controller: this.controller };
    }
});

export default GroupsListView;
