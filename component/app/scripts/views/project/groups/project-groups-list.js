//
// project-groups-list.js
// List of repertoire groups for projects
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

// Groups summary view
import summary_template from 'Templates/project/groups/project-groups-summary.html';
var GroupsSummaryView = Marionette.View.extend({
    template: Handlebars.compile(summary_template),

    templateContext() {
        return {
            age_display: this.model.getAgeDisplay(),
            species_display: this.model.getSpeciesDisplay(),
        }
    },

});

// Groups detail/edit view
import detail_template from 'Templates/project/groups/project-groups-detail.html';
var GroupsDetailView = Marionette.View.extend({
    template: Handlebars.compile(detail_template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

    },

    templateContext() {
        console.log(this.model);
        return {
            view_mode: this.model.view_mode
        }
    },

    onAttach() {
        // setup popovers and tooltips
        $('[data-toggle="popover"]').popover({
            trigger: 'hover'
        });

        $('[data-toggle="tooltip"]').tooltip();
    },

});

// Container view for Groups detail
// There are three Groups views: summary, detail and edit
// detail and edit are the same layout, but either in read or edit mode
var GroupsContainerView = Marionette.View.extend({
    template: Handlebars.compile('<div id="project-groups-container"></div>'),

    // one region for contents
    regions: {
        containerRegion: '#project-groups-container'
    },

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        // save state in model
        // if editing, leave in edit
        // get default view mode from controller
        if (this.model.view_mode != 'edit')
            this.model.view_mode = this.controller.getAnalysesViewMode();

        this.showGroupsView();
    },

    showGroupsView() {
        //console.log("passing edit_mode...");
        // Choose which view class to render
        switch (this.model.view_mode) {
            case 'detail':
            case 'edit':
                this.showChildView('containerRegion',new GroupsDetailView({controller: this.controller, model: this.model}));
                break;
            case 'summary':
            default:
                this.showChildView('containerRegion', new GroupsSummaryView({controller: this.controller, model: this.model}));
                break;
        }
    },

});

// list of analyses
var AnalysesListView = Marionette.CollectionView.extend({
    template: Handlebars.compile("<div></div>"),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        this.childView = GroupsContainerView;
        this.childViewOptions = { controller: this.controller };
    }
});

export default AnalysesListView;
