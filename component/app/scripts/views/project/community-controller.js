//
// community-controller.js
// Manages all the public project views
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
import ProjectList from 'Scripts/collections/agave-public-projects';
import ProjectListView from 'Scripts/views/project/project-list';
import ProjectPageView from 'Scripts/views/project/project-single';
import LoadingView from 'Scripts/views/utilities/loading-view';

// Community controller
//
// this manages displaying project content
export default Marionette.View.extend({
    template: Handlebars.compile('<div id="intro"><h1>Welcome!</h1><p>Welcome to the Community Projects page!</p><div id="project">'),
  // one region for the project content
  regions: {
    introRegion: '#intro',
    projectRegion: '#project',
  },

  initialize(options) {
    console.log('Initialize');
    this.projectList = null;
    this.currentProject = null;
  },

  // displaying intro text before Project List
  showIntro: function() {
      // create view for intro text

      var that = this;
      var introView = new IntroView({});
      that.showChildView('introRegion', introView);
  },

  showProjectList: function() {
    if (! this.projectList) {
        this.projectList = new ProjectList();

        var that = this;

        // show a loading view while fetching the data
        that.showChildView('projectRegion', new LoadingView({}));

        // load the projects
        this.projectList.fetch()
        .then(function() {
            console.log(that.projectList);
            // create view with project data
            var view = new ProjectListView({collection: that.projectList});
            that.showChildView('projectRegion', view);
        })
        .fail(function(error) {
          console.log(error);
        });
    } else {
        // projects already loaded
        // we need to create a new view each time
        var view = new ProjectListView({collection: this.projectList});
        this.showChildView('projectRegion', view);
    }
  },

  showProjectPage(projectUuid) {
    // if project list is not loaded yet, just fetch the single project
    if (! this.projectList) {
        this.currentProject = new Project({uuid: projectUuid});
        var that = this;
        this.currentProject.fetch()
            .then(function() {
                console.log(that.project);

                var view = new ProjectPageView({model: that.currentProject});
                this.showChildView('projectRegion', view);
                //that.showChildView('singleRegion', view);
            })
            .fail(function(error) {
                console.log(error);
            });
    } else {
        // get project from the list
        this.currentProject = this.projectList.get(projectUuid);
        if (! this.currentProject) {
            // ERROR: could not find project!
        }

        // show the current project view
        var view = new ProjectPageView({model: this.currentProject});
        this.showChildView('projectRegion', view);
    }
  },
});
