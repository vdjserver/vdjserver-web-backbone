/*
define([
    'app',
    'socket-io',
], function(
    App,
    io
) {

    'use strict';

    var WebsocketManager = Backbone.Model.extend({
        initialize: function() {

            var that = this;

            this.socket = io.connect(
                EnvironmentConfig.vdjApi.hostname,
                {
                    'reconnection': true,
                    'reconnectionDelay': 1000,
                    'reconnectionDelayMax': 5000,
                    'reconnectionAttempts': 5,
                    'path': '/api/v1/socket.io',
                }
            );

            this.socket.on('connect', function() {
                if (EnvironmentConfig.debug.console) {
                    console.log('connect room ok');
                }
            });

            this.socket.on('connect_error', function(error) {
                if (EnvironmentConfig.debug.console) {
                    console.log('socket connect_error is: ' + JSON.stringify(error));
                }
            });

            this.socket.on('error', function(error) {
                if (EnvironmentConfig.debug.console) {
                    console.log('socket error is: ' + JSON.stringify(error));
                }
            });

            this.socket.on('jobUpdate', function(jobUpdate) {
                if (EnvironmentConfig.debug.console) {
                    console.log('socket jobUpdate received: ' + JSON.stringify(jobUpdate));
                }

                var notification = new App.Models.Notification();
                notification.set('type', App.Models.Notification.JOB_NOTIFICATION);
                notification.set('notification', jobUpdate);

                App.Datastore.Notifications.push(notification);
                // TODO: reexamine websocket trigger
                that.trigger('jobStatusUpdate', jobUpdate);
            });

            this.socket.on('fileImportUpdate', function(fileImportUpdate) {
                if (EnvironmentConfig.debug.console) {
                    console.log('socket fileImportUpdate received: ' + JSON.stringify(fileImportUpdate));
                }

                var notification = new App.Models.Notification();
                notification.set('type', App.Models.Notification.FILE_IMPORT_NOTIFICATION);
                notification.set('notification', fileImportUpdate);

                if (fileImportUpdate.hasOwnProperty('error')) {
                    that.trigger('fileImportError', fileImportUpdate);
                }
                else {
                    App.Datastore.Notifications.push(notification);

                    that.trigger('fileImportUpdate', fileImportUpdate);

                    if (fileImportUpdate.hasOwnProperty('fileImportStatus') && fileImportUpdate.fileImportStatus === 'finished') {
                        that.trigger('addFileToProject', fileImportUpdate.fileInformation.metadata);
                    }
                    else if (fileImportUpdate.hasOwnProperty('fileImportStatus') && fileImportUpdate.fileImportStatus === 'permissions') {
                        //permissions
                        var filename = fileImportUpdate.fileInformation.filePath.split('/').pop();

                        fileImportUpdate.fileInformation.metadata = {
                            value: {
                                'name': filename,
                            },
                        };

                        that.trigger('updateFileImportProgress', fileImportUpdate);
                    }
                }
            });

            this.socket.on('userProjectUpdate', function(userProjectUpdate) {
                if (EnvironmentConfig.debug.console) {
                    console.log('socket userProjectUpdate received: ' + JSON.stringify(userProjectUpdate));
                }

                var notification = new App.Models.Notification();
                notification.set('type', App.Models.Notification.USER_PROJECT_NOTIFICATION);
                notification.set('notification', userProjectUpdate);

                App.Datastore.Notifications.push(notification);
                // TODO: reexamine websocket trigger
                that.trigger('userProjectUpdate', userProjectUpdate);
            });

        },
        subscribeToEvent: function(eventId) {
            if (EnvironmentConfig.debug.console) {
                console.log('socket subscribeToEvent - ' + eventId);
            }

            this.socket.emit('joinRoom', eventId);
        },
    },
    {
        FILE_IMPORT_STATUS_PROGRESS: {
            'permissions': 50,
            'metadata': 75,
            'metadataPermissions': 100,
        },
    }
    );

    App.Utilities.WebsocketManager = WebsocketManager;
    return WebsocketManager;
});
*/
