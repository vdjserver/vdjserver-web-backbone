define([
    'app',
    'socket-io',
    'environment-config'
], function(
    App,
    io,
    EnvironmentConfig
) {

    'use strict';

    var JobWebsocket = Backbone.Model.extend({
        connectToServer: function() {
        },
        subscribeToJob: function(jobId) {

            var that = this;

            var socket = io.connect(
                EnvironmentConfig.vdjauthRoot,
                {
                    'reconnection': true,
                    'reconnectionDelay': 1000,
                    'reconnectionDelayMax': 5000,
                    'reconnectionAttempts': 5,
                    'path': '/api/v1/socket.io',
                }
            );

            socket.on('connect', function() {
                socket.emit('joinRoom', jobId);
            });

            socket.on('connect_error', function(error) {
                if (EnvironmentConfig.debug.console) {
                    console.log('socket connect_error is: ' + JSON.stringify(error));
                }
            });

            socket.on('error', function(error) {
                if (EnvironmentConfig.debug.console) {
                    console.log('socket error is: ' + JSON.stringify(error));
                }
            });

            socket.on('jobUpdate', function(jobUpdate) {
                if (EnvironmentConfig.debug.console) {
                    console.log('socket jobUpdate received: ' + JSON.stringify(jobUpdate));
                }

                that.trigger('jobStatusUpdate', jobUpdate);
            });
        },
    });

    var Jobs = {};

    Jobs.Factory = function() {};
    Jobs.Factory.prototype = {
        getJobWebsocket: function() {

            var socket;

            if (App.Instances.Websockets.Job) {
                socket = App.Instances.Websockets.Job;
            }
            else {
                socket = new JobWebsocket();
                //socket.connectToServer();

                App.Instances.Websockets.Job = socket;
            }

            return socket;
        },
    };

    App.Websockets.Jobs = Jobs;
    return Jobs;
});
