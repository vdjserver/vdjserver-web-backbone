
'use strict';

require.config({
    deps: ['main'],
    paths: {
        'backbone':         '../bower_components/backbone/backbone',
        'backbone.syphon':  '../bower_components/backbone.syphon/lib/backbone.syphon',
        'bootstrap':        'vendor/bootstrap',
        'flow':             '../bower_components/flow.js/src/flow',
        'handlebars':       '../bower_components/handlebars/handlebars',
        'jquery':           '../bower_components/jquery/dist/jquery',
        'jquery-ui':        '../bower_components/jquery-ui/ui/jquery-ui',
        'layoutmanager':    '../bower_components/layoutmanager/backbone.layoutmanager',
        'moment':           '../bower_components/moment/moment',
        'typeahead':        '../bower_components/typeahead.js/dist/typeahead.bundle',
        'underscore':       '../bower_components/underscore/underscore',

        // Config
        'environment-config': 'config/environment-config',

        // Backbone Extensions
        'backbone-agave':  'vendor/backbone-agave',

        // Regular Models

        // Agave - Models
        'agave-new-account': 'models/agave-new-account',
        'agave-io': 'models/agave-io',
        'agave-user': 'models/agave-user',
        'agave-users': 'collections/agave-users',
        'agave-project-file': 'models/agave-project-file',

        // Agave - Metadata Models
        'agave-project-user':  'models/agave-project-user',
        'agave-project-users': 'collections/agave-project-users',
        'agave-project': 'models/agave-project',
        'agave-projects': 'collections/agave-projects',

        'agave-profile': 'models/agave-profile',

        // Misc.
        'fileSaver': 'vendor/fileSaver',

        // Handlebars Helpers
        'handlebars-utilities':   'views/handlebars-helpers/handlebars-utilities',

        // Views
        'app-views': 'views/app/app-views',
        'form-views': 'views/app/form-views',
        'util-views': 'views/app/util-views',

        'create-account-views': 'views/create-account-views',
        'auth-views': 'views/auth-views',
        'io-views': 'views/io-views',
        'profile-views': 'views/profile-views',
        'project-views': 'views/project-views',

        // Routers
        'router': 'routers/router'

    },
    shim: {
        'backbone': {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        },
        'backbone.syphon': {
            deps: ['backbone']
            //exports: 'Backbone'
        },
        'bootstrap': {
            deps: ['jquery']
        },
        'jquery-ui': {
            deps: ['jquery'],
            exports: '$'
        },
        'handlebars': {
            exports: 'Handlebars'
        },
        'layoutmanager': {
            deps: ['backbone'],
            exports: 'layoutmanager'
        },
        'typeahead': {
            deps: ['jquery']
        },

        // Agave
        'backbone-agave': {
            deps: ['backbone', 'environment-config'],
            exports: 'Backbone.Agave'
        },

        // Agave - Models
        'agave-new-account': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.NewAccount'
        },
        'agave-io': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.IO'
        },

        'agave-user': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.User'
        },
        'agave-users': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Collection.Users'
        },

        // Agave - Metadata Models
        'agave-profile': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.Profile'
        },


        // Projects
        'agave-project-file': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.ProjectFile'
        },
        'agave-project-user': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.ProjectUser'
        },
        'agave-project-users': {
            deps: ['backbone', 'backbone-agave', 'agave-project-user'],
            exports: 'Backbone.Agave.Collection.ProjectUsers'
        },
        'agave-project': {
            deps: ['backbone', 'backbone-agave', 'agave-project-users'],
            exports: 'Backbone.Agave.Model.Project'
        },
        'agave-projects': {
            deps: ['backbone', 'backbone-agave', 'agave-project'],
            exports: 'Backbone.Agave.Collection.Projects'
        }
    }
});
