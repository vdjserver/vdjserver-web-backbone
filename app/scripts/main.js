'use strict';

define([
    'app',
    'handlebars',
    'jquery',
    'bootstrap',
    'backbone.syphon',
    'moment',

    // Config
    'environment-config',

    // Agave
    'backbone-agave',
    'agave-new-account',
    'agave-io',

    'agave-project-user',
    'agave-project-users',
    'agave-project',
    'agave-projects',

    'agave-profile',

    // VDJ
    'models/message',
    'models/form',

    // Handlebars Helpers
    'handlebars-utilities',

    // Views
    'app-views',
    'form-views',
    'util-views',

    'create-account-views',
    'auth-views',
    'io-views',
    'profile-views',
    'project-views',

    // Routers
    'router'

], function(App) {
    App.start();
});
