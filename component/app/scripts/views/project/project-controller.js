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

import Project from 'Scripts/models/agave-project';
import ProjectList from 'Scripts/collections/agave-projects';
import ProjectListView from 'Scripts/views/project/project-list';
import PublicProjectCollection from 'Scripts/collections/agave-public-projects';
import SingleProjectController from 'Scripts/views/project/project-single-controller';
import LoadingView from 'Scripts/views/utilities/loading-view';
import CreateProjectView from 'Scripts/views/project/project-create';
import FilterController from 'Scripts/views/utilities/filter-controller';

// the main project view
var ProjectView = Marionette.View.extend({
    template: Handlebars.compile('<div id="project" class="general-padding"></div>'),

    // one region to show messages
    // one region for the project content
    regions: {
        projectRegion: '#project'
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
    },

    // show a loading view, used while fetching the data
    showLoading() {
        this.showChildView('projectRegion', new LoadingView({}));
    },

    showProjectList(projectList) {
        console.log(this.controller);
        var view = new ProjectListView({collection: projectList, controller: this.controller});
        this.showChildView('projectRegion', view);
    },

    showProjectPage(projectController) {
        console.log(this.controller);
        this.showChildView('projectRegion', projectController.getView());
    },

    showCreatePage(project) {
        var view = new CreateProjectView({model: project, controller: this.controller});
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
    this.currentProjectController = null;

    this.filterController = new FilterController(this, "adc_study");
    this.filterController.showFilter();
}

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
                that.filterController.showFilter();
            })
            .fail(function(error) {
            console.log(error);
            });
        } else {
            // projects already loaded
            // have the view display them
            this.projectView.showProjectList(this.projectList);
            this.filterController.showFilter();
        }
    },

    showProjectPage(projectUuid, page) {
        // clear the current project and controller
        this.currentProject = null;
        this.currentProjectController = null;

        var that = this;

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

            this.currentProject.fetch()
            .then(function() {
                console.log(that.currentProject);

                // have the view display it
                that.currentProjectController = new SingleProjectController(that.currentProject, page);
                that.projectView.showProjectPage(that.currentProjectController);
            })
            .fail(function(error) {
                // TODO: could not retrieve project
                // maybe the user does not have access, or the uuid is wrong
                // need to display some error message
                console.log(error);
            });
        } else {
            // have the view display it
            that.currentProjectController = new SingleProjectController(that.currentProject, page);
            that.projectView.showProjectPage(that.currentProjectController);
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
