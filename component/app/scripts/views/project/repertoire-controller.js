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
import SingleRepView from 'rep-view';
import LoadingView from 'loading-view';
import { Repertoire, Subject, Diagnosis } from 'agave-metadata';
import { RepertoireCollection, SubjectCollection, DiagnosisCollection } from 'agave-metadata-collections';

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

// Summary view for a single repertoire
import rep_summary_template from '../../../templates/project/repertoire-summary.html';
var RepertoireSummaryView = Marionette.View.extend({
    template: Handlebars.compile("<table class='table table-borderless table-sm'>" + rep_summary_template + "</table>"),

});

// Expanded view for a single repertoire
// TODO: do we use this same expanded view for both read-only and editing?
// We can do that with variables and Handlebars to generate different HTML
// or we can have different views that we swap between.
import single_rep from '../../../templates/project/single-repertoire.html';
var RepertoireExpandedView = Marionette.View.extend({
    template: Handlebars.compile(single_rep),

});

// The collection view for the list of repertoires
var RepertoireListView = Marionette.CollectionView.extend({
    template: Handlebars.compile(""),

    initialize: function(parameters) {
        this.childView = RepertoireSummaryView;
    },
});

// The header view
import repertoire_header from '../../../templates/project/repertoires.html';
var RepertoireHeaderView = Marionette.View.extend({
    template: Handlebars.compile(repertoire_header),

    initialize: function(parameters) {
    },
});

// this manages displaying repertoire content
// TODO: right now the controller and view are combined, will likely separate later
export default Marionette.View.extend({
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
        'click #save-repertoire': 'saveRepertoire'
    },

    initialize(options) {
        console.log('Initialize');

        // TODO: cache these lists
        this.repertoireList = new RepertoireCollection({projectUuid:this.model.get('uuid')});
        this.subjectList = new SubjectCollection({projectUuid:this.model.get('uuid')});

        var that = this;

        // show a loading view while fetching the data
        this.showChildView('listRegion', new LoadingView({}));

        // fetch the repertoires
        this.repertoireList.fetch()
            .then(function() {
                // fetch the subjects
                return that.subjectList.fetch();
            })
            .then(function() {
                console.log(that.repertoireList);
                // have the view display them
                that.showChildView('headerRegion', new RepertoireHeaderView());
                that.showChildView('listRegion', new RepertoireListView({collection: that.repertoireList}));
            })
            .fail(function(error) {
                console.log(error);
            });

/*
        var m = new Repertoire({projectUuid: this.model.get('uuid')});
        m.set('uuid',m.cid);
        this.repertoireList.add(m);
        m = new Repertoire({projectUuid: this.model.get('uuid')});
        m.set('uuid',m.cid);
        this.repertoireList.add(m);
        m = new Repertoire({projectUuid: this.model.get('uuid')});
        m.set('uuid',m.cid);
        this.repertoireList.add(m);
        this.currentRepertoire = m;

        this.showChildView('headerRegion', new RepertoireHeaderView());
        this.showChildView('listRegion', new RepertoireListView({collection: this.repertoireList}));
*/
    },

    createRepertoire(e) {
        console.log('createRepertoire');
        e.preventDefault();

        // Create an empty Repertoire object
        this.currentRepertoire = new Repertoire({projectUuid: this.model.get('uuid')});
        this.currentRepertoire.set('uuid',this.currentRepertoire.cid);

        // Add it to the list
        this.repertoireList.add(this.currentRepertoire);

        // show the create form
        //var view = new CreateRepertoireView();
        //this.showChildView('createRegion', view);
    },

    editRepertoire(e) {
        console.log('editRepertoire');
        $("#edit-repertoire").on("click", function() {
            $(this).addClass("no-display");
            $("#save-repertoire").removeClass("no-display");
            $(".repertoire-name").removeClass("hide");
            $(".repertoire-desc").removeClass("hide");
        });
    },

    saveRepertoire(e) {
        console.log('saveRepertoire');
        $('#save-repertoire').on("click", function() {
            $(this).addClass("no-display");
            $("#edit-repertoire").removeClass("no-display");
            $(".repertoire-name").addClass("hide");
            $(".repertoire-desc").addClass("hide");
        });
    },

    showDetails(e) {
        console.log('expandRepertoire');
        // e.preventDefault();
        $("#show-details").on("click", function() {
            $(this).removeClass("fa-chevron-up");
            $(this).addClass("fa-chevron-down");
        })
    },

});
