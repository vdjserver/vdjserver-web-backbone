'use strict';

define([
    'app',
    'handlebars',
    'jquery',
    'bootstrap',
    'backbone.syphon',
    'moment',

    // Agave
    'backbone-agave',
    'agave-uuid', // Order matters here. Don't change it.
    'agave-account',
    'agave-io',
    'agave-profile',
    'agave-project',
    'agave-projects',

    // VDJ
    'backbone-vdj',

    'models/message',
    'models/form',

    // Views
    'app-views',
    'form-views',
    'util-views',

    'agave-auth-views',
    'agave-io-views',
    'profile-views',
    'project-views',

    // Routers
    'router'

], function(App) {
    App.start();
});
