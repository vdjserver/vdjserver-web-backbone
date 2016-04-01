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
            App.Layouts.main.template = 'layouts/public/public-main';

            App.Layouts.main.setView('#nav-container', new App.Views.Navbar.Public());
        }
    };

    var _setProjectSubviews = function(projectUuid, section) {

        if (App.Layouts.main.template !== 'layouts/project/project-main') {
            App.Layouts.main.template = 'layouts/project/project-main';
            App.Layouts.main.setView('#sidebar-wrapper', App.Layouts.sidebar);
            App.Layouts.main.setView('#main-wrapper', App.Layouts.content);
            App.Layouts.main.render();
        }

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
            'community':                        'community',
            'community/:id':                    'communityDetail',
            'feedback':                         'feedback',
            'password-reset(/:uuid)':           'forgotPassword',
            'project':                          'projectIndex',
            'project/create':                   'projectCreate',
            'project/:id':                      'projectDetail',
            'project/:id/associations/qual':    'projectFileQualAssociations',
            'project/:id/associations/paired-reads': 'projectFilePairedReadAssociations',
            'project/:id/settings':             'projectSettings',
            'project/:id/users':                'projectManageUsers',
            'project/:id/jobs':                 'projectJobHistory',
            'project/:id/jobs/:jobId':          'projectJobOutput',
            'software':                         'software',

            // 404
            '*notFound': 'notFound',
        },

        // Index
        index: function() {
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
            // Routing *should* be handled automatically once the token is destroyed.
            App.Agave.destroyToken();
        },

        // Account
        createAccount: function() {
            _setPublicSubviews();
            App.Layouts.main.setView('.content', new App.Views.Account.CreateAccount());
            App.Layouts.main.render();
        },

        // Community
        community: function() {

            var destinationRoute = function() {
                _setProjectSubviews();

                var communityDataView = new App.Views.Community.Index();
                App.Layouts.content.setView('.content', communityDataView);
                App.Layouts.content.render()
                    .promise()
                    .done(function() {
                        communityDataView.startChart();
                    })
                    ;
            };

            _routeWithTokenRefreshCheck(destinationRoute);
        },

        // Community Detail
        communityDetail: function(communityDataId) {

            var destinationRoute = function() {
                _setProjectSubviews();

                var communityDetailView = new App.Views.Community.Detail({communityDataId: communityDataId});
                App.Layouts.content.setView('.content', communityDetailView);
                App.Layouts.content.render()
                    .promise()
                    .done(function() {
                        communityDetailView.startChart();
                    })
                    ;
            };

            _routeWithTokenRefreshCheck(destinationRoute);
        },

        // Verification Pending
        verificationPending: function() {
            _setPublicSubviews();
            App.Layouts.main.setView('.content', new App.Views.Account.VerificationPending());
            App.Layouts.main.render();
        },

        verifyAccount: function(verificationId) {
            _setPublicSubviews();
            App.Layouts.main.setView('.content', new App.Views.Account.VerifyAccount({'verificationId': verificationId}));
            App.Layouts.main.render();
        },

        // Forgot Password
        forgotPassword: function(uuid) {
            _setPublicSubviews();
            App.Layouts.main.setView('.content', new App.Views.ForgotPassword.Form({'uuid': uuid}));
            App.Layouts.main.render();
        },

        // Feedback
        feedback: function() {
            _setPublicSubviews();
            App.Layouts.main.setView('.content', new App.Views.Feedback.PublicForm());
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

        // User Feedback
        userFeedback: function() {

            var destinationRoute = function() {
                _setProjectSubviews();
                App.Layouts.main.setView('.content', new App.Views.Feedback.UserForm());
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
                _setProjectSubviews(
                    projectUuid,
                    App.Views.Sidemenu.List.Sections.ProjectFiles
                );

                App.Layouts.content.setView('.content', new App.Views.Projects.Detail({projectUuid: projectUuid}));
                App.Layouts.content.render();
            };

            _routeWithTokenRefreshCheck(destinationRoute);
        },

        projectFilePairedReadAssociations: function(projectUuid) {

            var destinationRoute = function() {
                _setProjectSubviews(
                    projectUuid,
                    App.Views.Sidemenu.List.Sections.ProjectPairedReadAssociations
                );

                App.Layouts.content.setView('.content', new App.Views.Projects.PairedReadFileAssociations({projectUuid: projectUuid}));
                App.Layouts.content.render();
            };

            _routeWithTokenRefreshCheck(destinationRoute);
        },

        projectFileQualAssociations: function(projectUuid) {

            var destinationRoute = function() {
                _setProjectSubviews(
                    projectUuid,
                    App.Views.Sidemenu.List.Sections.ProjectQualAssociations
                );

                App.Layouts.content.setView('.content', new App.Views.Projects.QualFileAssociations({projectUuid: projectUuid}));
                App.Layouts.content.render();
            };

            _routeWithTokenRefreshCheck(destinationRoute);
        },

        projectSettings: function(projectUuid) {

            var destinationRoute = function() {
                _setProjectSubviews(
                    projectUuid,
                    App.Views.Sidemenu.List.Sections.ProjectSettings
                );

                App.Layouts.content.setView('.content', new App.Views.Projects.Settings({projectUuid: projectUuid}));
                App.Layouts.content.render();
            };

            _routeWithTokenRefreshCheck(destinationRoute);
        },

        projectJobHistory: function(projectUuid, args) {

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

            _routeWithTokenRefreshCheck(destinationRoute);
        },

        projectJobOutput: function(projectUuid, jobId) {

            var destinationRoute = function() {
                _setProjectSubviews(
                    projectUuid,
                    App.Views.Sidemenu.List.Sections.ProjectAnalyses
                );

                App.Layouts.content.setView('.content', new App.Views.Analyses.SelectAnalyses({projectUuid: projectUuid, jobId: jobId}));
                App.Layouts.content.render();
            };

            _routeWithTokenRefreshCheck(destinationRoute);
        },

        // Software
        software: function() {
            var destinationRoute = function() {
                _setProjectSubviews();

                App.Layouts.content.setView('.content', new App.Views.Software.Index());
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
