
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

    revertRepertoiresChanges: function() {
        // throw away changes by re-cloning
        this.has_edits = false;
        this.resetCollections();
        this.showProjectRepertoiresList();
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

