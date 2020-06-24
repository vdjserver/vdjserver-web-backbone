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

import rs_header_template from 'Templates/project/repertoire-summary-header.html';
var RepertoireSummaryHeaderView = Marionette.View.extend({
    template: Handlebars.compile(rs_header_template),
});

import rs_subject_template from 'Templates/project/repertoire-summary-subject.html';
var RepertoireSummarySubjectView = Marionette.View.extend({
    template: Handlebars.compile(rs_subject_template),
});

import rs_sample_template from 'Templates/project/repertoire-summary-sample.html';
var RepertoireSummarySampleView = Marionette.View.extend({
    template: Handlebars.compile(rs_sample_template),
});

import rs_stats_template from 'Templates/project/repertoire-summary-statistics.html';
var RepertoireSummaryStatisticsView = Marionette.View.extend({
    template: Handlebars.compile(rs_stats_template),
});

// Summary view for a single repertoire
// Short multi-line summary, meant for showing in a list
// the model for the view is a repertoire
// we access related data (subject, sample, etc) through the controller
import rep_summary_template from 'Templates/project/repertoire-summary.html';
var RepertoireSummaryView = Marionette.View.extend({
    template: Handlebars.compile("<div'>" + rep_summary_template + "</div>"),

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
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        this.showChildView('headerRegion', new RepertoireSummaryHeaderView({model: this.model}));

        // get the subject for this repertoire
        var value = this.model.get('value');
        var subjectList = this.controller.getSubjectList();
        var subject = subjectList.get(value['subject']['vdjserver_uuid']);
        this.showChildView('subjectRegion', new RepertoireSummarySubjectView({model: subject}));

        // get the samples for this repertoire

        // get the repertoire statistics
        this.showChildView('statisticsRegion', new RepertoireSummaryStatisticsView({model: this.model}));
    },

});

// Expanded view for a single repertoire
// TODO: do we use this same expanded view for both read-only and editing?
// We can do that with variables and Handlebars to generate different HTML
// or we can have different views that we swap between.
import single_rep from 'Templates/project/single-repertoire.html';
var RepertoireExpandedView = Marionette.View.extend({
    template: Handlebars.compile(single_rep),

});

// The collection view for the list of repertoires
var RepertoireListView = Marionette.CollectionView.extend({
    template: Handlebars.compile(""),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        this.childView = RepertoireSummaryView;
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

        'click #show-details': 'showDetails',
        'click #edit-repertoire': 'editRepertoire',
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

    editRepertoire(e) {
        console.log('editRepertoire');
        e.preventDefault();

        // $("#edit-repertoire").on("click", function() {
            $(this).addClass("no-display");
            $("#save-repertoire").removeClass("no-display");

            $(this).closest("#save-repertoire").removeClass("no-display");

            $(".repertoire-name").removeClass("no-display");
            $(".repertoire-desc").removeClass("no-display");
        // });
    },

    saveRepertoire(e) {
        console.log('saveRepertoire');
        e.preventDefault();

        // $('#save-repertoire').on("click", function() {
            $(this).addClass("no-display");
            $("#edit-repertoire").removeClass("no-display");
            $(".repertoire-name").addClass("no-display");
            $(".repertoire-desc").addClass("no-display");
        // });
    },

    showDetails(e) {
        console.log('expandRepertoire');
        e.preventDefault();

        // $("#show-details").click(function () {
            $(this).closest("#details").toggleClass("collapse");
            $("#show-details").toggleClass("down");
        // });
    }
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
