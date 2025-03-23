//
// project-files-list.js
// List of files for projects
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

// subject summary view
import summary_template from 'Templates/project/samples/project-samples-summary.html';
var SampleSummaryView = Marionette.View.extend({
    template: Handlebars.compile(summary_template),

    templateContext() {
        var editMode = false;
        //console.log(this.model);
        var value = this.model.get('value');
        let target_loci = [];
        for (let i = 0; i < value['pcr_target'].length; ++i)
            target_loci.push(value['pcr_target'][i]['pcr_target_locus']);

        return {
            target_loci: target_loci,
            view_mode: this.model.view_mode
        }
    },

});

import detail_template from 'Templates/project/samples/project-samples-detail.html';
var SampleDetailView = Marionette.View.extend({
    template: Handlebars.compile(detail_template),

    events: {
        'change .form-control-sample': 'updateField',
        'change .ontology-select-sample': 'updateOntology',
        'change .value-select-sample': 'updateField',
        'change .value-select-sample-pcr': 'updatePCR',
        'change .value-select-sequencing-files': 'updateSequencingFiles',
        'change .form-control-sample-sdi' : 'updateSequencingDataId'
    },

    regions: {
        tissueRegion: '#tissue-region',
        cellSubsetRegion: '#cell-subset-region',
        cellSpeciesRegion: '#cell-species-region'
    },

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        // setup ontology search views for Tissue, Cell Subset, and Cell Species
        if (this.model.view_mode == 'edit') {
            var value = this.model.get('value');
            var uuid = this.model.get('uuid');
            let null_label_tissue = 'Choose a Tissue';
            let null_label_cell_subset = 'Choose a Cell Subset';
            let null_label_cell_species = 'Choose a Cell Species';
            let button_label_tissue = null;
            let button_label_cell_subset = null;
            let button_label_cell_species = null;
            if (value.tissue) button_label_tissue = value.tissue.label;
            if (value.cell_subset) button_label_cell_subset = value.cell_subset.label;
            if (value.cell_species) button_label_cell_species = value.cell_species.label;

            var view_tissue = new OntologySearchView({schema: 'Sample', field: 'tissue',
                null_label: null_label_tissue, button_label: button_label_tissue, field_label: 'Tissue',
                context: this, selectFunction: this.updateTissueOntology, dropdown_id: 'tissue_'+uuid});
            let regionName_tissue = "tissueRegion" + uuid;
            let regionID_tissue = "#tissue-region-" + uuid;
            this.addRegion(regionName_tissue, regionID_tissue);
            this.showChildView(regionName_tissue, view_tissue);

            var view_cell_subset = new OntologySearchView({schema: 'CellProcessing', field: 'cell_subset',
                null_label: null_label_cell_subset, button_label: button_label_cell_subset, field_label: 'Cell Subset',
                context: this, selectFunction: this.updateCellSubsetOntology, dropdown_id: 'cell_subset_'+uuid});
            let regionName_cell_subset = "cellSubsetRegion" + uuid;
            let regionID_cell_subset = "#cell-subset-region-" + uuid;
            this.addRegion(regionName_cell_subset, regionID_cell_subset);
            this.showChildView(regionName_cell_subset, view_cell_subset);

            var view_cell_species = new OntologySearchView({schema: 'CellProcessing', field: 'cell_species',
                null_label: null_label_cell_species, button_label: button_label_cell_species, field_label: 'Cell Species',
                context: this, selectFunction: this.updateCellSpeciesOntology, dropdown_id: 'cell_species_'+uuid});
            let regionName_cell_species = "cellSpeciesRegion" + uuid;
            let regionID_cell_species = "#cell-species-region-" + uuid;
            this.addRegion(regionName_cell_species, regionID_cell_species);
            this.showChildView(regionName_cell_species, view_cell_species);
        }
    },

    templateContext() {
        var editMode = false;
        var template_class = this.model.schema.spec('template_class');
        var library_generation_method = this.model.schema.spec('library_generation_method');
        var complete_sequences = this.model.schema.spec('complete_sequences');
        var physical_linkage = this.model.schema.spec('physical_linkage');
        var pcr_target = this.model.schema.spec('pcr_target');

        var coll = this.controller.getCollections();
        var sequencing_files = coll.fileList.getSequencingFiles();
        var sequencing_files_formatted = [];

        //populate array to contain the formatted options for the drop-down menu
        for(let i=0; i<sequencing_files.length; i++) {
            let obj = {};
            var file = sequencing_files.at(i);
            var value = file.get('value');
            obj['name'] = value['name'];
            obj['uuid'] = file.get('uuid');
            sequencing_files_formatted.push(obj);

            //get paired file's name if paired
            if (file.isPaired()) {
                let pairUuid = file.getPairUuid();
                let model = coll.fileList.get(pairUuid);
                if (model) {
                    let val = model.get('value');
                    obj['name'] = obj['name'] + ' / ' + val['name'];
                }
            }
        }

        return {
            view_mode: this.model.view_mode,
            template_class_enum: template_class.enum,
            library_generation_method_enum: library_generation_method.enum,
            complete_sequences_enum: complete_sequences.enum,
            physical_linkage_enum: physical_linkage.enum,
            pcr_target_locus_enum: pcr_target.items.properties.pcr_target_locus.enum,
            sequencing_files_formatted: sequencing_files_formatted
        }
    },

    updateField: function(e) {
        this.model.updateField(e.target.name, e.target.value);
    },

    updateOntology: function(e) {
        this.model.updateField(e.target.name, { id: e.target.selectedOptions[0]['id'], label: e.target.value });
    },

    updateTissueOntology: function(context, value) {
        context.model.updateField('tissue', value);
    },

    updateCellSubsetOntology: function(context, value) {
        context.model.updateField('cell_subset', value);
    },

    updateCellSpeciesOntology: function(context, value) {
        context.model.updateField('cell_species', value);
    },

    updatePCR: function(e) {
        this.model.updatePCR(e.target.name, e.target.value)
    },

    updateSequencingDataId: function(e) {
        this.model.updateSequencingDataId(e.target.value);
    },

    updateSequencingFiles: function(e) {
        //console.log('updateSequencingFiles');
        let fileID = e.target.selectedOptions[0]['id'];
        if (fileID.length == 0) {
            // null
            this.model.updateSequencingFiles();
        } else {
            let coll = this.controller.getCollections();
            let file = coll.fileList.get(fileID);
            if (file.isPaired()) {
                let pairUuid = file.getPairUuid();
                let fp = coll.fileList.get(pairUuid);
                this.model.updateSequencingFiles(file, fp);
            } else {
                this.model.updateSequencingFiles(file);
            }
        }
    },

});

// Container view for sample detail
// There are three sample views: summary, detail and edit
// detail and edit are the same layout, but either in read or edit mode
var SampleContainerView = Marionette.View.extend({
    template: Handlebars.compile('<div id="project-sample-container"></div>'),

    // one region for contents
    regions: {
        containerRegion: '#project-sample-container'
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
                this.showChildView('containerRegion', new SampleDetailView({controller: this.controller, model: this.model}));
                break;
            case 'summary':
            default:
                this.showChildView('containerRegion', new SampleSummaryView({controller: this.controller, model: this.model}));
                break;
        }
    },

});

var SamplesListView = Marionette.CollectionView.extend({
    template: Handlebars.compile(""),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        this.childView = SampleContainerView;
        this.childViewOptions = { controller: this.controller };
    },
});

export default SamplesListView;
