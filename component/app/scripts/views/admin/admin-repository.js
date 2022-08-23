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

import template from 'Templates/admin/admin-repository.html';
var RepositoryLoadView = Marionette.View.extend({
    template: Handlebars.compile(template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller) {
            this.controller = parameters.controller;
            this.loaded_mode = parameters.loaded_mode;
            this.collection = parameters.collection;
        }
    },

    templateContext() {
        return {
            loaded_mode: this.loaded_mode,
            collection: this.collection,
        }
    },

    events: {
    },

});

var RepositoryLoadListView = Marionette.CollectionView.extend({
    template: Handlebars.compile("<div></div>"),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller) {
            this.controller = parameters.controller;
            this.loaded_mode = parameters.loaded_mode;
            this.collection = parameters.collection;
        }

        this.childView = RepositoryLoadView;
        this.childViewOptions = { controller: this.controller, loaded_mode: this.loaded_mode, collection: this.collection };
    },

    templateContext() {
        return {
            loaded_mode: this.loaded_mode,
            collection: this.collection,
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
            this.collection = parameters.collection;
        }

        var view = new RepositoryLoadListView({collection: parameters.collection, controller: this.controller, loaded_mode: this.loaded_mode});
        this.showChildView('listRegion', view);
    },

    templateContext() {
        return {
            loaded_mode: this.loaded_mode,
            collection: this.collection,
        }
    },

});
