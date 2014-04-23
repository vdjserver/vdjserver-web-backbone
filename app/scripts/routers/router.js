define(['app'], function(App) {

    'use strict';

    var redirectToLogin = function() {
        App.router.navigate('', {
            trigger: true
        });
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
            '': 'index',

            'auth/logout': 'authLogout',

            'account':          'createAccount',
            'account/profile':  'accountProfile',

            'project':          'projectIndex',
            'project/create':   'projectCreate',
            'project/:id':      'projectDetail',
            'project/:id/jobs': 'projectJobHistory',
            'project/:id/jobs/:jobId/analyses': 'projectSelectAnalyses',
            'project/:id/users': 'projectManageUsers',

            // 404
            '*notFound': 'notFound',
        },


        // Index
        index: function() {
            if (! App.isLoggedIn()) {
                App.Layouts.main.template = 'layouts/public';
                App.Layouts.main.setView('.nav-container', new App.Views.AppViews.Nav({model: App.Agave.token()}));
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
            App.Agave.destroyToken();
            window.localStorage.removeItem('Agave.Token');

            redirectToLogin();
        },

        // Account
        createAccount: function() {
            App.Layouts.main.template = 'layouts/public';
            App.Layouts.main.setView('.nav-container', new App.Views.AppViews.Nav({model: App.Agave.token()}));
            App.Layouts.main.setView('.content', new App.Views.CreateAccount.Form());
            App.Layouts.main.render();
        },

        // Profile
        accountProfile: function() {

            if (! App.isLoggedIn()) {
                redirectToLogin();
            }
            else {
                App.Layouts.main.template = 'layouts/standard';
                App.Layouts.main.setView('.content', new App.Views.Profile.Form());
            }

            App.Layouts.main.render();
        },

        // Projects
        projectIndex: function() {

            if (! App.isLoggedIn()) {
                redirectToLogin();
            }
            else {

                setProjectSubviews();

                App.Layouts.main.setView('.content', new App.Views.Projects.Index());
            }

            App.Layouts.main.render();
        },

        projectCreate: function() {

            if (! App.isLoggedIn()) {
                redirectToLogin();
            }
            else {

                setProjectSubviews();

                App.Layouts.main.setView('.content', new App.Views.Projects.Create());
            }

            App.Layouts.main.render();
        },

        projectDetail: function(projectUuid) {

            if (! App.isLoggedIn()) {
                redirectToLogin();
            }
            else {

                setProjectSubviews(projectUuid);

                App.Layouts.main.setView('.content', new App.Views.Projects.Detail({projectUuid: projectUuid}));
            }

            App.Layouts.main.render();
        },

        projectManageUsers: function(projectUuid) {

            if (! App.isLoggedIn()) {
                redirectToLogin();
            }
            else {

                setProjectSubviews(projectUuid);

                App.Layouts.main.setView('.content', new App.Views.Projects.ManageUsers({projectUuid: projectUuid}));
            }

            App.Layouts.main.render();
        },

        projectJobHistory: function(projectUuid) {
            if (! App.isLoggedIn()) {
                redirectToLogin();
            }
            else {

                setProjectSubviews(projectUuid);

                App.Layouts.main.setView('.content', new App.Views.Jobs.History({projectUuid: projectUuid}));
            }

            App.Layouts.main.render();
        },

        projectSelectAnalyses: function(projectUuid, jobId) {
            if (! App.isLoggedIn()) {
                redirectToLogin();
            }
            else {

                setProjectSubviews(projectUuid);

                App.Layouts.main.setView('.content', new App.Views.Analyses.SelectAnalyses({projectUuid: projectUuid, jobId: jobId}));
            }

            App.Layouts.main.render();
        },

        // 404
        notFound: function() {
            App.Layouts.main.template = 'layouts/standard';
            App.Layouts.main.setView('.content', new App.Views.NotFound.Error());
            App.Layouts.main.render();
        },


    });

    App.Routers.DefaultRouter = DefaultRouter;
    return DefaultRouter;
});
