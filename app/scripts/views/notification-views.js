define([
    'app',
    'handlebars',
    'environment-config',
], function(App, Handlebars, EnvironmentConfig) {

    'use strict';

    Handlebars.registerHelper('GetClassForJobStatus', function(notification /*, options*/) {

        if (EnvironmentConfig.debug.console) {
            console.log('job status is: ' + JSON.stringify(notification));
        }

        if (notification.jobStatus === ('PENDING' || 'QUEUED')) {
            return 'badge-warning';
        }
        else if (notification.jobStatus === ('ARCHIVING_FINISHED' || 'FINISHED')) {
            return 'badge-success';
        }
        else if (notification.jobStatus === ('KILLED' || 'FAILED')) {
            return 'badge-danger';
        }
        else {
            var currentClass = $('#project-' + notification.uuid + '-notification-badge').attr('class');
            return currentClass;
        }
    });

    var Notifications = {};

    Notifications.Job = Backbone.View.extend({
        template: 'notification/job',
        initialize: function(parameters) {

            this.notificationModel = parameters.notificationModel;

            this.listenTo(
                App.Instances.WebsocketManager,
                'jobStatusUpdate',
                this._handleJobStatusUpdate
            );

            this.jobStatusMessage = 'PENDING';
        },
        serialize: function() {
            return {
                jobName: this.notificationModel.get('name'),
                jobStatus: this.jobStatusMessage,
                uuid: this.notificationModel.projectUuid,
            };
        },

        // Private Methods
        _handleJobStatusUpdate: function(jobStatusUpdate) {
            this.jobStatusMessage = jobStatusUpdate['jobStatus'];
            this.render();
        },
    });

    Notifications.FileTransfer = Backbone.View.extend({
        template: 'notification/file-transfer',
        serialize: function() {
            return {
                fileUniqueIdentifier: this.fileUniqueIdentifier,
                filename: this.filename,
            };
        },
    });

    Notifications.FileImport = Backbone.View.extend({
        template: 'notification/file-import',
        initialize: function(parameters) {

            this.notificationModel = parameters.notificationModel;

            this.listenTo(
                App.Instances.WebsocketManager,
                'fileImportUpdate',
                this._handleFileImportUpdate
            );

            this.statusMessage = 'pending';
        },
        serialize: function() {
            return {
                fileName: this.notificationModel.filename,
                fileStatus: this.statusMessage,
                projectUuid: this.notificationModel.projectUuid,
            };
        },

        // Private Methods
        _handleFileImportUpdate: function(websocketNotification) {

            if (this.notificationModel.associatedUuid === websocketNotification.fileUuid) {
                this.statusMessage = websocketNotification.fileImportStatus;
                this.render();
            }

            if (websocketNotification.fileImportStatus === 'finished') {
                this.notificationModel.projectView._fetchAndRenderFileListings();
            }
        },
    });

    App.Views.Notifications = Notifications;
    return Notifications;
});
