'use strict';

define([
    'app',
    'handlebars',
    'jquery',
    'jquery-ui',
    'bootstrap',
    'backbone.syphon',
    //'moment',
    'typeahead',

    // Config
    'environment-config',

    // Agave
    'backbone-agave',
    'agave-new-account',
    'agave-io',

    'agave-user',
    'agave-users',

    'agave-project-user',
    'agave-project-users',
    'agave-project',
    'agave-projects',

    'agave-profile',

    'agave-file',
    'agave-files',

    // Regular Models
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
