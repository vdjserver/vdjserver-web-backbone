'use strict';

define([
    'app',
    'handlebars',
    'jquery',
    'jquery-ui',
    'bootstrap',
    'typeahead',
    'file-saver',

    // Config
    'environment-config',

    //d3 and nvd3 libs for JS visualization
    'd3',
    'nvd3',
    //box for help with the box and whisker plot
    'box',
 
    //jquery.event.drag/drop
    'jquery.event.drag',
    'jquery.event.drop',
    
    //slickgrid
    'slickgrid.core',
    'slickgrid.grid',
    
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

    // Routers
    'router'

], function(App) {
    App.start();
});
