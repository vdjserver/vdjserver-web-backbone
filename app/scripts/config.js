
'use strict';

require.config({
    deps: ['main'],
    paths: {
        'backbone':         '../bower_components/backbone/backbone',
        'backbone.syphon':  '../bower_components/backbone.syphon/lib/backbone.syphon',
        'bootstrap':        'vendor/bootstrap',
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

        // Agave - Models/Collections
        'agave-new-account': 'models/agave-new-account',
        'agave-io': 'models/agave-io',
        'agave-tenant-user': 'models/agave-tenant-user',
        'agave-tenant-users': 'collections/agave-tenant-users',

        'agave-file-metadata': 'models/agave-file-metadata',
        'agave-file-metadatas': 'collections/agave-file-metadatas',

        'agave-file': 'models/agave-file',
        'agave-files': 'collections/agave-files',

        // Agave - Metadata Models/Collections
        'agave-permission':  'models/agave-permission',
        'agave-permissions': 'collections/agave-permissions',
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

        'agave-tenant-user': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.TenantUser'
        },
        'agave-tenant-users': {
            deps: ['backbone', 'backbone-agave', 'agave-tenant-user'],
            exports: 'Backbone.Agave.Collection.TenantUsers'
        },

        'agave-file-metadata': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.FileMetadata'
        },
        'agave-file-metadatas': {
            deps: ['backbone', 'backbone-agave', 'agave-file-metadata'],
            exports: 'Backbone.Agave.Collection.FileMetadatas'
        },

        'agave-file': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.File'
        },
        'agave-files': {
            deps: ['backbone', 'backbone-agave', 'agave-file'],
            exports: 'Backbone.Agave.Collection.Files'
        },

        // TODO - reorganize these. alphabetically?
        'agave-profile': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.Profile'
        },


        // Projects
        'agave-permission': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.ProjectUser'
        },
        'agave-permissions': {
            deps: ['backbone', 'backbone-agave', 'agave-permission'],
            exports: 'Backbone.Agave.Collection.ProjectUsers'
        },
        'agave-project': {
            deps: ['backbone', 'backbone-agave', 'agave-permissions'],
            exports: 'Backbone.Agave.Model.Project'
        },
        'agave-projects': {
            deps: ['backbone', 'backbone-agave', 'agave-project'],
            exports: 'Backbone.Agave.Collection.Projects'
        }
    }
});
