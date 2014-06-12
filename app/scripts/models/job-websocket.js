define([
    'app',
    'socket-io',
    'environment-config'
], function(
    App,
    io,
    EnvironmentConfig
){

    'use strict';

    var JobWebsocket = {};

    JobWebsocket = function() {};

    JobWebsocket.prototype = {
        connectToServer: function() {
            console.log("connecting to server");
        },
        subscribeToJob: function(jobId) {

            console.log("subscribe jobId is: " + jobId);

            var socket = io.connect(EnvironmentConfig.vdjauthRoot);

            socket.on('connect', function() {
                socket.emit('joinRoom', jobId);
            });

            socket.on('jobUpdate:' + jobId, function(jobUpdate) {
                console.log("jobUpdate is: " + JSON.stringify(jobUpdate));
            });
        },
    };

    /*
    JobWebsocket.Factory = function() {};

    JobWebsocket.Factory.prototype = {
        getJobWebsocket: function() {

            var socket;

            if (App.Websockets.job) {
                console.log("scenario A");
                socket = App.Websockets.job;
            }
            else {
                console.log("scenario B");
                socket = new JobWebsocket();
                socket.connectToServer();
                App.Websockets.job = socket;
            }

            return socket;
        },
    };
    */

    App.Models.JobWebsocket = JobWebsocket;
    return JobWebsocket;
});

