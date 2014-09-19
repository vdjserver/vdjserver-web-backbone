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

    var JobWebsocket = Backbone.Model.extend({
        connectToServer: function() {
            //console.log("connecting to server");
        },
        subscribeToJob: function(jobId) {

            var that = this;

            //console.log("subscribe jobId is: " + jobId);

            var socket = io.connect(
                EnvironmentConfig.vdjauthRoot,
                {
                    'reconnection delay': 500,
                }
            );

            socket.on('connect', function() {
                socket.emit('joinRoom', jobId);
            });

            socket.on('jobUpdate', function(jobUpdate) {
                //console.log("jobUpdate is: " + JSON.stringify(jobUpdate));
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
                //console.log("scenario A");
                socket = App.Instances.Websockets.Job;
            }
            else {
                //console.log("scenario B");
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
