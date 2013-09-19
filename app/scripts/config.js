
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

        'backbone-agave':      'vendor/backbone-agave/backbone-agave',
        'backbone-agave-apps': 'vendor/backbone-agave/backbone-agave-apps',
        'backbone-agave-jobs': 'vendor/backbone-agave/backbone-agave-jobs',
        'backbone-agave-io':   'vendor/backbone-agave/backbone-agave-io',

        'backbone-vdj':          'vendor/backbone-vdj/backbone-vdj',
        'backbone-vdj-account':  'vendor/backbone-vdj/backbone-vdj-account',
        'backbone-vdj-projects': 'vendor/backbone-vdj/backbone-vdj-projects',

        'fileSaver':           'vendor/fileSaver'
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
        'backbone-agave-jobs': {
            deps: ['backbone', 'backbone-agave', 'backbone-agave-io'],
            exports: 'Backbone.Agave.Jobs'
        },
        'backbone-agave-apps': {
            deps: ['backbone', 'backbone-agave', 'backbone-agave-io', 'backbone-agave-jobs'],
            exports: 'Backbone.Agave.Apps'
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
