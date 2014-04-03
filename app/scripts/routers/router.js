define(['app'], function(App) {

    'use strict';

    var DefaultRouter = Backbone.Router.extend({

        routes: {
            '': 'index',

            'auth/login':  'authLogin',
            'auth/logout': 'authLogout',

            'account':         'createAccount',
            'account/profile': 'accountProfile',

            'apps/public': 'appsPublicList',
            'apps/shared': 'appsSharedList',
            'apps/:id':    'appsView',

            'io':              'ioBrowser',
            'io/:owner':       'ioBrowser',
            'io/:owner/*path': 'ioBrowser',

            'project':           'projectIndex',
            'project/create':    'projectCreate',
            'project/:id':       'projectDetail',
            'project/:id/users': 'projectManageUsers'
        },


        // Index
        index: function() {
            App.Layouts.main.template = 'layouts/standard';
            App.Layouts.main.setView('.content', new App.Views.AppViews.Home());
            App.Layouts.main.render();
        },


        // Auth
        authLogin: function() {
            App.Layouts.main.template = 'layouts/standard';
            App.Layouts.main.setView('.content', new App.Views.Auth.Login({model: App.Agave.token()}));
            App.Layouts.main.render();
        },

        authLogout: function() {
            App.Agave.destroyToken();
            window.localStorage.removeItem('Agave.Token');
            App.router.navigate('', {trigger:true});
        },

        // Account
        createAccount: function() {
            App.Layouts.main.template = 'layouts/standard';
            App.Layouts.main.setView('.content', new App.Views.CreateAccount.Form());
            App.Layouts.main.render();
        },

        // Profile
        accountProfile: function() {

            if (!App.isLoggedIn()) {
                App.Layouts.main.template = 'layouts/standard';
                App.Layouts.main.setView('.content', new App.Views.Profile.Login());
            }
            else {
                App.Layouts.main.template = 'layouts/standard';
                App.Layouts.main.setView('.content', new App.Views.Profile.Form());
            }

            App.Layouts.main.render();
        },


        // Apps
        appsPublicList: function() {
            App.Layouts.main.template = 'layouts/standard';
            App.Layouts.main.setView('.content', new App.Views.AgaveApps.AppList({collection: new Backbone.Agave.Apps.PublicApplications()}));
            App.Layouts.main.render();
        },

        appsSharedList: function() {
            App.Layouts.main.template = 'layouts/standard';
            App.Layouts.main.setView('.content', new App.Views.AgaveApps.AppList({collection: new Backbone.Agave.Apps.SharedApplications()}));
            App.Layouts.main.render();
        },

        appsView: function(id) {
            App.Layouts.main.template = 'layouts/standard';
            App.Layouts.main.setView('.content', new App.Views.AgaveApps.AppView({model: new Backbone.Agave.Apps.Application({id:id})}));
            App.Layouts.main.render();
        },


        // IO
        ioBrowser: function(owner, path) {

            App.Layouts.main.template = 'layouts/standard';
            var fullPath = owner || App.Agave.token().get('username');

            if (path) {
                fullPath += '/' + path;
            }

            App.Layouts.main.setView('.content',new App.Views.AgaveIO.Browser({collection: new Backbone.Agave.IO.Listing([], {path: fullPath})}));
            App.Layouts.main.render();
        },

        // Projects
        projectIndex: function() {

            if (!App.isLoggedIn()) {
                App.Layouts.main.template = 'layouts/standard';
                App.Layouts.main.setView('.content', new App.Views.Projects.Login());
            }
            else {

                if (App.Layouts.main.template !== 'layouts/project-standard') {
                    App.Layouts.main.template = 'layouts/project-standard';
                    App.Layouts.main.setView('.sidebar', new App.Views.Projects.List());
                }

                App.Layouts.main.setView('.content', new App.Views.Projects.Index());
            }

            App.Layouts.main.render();
        },

        projectCreate: function() {

            if (!App.isLoggedIn()) {
                App.Layouts.main.template = 'layouts/standard';
                App.Layouts.main.setView('.content', new App.Views.Projects.Login());
            }
            else {

                if (App.Layouts.main.template !== 'layouts/project-standard') {
                    App.Layouts.main.template = 'layouts/project-standard';
                    App.Layouts.main.setView('.sidebar', new App.Views.Projects.List());
                }

                App.Layouts.main.setView('.content', new App.Views.Projects.Create());
            }

            App.Layouts.main.render();
        },

        projectDetail: function(projectUuid) {

            if (!App.isLoggedIn()) {
                App.Layouts.main.template = 'layouts/standard';
                App.Layouts.main.setView('.content', new App.Views.Projects.Login());
            }
            else {

                if (App.Layouts.main.template !== 'layouts/project-standard') {
                    App.Layouts.main.template = 'layouts/project-standard';
                    App.Layouts.main.setView('.sidebar', new App.Views.Projects.List());
                }

                App.Layouts.main.setView('.content', new App.Views.Projects.Detail({projectUuid: projectUuid}));
            }

            App.Layouts.main.render();
        },

        projectManageUsers: function(projectUuid) {

            if (!App.isLoggedIn()) {
                App.Layouts.main.template = 'layouts/standard';
                App.Layouts.main.setView('.content', new App.Views.Projects.Login());
            }
            else {

                if (App.Layouts.main.template !== 'layouts/project-standard') {
                    App.Layouts.main.template = 'layouts/project-standard';
                    App.Layouts.main.setView('.sidebar', new App.Views.Projects.List());
                }

                App.Layouts.main.setView('.content', new App.Views.Projects.ManageUsers({projectUuid: projectUuid}));
            }

            App.Layouts.main.render();
        }

    });

    App.Routers.DefaultRouter = DefaultRouter;
    return DefaultRouter;
});
