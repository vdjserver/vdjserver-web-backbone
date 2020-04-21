//
// project-single.js
// Manages all the views for a single project
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2020 The University of Texas Southwestern Medical Center
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
import Bootstrap from 'bootstrap';
import Project from 'agave-project';
import { Repertoire, Subject, Diagnosis } from 'agave-metadata';
import { RepertoireCollection, SubjectCollection, DiagnosisCollection } from 'agave-metadata-collections';

// Sidebar view
import sidebar_template from '../../../templates/project/project-sidebar.html';
var ProjectSidebarView = Marionette.View.extend({
    template: Handlebars.compile(sidebar_template)
});

// Project summary view
// TODO: merge create.html with this
import summary_template from '../../../templates/project/single-summary.html';
// import summary_template from '../../../templates/project/single-summary.html';
var ProjectSummaryView = Marionette.View.extend({
    template: Handlebars.compile(summary_template)
});

// Create new repertoire view
import create_template from '../../../templates/project/create-rep.html';
var CreateRepertoireView = Marionette.View.extend({
    template: Handlebars.compile(create_template)
});

// Repertoire view
import repertoire_template from '../../../templates/project/repertoire-detail.html';
var RepertoireView = Marionette.View.extend({
    template: Handlebars.compile(repertoire_template),

    regions: {
        createRegion: '#new-repertoire-entry'
    },

    createRepertoire() {
        // TODO: need to create an empty Repertoire object

        // show the create form
        var view = new CreateRepertoireView();
        this.showChildView('createRegion', view);
    },
});

// Main project
import template from '../../../templates/project/single.html';
export default Marionette.View.extend({
    template: Handlebars.compile(template),

    // one region for the sidebar
    // one region for the project summary
    // one region for the project detail
    regions: {
        sidebarRegion: '#project-sidebar',
        summaryRegion: '#project-summary',
        projectRegion: '#project-detail',
    },

    initialize: function(parameters) {

        // show sidebar
        this.sidebarView = new ProjectSidebarView();
        this.showChildView('sidebarRegion', this.sidebarView);

        // show project summary
        this.summaryView = new ProjectSummaryView({model: this.model});
        this.showChildView('summaryRegion', this.summaryView);

        // show repertoire as default for project detail
        this.detailView = new RepertoireView();
        this.showChildView('projectRegion', this.detailView);
    },

    events: {
        'click #create-rep': function() { this.detailView.createRepertoire(); }
    },


});
