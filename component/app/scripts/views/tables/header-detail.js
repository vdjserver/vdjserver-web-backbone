//
// header-detail.js
// Basic view for metadata objects with header detail design
// header is a single view
// detail is a collection view
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2021 The University of Texas Southwestern Medical Center
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
import MessageModel from 'Scripts/models/message';
import ModalView from 'Scripts/views/utilities/modal-view';
import LoadingView from 'Scripts/views/utilities/loading-view';


// Controller functionality
//
// If we design this right the object-table handles all of the
// functionality for the detail region. The controller just handles
// interaction between the header and detail views.

// TODO: metadata object parameter
// Pass in schema? meta/v2 name?
// Pass in object table


//
// top level view to manage the header and detail regions
//
var HeaderDetailTableView = Marionette.View.extend({
    template: Handlebars.compile('<div id="object-container">test</div>'),

    // one region for contents
    regions: {
        headerRegion: '#header-container',
        detailRegion: '#detail-container'
    },

    events: {
        'click #show-details': 'showDetails',
        'click #hide-details': 'hideDetails',
        'click #edit-repertoire': 'simpleEditRepertoire',
        'click #advanced-edit': 'advancedEditRepertoire',
        'click #save-repertoire': 'saveRepertoire',
        'click #save-advanced-repertoire': 'saveAdvancedRepertoire',
        'click #check-copy-repertoire': 'simpleCopyRepertoire',
        'click #copy-repertoire': 'copyRepertoireModal'
    },

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
        if (parameters && parameters.objectTable)
            this.objectTable = parameters.objectTable;

        //this.showObjectView();
    },

    showObjectView() {
        console.log('showObjectView');
        this.showChildView('containerRegion', new this.objectView({controller: this.controller, model: this.model}));
    },

/*
    showDetails(e) {
        console.log('expandRepertoire');
        e.preventDefault();

        // change the view mode
        this.model.view_mode = 'expand';
        this.showRepertoireView();
    },

    hideDetails(e) {
        console.log('contractRepertoire');
        e.preventDefault();

        // change the view mode
        this.model.view_mode = 'summary';
        this.showRepertoireView();
    },

    simpleEditRepertoire(edit_mode) {
        console.log('simpleEditRepertoire');
        // e.preventDefault();

        // change the view mode
        this.model.view_mode = 'simple-edit';
        this.model.edit_mode = 'simple';
        this.showRepertoireView();
    },

    advancedEditRepertoire(edit_mode) {
        console.log('advancedEditRepertoire');
        this.model.view_mode = 'advanced-edit';
        this.model.edit_mode = 'advanced';
        this.showRepertoireView();
    },

    saveRepertoire(e) {
        console.log('saveRepertoire');
        e.preventDefault();

        // change the view mode back
        this.model.view_mode = 'summary';
        this.showRepertoireView();
    },

    saveAdvancedRepertoire(e) {
        console.log('saveAdvancedRepertoire');
        e.preventDefault();

        // change the view mode back
        this.model.view_mode = 'expand';
        this.model.edit_mode = '';
        this.showRepertoireView();
    },

    simpleCopyRepertoire(e) {
        console.log('copyRepertoire - simple copy');
        this.model.view_mode = 'simple-copy';
        this.model.set('copy_mode', e.target.checked);
        this.model.copy_mode = this.model.get('copy_mode');
        console.log(
                        'input:', e.target.checked,
                        'model.copy_mode:', this.model.copy_mode
                        );
        this.showRepertoireView();
    },

    // Modal displays to:
    // 1. confirm user wants to copy chosen repertoire
    // 2. allow user to select specific details that should be copied?
    copyRepertoireModal(e) {
        console.log('copy modal will appear');
        var message = new MessageModel({
            'header': 'Copy a Repertoire',
            'body': '<div>Are you sure you would like to copy the repertoire?</div>',
            'confirmText': 'Yes',
            'cancelText': 'No'
        });

        var view = new ModalView({model: message});
        App.AppController.startModal(view, this, this.onShownSaveModal, this.onHiddenSaveModal);
        $('#modal-message').modal('show');

        console.log(message);
    }
*/
});


//
// The collection view for the list of objects
//
export default Marionette.CollectionView.extend({
    template: Handlebars.compile(""),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
        if (parameters && parameters.objectView)
            this.objectView = parameters.objectView;

        //this.childView = ObjectContainerView;
        this.childViewOptions = { controller: this.controller, objectView: this.objectView };
    },

});

