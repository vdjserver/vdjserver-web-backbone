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

    //Library for using google's recaptcha-ajax
    'recaptcha-ajax',

    //jquery.event.drag/drop
    'jquery.event.drag',
    'jquery.event.drop',

    //slickgrid
    'slickgrid.core',
    'slickgrid.grid',

    // Regular Models
    'error',
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
    'agave-feedback',

    'agave-job',
    'agave-jobs',

    // Regular Models
    'models/message',
    'models/form',

    // Handlebars Helpers
    'handlebars-utilities',

    // Model Helpers
    'vdjpipe-utilities',

    // Generic Views
    'generic-vdjpipe-option-views',

    // View Helpers
    'vdjpipe-view-helpers',
    'view-layouts',

    // Views
    'form-views',
    'util-views',
    'not-found-views',

    'create-account-views',
    'forgot-password-views',
    'profile-views',
    'job-views',
    'project-views',
    'sidemenu-views',
    'notification-views',
    'navbar-views',
    'public-views',
    'analyses-views',
    'vdjpipe-views',
    'feedback-views',

    // Routers
    'router'

], function(App) {
    App.start();
});
