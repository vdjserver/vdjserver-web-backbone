define([
    'app',
    'underscore.string',
], function(
    App,
    _string
) {

    'use strict';

    var Notifications = {};

    Notifications.Job = Backbone.View.extend({
        tagName: 'li',
        template: 'notification/message',
        initialize: function(parameters) {
            if (parameters.hasOwnProperty('notification')) {
                this.notification = parameters.notification;
            }
        },
        events: {
            'click .notification-message': '_selectMessage',
        },
        serialize: function() {
            return {
                icon: 'fa fa-server',
                type: this.notification.get('notification').jobName,
                notification: this._getMessageForJobStatus(this.notification),
            };
        },
        _selectMessage: function(e) {
            e.preventDefault();
        },
        _getMessageForJobStatus: function(notification) {
            var statusText = _string.capitalize(notification.get('notification').jobStatus.toLowerCase());

            var messageText = notification.get('notification').jobMessage;

            var completeMessage = statusText + ': ' + messageText;

            return completeMessage;
        },
    });

    Notifications.FileImport = Backbone.View.extend({
        tagName: 'li',
        template: 'notification/message',
        initialize: function(parameters) {
            if (parameters.hasOwnProperty('notification')) {
                this.notification = parameters.notification;
            }
        },
        events: {
            'click .notification-message': '_selectMessage',
        },
        serialize: function() {
            var filename = this._getFilenameFromPath(this.notification.get('notification').fileInformation.filePath);

            return {
                icon: 'fa fa-file-o',
                type: filename,
                notification: this._getMessageForImportStatus(this.notification),
            };
        },
        _selectMessage: function(e) {
            e.preventDefault();
        },
        _getMessageForImportStatus: function(notification) {

            var message = '';

            switch (notification.get('notification').fileImportStatus) {
                case 'permissions':
                    message = 'Set file permissions.';
                    break;

                case 'metadata':
                    message = 'Created file metadata.';
                    break;

                case 'metadataPermissions':
                    message = 'Set file metadata permissions.';
                    break;

                case 'finished':
                    message = 'Finished importing.';
                    break;

                default:
                    break;
            }

            return message;
        },
        _getFilenameFromPath: function(path) {
            // e.g. filePath":"/vdjZ/projects/1913926141201018395-e0bd34dffff8de6-0001-012/files/text9.txt
            var splitPath = path.split('/');

            var filename = splitPath.pop();

            return filename;
        },

        /*
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
        */
    });

    // TODO: this is deprecated and should be carefully removed soon
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

    App.Views.Notifications = Notifications;
    return Notifications;
});
