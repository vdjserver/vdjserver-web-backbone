
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
        'backbone-vdj':    'vendor/backbone-vdj/backbone-vdj',

        // Agave - Models
        'agave-account': 'models/agave-account',
        'agave-io':      'models/agave-io',
        'agave-profile': 'models/agave-profile',
        'agave-project': 'models/agave-project',
        'agave-uuid':    'models/agave-uuid',

        // Agave - Collections
        'agave-projects': 'collections/agave-projects',


        // Misc.
        'fileSaver': 'vendor/fileSaver',

        // Views
        'app-views': 'views/app/app-views',
        'form-views': 'views/app/form-views',
        'util-views': 'views/app/util-views',

        'agave-auth-views': 'views/agave-auth-views',
        'agave-io-views': 'views/agave-io-views',
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
        'agave-uuid': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.Uuid'
        },
        'agave-account': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.Account'
        },
        'agave-io': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.IO'
        },
        'agave-profile': {
            deps: ['backbone', 'backbone-agave', 'agave-uuid'],
            exports: 'Backbone.Agave.Model.Profile'
        },
        'agave-project': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.Project'
        },

        // Agave - Collections
        'agave-projects': {
            deps: ['backbone', 'backbone-agave', 'agave-project'],
            exports: 'Backbone.Agave.Collection.Projects'
        },


        // VDJ
        'backbone-vdj': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Vdj'
        }
    }
});
