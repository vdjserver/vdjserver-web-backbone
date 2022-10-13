//
// admin-repository.js
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

import template_buttons from 'Templates/admin/admin-repository-buttons.html';
var AdminButtonView = Marionette.View.extend({
    template: Handlebars.compile(template_buttons),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },

    templateContext() {
        return {
            //current_sort: current_sort,
            //hasEdits: this.controller.hasFileEdits()
        }
    },
});

import template from 'Templates/admin/admin-repository.html';
var RepositoryLoadView = Marionette.View.extend({
    template: Handlebars.compile(template),

    initialize: function(parameters) {
      // our controller
      if (parameters && parameters.controller) {
          this.controller = parameters.controller;
          this.loaded_mode = parameters.loaded_mode;
      }
    },

    templateContext() {
      var loaded_mode, inACollection, show_0, show_1, enable_0, enable_1;
      var collection_0, collection_1, isLoaded_0, isLoaded_1;
      var repertoireMetadataLoaded_0, repertoireMetadataLoaded_1;
      var rearrangementDataLoaded_0, rearrangementDataLoaded_1;
      loaded_mode = inACollection = show_0 = show_1 = enable_0 = enable_1 = false;
      collection_0 = collection_1 = isLoaded_0 = isLoaded_1 = false;
      repertoireMetadataLoaded_0 = repertoireMetadataLoaded_1 = false;
      rearrangementDataLoaded_0 = rearrangementDataLoaded_1 = false;
      if(this.model.load_0 != null) {
        this.collection_0 = this.model.load_0.get('value').collection;
        if(this.collection_0.length > 0) {
          this.inACollection = true;
          this.show_0 = true;
        }
        if(this.model.load_0.get('value').shouldLoad) {
          this.enable_0 = false;
        } else {
          this.enable_0 = true;
        }
        if(this.model.load_0.get('value').isLoaded) {
          this.isLoaded_0 = "Loaded";
          this.loaded_mode = true;
        } else {
          this.isLoaded_0 = "Not Loaded";
          this.loaded_mode = false;
        }
        if(this.model.load_0.get('value').repertoireMetadataLoaded) {
          this.repertoireMetadataLoaded_0 = "True";
        } else {
          this.repertoireMetadataLoaded_0 = "False";
        }
        if(this.model.load_0.get('value').rearrangementDataLoaded) {
          this.rearrangementDataLoaded_0 = "True";
        } else {
          this.rearrangementDataLoaded_0 = "False";
        }
      } else {
        this.show_0 = false;
      }

      if(this.model.load_1 != null) {
        this.collection_1 = this.model.load_1.get('value').collection;
        if(this.collection_1.length > 0) {
          this.inACollection = true;
          this.show_1 = true;
        }
        if(this.model.load_1.get('value').shouldLoad) {
          this.enable_1 = false;
        } else {
          this.enable_1 = true;
        }
        if(this.model.load_1.get('value').isLoaded) {
          this.isLoaded_1 = "Loaded";
        } else {
          this.isLoaded_1 = "Not Loaded";
        }
        if(this.model.load_1.get('value').repertoireMetadataLoaded) {
          this.repertoireMetadataLoaded_1 = "True";
        } else {
          this.repertoireMetadataLoaded_1 = "False";
        }
        if(this.model.load_1.get('value').rearrangementDataLoaded) {
          this.rearrangementDataLoaded_1 = "True";
        } else {
          this.rearrangementDataLoaded_1 = "False";
        }
      } else {
        this.show_1 = false;
      }
      if(!this.inACollection) {
        this.show_0 = false; this.show_1 = false;
        this.loaded_mode = false;
      }

      return {
          loaded_mode: this.loaded_mode,
          inACollection: this.inACollection,
          show_0: this.show_0,
          show_1: this.show_1,
          enable_0: this.enable_0,
          enable_1: this.enable_1,
          collection_0: this.collection_0,
          collection_1: this.collection_1,
          isLoaded_0: this.isLoaded_0,
          isLoaded_1: this.isLoaded_1,
          repertoireMetadataLoaded_0: this.repertoireMetadataLoaded_0,
          repertoireMetadataLoaded_1: this.repertoireMetadataLoaded_1,
          rearrangementDataLoaded_0: this.rearrangementDataLoaded_0,
          rearrangementDataLoaded_1: this.rearrangementDataLoaded_1,
      }
    },

    events: {
        'click #admin-load-repo': 'loadRepo',
        'click #admin-unload-repo': 'unloadRepo',
        'click #admin-reload-repo': 'reloadRepo',
        'click #admin-enableLoad_0_mode': 'enableLoad_0',
        'click #admin-disableLoad_0_mode': 'disableLoad_0',
        'click #admin-enableLoad_1_mode': 'enableLoad_1',
        'click #admin-disableLoad_1_mode': 'disableLoad_1',
    },

    loadRepo: function(e) {
        e.preventDefault();
        console.log("Clicked Load");
    },
    unloadRepo: function(e) {
        console.log("Clicked Unload");
    },
    reloadRepo: function(e) {
        e.preventDefault();
        console.log("Clicked Reload");
    },
    enableLoad_0: function(e) {
        e.preventDefault();
        console.log("Clicked Enable Load_0");
    },
    disableLoad_0: function(e) {
        e.preventDefault();
        console.log("Clicked Disable Load_0");
    },
    enableLoad_1: function(e) {
        e.preventDefault();
        console.log("Clicked Enable Load_1");
    },
    disableLoad_1: function(e) {
        e.preventDefault();
        console.log("Clicked Disable Load_1");
    },
});

var RepositoryLoadListView = Marionette.CollectionView.extend({
    template: Handlebars.compile("<div></div>"),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller) {
            this.controller = parameters.controller;
            this.loaded_mode = parameters.loaded_mode;
        }

        this.childView = RepositoryLoadView;
        this.childViewOptions = { controller: this.controller, loaded_mode: this.loaded_mode };
    },

    templateContext() {
        return {
            loaded_mode: this.loaded_mode,
        }
    },
});

//
// List of projects for load/unload in data repository
//
export default Marionette.View.extend({
    template: Handlebars.compile('<div id="admin-repository-buttons"></div><div id="admin-repository-list"></div>'),

    // one region for the project content
    regions: {
        buttonRegion: '#admin-repository-buttons',
        listRegion: '#admin-repository-list'
    },

    initialize(parameters) {
        // our controller
        if (parameters && parameters.controller) {
            this.controller = parameters.controller;
            this.loaded_mode = parameters.loaded_mode;
        }

        var view = new RepositoryLoadListView({collection: parameters.collection, controller: this.controller, loaded_mode: this.loaded_mode});
        this.showChildView('listRegion', view);
        var buttonsView = new AdminButtonView({controller: this.controller});
        this.showChildView('buttonRegion', buttonsView);
    },

    templateContext() {
        return {
            loaded_mode: this.loaded_mode,
        }
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
        'click #admin-enableADC': 'enableADC',
        'click #admin-disableADC': 'disableADC',
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
    enableADC: function(e) {
        e.preventDefault();
        console.log("Clicked Enable ADC Download Cache");
    },
    disableADC: function(e) {
        e.preventDefault();
        console.log("Clicked Disable ADC Download Cache");
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

