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

import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import { HandlebarsUtilities } from 'Scripts/views/utilities/handlebars-utilities';
import { Agave } from 'Scripts/backbone/backbone-agave';
import Router from 'Scripts/routers/router';

import { UserProfile } from 'Scripts/models/agave-tenant-user';

import PublicView from 'Scripts/views/app/public-views';
import CreateAccountView from 'Scripts/views/account/create-account';
import ForgotPasswordView from 'Scripts/views/account/password-reset';
import VerificationPendingView from 'Scripts/views/account/verification-pending';
import UserProfileView from 'Scripts/views/account/account-profile';
import PublicFeedbackView from 'Scripts/views/feedback/feedback-public';
import UserFeedbackView from 'Scripts/views/feedback/feedback-user';

import NavigationController from 'Scripts/views/app/navbar-controller';
import ProjectController from 'Scripts/views/project/project-controller';
import CommunityController from 'Scripts/views/community/community-controller';
import AdminController from 'Scripts/views/admin/admin-controller';

// AIRR Schema
import AIRRSchema from 'airr-schema';

// custom region to handle a bootstrap modal view
var ModalRegion = Marionette.Region.extend({
    constructor: function() {
        Marionette.Region.prototype.constructor.apply(this, arguments);
    },
});

// the bootstrap modal view
import modal_template from 'Templates/util/modal-message-confirm.html';
var ModalMessageConfirm = Marionette.View.extend({
    template: Handlebars.compile(modal_template),
    region: '#modal'
});

// Controller and view for the main regions for the application.
var ApplicationController = Marionette.View.extend({
    template: Handlebars.compile('<div id="navigation" class="navigation"></div><div id="main" class="p-0"></div><div id="modal"></div>'),

    // three regions:
    // one for the navigation bar
    // another for the main content
    // global modal region
    regions: {
        navigationRegion: '#navigation',
        mainRegion: '#main',
        modalRegion: {
            el: '#modal',
            regionClass: ModalRegion
        }
    },

    events: {
        // show and hide of modal
        'shown.bs.modal': 'onShownModal',
        'hidden.bs.modal': 'onHiddenModal',
    },

    initialize(options) {
        console.log('Initialize');

        // user profile available to whole app
        this.userProfile = null;

        // controllers
        this.clearControllers();

        // just a test to show schema is available
        console.log(AIRRSchema['Repertoire']);

        // create navigation bar
        this.navController = new NavigationController();
        this.showChildView('navigationRegion', this.navController);
    },

    clearControllers() {
        this.projectController = null;
        this.communityController = null;
        this.adminController = null;
    },

    showHomePage() {
        console.log('showHomePage');
        // tell navigation controller to display the nav bar
        this.navController.showNavigation();

        // show public view
        var view = new PublicView();
        this.showChildView('mainRegion', view);
    },

    showCreateAccountPage() {
        console.log('showCreateAccountPage');
        // tell navigation controller to display the nav bar
        this.navController.showNavigation();

        // show create account view
        var view = new CreateAccountView();
        this.showChildView('mainRegion', view);
    },

    showForgotPasswordPage(reset_code) {
        console.log('showForgotPasswordPage');
        // tell navigation controller to display the nav bar
        this.navController.showNavigation();

        // show create account view
        var view = new ForgotPasswordView({reset_code: reset_code});
        this.showChildView('mainRegion', view);
    },

    showVerificationPendingPage(verify_code) {
        console.log('showVerificationPendingPage');
        // tell navigation controller to display the nav bar
        this.navController.showNavigation();

        // show verify account view
        var view = new VerificationPendingView({verify_code: verify_code});
        this.showChildView('mainRegion', view);
    },

    showPublicFeedbackPage() {
        console.log('showPublicFeedbackPage');
        // tell navigation controller to display the nav bar
        this.navController.showNavigation();

        // show public feedback view
        var view = new PublicFeedbackView();
        this.showChildView('mainRegion', view);
    },

    showUserFeedbackPage() {
        console.log('showUserFeedbackPage');
        // tell navigation controller to display the nav bar
        this.navController.showNavigation();

        // show public feedback view
        var view = new UserFeedbackView();
        this.showChildView('mainRegion', view);
    },

    // This should be called after user login so that the user
    // profile and settings are available, returns a promise
    loadUserProfile() {
        var that = this;
        if (this.userProfile)
            return new Promise(function(resolve, reject) {
                resolve(that.userProfile);
            });

        var profile = new UserProfile();
        return profile.fetch()
            .then(function() {
                // now propagate loaded data to project
                that.userProfile = profile;
                return that.userProfile;
            })
            .fail(function(error) {
                console.log(error);
            });
    },

    showUserProfilePage() {
        console.log('showUserProfilePage');
        // tell navigation controller to display the nav bar
        this.navController.showNavigation();

        // show user profile view
        var view = new UserProfileView({ model: this.userProfile });
        this.showChildView('mainRegion', view);
    },

    reloadProjectList() {
        // remove the project controller so all the project data is reloaded
        this.projectController = null;
        App.router.navigate('/project', {'trigger': true});
    },

    showProjectList() {
        console.log('showProjectList');

        // create project controller if needed
        if (! this.projectController) {
          this.projectController = new ProjectController();
        }
        this.showChildView('mainRegion', this.projectController.getView());

        // tell navigation controller to display the nav bar
        this.navController.showNavigation();

        // tell project controller to display the project list page
        this.projectController.showProjectList();
    },

    showProjectPage(projectUuid, page) {
        console.log('showProjectPage');

        // create "project" controller if needed
        if (! this.projectController) {
          this.projectController = new ProjectController();
        }
        this.showChildView('mainRegion', this.projectController.getView());

        // tell "navigation" controller to display the nav bar
        this.navController.showNavigation();

        // tell "project" controller to display the project page
        this.projectController.showProjectPage(projectUuid, page);
    },

    showCommunityPage(projectUuid) {
        console.log('showCommunityPage');

        // create community controller if needed
        if (! this.communityController) {
          this.communityController = new CommunityController();
        }
        this.showChildView('mainRegion', this.communityController.getView());

        // tell navigation controller to display the nav bar
        this.navController.showNavigation();

        // tell controller to display the project list page
        this.communityController.showProjectList(projectUuid);
    },

    showAddChart() {
        console.log('showAddCommChart from app.js');
        // create community controller if needed
        if (! this.communityController) {
          this.communityController = new CommunityController();
        }
        this.showChildView('mainRegion', this.communityController.getView());

        // tell navigation controller to display the nav bar
        this.navController.showNavigation();

        // tell controller to display the add a chart page
        this.communityController.showAddChart();
    },

    showCreatePage() {
        console.log('showCreatePage');

        // create project controller if needed
        if (! this.projectController) {
          this.projectController = new ProjectController();
        }
        this.showChildView('mainRegion', this.projectController.getView());

        // tell navigation controller to display the nav bar
        this.navController.showNavigation();

        // tell project controller to display the create project page
        this.projectController.showCreatePage();
    },

    // Administration pages
    showAdminPage(page) {
        console.log('showAdminMain');

        if (! this.adminController) {
            this.adminController = new AdminController();
        }

        this.showChildView('mainRegion', this.adminController.getView());

        // tell navigation controller to display the nav bar
        this.navController.showNavigation();

        // tell project controller to display the create project page
        this.adminController.showAdminPage(page);
    },

    // Using repertoire controller to display information about a specific repertoire
    // showRepPage() {
    //     console.log('showRepPage');
    //
    // },

    // A single modal region is used for the whole application
    // This mainly attaches the view to the region
    // View creation and logic resides in the particular subview
    // The subview performs the show and hide of the modal
    // The show and hide events are captured and routed to given functions
    startModal(modalView, modalContext, onShowFunction, onHideFunction) {
        console.log('showModal');

        this.modalContext = modalContext;
        this.onShowFunction = onShowFunction;
        this.onHideFunction = onHideFunction;

        this.showChildView('modalRegion', modalView);
    },

    emptyModal() {
        if (this.getChildView('modalRegion')) this.getChildView('modalRegion').empty();
    },

    onShownModal() {
        console.log('App: Show the modal');
        if (this.onShowFunction) this.onShowFunction(this.modalContext);
    },

    onHiddenModal() {
        console.log('App: Hide the modal');
        if (this.onHideFunction) this.onHideFunction(this.modalContext);
    },

});


// The main application
export default Marionette.Application.extend({
  region: '#app',

  initialize(options) {
    console.log('Initialize');

    // setup Agave
    this.Agave = new Agave({token: JSON.parse(window.localStorage.getItem('Agave.Token'))});

    // Handlebars is global so register all helpers once for the whole app
    HandlebarsUtilities.registerAllHelpers();

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
