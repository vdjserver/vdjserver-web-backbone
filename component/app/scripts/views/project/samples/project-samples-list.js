//
// project-files-list.js
// List of files for projects
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2021 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
// Author: Olivia Dorsey <olivia.dorsey@utsouthwestern.edu>
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
import summary_template from 'Templates/project/samples/project-samples-summary.html';
var SampleSummaryView = Marionette.View.extend({
    template: Handlebars.compile(summary_template),

    templateContext() {
        //console.log(this.model);
        var value = this.model.get('value');
        let target_loci = [];
        for (let i = 0; i < value['pcr_target'].length; ++i)
            target_loci.push(value['pcr_target'][i]['pcr_target_locus']);

        return {
            target_loci: target_loci
        }
    },

});

import detail_template from 'Templates/project/samples/project-samples-detail.html';
var SampleDetailView = Marionette.View.extend({
    template: Handlebars.compile(detail_template),

  events: {
  },

});

// Container view for sample detail
// There are three sample views: summary, detail and edit
// detail and edit are the same layout, but either in read or edit mode
var SampleContainerView = Marionette.View.extend({
    template: Handlebars.compile('<div id="project-sample-container"></div>'),

    // one region for contents
    regions: {
        containerRegion: '#project-sample-container'
    },

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        // save state in model
        // if editing, leave in edit
        // get default view mode from controller
        if (this.model.view_mode != 'edit')
            this.model.view_mode = this.controller.getViewMode();

        this.showSubjectView();
    },

    showSubjectView() {
        //console.log("passing edit_mode...");
        // Choose which view class to render
        switch (this.model.view_mode) {
            case 'detail':
            case 'edit':
                this.showChildView('containerRegion', new SampleDetailView({controller: this.controller, model: this.model}));
                break;
            case 'summary':
            default:
                this.showChildView('containerRegion', new SampleSummaryView({controller: this.controller, model: this.model}));
                break;
        }
    },

});

var SamplesListView = Marionette.CollectionView.extend({
    template: Handlebars.compile("<div></div>"),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        this.childView = SampleContainerView;
        this.childViewOptions = { controller: this.controller };
    },
});

export default SamplesListView;