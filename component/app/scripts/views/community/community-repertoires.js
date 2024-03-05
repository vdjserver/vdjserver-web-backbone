//
// community-repertoires.js
// Repertoire table for community data project
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

import repertoire_template from 'Templates/community/repertoire-row.html';
var RepertoireRowView = Marionette.View.extend({
    //tagName: 'tbody',
    template: Handlebars.compile(repertoire_template),
    regions: {
        detailRegion: '#repertoire-details'
    },

  //   initialize: function(parameters) {
  //     var detail_view = new RepertoireDetailView();
  //     this.showChildView('detailRegion', detail_view);
  // },

  events:  {
    'click .subject': 'showRepDetails',
    'click .sample': 'showRepDetails',
    'click .cell': 'showRepDetails',
    'click .tissue': 'showRepDetails',
  },

  showRepDetails(detail_view) {
      $(event.target).toggleClass("selected-details");

/* TODO: this needs to be reworked
      if ($(event.target).hasClass("subject selected-details")) {
         var detail_view = new RepertoireSubjectView();
         this.showChildView('detailRegion', detail_view);
     } else if ($(event.target).hasClass("sample selected-details")) {
         var detail_view = new RepertoireSampleView();
         this.showChildView('detailRegion', detail_view);
     } else if ($(event.target).hasClass("cell selected-details")) {
         var detail_view = new RepertoireCellView();
         this.showChildView('detailRegion', detail_view);
     } else if ($(event.target).hasClass("tissue selected-details")) {
         var detail_view = new RepertoireTissueView();
         this.showChildView('detailRegion', detail_view);
     }
      else { // nothing is selected, empty the view
          this.getRegion('detailRegion').empty();
      } */
  },

});

import repertoire_table_template from 'Templates/community/repertoire-table.html';
var RepertoireListView = Marionette.CollectionView.extend({
    //tagName: 'table',
    //className: 'table table-condensed table-bordered',
    template: Handlebars.compile(repertoire_table_template),
    childView: RepertoireRowView,
    // childViewContainer: 'tbody'
});

import repertoire_page_template from 'Templates/community/community-repertoire-paging.html';
var RepertoirePageView = Marionette.View.extend({
    template: Handlebars.compile(repertoire_page_template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
        if (parameters && parameters.repository_id)
            this.repository_id = parameters.repository_id;

        this.num_repertoires = parameters.num_repertoires;
        this.firstPageRecord = parameters.firstPageRecord;
        this.lastPageRecord = parameters.lastPageRecord;
        this.firstPage = parameters.firstPage;
        this.lastPage = parameters.lastPage;
    },

    templateContext() {
        return {
            num_repertoires: this.num_repertoires,
            firstPageRecord: this.firstPageRecord,
            lastPageRecord: this.lastPageRecord,
            firstPage: this.firstPage,
            lastPage: this.lastPage
        }
    },
});

import repertoires_template from 'Templates/community/community-repertoires.html';
var RepertoireTable = Marionette.View.extend({
    template: Handlebars.compile(repertoires_template),
    // one region for contents
    regions: {
        tableRegion: '#community-repertoires-table',
        pageRegion: '#community-repertoires-paging'
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

        this.num_repertoires = this.getNumRepertoires();
        this.firstPageRecord = (this.currentPage * this.pageQty) + 1;
        this.lastPageRecord = Math.min(this.num_repertoires, this.pageQty * (this.currentPage + 1));
        this.total_pages = Math.ceil(this.num_repertoires/this.pageQty);
        if(this.currentPage == 0) this.firstPage = true; else this.firstPage = false;
        if(this.currentPage == (this.total_pages - 1)) this.lastPage = true; else this.lastPage = false;

        var repos = this.model.get('repos');
        var repository = repos.get(this.repository_id);
        var objects = repository.get('repertoires');
        this.paginatedObjects = objects.clone();
        this.constructPages();
        this.dataView = new RepertoireListView({ collection: this.paginatedObjects });
        this.showChildView('tableRegion', this.dataView);
        this.pageView = new RepertoirePageView({ firstPageRecord: this.firstPageRecord, lastPageRecord: this.lastPageRecord, num_repertoires: this.num_repertoires, firstPage: this.firstPage, lastPage: this.lastPage });
        this.showChildView('pageRegion', this.pageView);
    },

    templateContext() {
        var num_repertoires = this.getNumRepertoires();
        var firstPageRecord = this.currentPage + 1;
        var lastPageRecord = Math.min(num_repertoires, this.pageQty * (this.currentPage + 1));
        var total_pages = Math.ceil(num_repertoires/this.pageQty);
        var lastPage = false;
        var firstPage = true;
        this.updatePageRecords();

        return {
            num_repertoires: num_repertoires,
            firstPageRecord : firstPageRecord,
            lastPageRecord : lastPageRecord
        }
    },

    constructPages() {
        var repos = this.model.get('repos');
        var repository = repos.get(this.repository_id);

        this.pages = [];
        var objects = repository.get('repertoires');

        for (var i = 0; i < objects.length; i += this.pageQty) {
          this.pages[i/this.pageQty] =
            objects.models.slice(i, i + this.pageQty);
        }
        this.paginatedObjects.reset(this.pages[this.currentPage]);
    },

    getNumRepertoires() {
        var repos = this.model.get('repos');
        var repository = repos.get(this.repository_id);
        var objects = repository.get('repertoires');
        return objects.length;
    },

    updatePageRecords() {
        this.firstPageRecord = (this.currentPage * this.pageQty) + 1;
        this.lastPageRecord = Math.min(this.getNumRepertoires(), this.pageQty * (this.currentPage + 1));
        this.total_pages = Math.ceil(this.getNumRepertoires()/this.pageQty);
        if(this.currentPage == 0) this.firstPage = true; else this.firstPage = false;
        if(this.currentPage == (this.total_pages - 1)) this.lastPage = true; else this.lastPage = false;
    },

    previousPage() {
        --this.currentPage;
        if (this.currentPage < 0) this.currentPage = 0;
        this.paginatedObjects.reset(this.pages[this.currentPage]);
        this.updatePageRecords();
        this.pageView = new RepertoirePageView({ firstPageRecord: this.firstPageRecord, lastPageRecord: this.lastPageRecord, num_repertoires: this.num_repertoires, firstPage: this.firstPage, lastPage: this.lastPage });
        this.showChildView('pageRegion', this.pageView);
    },

    nextPage() {
        ++this.currentPage;
        if (this.currentPage >= this.pages.length) this.currentPage = this.pages.length - 1;
        this.paginatedObjects.reset(this.pages[this.currentPage]);
        this.updatePageRecords();
        this.pageView = new RepertoirePageView({ firstPageRecord: this.firstPageRecord, lastPageRecord: this.lastPageRecord, num_repertoires: this.num_repertoires, firstPage: this.firstPage, lastPage: this.lastPage });
        this.showChildView('pageRegion', this.pageView);
    },

    pageSize(e) {
        var x = this.pageQty * this.currentPage;

        if(e.target.value != "All") this.pageQty = Number(e.target.value);
        else this.pageQty = this.getNumRepertoires();

        this.currentPage = Math.floor(x / this.pageQty);
        this.constructPages();
        this.dataView = new RepertoireListView({ collection: this.paginatedObjects });
        this.showChildView('tableRegion', this.dataView);
        this.updatePageRecords();
        this.pageView = new RepertoirePageView({ collection: this.paginatedObjects, firstPageRecord: this.firstPageRecord, lastPageRecord: this.lastPageRecord, num_repertoires: this.num_repertoires, firstPage: this.firstPage, lastPage: this.lastPage });
        this.showChildView('pageRegion', this.pageView);
    },

});

export default RepertoireTable;
