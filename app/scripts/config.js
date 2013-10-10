
'use strict';

require.config({
    deps: ['main'],
    paths: {
        'backbone':         '../components/backbone/backbone',
        'backbone.syphon':  '../components/backbone.syphon/lib/backbone.syphon',
        'bootstrap':        'vendor/bootstrap',
        'handlebars':       '../components/handlebars/handlebars',
        'jquery':           '../components/jquery/jquery',
        'layoutmanager':    '../components/layoutmanager/backbone.layoutmanager',
        'moment':           '../components/moment/moment',
        'underscore':       '../components/underscore/underscore',

        // Backbone Extensions
        'backbone-agave':  'vendor/backbone-agave/backbone-agave',
        'backbone-vdj':    'vendor/backbone-vdj/backbone-vdj',

        // Models - Agave
        'backbone-agave-io': 'models/backbone-agave-io',

        // Models - VDJ
        'backbone-vdj-account':  'models/backbone-vdj-account',
        'backbone-vdj-projects': 'models/backbone-vdj-projects',

        // Misc.
        'fileSaver': 'vendor/fileSaver',

        // Views
        'app-views': 'views/app/app-views',
        'form-views': 'views/app/form-views',
        'util-views': 'views/app/util-views',
        'agave-auth': 'views/agave-auth',
        'agave-io': 'views/agave-io',
        'account-views': 'views/account-views',
        'project-views': 'views/project-views',

        // Routers
        'router': 'routers/default'

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


        'backbone-agave': {
            deps: ['backbone'],
            exports: 'Backbone.Agave'
        },
        'backbone-agave-io': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.IO'
        },


        'backbone-vdj': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Vdj'
        },
        'backbone-vdj-account': {
            deps: ['backbone', 'backbone-vdj'],
            exports: 'Backbone.Vdj.Account'
        },
        'backbone-vdj-projects': {
            deps: ['backbone', 'backbone-vdj'],
            exports: 'Backbone.Vdj.Projects'
        }
    }
});
