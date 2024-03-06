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
/*var SubjectsListView = Marionette.CollectionView.extend({
    template: Handlebars.compile("<div></div>"),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        this.childView = SubjectContainerView;
        this.childViewOptions = { controller: this.controller };
    },

});*/

import subject_template from 'Templates/community/subject-row.html';
var SubjectRowView = Marionette.View.extend({
    //tagName: 'tbody',
    template: Handlebars.compile(subject_template),
    regions: {
        detailRegion: '#subject-details'
    },
});

import subject_table_template from 'Templates/community/subject-table.html';
var SubjectListView = Marionette.CollectionView.extend({
    //tagName: 'table',
    //className: 'table table-condensed table-bordered',
    template: Handlebars.compile(subject_table_template),
    childView: SubjectRowView,
    // childViewContainer: 'tbody'
});

import subjects_page_template from 'Templates/community/community-subjects-paging.html';
var SubjectPageView = Marionette.View.extend({
    template: Handlebars.compile(subjects_page_template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
        if (parameters && parameters.repository_id)
            this.repository_id = parameters.repository_id;

        this.numSubjects = parameters.numSubjects;
        this.firstPageRecord = parameters.firstPageRecord;
        this.lastPageRecord = parameters.lastPageRecord;
        this.firstPage = parameters.firstPage;
        this.lastPage = parameters.lastPage;
    },

    templateContext() {
        return {
            numSubjects: this.numSubjects,
            firstPageRecord: this.firstPageRecord,
            lastPageRecord: this.lastPageRecord,
            firstPage: this.firstPage,
            lastPage: this.lastPage
        }
    },
});

import subjects_template from 'Templates/community/community-subjects.html';
var SubjectTable = Marionette.View.extend({
    template: Handlebars.compile(subjects_template),
    // one region for contents
    regions: {
        tableRegion: '#community-subjects-table',
        pageRegion: '#community-subjects-paging'
    },
    events:  {
        'click #pagination-previous-page': 'previousPage',
        'click #pagination-next-page': 'nextPage',
        'change #pagination-page-size': 'pageSize',
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

        this.numSubjects = this.getNumSubjects();
        this.firstPageRecord = (this.currentPage * this.pageQty) + 1;
        this.lastPageRecord = Math.min(this.numSubjects, this.pageQty * (this.currentPage + 1));
        this.totalPages = Math.ceil(this.numSubjects/this.pageQty);
        if(this.currentPage == 0) this.firstPage = true; else this.firstPage = false;
        if(this.currentPage == (this.totalPages - 1)) this.lastPage = true; else this.lastPage = false;

        var repos = this.model.get('repos');
        var repository = repos.get(this.repository_id);
        var objects = repository.get('subjects');
        this.paginatedObjects = objects.clone();

        this.constructPages();
        this.dataView = new SubjectListView({ collection: this.paginatedObjects });
        this.showChildView('tableRegion', this.dataView);
        this.pageView = new SubjectPageView({ firstPageRecord: this.firstPageRecord, lastPageRecord: this.lastPageRecord, numSubjects: this.numSubjects, firstPage: this.firstPage, lastPage: this.lastPage });
        this.showChildView('pageRegion', this.pageView);

    },

    templateContext() {
        var numSubjects = this.getNumSubjects();
        var firstPageRecord = this.currentPage + 1;
        var lastPageRecord = Math.min(numSubjects, this.pageQty * (this.currentPage + 1));
        var totalPages = Math.ceil(numSubjects/this.pageQty);
        var lastPage = false;
        var firstPage = true;
        this.updatePageRecords();

        return {
            numSubjects: numSubjects,
            firstPageRecord : firstPageRecord,
            lastPageRecord : lastPageRecord
        }
    },

    constructPages() {
        var repos = this.model.get('repos');
        var repository = repos.get(this.repository_id);

        this.pages = [];
        var objects = repository.get('subjects');

        for (var i = 0; i < objects.length; i += this.pageQty) {
          this.pages[i/this.pageQty] =
            objects.models.slice(i, i + this.pageQty);
        }
        this.paginatedObjects.reset(this.pages[this.currentPage]);
    },

    getNumSubjects() {
        var repos = this.model.get('repos');
        var repository = repos.get(this.repository_id);
        var objects = repository.get('subjects');
        return objects.length;
    },

    updatePageRecords() {
        this.firstPageRecord = (this.currentPage * this.pageQty) + 1;
        this.lastPageRecord = Math.min(this.getNumSubjects(), this.pageQty * (this.currentPage + 1));
        this.totalPages = Math.ceil(this.getNumSubjects()/this.pageQty);
        if(this.currentPage == 0) this.firstPage = true; else this.firstPage = false;
        if(this.currentPage == (this.totalPages - 1)) this.lastPage = true; else this.lastPage = false;
    },

    previousPage() {
        --this.currentPage;
        if (this.currentPage < 0) this.currentPage = 0;
        this.paginatedObjects.reset(this.pages[this.currentPage]);
        this.updatePageRecords();
        this.pageView = new SubjectPageView({ firstPageRecord: this.firstPageRecord, lastPageRecord: this.lastPageRecord, numSubjects: this.numSubjects, firstPage: this.firstPage, lastPage: this.lastPage });
        this.showChildView('pageRegion', this.pageView);
    },

    nextPage() {
        ++this.currentPage;
        if (this.currentPage >= this.pages.length) this.currentPage = this.pages.length - 1;
        this.paginatedObjects.reset(this.pages[this.currentPage]);
        this.updatePageRecords();
        this.pageView = new SubjectPageView({ firstPageRecord: this.firstPageRecord, lastPageRecord: this.lastPageRecord, numSubjects: this.numSubjects, firstPage: this.firstPage, lastPage: this.lastPage });
        this.showChildView('pageRegion', this.pageView);
    },

    pageSize(e) {
        var x = this.pageQty * this.currentPage;

        if(e.target.value != "All") this.pageQty = Number(e.target.value);
        else this.pageQty = this.getNumSubjects();

        this.currentPage = Math.floor(x / this.pageQty);
        this.constructPages();
        this.dataView = new SubjectListView({ collection: this.paginatedObjects });
        this.showChildView('tableRegion', this.dataView);
        this.updatePageRecords();
        this.pageView = new SubjectPageView({ collection: this.paginatedObjects, firstPageRecord: this.firstPageRecord, lastPageRecord: this.lastPageRecord, numSubjects: this.numSubjects, firstPage: this.firstPage, lastPage: this.lastPage });
        this.showChildView('pageRegion', this.pageView);
    },
});

export default SubjectTable;
