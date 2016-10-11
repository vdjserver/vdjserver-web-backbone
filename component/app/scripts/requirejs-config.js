'use strict';

require.config({
    deps: ['requirejs-main'],
    paths: {
        'backbone':         '../bower_components/backbone/backbone',
        'backbone.syphon':  '../bower_components/marionette.backbone.syphon/lib/backbone.syphon',
        'backbone-retry-sync': '../bower_components/backbone-retry-sync/backbone-retry-sync',
        'bootstrap':        '../bower_components/twbs-bootstrap-sass/assets/javascripts/bootstrap',
        'bootstrap-multiselect': '../bower_components/bootstrap-multiselect/dist/js/bootstrap-multiselect',
        'chance':           '../bower_components/chance/chance',
        'datatables':       '../bower_components/datatables/media/js/jquery.dataTables',
        'datatables-responsive': '../bower_components/datatables-responsive/js/dataTables.responsive',
        //'datatables.net':       '../bower_components/datatables.net/js/jquery.dataTables',
        //'datatables.net-bs':       '../bower_components/datatables.net-bs/js/dataTables.bootstrap',
        //'datatables.net-select':       '../bower_components/datatables.net-select/js/dataTables.select',
        //'datatables.net-scroller':       '../bower_components/datatables.net-scroller/js/dataTables.scroller',
        //'datatables.net-responsive': '../bower_components/datatables.net-responsive/js/dataTables.responsive',
        //'datatables.net-responsive-bs': '../bower_components/datatables.net-responsive-bs/js/responsive.bootstrap',
        'detect':           '../bower_components/Detect.js/detect',
        'filesize':         '../bower_components/filesize/lib/filesize',
        'file-saver':       '../bower_components/file-saver/FileSaver',
        'handlebars':       '../bower_components/handlebars/handlebars',
        'highcharts':       '../bower_components/highstock-release/highstock',
        'highcharts-data':  '../bower_components/highstock-release/modules/data',
        'highcharts-drilldown': '../bower_components/highstock-release/modules/drilldown',
        'highcharts-more':  '../bower_components/highstock-release/highcharts-more',
        'highcharts-exporting': '../bower_components/highstock-release/modules/exporting',


        'jquery':           '../bower_components/jquery/dist/jquery',
        'jquery-ui':        '../bower_components/jquery-ui/jquery-ui',
        'layoutmanager':    '../bower_components/layoutmanager/backbone.layoutmanager',
        'moment':           '../bower_components/moment/moment',
        'typeahead':        '../bower_components/typeahead.js/dist/typeahead.bundle',
        'underscore':       '../bower_components/underscore/underscore',
        'underscore.string': '../bower_components/underscore.string/dist/underscore.string.min',
        'd3':               '../bower_components/d3/d3.min',
        'nvd3':             '../bower_components/nvd3/nv.d3.min',
        'socket-io':        '../bower_components/socket.io-client/socket.io',
        'simple-statistics':'../bower_components/simple-statistics/src/simple_statistics',

        // Backbone Extensions
        'backbone-agave':  'backbone/backbone-agave',

        // Regular Models
        'error': 'models/error',
        'recaptcha': 'models/recaptcha',

        // Agave - Models/Collections
        'telemetry': 'models/telemetry',

        'agave-account': 'models/agave-account',
        'agave-feedback': 'models/agave-feedback',

        'agave-community-data': 'models/agave-community-data',
        'agave-community-datas': 'collections/agave-community-datas',

        'agave-notification': 'models/agave-notification',
        'agave-password-reset': 'models/agave-password-reset',
        'agave-password-change': 'models/agave-password-change',
        'agave-system': 'models/agave-system',
        'agave-systems': 'collections/agave-systems',
        'agave-tenant-user': 'models/agave-tenant-user',
        'agave-tenant-users': 'collections/agave-tenant-users',

        'agave-file': 'models/agave-file',
        'agave-files': 'collections/agave-files',

        'agave-job': 'models/agave-job',
        'agave-jobs': 'collections/agave-jobs',

        // Agave - Metadata Models/Collections
        'agave-permission':  'models/agave-permission',
        'agave-permissions': 'collections/agave-permissions',
        'agave-project': 'models/agave-project',
        'agave-projects': 'collections/agave-projects',

        'agave-profile': 'models/agave-profile',

        'agave-sample-metadata': 'models/agave-sample-metadata',
        'agave-samples-metadata': 'collections/agave-samples-metadata',
        'agave-subject-metadata': 'models/agave-subject-metadata',
        'agave-subjects-metadata': 'collections/agave-subjects-metadata',
        'agave-sample-group': 'models/agave-sample-group',
        'agave-sample-groups': 'collections/agave-sample-groups',

        // Misc.
        'box': 'vendor/box',
        'jquery.event.drag':'vendor/jquery.event.drag',
        'jquery.event.drop':'vendor/jquery.event.drop',

        // Handlebars Helpers
        'handlebars-utilities':   'views/utilities/handlebars-utilities',

        // Utilities
        'websocket-manager': 'utilities/websocket-manager',
        'serialization-tools': 'utilities/serialization-tools',
        'vdjpipe-workflow-parser': 'utilities/vdjpipe-workflow-parser',
        'vdjpipe-view-factory': 'utilities/vdjpipe-view-factory',
        'presto-view-factory': 'utilities/presto-view-factory',
        'repcalc-view-factory': 'utilities/repcalc-view-factory',

        // Generic Views
        'generic-vdjpipe-option-views': 'views/generic/generic-vdjpipe-option-views',

        // Mixins
        'file-transfer-project-ui-mixin': 'mixins/file-transfer-project-ui-mixin',
        'comparators-mixin': 'collections/mixins/comparators-mixin',
        'file-transfer-mixins': 'models/mixins/file-transfer-mixins',

        // View Helpers
        'view-layouts': 'views/layouts/view-layouts',

        // Views
        'util-views': 'views/app/util-views',
        'not-found-views': 'views/not-found-views',

        'account-views': 'views/account-views',
        'forgot-password-views': 'views/forgot-password-views',
        'profile-views': 'views/profile-views',
        'job-views': 'views/job-views',
        'project-views': 'views/project-views',
        'sidemenu-views': 'views/sidemenu-views',
        'notification-views': 'views/notification-views',
        'navbar-views': 'views/navbar-views',
        'public-views': 'views/public-views',
        'analyses-views': 'views/analyses-views',
        'vdjpipe-views': 'views/vdjpipe-views',
        'presto-views': 'views/presto-views',
        'repcalc-views': 'views/repcalc-views',
        'feedback-views': 'views/feedback-views',
        'software-views': 'views/software-views',
        'community-views': 'views/community-views',

        // Routers
        'router': 'routers/router'

    },
    config: {
        moment: {
            noGlobal: true,
        },
    },
    shim: {
        'bootstrap': {
            deps: ['jquery']
        },
        'bootstrap-multiselect': {
            deps: ['bootstrap']
        },
        'jquery.event.drag': {
            deps: ['jquery']
        },
        'jquery.event.drop': {
            deps: ['jquery']
        },
        'handlebars': {
            exports: 'Handlebars'
        },

        'highcharts': {
          deps: ['jquery'],
          exports: 'Highcharts'
        },
        'highcharts-data': {
          deps: ['highcharts'],
        },
        'highcharts-drilldown': {
          deps: ['highcharts'],
        },
        'highcharts-more': {
            deps:['highcharts'],
        },
        'highcharts-exporting': {
            deps:['highcharts'],
        },

        'layoutmanager': {
            deps: ['backbone'],
            exports: 'layoutmanager'
        },
        'box': {
            deps:['d3'],
            exports: 'box'
        },
        'nvd3': {
            deps:['d3'],
            exports: 'nv'
        },
        'typeahead': {
            deps: ['jquery']
        },

        // Agave
        'backbone-agave': {
            deps: ['backbone'],
            exports: 'Backbone.Agave'
        },

        // Agave - Models
        'telemetry': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.Telemetry',
        },

        'agave-account': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.Account',
        },

        'agave-community-data': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.CommunityData',
        },

        'agave-community-datas': {
            deps: ['backbone', 'backbone-agave', 'agave-community-data'],
            exports: 'Backbone.Agave.Collection.CommunityDatas'
        },

        'agave-notification': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.Notification'
        },

        'agave-password-reset': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.PasswordReset'
        },

        'agave-password-change': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.PasswordChange'
        },

        'agave-tenant-user': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.TenantUser'
        },
        'agave-tenant-users': {
            deps: ['backbone', 'backbone-agave', 'agave-tenant-user'],
            exports: 'Backbone.Agave.Collection.TenantUsers'
        },

        'agave-feedback': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.FeedbackModel'
        },

        'agave-file': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.File'
        },
        'agave-files': {
            deps: ['backbone', 'backbone-agave', 'agave-file'],
            exports: 'Backbone.Agave.Collection.Files'
        },

        'agave-job': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.Job'
        },
        'agave-jobs': {
            deps: ['backbone', 'backbone-agave', 'agave-job'],
            exports: 'Backbone.Agave.Collection.Jobs'
        },

        'agave-system': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.System',
        },
        'agave-systems': {
            deps: ['backbone', 'backbone-agave', 'agave-system'],
            exports: 'Backbone.Agave.Collection.Systems',
        },

        // TODO - reorganize these. alphabetically?
        'agave-profile': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.Profile'
        },

        // Projects
        'agave-permission': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.ProjectUser'
        },
        'agave-permissions': {
            deps: ['backbone', 'backbone-agave', 'agave-permission'],
            exports: 'Backbone.Agave.Collection.ProjectUsers'
        },

        'agave-project': {
            deps: ['backbone', 'backbone-agave', 'agave-permissions'],
            exports: 'Backbone.Agave.Model.Project'
        },
        'agave-projects': {
            deps: ['backbone', 'backbone-agave', 'agave-project'],
            exports: 'Backbone.Agave.Collection.Projects'
        },

        // Metadata Entry
        'agave-sample-metadata': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.SampleMetadata'
        },
        'agave-samples-metadata': {
            deps: ['backbone', 'backbone-agave', 'agave-sample-metadata'],
            exports: 'Backbone.Agave.Collection.SamplesMetadata'
        },
        'agave-subject-metadata': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.SubjectMetadata'
        },
        'agave-subjects-metadata': {
            deps: ['backbone', 'backbone-agave', 'agave-subject-metadata'],
            exports: 'Backbone.Agave.Collection.SubjectsMetadata'
        },
        'agave-sample-group': {
            deps: ['backbone', 'backbone-agave'],
            exports: 'Backbone.Agave.Model.SampleGroup'
        },
        'agave-sample-groups': {
            deps: ['backbone', 'backbone-agave', 'agave-sample-group'],
            exports: 'Backbone.Agave.Collection.SampleGroups'
        },

        //Analyses
        'agave-analyses': {
            deps: ['backbone', 'backbone-agave', 'agave-project'],
            exports: 'Backbone.Agave.Collection.Analyses'
        }
    }
});
