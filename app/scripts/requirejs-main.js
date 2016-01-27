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
    'datatables-responsive',

    'highcharts',
    'highcharts-data',
    'highcharts-drilldown',
    'highcharts-more',
    'highcharts-exporting',

    //jquery.event.drag/drop
    'jquery.event.drag',
    'jquery.event.drop',

    // Regular Models
    'error',

    // Agave
    'backbone-agave',
    'telemetry',

    'agave-account',
    'agave-community-data',
    'agave-community-datas',
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

    'agave-system',
    'agave-systems',

    // Regular Collections and Models
    'models/message',
    'models/notification',
    'collections/notifications',

    // Handlebars Helpers
    'handlebars-utilities',

    // Utilities
    'websocket-manager',
    'serialization-tools',
    'vdjpipe-workflow-parser',
    'vdjpipe-view-factory',

    // Generic Views
    'generic-vdjpipe-option-views',

    // Mixins
    'file-download-detection-mixin',
    'file-transfer-project-ui-mixin',
    'comparators-mixin',
    'file-transfer-mixins',

    // View Helpers
    'view-layouts',

    // Views
    'util-views',
    'not-found-views',

    'account-views',
    'community-views',
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
    'software-views',

    // Routers
    'router'

], function(App) {
    App.start();
});
