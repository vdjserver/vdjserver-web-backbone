//
// repertoire-controller.js
// Manage the repertoire views for a single project
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2020 The University of Texas Southwestern Medical Center
//
// Author: Olivia Dorsey <olivia.dorsey@utsouthwestern.edu>
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
import { Repertoire, Subject } from 'Scripts/models/agave-metadata';
import { RepertoireCollection, SubjectCollection, SampleCollection } from 'Scripts/collections/agave-metadata-collections';
import MetadataImportModal from 'Scripts/views/project/project-import-metadata';

// Repertoire Controller: manages any views associated with viewing a repertoire
// The basic design is a repertoire collection view
// Individual repertoire views can be shifted between different
// states: summary, expanded read-only, and expanded editable.

// TODO: How do we handle the shifting of an individual repertoire
// view between it's different states?
//
// The Marionette CollectionView is based upon a single view that's utilized
// for all the models in the collection. If we change that view, then
// it changes it for all models (repertoire), which we don't want.
//
// We likely need to create an abstract view that is given to CollectionView
// and it manages subviews which deal with the different transitions.

//
// Repertoire summary views
// Show list of repertoires, each with a 4-line summary
//

// Subviews for the repertoire summary
// four of them, each one is meant to be a single row or line
import summary_header_template from 'Templates/project/repertoires/repertoire-summary-header.html';
var RepertoireSummaryHeaderView = Marionette.View.extend({
    template: Handlebars.compile(summary_header_template),
    className: "row",
    initialize: function(parameters) {
        this.copy_mode = this.model.copy_mode;
    },
    templateContext() {
        return {
            copy_mode: this.model.copy_mode,
        }
    }
});

import summary_subject_template from 'Templates/project/repertoires/repertoire-summary-subject.html';
var RepertoireSummarySubjectView = Marionette.View.extend({
    template: Handlebars.compile(summary_subject_template),
    className: "row"
});

import summary_sample_template from 'Templates/project/repertoires/repertoire-summary-sample.html';
var RepertoireSummarySampleView = Marionette.View.extend({
    template: Handlebars.compile(summary_sample_template),
    className: "row"
});

import summary_stats_template from 'Templates/project/repertoires/repertoire-summary-statistics.html';
var RepertoireSummaryStatisticsView = Marionette.View.extend({
    template: Handlebars.compile(summary_stats_template),
    className: "row"
});

// Summary view for a single repertoire
// Short multi-line summary, meant for showing in a list
// the model for the view is a repertoire
// we access related data (subject, sample, etc) through the controller
import rep_summary_template from 'Templates/project/repertoires/repertoire-summary-new.html';
var RepertoireSummaryView = Marionette.View.extend({
    template: Handlebars.compile(rep_summary_template),

    // one region for any header content
    // one region for subject summary
    // one region for sample summary
    // one region for repertoire statistics
    regions: {
        headerRegion: '#repertoire-summary-header',
        subjectRegion: '#repertoire-summary-subject',
        sampleRegion: '#repertoire-summary-sample',
        statisticsRegion: '#repertoire-summary-statistics'
    },

    initialize: function(parameters) {
        // Copy Mode is false by default
        this.copy_mode = false;

        // our controller
        // if (parameters && parameters.controller)
        //     this.controller = parameters.controller;

        // our controller
        if (parameters) {
            if (parameters.controller) this.controller = parameters.controller;
            if (parameters.copy_mode) this.copy_mode = parameters.copy_mode;
        }

        this.showChildView('headerRegion', new RepertoireSummaryHeaderView({model: this.model}));

        // get the subject for this repertoire
        var value = this.model.get('value');
        var subjectList = this.controller.getSubjectList();
        var subject = subjectList.get(value['subject']['vdjserver_uuid']);
        this.showChildView('subjectRegion', new RepertoireSummarySubjectView({model: subject}));

        // TODO: get the samples for this repertoire
        // samples is a collection of models
        this.showChildView('sampleRegion', new RepertoireSummarySampleView());

        // get the repertoire statistics
        this.showChildView('statisticsRegion', new RepertoireSummaryStatisticsView({model: this.model}));
    },

    templateContext() {
        return {
            copy_mode: this.copy_mode,
        }
    }
});

//
// Repertoire expanded views
// this makes all data in the repertoire viewable
//
// We layout a set of subviews for each of the repertoire data pieces
// repertoire (name, description, id, action buttons)
// subject
// samples
// sequencing files
// repertoire statistics
//

import expand_header_template from 'Templates/project/repertoires/repertoire-expand-header.html';
var RepertoireExpandedHeaderView = Marionette.View.extend({
    template: Handlebars.compile(expand_header_template),
    className: "row",
    initialize: function(parameters) {
        this.edit_mode = this.model.edit_mode;
    },
    templateContext() {
        return {
            edit_mode: this.model.edit_mode,
        }
    }
});

import expand_subject_template from 'Templates/project/repertoires/repertoire-expand-subject.html';
var RepertoireExpandedSubjectView = Marionette.View.extend({
    template: Handlebars.compile(expand_subject_template),
    className: "row",
    initialize: function(parameters) {
        this.edit_mode = this.model.edit_mode;
    },
    templateContext() {
        return {
            edit_mode: this.model.edit_mode,
        }
    }
});

import expand_sample_template from 'Templates/project/repertoires/repertoire-expand-sample.html';
var RepertoireExpandedSampleView = Marionette.View.extend({
    template: Handlebars.compile(expand_sample_template),
    className: "row",
    initialize: function(parameters) {
        this.edit_mode = this.model.edit_mode;
    },
    templateContext() {
        return {
            edit_mode: this.model.edit_mode,
        }
    }
});

import expand_stats_template from 'Templates/project/repertoires/repertoire-expand-statistics.html';
var RepertoireExpandedStatisticsView = Marionette.View.extend({
    template: Handlebars.compile(expand_stats_template),
    className: "row",
    initialize: function(parameters) {
        this.edit_mode = this.model.edit_mode;
    },
    templateContext() {
        return {
            edit_mode: this.model.edit_mode,
        }
    }
});

// Expanded view for a single repertoire
//
// TODO: do we use this same expanded view for both read-only and editing?
// We can do that with variables and Handlebars to generate different HTML
// or we can have different views that we swap between.
import rep_expanded_template from 'Templates/project/repertoires/repertoire-expand.html';
var RepertoireExpandedView = Marionette.View.extend({
    template: Handlebars.compile(rep_expanded_template),

    // one region for any header content
    // one region for subject summary
    // one region for sample summary
    // one region for repertoire statistics
    regions: {
        headerRegion: '#repertoire-expand-header',
        subjectRegion: '#repertoire-expand-subject',
        sampleRegion: '#repertoire-expand-sample',
        fileRegion: '#repertoire-expand-file',
        statisticsRegion: '#repertoire-expand-statistics'
    },

    initialize: function(parameters) {
        // if "Edit" is clicked, it will be in "advanced" mode
        this.edit_mode = this.model.edit_mode;

        // if (parameters && parameters.controller)
        //     this.controller = parameters.controller;

        if (parameters) {
            if (parameters.controller) this.controller = parameters.controller;
            if (parameters.edit_mode) this.edit_mode = parameters.edit_mode;
        }

        this.showChildView('headerRegion', new RepertoireExpandedHeaderView({model: this.model, edit_mode: this.model.edit_mode}));

        // get the subject for this repertoire
        var value = this.model.get('value');
        var subjectList = this.controller.getSubjectList();
        var subject = subjectList.get(value['subject']['vdjserver_uuid']);
        this.showChildView('subjectRegion', new RepertoireExpandedSubjectView({model: subject, edit_mode: this.model.edit_mode}));

        // TODO: get the samples for this repertoire
        // samples is a collection of models
        this.showChildView('sampleRegion', new RepertoireExpandedSampleView({model: this.model, edit_mode: this.model.edit_mode}));

        // get the repertoire statistics
        this.showChildView('statisticsRegion', new RepertoireExpandedStatisticsView({model: this.model, edit_mode: this.model.edit_mode}));
    },

    templateContext() {
        return {
            edit_mode: this.edit_mode,
        }
    }

});

//
// Repertoire edit views
// this makes all data in the repertoire editable
//
import edit_header_template from 'Templates/project/repertoires/repertoire-edit-header.html';
var RepertoireEditHeaderView = Marionette.View.extend({
    template: Handlebars.compile(edit_header_template),
    className: "row"
});

import edit_subject_template from 'Templates/project/repertoires/repertoire-edit-subject.html';
var RepertoireEditSubjectView = Marionette.View.extend({
    template: Handlebars.compile(edit_subject_template),
    className: "row"
});

import edit_sample_template from 'Templates/project/repertoires/repertoire-edit-sample.html';
var RepertoireEditSampleView = Marionette.View.extend({
    template: Handlebars.compile(edit_sample_template),
    className: "row"
});

import edit_stats_template from 'Templates/project/repertoires/repertoire-edit-statistics.html';
var RepertoireEditStatisticsView = Marionette.View.extend({
    template: Handlebars.compile(edit_stats_template),
    className: "row"
});

import rep_edit_template from 'Templates/project/repertoires/repertoire-edit.html';
var RepertoireEditView = Marionette.View.extend({
    template: Handlebars.compile(rep_edit_template),

    // one region for editing any header content
    // one region for editing subject summary
    // one region for editing sample summary
    // one region for editing repertoire file
    // one region for editing repertoire statistics
    regions: {
        headerRegion: '#repertoire-edit-header',
        subjectRegion: '#repertoire-edit-subject',
        sampleRegion: '#repertoire-edit-sample',
        fileRegion: '#repertoire-edit-file',
        statisticsRegion: '#repertoire-edit-statistics'
    },

    initialize: function(parameters) {
        // show "simple" edit mode by default
        this.edit_mode = "simple";

        // our controller
        if (parameters) {
            if (parameters.controller) this.controller = parameters.controller;
            if (parameters.edit_mode) this.edit_mode = parameters.edit_mode;
        }

        this.showChildView('headerRegion', new RepertoireEditHeaderView({model: this.model}));

        // get the subject for this repertoire
        var value = this.model.get('value');
        var subjectList = this.controller.getSubjectList();
        var subject = subjectList.get(value['subject']['vdjserver_uuid']);
        this.showChildView('subjectRegion', new RepertoireEditSubjectView({model: subject}));

        // TODO: get the samples for this repertoire
        // samples is a collection of models
        this.showChildView('sampleRegion', new RepertoireEditSampleView());

        // get file for this repertoire

        // get the repertoire statistics
        this.showChildView('statisticsRegion', new RepertoireEditStatisticsView({model: this.model}));
    },

    templateContext() {
        return {
            edit_mode: this.edit_mode,
        }
    },
});

//
// Container view for a repertoire
// We cannot change the class of child view in a collection view
// and have it re-render. So we create an abstraction layer, the collection
// view uses this container view for the children, thus the child view class
// stays the same, and the container view switches between the different
// repertoire views.
//
var RepertoireContainerView = Marionette.View.extend({
    template: Handlebars.compile('<div id="repertoire-container"></div>'),

    // one region for contents
    regions: {
        containerRegion: '#repertoire-container'
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

        this.showRepertoireView();
    },

    showRepertoireView(edit_mode, copy_mode) {
        //console.log("passing edit_mode...");
        // Choose which view class to render
        switch (this.model.view_mode) {
            case 'expand':
                this.showChildView('containerRegion', new RepertoireExpandedView({controller: this.controller, model: this.model, edit_mode: this.model.edit_mode}));
                break;
            case 'simple-edit':
                this.showChildView('containerRegion', new RepertoireEditView({controller: this.controller, model: this.model}));
                break;
            case 'advanced-edit':
                // do we want to create another set of pages for the advanced edit (expanded repertoire with edit functionality)?
                this.showChildView('containerRegion', new RepertoireExpandedView({controller: this.controller, model: this.model, edit_mode: this.model.edit_mode}));
                break;
            case 'simple-copy':
                this.showChildView('containerRegion', new RepertoireSummaryView({controller: this.controller, model: this.model, copy_mode: this.model.copy_mode}));
                break;
            case 'summary':
            default:
                this.showChildView('containerRegion', new RepertoireSummaryView({controller: this.controller, model: this.model}));
                break;
        }
    },

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

});

//
// The collection view for the list of repertoires
//
var RepertoireListView = Marionette.CollectionView.extend({
    template: Handlebars.compile(""),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        this.childView = RepertoireContainerView;
        this.childViewOptions = { controller: this.controller };
    },

});

// The button view
import repertoire_buttons from 'Templates/project/repertoires/project-repertoire-buttons.html';
var RepertoireButtonView = Marionette.View.extend({
    template: Handlebars.compile(repertoire_buttons),

    initialize: function(parameters) {
    },
});

// this manages repertoire layout
// shows all the repertoires in a list
// content display is handled by sub views
var RepertoireMainView = Marionette.View.extend({
    template: Handlebars.compile('<div id="repertoire-buttons"></div><div id="repertoire-list"></div>'),

    // one region for any repertoire buttons
    // one region for the repertoire collection
    regions: {
        buttonRegion: '#repertoire-buttons',
        listRegion: '#repertoire-list'
    },

    events: {
        'click #create-rep': 'createRepertoire',

        'click #project-repertoires-import': 'importMetadata',
        'click #project-repertoires-export': 'exportMetadata',
        //'click #edit-repertoire': 'editRepertoire',
        // 'click #save-repertoire': 'saveRepertoire',
    },

    initialize(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },

    // show a loading view, used while fetching the data
    showLoading() {
        this.showChildView('buttonRegion', new LoadingView({}));
    },

    showRepertoireList(repertoireList) {
        this.showChildView('buttonRegion', new RepertoireButtonView());
        this.showChildView('listRegion', new RepertoireListView({collection: repertoireList, controller: this.controller}));
    },

    importMetadata: function(e) {
        e.preventDefault();
        this.controller.showMetadataImport();
    },

    exportMetadata: function(e) {
        console.log('exportMetadata');
        e.preventDefault();
        this.model.exportMetadataToDisk();
    },

    createRepertoire(e) {
        console.log('createRepertoire');
        //e.preventDefault();

        // // Create an empty Repertoire object
        // this.currentRepertoire = new Repertoire({projectUuid: this.model.get('uuid')});
        // this.currentRepertoire.set('uuid',this.currentRepertoire.cid);
        //
        // // Add it to the list
        // this.repertoireList.add(this.currentRepertoire);

        // show the create form
        //var view = new CreateRepertoireView();
        //this.showChildView('createRegion', view);
    },

    // editRepertoire(edit_mode) {
        // console.log('editRepertoire function');

        // e.preventDefault();

        // $("#edit-repertoire").on("click", function() {
        //     $(this).addClass("no-display");
        //     $("#save-repertoire").removeClass("no-display");
        // });
    // },

    // saveRepertoire(e) {
    //     console.log('saveRepertoire');
    //     e.preventDefault();
    //
    //     // change the view mode back
    //     this.model.view_mode = 'summary';
    //     this.showRepertoireView();
    //
    //     // $('#save-repertoire').on("click", function() {
    //         // $(this).addClass("no-display");
    //         // $("#edit-repertoire").removeClass("no-display");
    //     // });
    // },
});

//
// Repertoire controller
// manages all the different repertoire views within a project
//
function RepertoireController(controller) {
    // upper level controller, i.e. the single project controller
    this.controller = controller;

    // the project model
    // we assume all the repertoire data is held by the controller
    this.model = this.controller.model;
    console.log(this.model);

    // repertoire list view
    this.mainView = new RepertoireMainView({controller: this, model: this.model});
    this.importView = null;
}

RepertoireController.prototype = {
    // return the main view, create it if necessary
    getView() {
        if (!this.mainView)
            this.mainView = new RepertoireMainView({controller: this, model: this.model});
        else if (this.mainView.isDestroyed())
            this.mainView = new RepertoireMainView({controller: this, model: this.model});
        return this.mainView;
    },

    // access data held by upper level controller
    getCollections() {
        return this.controller.getCollections();
    },

    getRepertoireList() {
        return this.controller.repertoireList;
    },

    getSampleList() {
        return this.controller.sampleList;
    },

    getSubjectList() {
        return this.controller.subjectList;
    },

    // show list of repertoires for the project
    showRepertoireList() {
        this.mainView.showRepertoireList(this.getRepertoireList());
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

};
export default RepertoireController;

