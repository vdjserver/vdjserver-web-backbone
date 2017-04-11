define(['app'], function(App) {

    'use strict';

    // Private Methods
    var _redirectToLogin = function() {
        // Routing should be done automatically when this happens.
        App.Agave.destroyToken();
    };

    /*
        routeWithTokenRefreshCheck states

        A.) Token is good, continue routing as normal
        B.) Token is no longer active, but can probably be refreshed and route continued
        C.) All hope is lost
     */
    var _routeWithTokenRefreshCheck = function(destinationRoute) {
        if (App.Agave.token().isActive()) {
            destinationRoute();
        }
        else if (!App.Agave.token().isActive() && App.Agave.token().get('refresh_token')) {
            App.Agave.token().save()
                .done(function() {
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

    var _setPublicSubviews = function() {
        if (App.Layouts.main.template !== 'layouts/public') {
            App.Layouts.main.template = 'layouts/public/public-wrapper';

            App.Layouts.main.setView('#nav-container', new App.Views.Navbar.Public());
        }
    };

    var _setProjectSubviews = function(projectUuid, section) {

        if (App.Layouts.main.template !== 'layouts/project/project-wrapper') {
            App.Layouts.main.template = 'layouts/project/project-wrapper';
            App.Layouts.main.setView('#sidebar-wrapper', App.Layouts.sidebar);
            App.Layouts.main.setView('#main-wrapper', App.Layouts.content);
            App.Layouts.main.render();
        }

        App.Routers.currentProjectUuid = projectUuid;

        if (!App.Layouts.sidebar.getView('.sidebar')) {
            App.Layouts.sidebar.setView(
                '.sidebar',
                new App.Views.Sidemenu.List({
                    projectUuid: projectUuid,
                    section: section,
                })
            );
            //App.Layouts.sidebar.render();
        }
        else {
            var listView = App.Layouts.sidebar.getView('.sidebar');
            listView.setSection(section);
            listView.uiSelectProject(projectUuid);
        }

        if (!App.Layouts.content.getView('#project-navbar')) {
            App.Layouts.content.setView('#project-navbar', new App.Views.Navbar.Navigation());
        }
    };

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

            //App.Layouts.main = new App.Views.Layouts.MainLayout();
            //App.Layouts.sidebar = new App.Views.Layouts.SidebarLayout();
            //App.Layouts.content = new App.Views.Layouts.ContentLayout();

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
