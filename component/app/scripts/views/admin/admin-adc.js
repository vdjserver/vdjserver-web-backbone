//
// admin-adc.js
// Administration of data repository
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2022 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
// Author: Ryan C. Kennedy
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

import templateHeader from 'Templates/admin/admin-header.html';
var AdminHeaderView = Marionette.View.extend({
    template: Handlebars.compile(templateHeader),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
//test Enable Button
this.enableADC_mode = true;
    },

    templateContext() {
        if (!this.controller) return {};
        //var current_sort = files['sort_by'];
        return {
//test Enable Button
enableADC_mode: this.enableADC_mode,
        //    current_sort: current_sort,
        //    hasEdits: this.controller.hasFileEdits()
        }
    },
});

import template from 'Templates/admin/admin-adc.html';
var ADCView = Marionette.View.extend({
    template: Handlebars.compile(template),

    initialize: function(parameters) {
      // our controller
      if (parameters && parameters.controller) {
          this.controller = parameters.controller;
      }
    },

    templateContext() {
      var repository_id, study_id, should_cache, is_cached, archive_file, download_url;

      if(this.model != null) {
        this.repository_id = this.model.get('repository_id');
        this.study_id = this.model.get('study_id');
        this.should_cache = this.model.get('should_cache');
        if(this.model.get('is_cached')) {
            this.is_cached = "Yes";
        } else {
            this.is_cached = "No";
        }
        this.archive_file = this.model.get('archive_file');
        this.download_url = this.model.get('download_url');
      }

      return {
          repository_id: this.repository_id,
          study_id: this.study_id,
          should_cache: this.should_cache,
          is_cached: this.is_cached,
          archive_file: this.archive_file,
          download_url: this.download_url,
      }
    },

    events: {
    },

});

var ADCListView = Marionette.CollectionView.extend({
    template: Handlebars.compile("<div></div>"),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller) {
            this.controller = parameters.controller;
        }

        this.childView = ADCView;
        this.childViewOptions = { controller: this.controller };
    },

    templateContext() {
    },
});

//
// List of projects for load/unload in data repository
//
export default Marionette.View.extend({
    template: Handlebars.compile('<div id="admin-adc-buttons"></div><div id="admin-adc-list"></div>'),

    // one region for the project content
    regions: {
        buttonRegion: '#admin-adc-buttons',
        listRegion: '#admin-adc-list'
    },

    initialize(parameters) {
        // our controller
        if (parameters && parameters.controller) {
            this.controller = parameters.controller;
        }

        var view = new ADCListView({collection: parameters.collection, controller: this.controller });
        this.showChildView('listRegion', view);
        var buttonsView = new AdminHeaderView({controller: this.controller});
        this.showChildView('buttonRegion', buttonsView);
    },

    events: {
        'click #admin-files-sort-select': 'sort' /*function(e) {
            // check it is a new sort
            var files = this.controller.getPairedList();
            var current_sort = files['sort_by'];
            if (e.target.name != current_sort) {
                this.controller.applySort(e.target.name);
                this.updateHeader();
            }
        }*/,
        'click #admin-refresh': 'refresh',
        'click #admin-enable-cache': 'enable',
        'click #admin-disable-cache': 'disable',
        'click #admin-clear-cache': 'clear',
        'click #admin-enableVDJ': 'enableVDJ',
        'click #admin-disableVDJ': 'disableVDJ',
    },
    sort: function(e) {
        e.preventDefault();
        console.log("Clicked Sort By");
    },
    refresh: function(e) {
        e.preventDefault();
        console.log("Clicked Refresh");
    },
    enable: function(e) {
        e.preventDefault();
        console.log("Clicked Enable Cache");
    },
    disable: function(e) {
        e.preventDefault();
        console.log("Clicked Disable Cache");
    },
    clear: function(e) {
        e.preventDefault();
        console.log("Clicked Clear");
    },
    enableVDJ: function(e) {
        e.preventDefault();
        console.log("Clicked Enable VDJServer Repository");
    },
    disableVDJ: function(e) {
        e.preventDefault();
        console.log("Clicked Disable VDJServer Repository");
    },

});

