//
// subjects-list.js
// List of subjects for projects
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
import summary_template from 'Templates/project/subjects/subjects-summary.html';
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
import detail_template from 'Templates/project/subjects/subjects-detail.html';
var SubjectDetailView = Marionette.View.extend({
    template: Handlebars.compile(detail_template),
});

// Container view for subject detail
// There are three subject views: summary, detail and edit
// detail and edit are the same layout, but either in read or edit mode
var SubjectContainerView = Marionette.View.extend({
    template: Handlebars.compile('<div id="project-subject-container"></div>'),

    // one region for contents
    regions: {
        containerRegion: '#project-subject-container'
    },

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
        if (parameters && parameters.view_mode) {
            // save state in model instead of view
            // if editing, leave in edit
            if (this.model.view_mode != 'edit')
                this.model.view_mode = parameters.view_mode;
        }

        this.showSubjectView();
    },

    showSubjectView() {
        //console.log("passing edit_mode...");
        // Choose which view class to render
        switch (this.model.view_mode) {
            case 'detail':
                //this.getRegion('containerRegion').empty();
                this.showChildView('containerRegion',new SubjectDetailView({controller: this.controller, model: this.model}));
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
        if (parameters && parameters.view_mode)
            this.view_mode = parameters.view_mode;

        this.childView = SubjectContainerView;
        this.childViewOptions = { controller: this.controller, view_mode: this.view_mode };
    }
});

export default SubjectsListView;
