define(['backbone'], function(Backbone) {

    'use strict';

    var Notification = {};

    Notification.Job = Backbone.Agave.Model.extend({
        defaults: {
            event: '*',
            url:   Backbone.Agave.vdjauthRoot + '/notifications/jobs/${JOB_ID}?status=${JOB_STATUS}&event=${EVENT}&error=${JOB_ERROR}',
            associatedUuid:  '',
        },
        url: function() {
            return '/notifications/v2/';
        },
    });

    Backbone.Agave.Model.Notification = Notification;
    return Notification;
});
