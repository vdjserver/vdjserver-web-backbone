define(['app'], function(App) {

    'use strict';

    var redirectToLogin = function() {
        // Routing should be done automatically when this happens.
        App.Agave.destroyToken();
    };

    /*
        routeWithTokenRefreshCheck states

        A.) Token is good, continue routing as normal
        B.) Token is no longer active, but can probably be refreshed and route continued
        C.) All hope is lost
     */
    var routeWithTokenRefreshCheck = function(destinationRoute) {
        if (App.Agave.token().isActive()) {
            destinationRoute();
        }
        else if (! App.Agave.token().isActive() && App.Agave.token().get('refresh_token')) {
            App.Agave.token().save()
                .done(function() {
                    destinationRoute();
                })
                .fail(function() {
                    redirectToLogin();
                });
        }
        else {
            redirectToLogin();
        }
    };

    var setPublicSubviews = function() {

        App.Layouts.main.removeView('.sidebar');

        if (App.Layouts.main.template !== 'layouts/public') {
            App.Layouts.main.template = 'layouts/public';
        }

        App.Layouts.main.setView('.nav-container', new App.Views.AppViews.Nav({model: App.Agave.token()}));
    };

    var setProjectSubviews = function(projectUuid) {

        if (App.Layouts.main.template !== 'layouts/project-standard') {
            App.Layouts.main.template = 'layouts/project-standard';
        }

        if (! App.Layouts.main.getView('.sidebar')) {
            App.Layouts.main.setView('.sidebar', new App.Views.Projects.List({projectUuid: projectUuid}));
        }
        else {
            var listView = App.Layouts.main.getView('.sidebar');
            listView.uiSelectProject(projectUuid);
        }

        if (! App.Layouts.main.getView('#project-navbar')) {
            App.Layouts.main.setView('#project-navbar', new App.Views.Projects.Navbar());
        }
    };

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
                setPublicSubviews();
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
            setPublicSubviews();
            App.Layouts.main.setView('.content', new App.Views.CreateAccount.Form());
            App.Layouts.main.render();
        },

        // Forgot Password
        forgotPassword: function(uuid) {
            setPublicSubviews();
            App.Layouts.main.setView('.content', new App.Views.ForgotPassword.Form({'uuid': uuid}));
            App.Layouts.main.render();
        },

        // Profile
        accountProfile: function() {

            var destinationRoute = function() {
                setProjectSubviews();
                App.Layouts.main.setView('.content', new App.Views.Profile.Main());
                App.Layouts.main.render();
            };

            routeWithTokenRefreshCheck(destinationRoute);
        },

        // Change Password
        changePassword: function() {

            var destinationRoute = function() {
                setProjectSubviews();
                App.Layouts.main.setView('.content', new App.Views.Profile.Main({'subView':'ChangePasswordForm'}));
                App.Layouts.main.render();
            };

            routeWithTokenRefreshCheck(destinationRoute);
        },

        // Projects

        projectIndex: function() {

            var destinationRoute = function() {

                /*
                    This route doesn't follow the standard view loading
                    pattern that other project routes follow because it needs
                    to have listView handle redirection instead of indexView.

                    The reason for this is that listView handles data
                    management for projects, so it can only redirect properly
                    after data has been fetched.

                    I don't think it makes sense to refactor data management
                    out into a separate function when this is the only
                    exception case/problem.
                */

                if (App.Layouts.main.template !== 'layouts/project-standard') {
                    App.Layouts.main.template = 'layouts/project-standard';
                }

                // Get this out so it can render quickly, and so it won't
                // cause problems by overriding our redirect if it renders
                // slowly.
                App.Layouts.main.setView('.content', new App.Views.Projects.Index());

                if (! App.Layouts.main.getView('.sidebar')) {
                    App.Layouts.main.setView('.sidebar', new App.Views.Projects.List({shouldLoadViewForIndex: true}));
                }
                else {
                    var projectListView = App.Layouts.main.getView('.sidebar');
                    projectListView.loadViewForIndex();
                }

                if (! App.Layouts.main.getView('#project-navbar')) {
                    App.Layouts.main.setView('#project-navbar', new App.Views.Projects.Navbar());
                }

                App.Layouts.main.render();
            };

            routeWithTokenRefreshCheck(destinationRoute);
        },

        projectCreate: function() {

            var destinationRoute = function() {
                setProjectSubviews();
                App.Layouts.main.setView('.content', new App.Views.Projects.Create());
                App.Layouts.main.render();
            };

            routeWithTokenRefreshCheck(destinationRoute);
        },

        projectDetail: function(projectUuid) {

            var destinationRoute = function() {
                setProjectSubviews(projectUuid);
                App.Layouts.main.setView('.content', new App.Views.Projects.Detail({projectUuid: projectUuid}));
                App.Layouts.main.render();
            };

            routeWithTokenRefreshCheck(destinationRoute);
        },

        projectSettings: function(projectUuid) {

            var destinationRoute = function() {
                setProjectSubviews(projectUuid);
                App.Layouts.main.setView('.content', new App.Views.Projects.Settings({projectUuid: projectUuid}));
                App.Layouts.main.render();
            };

            routeWithTokenRefreshCheck(destinationRoute);
        },

        projectManageUsers: function(projectUuid) {

            var destinationRoute = function() {
                setProjectSubviews(projectUuid);
                App.Layouts.main.setView('.content', new App.Views.Projects.ManageUsers({projectUuid: projectUuid}));
                App.Layouts.main.render();
            };

            routeWithTokenRefreshCheck(destinationRoute);
        },

        projectJobHistory: function(projectUuid) {

            var destinationRoute = function() {
                setProjectSubviews(projectUuid);
                App.Layouts.main.setView('.content', new App.Views.Jobs.History({projectUuid: projectUuid}));
                App.Layouts.main.render();
            };

            routeWithTokenRefreshCheck(destinationRoute);
        },

        projectJobOutput: function(projectUuid, jobId) {

            var destinationRoute = function() {
                setProjectSubviews(projectUuid);
                App.Layouts.main.setView('.content', new App.Views.Analyses.SelectAnalyses({projectUuid: projectUuid, jobId: jobId}));
                App.Layouts.main.render();
            };

            routeWithTokenRefreshCheck(destinationRoute);
        },

        // 404
        notFound: function() {
            setPublicSubviews();
            App.Layouts.main.setView('.content', new App.Views.NotFound.Error());
            App.Layouts.main.render();
        },

    });

    App.Routers.DefaultRouter = DefaultRouter;
    return DefaultRouter;
});
