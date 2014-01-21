
'use strict';

require.config({
    deps: ['main'],
    paths: {
        'backbone':         '../bower_components/backbone/backbone',
        'backbone.syphon':  '../bower_components/backbone.syphon/lib/backbone.syphon',
        'bootstrap':        '../bower_components/sass-bootstrap/dist/js/bootstrap',
        'handlebars':       '../bower_components/handlebars/handlebars',
        'jquery':           '../bower_components/jquery/jquery',
        'layoutmanager':    '../bower_components/layoutmanager/backbone.layoutmanager',
        'moment':           '../bower_components/moment/moment',
        'underscore':       '../bower_components/underscore/underscore',

        // Backbone Extensions
        'backbone-agave':  'vendor/backbone-agave/backbone-agave',

        // Agave - Models
        'agave-new-account': 'models/agave-new-account',
        'agave-io':      'models/agave-io',

        // Agave - Metadata Models
        'agave-project-user':  'models/agave-project-user',
        'agave-project-users': 'collections/agave-project-users',
        'agave-project': 'models/agave-project',
        'agave-projects': 'collections/agave-projects',

        'agave-profile': 'models/agave-profile',

        // Misc.
        'fileSaver': 'vendor/fileSaver',

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
            deps: ['backbone'],
            exports: 'Backbone'
        },
        'bootstrap': {
            deps: ['jquery'],
            exports: 'jquery'
        },
        'handlebars': {
            exports: 'Handlebars'
        },
        'layoutmanager': {
            deps: ['backbone'],
            exports: 'layoutmanager'
        },
        'underscore': {
            exports: '_'
        },


        // Agave
        'backbone-agave': {
            deps: ['backbone'],
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

        // Agave - Metadata Models
        'agave-profile': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.Profile'
        },


        // Projects
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
