//
// community-subjects.js
// Subject table for community data project
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

// subject summary view
import summary_template from 'Templates/community/community-subjects-summary.html';
var SubjectSummaryView = Marionette.View.extend({
    template: Handlebars.compile(summary_template),

    templateContext() {
        return {
            age_display: this.model.getAgeDisplay(),
            species_display: this.model.getSpeciesDisplay(),
        }
    },

});

// subject detail/edit view
//import detail_template from 'Templates/project/subjects/subjects-detail.html';
//var SubjectDetailView = Marionette.View.extend({
//    template: Handlebars.compile(detail_template),
//});

// Container view for subject detail
// There are two subject views: summary and detail
var SubjectContainerView = Marionette.View.extend({
    template: Handlebars.compile('<div id="community-subject-container"></div>'),

    // one region for contents
    regions: {
        containerRegion: '#community-subject-container'
    },

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        this.showSubjectView();
    },

    showSubjectView() {
        //console.log("passing edit_mode...");
        // Choose which view class to render
        switch (this.model.view_mode) {
            case 'detail':
                //this.showChildView('containerRegion', new RepertoireExpandedView({controller: this.controller, model: this.model, edit_mode: this.model.edit_mode}));
                break;
            case 'edit':
                //this.showChildView('containerRegion', new RepertoireExpandedView({controller: this.controller, model: this.model, edit_mode: this.model.edit_mode}));
                break;
            case 'summary':
            default:
                this.showChildView('containerRegion', new SubjectSummaryView({controller: this.controller, model: this.model}));
                break;
        }
    },

});

// list of subjects
var SubjectsListView = Marionette.CollectionView.extend({
    template: Handlebars.compile("<div></div>"),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        this.childView = SubjectContainerView;
        this.childViewOptions = { controller: this.controller };
    },

});

import subjects_template from 'Templates/community/community-subjects.html';
var SubjectsView = Marionette.View.extend({
    template: Handlebars.compile(subjects_template),
    // one region for contents
    regions: {
        tableRegion: '#community-subjects-table'
    },
    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
        if (parameters && parameters.repository_id)
            this.repository_id = parameters.repository_id;

        // pagination of data table
        this.pageQty = 10;
        this.currentPage = 0;
        this.constructPages();
        this.dataView = new SubjectsListView({ collection: this.paginatedObjects });
        this.showChildView('tableRegion', this.dataView);
    },

    constructPages() {
        // TODO: handle multiple repositories
        //var repository_id = this.model.get('repository')[0];
        var repos = this.model.get('repos');
        var repository = repos.get(this.repository_id);

        this.pages = [];
        var objects = repository.get('subjects');
        this.paginatedObjects = objects.clone();

        for (var i = 0; i < objects.length; i += this.pageQty) {
          this.pages[i/this.pageQty] =
            objects.models.slice(i, i + this.pageQty);
        }
        this.paginatedObjects.reset(this.pages[this.currentPage]);
    },
});

export default SubjectsView;