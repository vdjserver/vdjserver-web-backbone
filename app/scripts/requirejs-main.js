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
    
    //d3 and nvd3 libs for JS visualization
    'd3',
    'nvd3',

    // Agave
    'backbone-agave',
    'agave-new-account',
    'agave-io',

    'agave-tenant-user',
    'agave-tenant-users',

    'agave-permission',
    'agave-permissions',
    'agave-project',
    'agave-projects',

    'agave-profile',

    'agave-file-metadata',
    'agave-file-metadatas',

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
    'job-views',
    'project-views',
    'analyses-views',

    // Routers
    'router'

], function(App) {
    App.start();
});