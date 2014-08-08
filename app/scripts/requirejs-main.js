'use strict';

define([
    'app',
    'handlebars',
    'bootstrap',
    'typeahead',
    'file-saver',

    // Config
    'environment-config',

    // Libs for JS visualization
    'nvd3',
    'box', // box for help with the box and whisker plot

    //jquery.event.drag/drop
    'jquery.event.drag',
    'jquery.event.drop',

    //slickgrid
    'slickgrid.core',
    'slickgrid.grid',

    // Regular Models
    'job-websocket',

    // Agave
    'backbone-agave',
    'agave-new-account',
    'agave-notification',

    'agave-password-change',
    'agave-password-reset',

    'agave-tenant-user',
    'agave-tenant-users',

    'agave-permission',
    'agave-permissions',
    'agave-project',
    'agave-projects',

    'agave-profile',

    'agave-file',
    'agave-files',

    'agave-job',
    'agave-jobs',

    // Regular Models
    'models/message',
    'models/form',

    // Handlebars Helpers
    'handlebars-utilities',
    'handlebars-file-metadata-helpers',

    // Model Helpers
    'vdjpipe-utilities',

    // Generic Views
    'generic-vdjpipe-option-views',

    // View Helpers
    'vdjpipe-view-helpers',

    // Views
    'app-views',
    'form-views',
    'util-views',
    'not-found-views',

    'create-account-views',
    'forgot-password-views',
    'profile-views',
    'job-views',
    'project-views',
    'analyses-views',
    'vdjpipe-views',

    // Routers
    'router'

], function(App) {
    App.start();
});
