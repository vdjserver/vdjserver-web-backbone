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
        else if (! App.Agave.token().isActive() && App.Agave.token().get('refresh_token')) {
            App.Agave.token().save()
                .done(function() {
                    destinationRoute();
                })
                .fail(function() {
                    _redirectToLogin();
                });
        }
        else {
            _redirectToLogin();
        }
    };

    var _setPublicSubviews = function() {

        if (App.Layouts.main.template !== 'layouts/public') {
            App.Layouts.main.template = 'layouts/public';
        }

        App.Layouts.main.setView('.nav-container', new App.Views.AppViews.Nav({model: App.Agave.token()}));
    };

    var _setProjectSubviews = function(projectUuid) {

        if (App.Layouts.main.template !== 'layouts/project/project-main') {
            App.Layouts.main.template = 'layouts/project/project-main';
            App.Layouts.main.setView('#sidebar-wrapper', App.Layouts.sidebar);
            App.Layouts.main.setView('#main-wrapper', App.Layouts.content);
            App.Layouts.main.render();
        }

        if (! App.Layouts.sidebar.getView('.sidebar')) {
            App.Layouts.sidebar.setView('.sidebar', new App.Views.Projects.List({projectUuid: projectUuid}));
            //App.Layouts.sidebar.render();
        }
        else {
            var listView = App.Layouts.sidebar.getView('.sidebar');
            listView.uiSelectProject(projectUuid);
        }

        if (! App.Layouts.content.getView('#project-navbar')) {
            App.Layouts.content.setView('#project-navbar', new App.Views.Projects.Navbar());
        }
    };

    // Public Methods
    var DefaultRouter = Backbone.Router.extend({

        routes: {
            '':                                 'index',
            'auth/logout':                      'authLogout',
            'account':                          'createAccount',
            'password-reset(/:uuid)':           'forgotPassword',
            'account/profile':                  'accountProfile',
            'account/change-password':          'changePassword',
            'project':                          'projectIndex',
            'project/create':                   'projectCreate',
            'project/:id':                      'projectDetail',
            'project/:id/settings':             'projectSettings',
            'project/:id/users':                'projectManageUsers',
            'project/:id/jobs':                 'projectJobHistory',
            'project/:id/jobs/:jobId':          'projectJobOutput',

            // 404
            '*notFound': 'notFound',
        },


        // Index
        index: function() {
            if (! App.Agave.token().isActive()) {
                _setPublicSubviews();
                App.Layouts.main.setView('.content', new App.Views.AppViews.Home({model: App.Agave.token()}));
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
            // Routing *should* be handled automatically once the token is destroyed.
            App.Agave.destroyToken();
        },

        // Account
        createAccount: function() {
            _setPublicSubviews();
            App.Layouts.main.setView('.content', new App.Views.CreateAccount.Form());
            App.Layouts.main.render();
        },

        // Forgot Password
        forgotPassword: function(uuid) {
            _setPublicSubviews();
            App.Layouts.main.setView('.content', new App.Views.ForgotPassword.Form({'uuid': uuid}));
            App.Layouts.main.render();
        },

        // Profile
        accountProfile: function() {

            var destinationRoute = function() {
                _setProjectSubviews();
                App.Layouts.main.setView('.content', new App.Views.Profile.Main());
                App.Layouts.main.render();
            };

            _routeWithTokenRefreshCheck(destinationRoute);
        },

        // Change Password
        changePassword: function() {

            var destinationRoute = function() {
                _setProjectSubviews();
                App.Layouts.main.setView('.content', new App.Views.Profile.Main({'subView':'ChangePasswordForm'}));
                App.Layouts.main.render();
            };

            _routeWithTokenRefreshCheck(destinationRoute);
        },

        // Projects

        projectIndex: function() {

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

            _routeWithTokenRefreshCheck(destinationRoute);
        },

        projectCreate: function() {

            var destinationRoute = function() {
                _setProjectSubviews();
                App.Layouts.content.setView('.content', new App.Views.Projects.Create());
                App.Layouts.content.render();
            };

            _routeWithTokenRefreshCheck(destinationRoute);
        },

        projectDetail: function(projectUuid) {

            var destinationRoute = function() {
                _setProjectSubviews(projectUuid);
                App.Layouts.content.setView('.content', new App.Views.Projects.Detail({projectUuid: projectUuid}));
                App.Layouts.content.render();
            };

            _routeWithTokenRefreshCheck(destinationRoute);
        },

        projectSettings: function(projectUuid) {

            var destinationRoute = function() {
                _setProjectSubviews(projectUuid);
                App.Layouts.content.setView('.content', new App.Views.Projects.Settings({projectUuid: projectUuid}));
                App.Layouts.content.render();
            };

            _routeWithTokenRefreshCheck(destinationRoute);
        },

        projectManageUsers: function(projectUuid) {

            var destinationRoute = function() {
                _setProjectSubviews(projectUuid);
                App.Layouts.content.setView('.content', new App.Views.Projects.ManageUsers({projectUuid: projectUuid}));
                App.Layouts.content.render();
            };

            _routeWithTokenRefreshCheck(destinationRoute);
        },

        projectJobHistory: function(projectUuid) {

            var destinationRoute = function() {
                _setProjectSubviews(projectUuid);
                App.Layouts.content.setView('.content', new App.Views.Jobs.History({projectUuid: projectUuid}));
                App.Layouts.content.render();
            };

            _routeWithTokenRefreshCheck(destinationRoute);
        },

        projectJobOutput: function(projectUuid, jobId) {

            var destinationRoute = function() {
                _setProjectSubviews(projectUuid);
                App.Layouts.content.setView('.content', new App.Views.Analyses.SelectAnalyses({projectUuid: projectUuid, jobId: jobId}));
                App.Layouts.content.render();
            };

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
