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
import SingleRepView from 'Scripts/views/project/rep-view';
import LoadingView from 'Scripts/views/utilities/loading-view';
import { Repertoire, Subject, Diagnosis } from 'Scripts/models/agave-metadata';
import { RepertoireCollection, SubjectCollection, DiagnosisCollection, SampleCollection } from 'Scripts/collections/agave-metadata-collections';

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
import summary_header_template from 'Templates/project/repertoire-summary-header.html';
var RepertoireSummaryHeaderView = Marionette.View.extend({
    template: Handlebars.compile(summary_header_template),
    className: "row",
    regions: {
        editHeaderRegion: '#edit-mode-header'
    },

    initialize: function(parameters) {
        // show in read-only mode by default
        this.edit_mode = false;

        // our controller
        if (parameters) {
            if (parameters.controller) this.controller = parameters.controller;
            if (parameters.edit_mode) this.edit_mode = parameters.edit_mode;
        }
    },

        // setting up templateContext
        templateContext() {
            return {
                // if edit mode is true, then fields should be editable
                edit_mode: this.edit_mode,
            }
        },

        events: {
            'click #edit-repertoire': function() {
                this.editRepertoire(true);
            }
        },

        editRepertoire(edit_mode) {
            console.log('editRepertoire function from header');

            var view = new RepertoireSummaryHeaderView({controller: this.controller, model: this.model, edit_mode: edit_mode});

            this.showChildView('editHeaderRegion', view);
        }
});

import summary_subject_template from 'Templates/project/repertoire-summary-subject.html';
var RepertoireSummarySubjectView = Marionette.View.extend({
    template: Handlebars.compile(summary_subject_template),
    className: "row"
});

import summary_sample_template from 'Templates/project/repertoire-summary-sample.html';
var RepertoireSummarySampleView = Marionette.View.extend({
    template: Handlebars.compile(summary_sample_template),
    className: "row"
});

import summary_stats_template from 'Templates/project/repertoire-summary-statistics.html';
var RepertoireSummaryStatisticsView = Marionette.View.extend({
    template: Handlebars.compile(summary_stats_template),
    className: "row"
});

// Summary view for a single repertoire
// Short multi-line summary, meant for showing in a list
// the model for the view is a repertoire
// we access related data (subject, sample, etc) through the controller
import rep_summary_template from 'Templates/project/repertoire-summary-new.html';
var RepertoireSummaryView = Marionette.View.extend({
    template: Handlebars.compile(rep_summary_template),

    // one region for any header content
    // one region for subject summary
    // one region for sample summary
    // one region for repertoire statistics
    regions: {
        editStatusRegion: '#edit-rep-status',
        headerRegion: '#repertoire-summary-header',
        subjectRegion: '#repertoire-summary-subject',
        sampleRegion: '#repertoire-summary-sample',
        statisticsRegion: '#repertoire-summary-statistics'
    },

    initialize: function(parameters) {
        // show in read-only mode by default
        // this.edit_mode = false;

        // our controller
        if (parameters) {
            if (parameters.controller) this.controller = parameters.controller;
            // if (parameters.edit_mode) this.edit_mode = parameters.edit_mode;
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

    // setting up templateContext
    templateContext() {
        // return {
        //     // if edit mode is true, then fields should be editable
        //     edit_mode: this.edit_mode,
        // }
    },

    events: {
        // 'click #edit-repertoire': function() {
        //     this.editRepertoire(true);
        // }
    },

    editRepertoire(edit_mode) {
        console.log('editRepertoire function');

        var view = new RepertoireSummaryView({controller: this.controller, model: this.model, edit_mode: edit_mode});
        this.showChildView('editStatusRegion', view);
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

import expand_header_template from 'Templates/project/repertoire-expand-header.html';
var RepertoireExpandedHeaderView = Marionette.View.extend({
    template: Handlebars.compile(expand_header_template),
    className: "row"
});

import expand_subject_template from 'Templates/project/repertoire-expand-subject.html';
var RepertoireExpandedSubjectView = Marionette.View.extend({
    template: Handlebars.compile(expand_subject_template),
    className: "row"
});

import expand_sample_template from 'Templates/project/repertoire-expand-sample.html';
var RepertoireExpandedSampleView = Marionette.View.extend({
    template: Handlebars.compile(expand_sample_template),
    className: "row"
});

import expand_stats_template from 'Templates/project/repertoire-expand-statistics.html';
var RepertoireExpandedStatisticsView = Marionette.View.extend({
    template: Handlebars.compile(expand_stats_template),
    className: "row"
});

// Expanded view for a single repertoire
//
// TODO: do we use this same expanded view for both read-only and editing?
// We can do that with variables and Handlebars to generate different HTML
// or we can have different views that we swap between.
import rep_expanded_template from 'Templates/project/repertoire-expand.html';
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
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        this.showChildView('headerRegion', new RepertoireExpandedHeaderView({model: this.model}));

        // get the subject for this repertoire
        var value = this.model.get('value');
        var subjectList = this.controller.getSubjectList();
        var subject = subjectList.get(value['subject']['vdjserver_uuid']);
        this.showChildView('subjectRegion', new RepertoireExpandedSubjectView({model: subject}));

        // TODO: get the samples for this repertoire
        // samples is a collection of models
        this.showChildView('sampleRegion', new RepertoireExpandedSampleView());

        // get the repertoire statistics
        this.showChildView('statisticsRegion', new RepertoireExpandedStatisticsView({model: this.model}));
    },

});

//
// Repertoire edit views
// this makes all data in the repertoire editable
//

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
    },

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        this.showRepertoireView();
    },

    showRepertoireView() {
        // Choose which view class to render
        switch (this.model.view_mode) {
            case 'expand':
                this.showChildView('containerRegion', new RepertoireExpandedView({controller: this.controller, model: this.model}));
                break;
            case 'edit':
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

// The header view
import repertoire_header from 'Templates/project/repertoires.html';
var RepertoireHeaderView = Marionette.View.extend({
    template: Handlebars.compile(repertoire_header),

    initialize: function(parameters) {
    },
});

// this manages repertoire layout
// shows all the repertoires in a list
// content display is handled by sub views
var RepertoireMainView = Marionette.View.extend({
    template: Handlebars.compile('<div id="repertoire-header"></div><div id="repertoire-list"></div>'),

    // one region for any header content
    // one region for the repertoire collection
    regions: {
        headerRegion: '#repertoire-header',
        listRegion: '#repertoire-list'
    },

    events: {
        'click #create-rep': 'createRepertoire',

        //'click #show-details': 'showDetails',
        //'click #edit-repertoire': 'editRepertoire',
        'click #save-repertoire': 'saveRepertoire',
    },

    initialize(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },

    // show a loading view, used while fetching the data
    showLoading() {
        this.showChildView('headerRegion', new LoadingView({}));
    },

    showRepertoireList(repertoireList) {
        this.showChildView('headerRegion', new RepertoireHeaderView());
        this.showChildView('listRegion', new RepertoireListView({collection: repertoireList, controller: this.controller}));
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
        //
        //     $(this).closest("#save-repertoire").removeClass("no-display");
        //
        //     $(".repertoire-name").removeClass("no-display");
        //     $(".repertoire-desc").removeClass("no-display");
        // // });
    // },

    saveRepertoire(e) {
        console.log('saveRepertoire');
        e.preventDefault();

        // $('#save-repertoire').on("click", function() {
            // $(this).addClass("no-display");
            // $("#edit-repertoire").removeClass("no-display");
            // $(".repertoire-name").addClass("no-display");
            // $(".repertoire-desc").addClass("no-display");
        // });
    },
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
    this.mainView = new RepertoireMainView({controller: this});
};

RepertoireController.prototype = {
    // return the main view, create it if necessary
    getView() {
        if (!this.mainView)
            this.mainView = new RepertoireMainView({controller: this});
        else if (this.mainView.isDestroyed())
            this.mainView = new RepertoireMainView({controller: this});
        return this.mainView;
    },

    // access data held by upper level controller
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

};
export default RepertoireController;
