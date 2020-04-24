//
// app.js
// Main Application object
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
import { Agave } from 'backbone-agave';
import Router from 'router';

import PublicView from 'public-views';
// import IntroView from 'intro-view';
import NavigationController from 'navbar-controller';
import ProjectController from 'project-controller';
import CommunityController from 'community-controller';

// AIRR Schema
import AIRRSchema from 'airr-schema';

// Controller and view for the main regions for the application.
var ApplicationController = Marionette.View.extend({
  template: Handlebars.compile('<div id="navigation"></div><div id="main"></div>'),

  // two primary regions:
  // one for the navigation bar
  // the other for the main content
  regions: {
    navigationRegion: '#navigation',
    mainRegion: '#main'
  },

  initialize(options) {
    console.log('Initialize');

    // just a test to show schema is available
    console.log(AIRRSchema['Repertoire']);

    // create navigation bar
    this.navController = new NavigationController();
    this.showChildView('navigationRegion', this.navController);
  },

  showHomePage() {
    console.log('showHomePage');
    // tell navigation controller to display its public nav bar
    this.navController.showPublicNavigation();

    // show public view
    var view = new PublicView();
    this.showChildView('mainRegion', view);
  },

  showProjectList() {
    console.log('showProjectList');

    // create project controller if needed
    if (! this.projectController) {
      this.projectController = new ProjectController();
    }
    this.showChildView('mainRegion', this.projectController.getView());

    // tell navigation controller to display its private nav bar
    this.navController.showPrivateNavigation();

    // tell project controller to display the project list page
    this.projectController.showProjectList();
  },

  showProjectPage(projectUuid) {
    console.log('showProjectPage');

    // create "project" controller if needed
    if (! this.projectController) {
      this.projectController = new ProjectController();
    }
    this.showChildView('mainRegion', this.projectController.getView());

    // tell "navigation" controller to display its private nav bar
    this.navController.showPrivateNavigation();

    // tell "project" controller to display the project page
    this.projectController.showProjectPage(projectUuid);
  },

  showCommunityList() {
    console.log('showCommunityList');

    // create community controller if needed
    if (! this.communityController) {
      this.communityController = new CommunityController();
    }
    this.showChildView('mainRegion', this.communityController);

    // tell navigation controller to display its public nav bar
    this.navController.showPublicNavigation();

    // tell controller to display the project list page
    this.communityController.showProjectList();
  },

    showCreatePage() {
        console.log('showCreatePage');

        // create project controller if needed
        if (! this.projectController) {
          this.projectController = new ProjectController();
        }
        this.showChildView('mainRegion', this.projectController.getView());

        // tell navigation controller to display its private nav bar
        this.navController.showPrivateNavigation();

        // tell project controller to display the create project page
        this.projectController.showCreatePage();
  },

});


// The main application
export default Marionette.Application.extend({
  region: '#app',

  initialize(options) {
    console.log('Initialize');

    // setup Agave
    this.Agave = new Agave({token: JSON.parse(window.localStorage.getItem('Agave.Token'))});

    // setup application controller
    this.AppController = new ApplicationController();
    this.showView(this.AppController);

    // setup router
    this.router = new Router();

    // token is saved into browser local storage
    // if users does a page refresh, retrieve it versus require a new login
    this.listenTo(
        this.Agave.token(),
        'change',
        function() {
            // Necessary for browser refresh...
            window.localStorage.setItem('Agave.Token', JSON.stringify(App.Agave.token().toJSON()));
        }
    );

    // remove token from browser local storage if it is invalid
    this.listenTo(
        this.Agave.token(),
        'destroy',
        function() {
            App.Agave.token().clear();
            window.localStorage.removeItem('Agave.Token');
            App.router.navigate('', {'trigger': true});
        }
    );
  },

  onStart() {
    console.log('onStart');

    // start up backbone router
    Backbone.history.start({pushState: true});

    // this is to trap clicks on hrefs and route them through Backbone's router
    $(document).on('click', 'a[href]:not([data-bypass])', function(evt) {
        var href = {
            prop: $(this).prop('href'),
            attr: $(this).attr('href')
        };

        var root = location.protocol + '//' + location.host;

        if (href.prop.slice(0, root.length) === root) {
            evt.preventDefault();
            Backbone.history.navigate(href.attr, true);
        }
    });


  },

});
