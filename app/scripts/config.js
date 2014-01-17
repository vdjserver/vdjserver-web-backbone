
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
        'agave-new-account': 'models/agave-new-account',
        'agave-io':      'models/agave-io',

        // Agave - Metadata Models
        'agave-metadata-permission':  'models/agave-metadata-permission',
        'agave-metadata-permissions': 'collections/agave-metadata-permissions',

        'agave-profile': 'models/agave-profile',
        'agave-project': 'models/agave-project',

        // Agave - Metadata Collections
        'agave-projects': 'collections/agave-projects',

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
        'agave-metadata-permission': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.MetadataPermission'
        },
        'agave-profile': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.Profile'
        },


        // Projects
        'agave-metadata-permissions': {
            deps: ['backbone', 'backbone-agave', 'agave-metadata-permission'],
            exports: 'Backbone.Agave.Collection.MetadataPermissions'
        },
        'agave-project': {
            deps: ['backbone', 'backbone-agave', 'agave-metadata-permissions'],
            exports: 'Backbone.Agave.Model.Project'
        },
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
