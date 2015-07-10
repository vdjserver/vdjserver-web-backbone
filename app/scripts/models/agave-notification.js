define(
    [
        'backbone',
        'environment-config'
    ],
function(Backbone, EnvironmentConfig) {

    'use strict';

    var Notification = {};

    Notification.Job = Backbone.Agave.Model.extend({
        defaults: {
            event: '*',
            url: EnvironmentConfig.vdjApi.host + '/notifications/jobs/${JOB_ID}?status=${JOB_STATUS}&event=${EVENT}&error=${JOB_ERROR}',
            associatedUuid: '',
            persistent: true,
        },
        url: function() {
            return '/notifications/v2/';
        },
    });

    Notification.FileImport = Backbone.Agave.Model.extend({
        defaults: {
            event: 'TRANSFORMING_COMPLETED',
            //event: '*',
            url: EnvironmentConfig.vdjApi.host + '/notifications/files/${UUID}'
                + '?event=${EVENT}'
                + '&type=${TYPE}'
                //+ '&format=${FORMAT}'
                + '&path=${PATH}'
                + '&system=${SYSTEM}',
            associatedUuid: '',
            persistent: false,
        },
        url: function() {
            return '/notifications/v2/';
        },
    });

    Backbone.Agave.Model.Notification = Notification;
    return Notification;
});
