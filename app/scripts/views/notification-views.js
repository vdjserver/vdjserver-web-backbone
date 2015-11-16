define([
    'app',
    'handlebars',
    'environment-config',
    'file-transfer-sidebar-ui-mixin',
], function(
    App,
    Handlebars,
    EnvironmentConfig,
    FileTransferSidebarUiMixin
) {

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
        tagName: 'li',
        template: 'notification/message',
        initialize: function(parameters) {
            if (parameters.hasOwnProperty('notification')) {
                this.notification = parameters.notification;
            }
        },
        serialize: function() {
            return {
                type: this.notification.get('type'),
                notification: this.notification.get('notification'),
            };
        },
    });

    Notifications.FileTransfer = Backbone.View.extend({
        template: 'notification/file-transfer',
        serialize: function() {
            return {
                fileUniqueIdentifier: this.fileUniqueIdentifier,
                filename: this.filename,
                transferIcon: 'fa fa-laptop',
            };
        },
    });

    Notifications.FileImport = Backbone.View.extend(
        _.extend({}, FileTransferSidebarUiMixin, {

            template: 'notification/file-transfer',
            initialize: function(parameters) {

                this.notificationModel = parameters.notificationModel;
                this.fileUuid = parameters.fileUuid;

                this.listenTo(
                    App.Instances.WebsocketManager,
                    'fileImportUpdate',
                    this._handleFileImportUpdate
                );
            },
            serialize: function() {
                return {
                    fileUniqueIdentifier: this.fileUuid,
                    filename: this.notificationModel.filename,
                    transferIcon: 'fa fa-dropbox',
                };
            },

            // Private Methods
            _handleFileImportUpdate: function(websocketNotification) {

                if (this.fileUuid === websocketNotification.fileInformation.fileUuid) {
                    var percentCompleted = this._getPercentCompleted(websocketNotification.fileImportStatus);

                    this._uiSetUploadProgress(percentCompleted, this.fileUuid);
                }

                if (websocketNotification.fileImportStatus === 'finished') {
                    this._uiSetSidemenuTransferSuccess(this.fileUuid);
                    this.notificationModel.projectView._fetchAndRenderFileListings();
                }
            },
            _getPercentCompleted: function(importStatus) {
                var percentCompleted = 0;

                switch (importStatus) {
                    case 'permissions': {
                        percentCompleted = 25;
                        break;
                    }

                    case 'metadata': {
                        percentCompleted = 50;
                        break;
                    }

                    case 'metadataPermissions': {
                        percentCompleted = 75;
                        break;
                    }

                    case 'finished': {
                        percentCompleted = 100;
                        break;
                    }

                    default: {
                        break;
                    }
                }

                return percentCompleted;
            },
        })
    );

    App.Views.Notifications = Notifications;
    return Notifications;
});
