'use strict';

require.config({
    deps: ['requirejs-main'],
    paths: {
        'backbone':         '../bower_components/backbone/backbone',
        'backbone.syphon':  '../bower_components/marionette.backbone.syphon/lib/backbone.syphon',
        'bootstrap':        'vendor/bootstrap',
        'filesize':         '../bower_components/filesize/lib/filesize',
        'handlebars':       '../bower_components/handlebars/handlebars',
        'jquery':           '../bower_components/jquery/dist/jquery',
        'jquery-ui':        '../bower_components/jquery-ui/jquery-ui',
        'layoutmanager':    '../bower_components/layoutmanager/backbone.layoutmanager',
        'moment':           '../bower_components/moment/moment',
        'typeahead':        '../bower_components/typeahead.js/dist/typeahead.bundle',
        'underscore':       '../bower_components/underscore/underscore',
        'd3':               '../bower_components/d3/d3.min',
        'nvd3':             '../bower_components/nvd3/nv.d3.min',
        'slickgrid.core':   '../bower_components/slickgrid/slick.core',
        'slickgrid.grid':   '../bower_components/slickgrid/slick.grid',
        'socket-io':        '../bower_components/socket.io-client/socket.io',
        'file-saver':       '../bower_components/file-saver/FileSaver',
        'recaptcha-ajax':   '../bower_components/recaptcha-ajax/recaptcha_ajax',

        // Config
        'environment-config': 'config/environment-config',

        // Backbone Extensions
        'backbone-agave':  'vendor/backbone-agave',

        // Regular Models
        'error': 'models/error',
        'job-websocket': 'models/job-websocket',

        // Agave - Models/Collections
        'agave-new-account': 'models/agave-new-account',
        'agave-feedback': 'models/agave-feedback',

        'agave-notification': 'models/agave-notification',
        'agave-password-reset': 'models/agave-password-reset',
        'agave-password-change': 'models/agave-password-change',
        'agave-tenant-user': 'models/agave-tenant-user',
        'agave-tenant-users': 'collections/agave-tenant-users',

        'agave-file': 'models/agave-file',
        'agave-files': 'collections/agave-files',

        'agave-job': 'models/agave-job',
        'agave-jobs': 'collections/agave-jobs',

        // Agave - Metadata Models/Collections
        'agave-permission':  'models/agave-permission',
        'agave-permissions': 'collections/agave-permissions',
        'agave-project': 'models/agave-project',
        'agave-projects': 'collections/agave-projects',

        'agave-profile': 'models/agave-profile',

        // Misc.
        'fileSaver': 'vendor/fileSaver',
        'box': 'vendor/box',
        'jquery.event.drag':'vendor/jquery.event.drag',
        'jquery.event.drop':'vendor/jquery.event.drop',

        // Handlebars Helpers
        'handlebars-utilities':   'views/handlebars-helpers/handlebars-utilities',

        // Model Helpers
        'vdjpipe-utilities': 'models/helpers/vdjpipe-utilities',

        // Generic Views
        'generic-vdjpipe-option-views': 'views/generic/generic-vdjpipe-option-views',

        // View Helpers
        'vdjpipe-view-helpers': 'views/helpers/vdjpipe-view-helpers',
        'view-layouts': 'views/layouts/view-layouts',

        // Views
        'form-views': 'views/app/form-views',
        'util-views': 'views/app/util-views',
        'not-found-views': 'views/not-found-views',

        'create-account-views': 'views/create-account-views',
        'forgot-password-views': 'views/forgot-password-views',
        'profile-views': 'views/profile-views',
        'job-views': 'views/job-views',
        'project-views': 'views/project-views',
        'sidemenu-views': 'views/sidemenu-views',
        'notification-views': 'views/notification-views',
        'navbar-views': 'views/navbar-views',
        'public-views': 'views/public-views',
        'analyses-views': 'views/analyses-views',
        'vdjpipe-views': 'views/vdjpipe-views',
        'feedback-views': 'views/feedback-views',

        // Routers
        'router': 'routers/router'

    },
    shim: {
        'bootstrap': {
            deps: ['jquery']
        },
        'environment-config': {
            exports: 'EnvironmentConfig',
        },
        'jquery.event.drag': {
            deps: ['jquery']
        },
        'jquery.event.drop': {
            deps: ['jquery']
        },
        'handlebars': {
            exports: 'Handlebars'
        },
        'layoutmanager': {
            deps: ['backbone'],
            exports: 'layoutmanager'
        },
        'box': {
            deps:['d3'],
            exports: 'box'
        },
        'nvd3': {
            deps:['d3'],
            exports: 'nv'
        },
        'recaptcha-ajax': {
            exports: 'Recaptcha'
        },
        'slickgrid.core': {
            deps:['jquery', 'jquery-ui', 'jquery.event.drag','jquery.event.drop'],
            exports: 'Slick'
        },
        'slickgrid.grid': {
            deps:['jquery','jquery-ui', 'slickgrid.core', 'jquery.event.drag','jquery.event.drop'],
            exports: 'Slick'
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

        'agave-notification': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.Notification'
        },

        'agave-password-reset': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.PasswordReset'
        },

        'agave-password-change': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.PasswordChange'
        },

        'agave-tenant-user': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.TenantUser'
        },
        'agave-tenant-users': {
            deps: ['backbone', 'backbone-agave', 'agave-tenant-user'],
            exports: 'Backbone.Agave.Collection.TenantUsers'
        },
'agave-feedback': {
    deps: ['backbone', 'backbone-agave'],
    exports: 'Backbone.Agave.Model.FeedbackModel'
},
        'agave-file': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.File'
        },
        'agave-files': {
            deps: ['backbone', 'backbone-agave', 'agave-file'],
            exports: 'Backbone.Agave.Collection.Files'
        },

        'agave-job': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.Job'
        },
        'agave-jobs': {
            deps: ['backbone', 'backbone-agave', 'agave-job'],
            exports: 'Backbone.Agave.Collection.Jobs'
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
        },

        //Analyses
        'agave-analyses': {
            deps: ['backbone', 'backbone-agave', 'agave-project'],
            exports: 'Backbone.Agave.Collection.Analyses'
        }
    }
});
