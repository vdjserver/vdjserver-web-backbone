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

// Sidebar view
//import sidebar_template from '../../../templates/project/project-sidebar.html';
//var ProjectSidebarView = Marionette.View.extend({
//    template: Handlebars.compile(sidebar_template)
//});

// Project summary
import summary_template from '../../../templates/project/single-summary.html';
var ProjectSummaryView = Marionette.View.extend({
    template: Handlebars.compile(summary_template)
});

// Repertoire Groups Page
import groups_template from '../../../templates/project/groups.html';
var GroupsView = Marionette.View.extend({
    template: Handlebars.compile(groups_template)
});

// Project Files Page
import files_template from '../../../templates/project/files.html';
var FilesView = Marionette.View.extend({
    template: Handlebars.compile(files_template)
});

// Analyses Page
import analyses_template from '../../../templates/project/analyses.html';
var AnalysesView = Marionette.View.extend({
    template: Handlebars.compile(analyses_template)
});

// Project overview page
// TODO: merge create.html with this
import overview_template from '../../../templates/project/project-overview.html';
var ProjectOverView = Marionette.View.extend({
    template: Handlebars.compile(overview_template)
});

// Create new repertoire view
import create_template from '../../../templates/project/create-repertoire.html';
var CreateRepertoireView = Marionette.View.extend({
    template: Handlebars.compile(create_template)
});

// Repertoire view
import RepertoireController from 'repertoire-controller';

// Main project
import template from '../../../templates/project/single.html';
export default Marionette.View.extend({
    template: Handlebars.compile(template),

    // one region for the project summary
    // one region for the project detail
    regions: {
        summaryRegion: '#project-summary',
        detailRegion: '#project-detail'
    },

    initialize: function(parameters) {

        // show sidebar
        //this.sidebarView = new ProjectSidebarView({model: this.model});
        //this.showChildView('sidebarRegion', this.sidebarView);

        // show project summary
        this.summaryView = new ProjectSummaryView({model: this.model});
        this.showChildView('summaryRegion', this.summaryView);

        // are we routing to a specific page?
        if (parameters && parameters.page) {
            switch (parameters.page) {
                case 'repertoire':
                    this.showProjectRepertoires();
                    break;
                case 'group':
                    this.showProjectGroups();
                    break;
                case 'file':
                    this.showProjectFiles();
                    break;
                case 'analysis':
                    this.showProjectAnalyses();
                    break;
                case 'overview':
                default:
                    this.showProjectOverview();
                    break;
            }
        } else {
            // show project summary
            this.showProjectOverview();
        }

        // show repertoire as default for project detail
        // this.detailView = new RepertoireView();
        // this.showChildView('projectRegion', this.detailView);
    },

    events: {
        'click #overview-tab': function() {
            App.router.navigate('project/' + this.model.get('uuid'), {trigger: false});
            this.showProjectOverview();
        },

        // setting event for Repertoires page
        'click #repertoires-tab': function() {
            App.router.navigate('project/' + this.model.get('uuid') + '/repertoire', {trigger: false});
            this.showProjectRepertoires();
        },

        // setting event for Groups page
        'click #groups-tab': function() {
            App.router.navigate('project/' + this.model.get('uuid') + '/group', {trigger: false});
            this.showProjectGroups();
        },

        // setting event for Files page
        'click #files-tab': function() {
            App.router.navigate('project/' + this.model.get('uuid') + '/file', {trigger: false});
            this.showProjectFiles();
        },

        // setting event for Analyses page
        'click #analyses-tab': function() {
            App.router.navigate('project/' + this.model.get('uuid') + '/analysis', {trigger: false});
            this.showProjectAnalyses();
        },

        // setting event for Create a Repertoire page
        'click #create-rep': function() {
            App.router.navigate('project/' +
            this.model.get('uuid') + '/analysis', {trigger: false});
            this.showCreateRepertoire();
        }
    },

    showProjectOverview()
    {
        this.detailView = new ProjectOverView({model: this.model});
        this.showChildView('detailRegion', this.detailView);
    },

    showProjectRepertoires()
    {
        this.detailView = new RepertoireController({model: this.model});
        this.showChildView('detailRegion', this.detailView);
    },

    showProjectGroups()
    {
        this.detailView = new GroupsView({model: this.model});
        this.showChildView('detailRegion', this.detailView);
    },

    showProjectFiles()
    {
        this.detailView = new FilesView({model: this.model});
        this.showChildView('detailRegion', this.detailView);
    },

    showProjectAnalyses()
    {
        this.detailView = new AnalysesView({model: this.model});
        this.showChildView('detailRegion', this.detailView);
    },

    showCreateRepertoire()
    {
        this.detailView = new CreateRepertoireView({model: this.model});
        this.showChildView('detailRegion', this.detailView);
    },

});
