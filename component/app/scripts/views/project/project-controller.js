//
// project-controller.js
// Manages all the private project views
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

import Project from 'agave-project';
import ProjectList from 'agave-projects';
import ProjectListView from 'project-list';
import ProjectPageView from 'project-single';
import intro_template from '../../../templates/project/intro.html';
import LoadingView from 'loading-view';
import CreateProjectView from 'create-view';

// the main project view
var ProjectView = Marionette.View.extend({
    template: Handlebars.compile('<div id="intro">' + intro_template + '</div><div id="project">'),

    // one region to show messages
    // one region for the project content
    regions: {
        introRegion: '#intro',
        projectRegion: '#project',
    },

    initialize(parameters) {
        console.log('Initialize');
        console.log(parameters);

        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },

    events: {
        'click #create-project': function() { this.controller.createProject(); },
        'click #create-rep': 'createRep'
    },

    // show a loading view, used while fetching the data
    showLoading() {
        this.showChildView('projectRegion', new LoadingView({}));
    },

    // displaying intro text before Project List
    showIntroView() {
        this.showChildView('introRegion', new IntroView());
    },

    clearIntroView() {
        this.getRegion('introRegion').empty();
    },

    showProjectList(projectList) {
        console.log(this.controller);
        var view = new ProjectListView({collection: projectList});
        this.showChildView('projectRegion', view);
    },

    showProjectPage(project, page, isNew) {
        this.clearIntroView();
        console.log(this.controller, isNew);
        var view = new ProjectPageView({model: project, page: page});
        this.showChildView('projectRegion', view);
    },

    showCreatePage(project) {
        this.clearIntroView();
        var view = new CreateProjectView({model: project});
        this.showChildView('projectRegion', view);
    },
});

//
// Project controller
// manages all the different project views
//
function ProjectController() {
    // the project view
    this.projectView = new ProjectView({controller: this});

    // maintain state across multiple views
    this.projectList = null;
    this.currentProject = null;
};

ProjectController.prototype = {
    // return the main view, create it if necessary
    getView() {
        if (!this.projectView)
            this.projectView = new ProjectView({controller: this});
        else if (this.projectView.isDestroyed())
            this.projectView = new ProjectView({controller: this});
        return this.projectView;
    },

    // show list of private projects for user
    showProjectList() {
        if (! this.projectList) {
            this.projectList = new ProjectList();

            var that = this;

            // show a loading view while fetching the data
            this.projectView.showLoading();

            // load the projects
            this.projectList.fetch()
            .then(function() {
                console.log(that.projectList);
                // have the view display them
                that.projectView.showProjectList(that.projectList);
            })
            .fail(function(error) {
            console.log(error);
            });
        } else {
            // projects already loaded
            // have the view display them
            this.projectView.showProjectList(this.projectList);
        }
    },

    showProjectPage(projectUuid, page, isNew) {
        // clear the current project
        this.currentProject = null;

        // if project list is loaded, get from list
        if (this.projectList) {
            this.currentProject = this.projectList.get(projectUuid);
            if (! this.currentProject) {
                // Not in list,
                // maybe list is out of date, so clear it
                this.projectList = null;
            }
        }

        // If no project then fetch it
        if (! this.currentProject) {
            this.currentProject = new Project({uuid: projectUuid});
            var that = this;
            this.currentProject.fetch()
            .then(function() {
                console.log(that.currentProject);

                // have the view display it
                that.projectView.showProjectPage(that.currentProject, page, isNew);
            })
            .fail(function(error) {
                // TODO: could not retrieve project
                // maybe the user does not have access, or the uuid is wrong
                // need to display some error message
                console.log(error);
            });
        } else {
            // have the view display it
            this.projectView.showProjectPage(this.currentProject, page, isNew);
        }
    },

    createProject: function() {
        console.log('controller createProject');

        // Navigate to the "Create a Project" page
        //
        // Because we are already the project controller, no need to actually
        // trigger the route, just set the route then show the page
        App.router.navigate('/project/create', {trigger:false});
        this.showCreatePage();
    },

    showCreatePage() {
        console.log('showCreatePage');

        // create empty Project model
        this.currentProject = new Project();

        // display
        this.projectView.showCreatePage(this.currentProject);
    }
};
export default ProjectController;
