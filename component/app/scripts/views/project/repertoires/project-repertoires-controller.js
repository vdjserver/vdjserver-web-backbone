
'use strict';

//
// project-repertoires-controller.js
// Controller for the project repertoires page
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

import Project from 'Scripts/models/agave-project';
import ProjectRepertoiresView from 'Scripts/views/project/repertoires/project-repertoires-main';

import MessageModel from 'Scripts/models/message';
import ModalView from 'Scripts/views/utilities/modal-view';
import LoadingView from 'Scripts/views/utilities/loading-view';
import FilterController from 'Scripts/views/utilities/filter-controller';
import MetadataImportModal from 'Scripts/views/project/project-import-metadata';

import { Repertoire, SampleProcessing } from 'Scripts/models/agave-metadata';
import { SampleCollection, DataProcessingCollection } from 'Scripts/collections/agave-metadata-collections';

// Project repertoires controller
//
function ProjectRepertoiresController(controller) {
    // upper level controller, i.e. the single project controller
    this.controller = controller;

    // the project model
    this.model = this.controller.model;

    // default to summary views
    this.repertoires_view_mode = 'summary';
    // edits
    this.has_edits = false;
    this.resetCollections();

    this.mainView = new ProjectRepertoiresView({model: this.model, controller: this});

    // filters
    this.filteredRepertoires = null;
    this.filterController = new FilterController(this, "airr_repertoire");
    this.filterController.constructValues(this.repertoireList);
    this.filterController.showFilter();
}

ProjectRepertoiresController.prototype = {
    // return the main view, create it if necessary
    getView() {
        if (!this.mainView)
            this.mainView = new ProjectRepertoiresView({model: this.model, controller: this});
        else if (this.mainView.isDestroyed())
            this.mainView = new ProjectRepertoiresView({model: this.model, controller: this});
        return this.mainView;
    },

    // access data held by upper level controller
    getCollections() {
        return this.controller.getCollections();
    },

    resetCollections() {
        this.repertoireList = this.controller.repertoireList.getClonedCollection(); //create the cloned collection
    },

    getViewMode() {
        return this.repertoires_view_mode;
    },

    getRepertoireList() {
        return this.repertoireList;
    },

    getOriginalRepertoireList() {
        return this.controller.repertoireList;
    },

    toggleViewMode() {
        // summary -> detail -> summary
        switch(this.repertoires_view_mode) {
            case 'summary': this.repertoires_view_mode = 'detail'; break;
            case 'detail': this.repertoires_view_mode = 'summary'; break;
        }
        var coll = this.getRepertoireList();
        for (let i = 0; i < coll.length; ++i) {
            let m = coll.at(i);
            if (m.view_mode != 'edit') m.view_mode = this.repertoires_view_mode;
            let samples = m.sample;
            if (samples) {
                for (let i = 0; i < samples.length; ++i) {
                    let s = samples.at(i);
                    if (s.view_mode != 'edit') s.view_mode = this.repertoires_view_mode;
                }
            }
        }
        // redisplay list
        this.showProjectRepertoiresList();
    },

    applyFilter(filters) {
        if (filters) {
            this.filteredRepertoires = this.repertoireList.filterCollection(filters);

            this.filteredRepertoires.sort_by = this.repertoireList.sort_by;
            this.filteredRepertoires.sort();
        } else this.filteredRepertoires = null;

        this.showProjectRepertoiresList();
    },

    applySort(sort_by) {
        var coll = this.getRepertoireList();
        coll['sort_by'] = sort_by;
        coll.sort();
        this.mainView.updateHeader();
    },

    // show project repertoires
    showProjectRepertoiresList() {
        if (this.filteredRepertoires)
            this.mainView.showProjectRepertoiresList(this.filteredRepertoires);
        else
            this.mainView.showProjectRepertoiresList(this.repertoireList);
        this.filterController.showFilter();
    },

    flagRepertoiresEdits: function() {
        // we keep flag just for file changes
        this.has_edits = true;
        // update header
        this.mainView.updateHeader();
    },

    //
    // add, duplicate, delete repertoire and sample
    //

    duplicateRepertoire: function(e, model) {
        e.preventDefault();
        var clonedList = this.getRepertoireList();
        let i = clonedList.findIndex(model);
        let newRepertoire = model.clone();
        newRepertoire.set('uuid', newRepertoire.cid);
        newRepertoire.view_mode = 'edit';
        clonedList.add(newRepertoire, {at:i});
        $('#repertoire_name_'+newRepertoire.cid).focus();
        this.flagRepertoiresEdits();
    },

    addRepertoire: function(e) {
        var clonedList = this.getRepertoireList();
        var samples = new SampleCollection(null, {projectUuid: this.controller.model.get('uuid')});
        var sample = new SampleProcessing({projectUuid: this.controller.model.get('uuid')});
        sample.set('uuid', sample.cid);
        samples.add(sample);
        sample.view_mode = 'edit';
        var newRepertoire = new Repertoire({projectUuid: this.controller.model.get('uuid'), sample: samples});
        newRepertoire.view_mode = 'edit';
        clonedList.add(newRepertoire, {at:0});
        $('#repertoire_name_'+newRepertoire.cid).focus();
        this.flagRepertoiresEdits();
    },

    deleteRepertoire: function(e, model) {
        e.preventDefault();
        var clonedList = this.getRepertoireList();
        clonedList.remove(model.id);
        this.flagRepertoiresEdits();
    },

    duplicateSample: function(e, model) {
        e.preventDefault();
        var sampleUuid = e.target.name;
        var clonedList = model.sample; //sample list
        let i = clonedList.get(sampleUuid);
        let j = clonedList.findIndex(i);
        let newSample = model.sample.at(j).clone();
        newSample.set('uuid', newSample.cid);
        newSample.view_mode = 'edit';
        clonedList.add(newSample, {at:j});
        $('#sample_id_'+newSample.cid).focus();
    },

    addSample: function(e, model) {
        e.preventDefault();
        var sampleList = model.sample;
        var newSample = new SampleProcessing({projectUuid: this.controller.model.get('uuid')});
        newSample.set('uuid', newSample.cid);
        model.view_mode = 'edit';
        newSample.view_mode = 'edit';
        sampleList.add(newSample, {at:0});
        $('#sample_id_'+newSample.cid).focus();
        this.flagRepertoiresEdits();
    },

    deleteSample: function(e, model) {
        e.preventDefault();
        var sampleUuid = e.target.name;
        var clonedList = model.sample;
        clonedList.remove(clonedList.get(sampleUuid));
        this.flagRepertoiresEdits();
    },

    //
    // Revert changes
    // Validate and save changes
    //

    revertRepertoiresChanges: function() {
        // throw away changes by re-cloning
        this.has_edits = false;
        this.resetCollections();
        this.showProjectRepertoiresList();
    },

    saveRepertoiresChanges: function(e) {
        console.log('Clicked Save');

        // clear errors
        let hasErrors = false;
        $('.needs-validation').removeClass('was-validated');
        let fields = $('.is-invalid');
        for (let i = 0; i < fields.length; ++i) fields[i].setCustomValidity('');
        fields.removeClass('is-invalid');

        // model validation
        var minY = Number.MAX_VALUE;
        for (let i = 0; i < this.repertoireList.length; ++i) {
            // only validate models that have been changed or are new
            let model = this.repertoireList.at(i);
            let origModel = this.getOriginalRepertoireList().get(model.get('uuid'));
            var changed = null;
            if (origModel) {
                changed = model.hasChangedFromModel(origModel);
            } else changed = true;

            if (changed) {
                // TODO: need to handle if the repertoire is currently being edited but is invalid, switch to edit

                // validate the repertoire
                let valid = model.isValid();
                if (!valid) {
                    hasErrors = true;
                    let form = document.getElementById("edit-repertoire-form " + model.get('uuid'));
                    var rect = form[i].getBoundingClientRect();
                    if (rect['y'] < minY) minY = rect['y'] + window.scrollY;
                    form = $(form);
                    for (let j = 0; j < model.validationError.length; ++j) {
                        let e = model.validationError[j];
                        let f = form.find('#' + e['field']);
                        if (f.length > 0) {
                            f[0].setCustomValidity(e['message']);
                            f.addClass('is-invalid');
                        }
                    }
                }
                // validate the samples
                if (model.sample) {
                    for (let j = 0; j < model.sample.length; ++j) {
                        let s = model.sample.at(j);
                        valid = s.isValid();
                        if (!valid) hasErrors = true;
                    }
                    // TODO: scroll to sample?
                }
            }
        }

        /* TODO: identical sample IDs must have equivalent sample object

        // Validation across multiple models
        // invalidate any duplicate sample IDs
        var samplesList;
        var coll = [];
        for (let i = 0; i < coll.length; ++i) {
            let m = coll.at(i);
            let samples = m.sample;
            if (samples) {
                for (let i = 0; i < samples.length; ++i) {
                    let s = samples.at(i);
                    samplesList.add(s);
                }
            }
            var duplicates = samplesList.checkDuplicates();
            for (let i = 0; i < duplicates.length; ++i) {
                var model = duplicates.at(i);
                var field = document.getElementById("sample_id_" + model.get('uuid'));
                if (field) {
                    field.setCustomValidity("ERROR");
                    $(field).addClass('is-invalid');
                    hasErrors = true;
                    var rect = field.form.getBoundingClientRect();
                    if (rect['y'] < minY)
                        minY = rect['y']+window.scrollY;
                }
            }
        } */

        // form validation
        $('.needs-validation').addClass('was-validated');
        var form = document.getElementsByClassName('needs-validation');
        for (let i = 0; i < form.length; ++i)
            if (form[i].checkValidity() === false) {
                hasErrors = true;
                var rect = form[i].getBoundingClientRect();
                if (rect['y'] < minY)
                    minY = rect['y']+window.scrollY;
            }

        // scroll to first form with error and abort save
        if (hasErrors) {
            $('html, body').animate({ scrollTop: minY - 100 }, 1000);
            console.log('validation errors');
            return;
        }

        console.log('save disabled');
        /* TODO: save disabled

        // display a modal while the data is being saved
        this.modalState = 'save';
        var message = new MessageModel({
          'header': 'Project Repertoires',
          'body':   '<p><i class="fa fa-spinner fa-spin fa-2x"></i> Saving Project Repertoires Changes</p>'
        });

        // the app controller manages the modal region
        var view = new ModalView({model: message});
        App.AppController.startModal(view, this, this.onShownSaveModal, this.onHiddenSaveModal);
        $('#modal-message').modal('show'); */
    },

    //
    // Series of modals for metadata import
    //

    // kick off the first screen
    showMetadataImport: function() {
        // TODO: check if any repertoire/subject/samples/etc changes, do not allow user to import

        this.importView = new MetadataImportModal({model: this.model, controller: this});
        App.AppController.startModal(this.importView, this, this.onShownImportModal, this.onHiddenImportModal);
        $('#modal-message').modal('show');
    },

    onShownImportModal: function(context) {
        console.log('import: Show the modal');
    },

    onHiddenImportModal: function(context) {
        console.log('import: Hide the modal');
        console.log(context.importView.file);
        console.log(context.importView.operation);

        if (context.importView.file) {
            var message = new MessageModel({
              'header': 'Import AIRR Repertoire Metadata',
              'body':   '<p><i class="fa fa-spinner fa-spin fa-2x"></i> Please wait while we import...</p>'
            });

            // the app controller manages the modal region
            var view = new ModalView({model: message});
            App.AppController.startModal(view, context, context.onShownModal, context.onHiddenModal);
            $('#modal-message').modal('show');
        }
    },

    onShownModal(context) {
        // do the import
        context.model.importMetadataFromFile(context.importView.file, context.importView.operation)
            .done(function() {
                context.modalState = 'pass';
                $('#modal-message').modal('hide');
            })
            .fail(function(error) {
                // save failed so show error modal
                context.modalState = 'fail';
                $('#modal-message').modal('hide');

                var message = new MessageModel({
                    'header': 'Import AIRR Repertoire Metadata',
                    'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Metadata import failed!</div>',
                    cancelText: 'Ok',
                    serverError: error
                });

                var view = new ModalView({model: message});
                App.AppController.startModal(view, null, null, null);
                $('#modal-message').modal('show');
            });
    },

    onHiddenModal(context) {
        //console.log('create: Hide the modal');
        if (context.modalState == 'pass') {
            // display a success modal
            var message = new MessageModel({
                'header': 'Import AIRR Repertoire Metadata',
                'body': '<p>Metadata successfully imported!</p>',
                cancelText: 'Ok'
            });

            var view = new ModalView({model: message});
            App.AppController.startModal(view, context, null, context.onHiddenSuccessModal);
            $('#modal-message').modal('show');
        }
    },

    onHiddenSuccessModal(context) {
        // refresh
        App.router.navigate('project/' + context.model.get('uuid') + '/repertoire', {trigger: true});
    },

    showMetadataExport: function() {
        // TODO: check if any repertoire/subject/samples/etc changes, do not allow user to export?
        // TODO: do we show a modal during the export?
        this.model.exportMetadataToDisk();

        //this.importView = new MetadataImportModal({model: this.model, controller: this});
        //App.AppController.startModal(this.importView, this, this.onShownImportModal, this.onHiddenImportModal);
        //$('#modal-message').modal('show');
    },
};
export default ProjectRepertoiresController;

