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

    templateContext() {
        return {
            age_display: this.model.getAgeDisplay(),
            species_display: this.model.getSpeciesDisplay(),
        }
    },

});

// Groups detail/edit view
import detail_template from 'Templates/project/groups/project-groups-detail.html';
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

        console.log("tempcontext model:", this.model);
        var rep_list = [];

        colls.repertoireList.models.forEach(repertoire => {
            // Define the display name
            var displayName = "";

            // Add repertoire name
            var repertoireName = repertoire.attributes.value.repertoire_name;
            if(repertoireName) {displayName += "Repertoire: " + repertoireName + ", ";}

            // Add subject name
            var subjectName = repertoire.subject.attributes.value.subject_id;
            if(subjectName) {displayName += "Subject: " + subjectName + ", ";}

            // Add sample names
            var sampleNames = [];
            repertoire.sample.models.forEach(sample => {
                sampleNames.push(sample.attributes.value.sample_id);
            })
            if(sampleNames) {
                displayName += "Sample";
                if(sampleNames.length > 1) {displayName += "s";}
                displayName += ":";
                sampleNames.forEach(sampleName => {
                    displayName += " " + sampleName + ",";
                });
                displayName = displayName.slice(0,-1);
            }

            var selected = false;
            for (let i in value['repertoires'])
                if (value['repertoires'][i]['repertoire_id'] == repertoire.get('uuid'))
                    selected = true;
            rep_list.push({ uuid:repertoire.get('uuid'), displayName:displayName, selected:selected });
        });

        // check if the model has a Repertoire filter, otherwise assume manual
        var filter_mode = false;
        var repertoire_filter;
        if (this.model.repertoireFilter) {
            filter_mode = true;
            repertoire_filter = this.model.repertoireFilter;
        }
        //console.log("templateContext filter_mode: ", this.filter_mode);

        return {
            view_mode: this.model.view_mode,
            filter_mode: filter_mode,
            rep_list: rep_list,
            repertoire_filter: repertoire_filter,
            subjectFieldNames: subjectFieldNames,
            sampleFieldNames: sampleFieldNames
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
        if (this.model.view_mode != 'edit')
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
