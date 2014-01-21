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
    'agave-new-account',
    'agave-io',

    'agave-project-user',
    'agave-project-users',
    'agave-project',
    'agave-projects',

    'agave-profile',

    // VDJ
    'backbone-vdj',
    'models/message',
    'models/form',

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
