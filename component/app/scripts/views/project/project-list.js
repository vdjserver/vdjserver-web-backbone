//
// project-list.js
// List of user private projects
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

import template from 'Templates/project/project-list-summary.html';
import intro_template from 'Templates/project/intro.html';
import LoadingView from 'Scripts/views/utilities/loading-view';

var ProjectSummaryView = Marionette.View.extend({
    template: Handlebars.compile(template),
    tagName: 'div',
    className: 'community-project',

    templateContext() {
        var project_type = null;

        if (this.model.get('name') == 'archived_project') project_type = '<a class="badge badge-pill badge-archive">ARCHIVED</a> ';
        if (this.model.get('name') == 'public_project') project_type = '<a class="badge badge-pill badge-vdjserver">PUBLISHED</a> ';
        return {
            project_type: project_type
        }
    },

    events: {
      'click #edit-project': 'editProject',
      'click .study-desc-more': function(e) {
          // console.log("clicked expand for desc");
          $(event.target).parent(".community-study-desc").addClass("no-display");

          $(event.target).parent(".community-study-desc").siblings(".community-study-desc-full").removeClass("no-display");
      },
      'click .study-desc-collapse': function(e) {
          // console.log("clicked collapse for desc");
          $(event.target).parent(".community-study-desc-full").addClass("no-display");

          $(event.target).parent(".community-study-desc-full").siblings(".community-study-desc").removeClass("no-display");
      }
    },

  editProject: function(e) {
      console.log('child editProject');
      e.preventDefault();

      // navigate to the project page
      App.router.navigate('/project/' + this.model.get('uuid'), {trigger:true});
  },
});

var ProjectListView = Marionette.CollectionView.extend({
    template: Handlebars.compile("<div></div>"),
//     tagName: 'table',
//     className: 'table table-hover table-sm table-bordered',
    initialize: function(parameters) {
    this.childView = ProjectSummaryView;
  },
});

//
// List of private projects for the user
// welcome message at top with button to create a new project
//
export default Marionette.View.extend({
    template: Handlebars.compile(intro_template + '<div id="project-list"></div>'),

    // one region for the project content
    regions: {
        projectRegion: '#project-list'
    },

    initialize(parameters) {
        console.log('Initialize');
        console.log(parameters);

        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        var view = new ProjectListView({collection: parameters.collection, controller: this.controller});
        this.showChildView('projectRegion', view);
    },

    events: {
        'click #create-project': function() { this.controller.createProject(); }
    }

});
