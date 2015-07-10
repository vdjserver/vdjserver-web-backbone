define([
    'app',
    'socket-io',
    'environment-config',
], function(
    App,
    io,
    EnvironmentConfig
) {

    'use strict';

    var WebsocketManager = Backbone.Model.extend({
        initialize: function() {

            var that = this;

            this.socket = io.connect(
                EnvironmentConfig.vdjApi.host,
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

                that.trigger('jobStatusUpdate', jobUpdate);
            });

            this.socket.on('fileImportUpdate', function(fileImportUpdate) {
                if (EnvironmentConfig.debug.console) {
                    console.log('socket fileImportUpdate received: ' + JSON.stringify(fileImportUpdate));
                }

                that.trigger('fileImportUpdate', fileImportUpdate);
            });
        },
        subscribeToEvent: function(eventId) {
            if (EnvironmentConfig.debug.console) {
                console.log('socket subscribeToEvent - ' + eventId);
            }

            this.socket.emit('joinRoom', eventId);
        },
    });

    App.Utilities.WebsocketManager = WebsocketManager;
    return WebsocketManager;
});
