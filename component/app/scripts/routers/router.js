//
// router.js
// Manage URL routes
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

'use strict';
import Backbone from 'backbone';

// Private Methods
var _redirectToLogin = function() {
    // clear out app state
    App.AppController.clearControllers();

    // Routing should be done automatically when this happens.
    // App listens for destroy
    App.Agave.destroyToken();
};

var _routeWithTokenRefreshCheck = function(destinationRoute) {
    if (App.Agave.token().isActive()) {
        App.AppController.loadUserProfile()
            .then(function() {
                destinationRoute();
            })
    }
    else if (!App.Agave.token().isActive() && App.Agave.token().get('refresh_token')) {
        App.Agave.token().save()
            .then(function() {
                return App.AppController.loadUserProfile();
            })
            .then(function() {
                destinationRoute();
            })
            .fail(function() {
                _redirectToLogin();
            })
            ;
    }
    else {
        _redirectToLogin();
    }
};

export default Backbone.Router.extend({

    // order of routes matter as the first one that matches is used
    routes: {
        '':                                 'index',
        'auth/logout':                      'authLogout',

        // public user account pages
        'account':                          'createAccount',
        'password-reset(/:uuid)':           'forgotPassword',
        'account/pending(/:uuid)':          'verificationPending',
        'feedback':                         'feedback',

        // private user account pages
        'account/profile':                  'accountProfile',
        //'account/user-feedback':            'userFeedback',
        //'account/change-password':          'changePassword',

        // project pages
        'project':                          'projectList',
        'project/create':                   'createPage',
        'project/:id':                      'projectPage',
        'project/:id/subject-sample':       'projectSubjectSample',
        'project/:id/repertoire':           'projectRepertoire',
        'project/:id/group':                'projectGroup',
        'project/:id/file':                 'projectFile',
        'project/:id/analysis':             'projectAnalysis',
        'community':                        'communityPage',
        'community/':                       'communityPage',
        'community(/:uuid)':                'communityPage',
        //'community/addchart':               'addCommChart',
        //'project/:id/repertoire/create':           'createRepertoire',
        //'project/:id/repertoire/create/subject': 'addSubject',
        //'project/:id/repertoire/create/subject/diagnosis': 'addDiagnosis',
        //'project/:id/repertoire/create/sample': 'addSample',
        //'project/:id/repertoire/create/cell': 'addCell',
        //'project/:id/repertoire/create/nucleic': 'addNucleic',
        //'project/:id/group/create':         'addRepGroup',

        // admin pages
        'admin':                            'adminOverview',
        'admin/users':                      'adminUsers',
        'admin/jobs':                       'adminJobs',
        'admin/repository':                 'adminRepository',
        'admin/statistics':                 'adminStatistics',

        // 404
        '*notFound': 'notFound',
    },

    /*
        routeWithTokenRefreshCheck states

        Make sure the user profile is loaded

        A.) Token is good, continue routing as normal
        B.) Token is no longer active, but can probably be refreshed and route continued
        C.) All hope is lost
     */
    routeWithTokenRefreshCheck: function(destinationRoute) {
        this.redirectRoute = null;
        if (App.Agave.token().isActive()) {
            App.AppController.loadUserProfile()
                .then(function() {
                    destinationRoute();
                })
        }
        else if (!App.Agave.token().isActive() && App.Agave.token().get('refresh_token')) {
            App.Agave.token().save()
                .then(function() {
                    return App.AppController.loadUserProfile();
                })
                .then(function() {
                    destinationRoute();
                })
                .fail(function() {
                    this.redirectRoute = destinationRoute;
                    _redirectToLogin();
                })
                ;
        }
        else {
            this.redirectRoute = destinationRoute;
            _redirectToLogin();
        }
    },

    // Index
    index: function() {
        console.log('index route');

        // make sure to clear out any inactive token
        if (!App.Agave.token().isActive()) {
            App.Agave.token().clear();
            window.localStorage.removeItem('Agave.Token');

            // show home page
            App.AppController.showHomePage();
        }
        else {
            // otherwise go to project page
            App.router.navigate('/project', {
                trigger: true
            });
        }
    },
/*
    index: function() {
        console.log('index route');

        // go to community page
        App.router.navigate('/community', {
            trigger: true
        });
    }, */

    //
    // Public account pages
    //

    createAccount: function() {
        console.log('createAccount route');

        App.AppController.showCreateAccountPage();
    },

    forgotPassword: function(reset_code) {
        console.log('forgotPassword route');

        App.AppController.showForgotPasswordPage(reset_code);
    },

    verificationPending: function(verify_code) {
        console.log('verificationPending route');

        App.AppController.showVerificationPendingPage(verify_code);
    },

    feedback: function() {
        console.log('feedback route');

        if (!App.Agave.token().isActive()) {
            App.AppController.showPublicFeedbackPage();
        } else {
            App.AppController.showUserFeedbackPage();
        }
    },

    //
    // Private account pages
    //

    accountProfile: function() {
        console.log('accountProfile route');

        var destinationRoute = function() {
            App.AppController.showUserProfilePage();
        };
        this.routeWithTokenRefreshCheck(destinationRoute);
    },

    //
    // Project pages
    //

    // Project Summary List
    projectList: function() {
        console.log('projectList route');

        // check to see if redirect route after login
        if (this.redirectRoute) {
            this.routeWithTokenRefreshCheck(this.redirectRoute);
        } else {
            var destinationRoute = function() {
                App.AppController.showProjectList();
            };
            this.routeWithTokenRefreshCheck(destinationRoute);
        }
    },

    // For Single Project Page
    projectPage: function(projectUuid, page) {
        console.log('projectPage route');

        var destinationRoute = function() {
            App.AppController.showProjectPage(projectUuid, page);
        };
        this.routeWithTokenRefreshCheck(destinationRoute);
    },

    // Subject/Sample page for a project
    projectSubjectSample: function(projectUuid) {
        this.projectPage(projectUuid, 'subject-sample');
    },

    // Repertoire page for a project
    projectRepertoire: function(projectUuid) {
        this.projectPage(projectUuid, 'repertoire');
    },

    // Group page for a project
    projectGroup: function(projectUuid) {
        this.projectPage(projectUuid, 'group');
    },

    // File page for a project
    projectFile: function(projectUuid) {
        this.projectPage(projectUuid, 'file');
    },

    // Analysis page for a project
    projectAnalysis: function(projectUuid) {
        this.projectPage(projectUuid, 'analysis');
    },

    // Create page for a repertoire
    createRepertoire: function(projectUuid) {
        this.projectPage(projectUuid, 'createRepertoire');
    },

    // Add Subject page for a Repertoire
    addSubject: function(projectUuid) {
        this.projectPage(projectUuid, 'addSubject');
    },

    // Add Diagnosis page for a Repertoire
    addDiagnosis: function(projectUuid) {
        this.projectPage(projectUuid, 'addDiagnosis');
    },

    // Community Studies
    communityPage: function(projectUuid) {
        console.log('communityPage route');

        App.AppController.showCommunityPage(projectUuid);
    },

    // Create Community Chart Page
    addCommChart: function() {
        console.log('addCommChart route');

        App.AppController.showAddChart();
    },

    // For Create a Project Page
    createPage: function() {
        console.log('createPage route');

        var destinationRoute = function() {
            App.AppController.showCreatePage();
        };
        this.routeWithTokenRefreshCheck(destinationRoute);
    },

    // Files List
    // filesList: function() {
    //     console.log('filesList route');
    //
    //     var destinationRoute = function() {
    //         App.AppController.showFilesPage();
    //     };
    //     _routeWithTokenRefreshCheck(destinationRoute);
    // },

    // Auth
    authLogout: function() {
        _redirectToLogin();
    },

    //
    // Administration pages
    //
    adminPage: function(page) {
        if (! App.Agave.token().isAdmin(App.AppController.userProfile)) {
            this.index();
        } else {
            App.AppController.showAdminPage(page);
        }
    },

    // Overview administration page
    adminOverview: function() {
        this.adminPage('overview');
    },

    // Users administration page
    adminUsers: function() {
        this.adminPage('users');
    },

    // Jobs administration page
    adminJobs: function() {
        this.adminPage('jobs');
    },

    // Repository administration page
    adminRepository: function() {
        this.adminPage('repository');
    },

    // Statistics administration page
    adminStatistics: function() {
        this.adminPage('statistics');
    },

    // 404
    notFound: function() {
      console.log('not found');
    },
});


/*
    // Public Methods
    var DefaultRouter = Backbone.Router.extend({

        routes: {
            '':                                 'index',
            'account':                          'createAccount',
            'account/pending':                  'verificationPending',
            'account/verify/:id':               'verifyAccount',
            'account/profile':                  'accountProfile',
            'account/user-feedback':            'userFeedback',
            'account/change-password':          'changePassword',
            'auth/logout':                      'authLogout',
            'communityData':                    'community',
            'feedback':                         'feedback',
            'password-reset(/:uuid)':           'forgotPassword',
            'project':                          'projectIndex',
            'project/create':                   'projectCreate',
            'project/:id':                      'projectDetail',
            'project/:id/associations/qual':    'projectFileQualAssociations',
            'project/:id/associations/paired-reads': 'projectFilePairedReadAssociations',
            'project/:id/settings':             'projectSettings',
            'project/:id/metadata':             'projectMetadata',
            'project/:id/users':                'projectManageUsers',
            'project/:id/jobs':                 'projectJobHistory',
            'project/:id/jobs/:jobId':          'projectJobOutput',
            'community':                        'communityIndex',
            'community/:id':                    'communityDetail',
            'community/:id/settings':           'communitySettings',
            'community/:id/metadata':           'communityMetadata',
            'community/:id/jobs':               'communityJobHistory',
            'community/:id/jobs/:jobId':        'communityJobOutput',
            'software':                         'software',

            // 404
            '*notFound': 'notFound',
        },

        // Index
        index: function() {
            App.Routers.communityMode = false;

            if (!App.Agave.token().isActive()) {
                App.Agave.token().clear();
                window.localStorage.removeItem('Agave.Token');

                _setPublicSubviews();
                App.Layouts.main.setView('.content', new App.Views.Public.Home({model: App.Agave.token()}));
                App.Layouts.main.render();
            }
            else {
                App.router.navigate('/project', {
                    trigger: true
                });
            }
        },

        // Auth
        authLogout: function() {
            App.Routers.communityMode = false;

            // Routing *should* be handled automatically once the token is destroyed.
            App.Agave.destroyToken();
        },

        // Account
        createAccount: function() {
            App.Routers.communityMode = false;

            _setPublicSubviews();
            App.Layouts.main.setView('.content', new App.Views.Account.CreateAccount());
            App.Layouts.main.render();
        },

        // Verification Pending
        verificationPending: function() {
            App.Routers.communityMode = false;

            App.Routers.currentRouteView = 'verificationPending';
            _setPublicSubviews();
            App.Layouts.main.setView('.content', new App.Views.Account.VerificationPending());
            App.Layouts.main.render();
        },

        verifyAccount: function(verificationId) {
            App.Routers.communityMode = false;

            App.Routers.currentRouteView = 'verifyAccount';
            _setPublicSubviews();
            App.Layouts.main.setView('.content', new App.Views.Account.VerifyAccount({'verificationId': verificationId}));
            App.Layouts.main.render();
        },

        // Forgot Password
        forgotPassword: function(uuid) {
            App.Routers.communityMode = false;

            App.Routers.currentRouteView = 'forgotPassword';
            _setPublicSubviews();
            App.Layouts.main.setView('.content', new App.Views.ForgotPassword.Form({'uuid': uuid}));
            App.Layouts.main.render();
        },

        // Feedback
        feedback: function() {
            App.Routers.communityMode = false;

            App.Routers.currentRouteView = 'feedback';
            _setPublicSubviews();
            App.Layouts.main.setView('.content', new App.Views.Feedback.PublicForm());
            App.Layouts.main.render();
        },

        // Profile
        accountProfile: function() {
            App.Routers.communityMode = false;

            var destinationRoute = function() {
                _setProjectSubviews();
                App.Layouts.main.setView('.content', new App.Views.Profile.Main());
                App.Layouts.main.render();
            };

            App.Routers.currentRouteView = 'accountProfile';
            _routeWithTokenRefreshCheck(destinationRoute);
        },

        // User Feedback
        userFeedback: function() {
            App.Routers.communityMode = false;

            var destinationRoute = function() {
                _setProjectSubviews();
                App.Layouts.main.setView('.content', new App.Views.Feedback.UserForm());
                App.Layouts.main.render();
            };

            App.Routers.currentRouteView = 'userFeedback';
            _routeWithTokenRefreshCheck(destinationRoute);
        },

        // Change Password
        changePassword: function() {
            App.Routers.communityMode = false;

            var destinationRoute = function() {
                _setProjectSubviews();
                App.Layouts.main.setView('.content', new App.Views.Profile.Main({'subView':'ChangePasswordForm'}));
                App.Layouts.main.render();
            };

            App.Routers.currentRouteView = 'changePassword';
            _routeWithTokenRefreshCheck(destinationRoute);
        },

        // Projects

        projectIndex: function() {
            App.Routers.communityMode = false;

            var destinationRoute = function() {
                _setProjectSubviews();

                // Either load the index view before the fetch is done,
                // or load after the fetch is done.
                var projectListView = App.Layouts.sidebar.getView('.sidebar');
                projectListView.shouldLoadViewForIndex = true;

                if (projectListView.fetchDone === true) {
                    projectListView.loadViewForIndex();
                }

                App.Layouts.content.setView('.content', new App.Views.Projects.Index());

                App.Layouts.content.render();
            };

            App.Layouts.main = new App.Views.Layouts.MainLayout();
            App.Layouts.sidebar = new App.Views.Layouts.SidebarLayout();
            App.Layouts.content = new App.Views.Layouts.ContentLayout();

            App.Routers.currentRouteView = 'projectIndex';
            _routeWithTokenRefreshCheck(destinationRoute);
        },

        projectCreate: function() {
            App.Routers.communityMode = false;

            var destinationRoute = function() {
                _setProjectSubviews();
                App.Layouts.content.setView('.content', new App.Views.Projects.Create());
                App.Layouts.content.render();
            };

            App.Routers.currentRouteView = 'projectCreate';
            _routeWithTokenRefreshCheck(destinationRoute);
        },

        projectDetail: function(projectUuid) {
            App.Routers.communityMode = false;

            var destinationRoute = function() {
                _setProjectSubviews(
                    projectUuid,
                    App.Views.Sidemenu.List.Sections.ProjectFiles
                );

                App.Layouts.content.setView('.content', new App.Views.Projects.Detail({projectUuid: projectUuid}));
                App.Layouts.content.render();
            };

            App.Routers.currentRouteView = 'projectDetail';
            _routeWithTokenRefreshCheck(destinationRoute);
        },

        projectFilePairedReadAssociations: function(projectUuid) {
            App.Routers.communityMode = false;

            var destinationRoute = function() {
                _setProjectSubviews(
                    projectUuid,
                    App.Views.Sidemenu.List.Sections.ProjectPairedReadAssociations
                );

                App.Layouts.content.setView('.content', new App.Views.Projects.PairedReadFileAssociations({projectUuid: projectUuid}));
                App.Layouts.content.render();
            };

            App.Routers.currentRouteView = 'projectFilePairedReadAssociations';
            _routeWithTokenRefreshCheck(destinationRoute);
        },

        projectFileQualAssociations: function(projectUuid) {
            App.Routers.communityMode = false;

            var destinationRoute = function() {
                _setProjectSubviews(
                    projectUuid,
                    App.Views.Sidemenu.List.Sections.ProjectQualAssociations
                );

                App.Layouts.content.setView('.content', new App.Views.Projects.QualFileAssociations({projectUuid: projectUuid}));
                App.Layouts.content.render();
            };

            App.Routers.currentRouteView = 'projectFileQualAssociations';
            _routeWithTokenRefreshCheck(destinationRoute);
        },

        projectSettings: function(projectUuid) {
            App.Routers.communityMode = false;

            var destinationRoute = function() {
                _setProjectSubviews(
                    projectUuid,
                    App.Views.Sidemenu.List.Sections.ProjectSettings
                );

                App.Layouts.content.setView('.content', new App.Views.Projects.Settings({projectUuid: projectUuid}));
                App.Layouts.content.render();
            };

            App.Routers.currentRouteView = 'projectSettings';
            _routeWithTokenRefreshCheck(destinationRoute);
        },

        projectMetadata: function(projectUuid) {
            App.Routers.communityMode = false;

            var destinationRoute = function() {
                _setProjectSubviews(
                    projectUuid,
                    App.Views.Sidemenu.List.Sections.ProjectMetadata
                );

                App.Layouts.content.setView('.content', new App.Views.Projects.Metadata({projectUuid: projectUuid}));
                App.Layouts.content.render();
            };

            App.Routers.currentRouteView = 'projectMetadata';
            _routeWithTokenRefreshCheck(destinationRoute);
        },

        projectJobHistory: function(projectUuid, args) {
            App.Routers.communityMode = false;

            var paginationIndex = 1;
            if (_.isString(args)) {
                var tmpPaginationIndex = args.split('=')[1];

                if (parseInt(tmpPaginationIndex)) {
                    paginationIndex = parseInt(tmpPaginationIndex);
                }
            }

            var destinationRoute = function() {
                _setProjectSubviews(
                    projectUuid,
                    App.Views.Sidemenu.List.Sections.ProjectAnalyses
                );

                App.Layouts.content.setView('.content', new App.Views.Analyses.OutputList({projectUuid: projectUuid, paginationIndex: paginationIndex}));
                App.Layouts.content.render();
            };

            App.Routers.currentRouteView = 'projectJobHistory';
            _routeWithTokenRefreshCheck(destinationRoute);
        },

        projectJobOutput: function(projectUuid, jobId) {
            App.Routers.communityMode = false;

            var destinationRoute = function() {
                _setProjectSubviews(
                    projectUuid,
                    App.Views.Sidemenu.List.Sections.ProjectAnalyses
                );

                App.Layouts.content.setView('.content', new App.Views.Analyses.SelectAnalyses({projectUuid: projectUuid, jobId: jobId}));
                App.Layouts.content.render();
            };

            App.Routers.currentRouteView = 'projectJobOutput';
            _routeWithTokenRefreshCheck(destinationRoute);
        },

        // Community project data

        communityIndex: function() {
            App.Routers.communityMode = true;

            var destinationRoute = function() {
                _setProjectSubviews();

                // Either load the index view before the fetch is done,
                // or load after the fetch is done.
                var projectListView = App.Layouts.sidebar.getView('.sidebar');
                projectListView.shouldLoadViewForIndex = true;

                if (projectListView.fetchDone === true) {
                    projectListView.loadViewForIndex();
                }

                App.Layouts.content.setView('.content', new App.Views.Projects.Index());

                App.Layouts.content.render();
            };

            App.Layouts.main = new App.Views.Layouts.MainLayout();
            App.Layouts.sidebar = new App.Views.Layouts.SidebarLayout();
            App.Layouts.content = new App.Views.Layouts.ContentLayout();

            App.Routers.currentRouteView = 'projectIndex';
            destinationRoute();
        },

        communityDetail: function(projectUuid) {
            App.Routers.communityMode = true;

            var destinationRoute = function() {
                _setProjectSubviews(
                    projectUuid,
                    App.Views.Sidemenu.List.Sections.ProjectFiles
                );

                App.Layouts.content.setView('.content', new App.Views.Projects.Detail({projectUuid: projectUuid}));
                App.Layouts.content.render();
            };

            App.Routers.currentRouteView = 'projectDetail';
            destinationRoute();
        },

        communitySettings: function(projectUuid) {
            App.Routers.communityMode = true;

            var destinationRoute = function() {
                _setProjectSubviews(
                    projectUuid,
                    App.Views.Sidemenu.List.Sections.ProjectSettings
                );

                App.Layouts.content.setView('.content', new App.Views.Projects.Settings({projectUuid: projectUuid}));
                App.Layouts.content.render();
            };

            App.Routers.currentRouteView = 'projectSettings';
            destinationRoute();
        },

        communityMetadata: function(projectUuid) {
            App.Routers.communityMode = true;

            var destinationRoute = function() {
                _setProjectSubviews(
                    projectUuid,
                    App.Views.Sidemenu.List.Sections.ProjectMetadata
                );

                App.Layouts.content.setView('.content', new App.Views.Projects.Metadata({projectUuid: projectUuid}));
                App.Layouts.content.render();
            };

            App.Routers.currentRouteView = 'projectMetadata';
            destinationRoute();
        },

        communityJobHistory: function(projectUuid, args) {
            App.Routers.communityMode = true;

            var paginationIndex = 1;
            if (_.isString(args)) {
                var tmpPaginationIndex = args.split('=')[1];

                if (parseInt(tmpPaginationIndex)) {
                    paginationIndex = parseInt(tmpPaginationIndex);
                }
            }

            var destinationRoute = function() {
                _setProjectSubviews(
                    projectUuid,
                    App.Views.Sidemenu.List.Sections.ProjectAnalyses
                );

                App.Layouts.content.setView('.content', new App.Views.Analyses.OutputList({projectUuid: projectUuid, paginationIndex: paginationIndex}));
                App.Layouts.content.render();
            };

            App.Routers.currentRouteView = 'projectJobHistory';
            destinationRoute();
        },

        communityJobOutput: function(projectUuid, jobId) {
            App.Routers.communityMode = true;

            var destinationRoute = function() {
                _setProjectSubviews(
                    projectUuid,
                    App.Views.Sidemenu.List.Sections.ProjectAnalyses
                );

                App.Layouts.content.setView('.content', new App.Views.Analyses.SelectAnalyses({projectUuid: projectUuid, jobId: jobId}));
                App.Layouts.content.render();
            };

            App.Routers.currentRouteView = 'projectJobOutput';
            destinationRoute();
        },

        // Software
        software: function() {
            App.Routers.communityMode = false;

            var destinationRoute = function() {
                _setProjectSubviews();

                App.Layouts.content.setView('.content', new App.Views.Software.Index());
                App.Layouts.content.render();
            };

            App.Routers.currentRouteView = 'software';
            _routeWithTokenRefreshCheck(destinationRoute);
        },

        // 404
        notFound: function() {
            _setPublicSubviews();
            App.Layouts.main.setView('.content', new App.Views.NotFound.Error());
            App.Layouts.main.render();
        },

    });

    App.Routers.DefaultRouter = DefaultRouter;
    return DefaultRouter;
});
*/
