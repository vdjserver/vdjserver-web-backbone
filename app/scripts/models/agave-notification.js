define(['backbone'], function(Backbone) {

    'use strict';

    var Notification = {};

    Notification.Job = Backbone.Agave.Model.extend({
        defaults: {
            event: '*',
            url:   Backbone.Agave.vdjauthRoot + '/notifications/jobs/${JOB_ID}?status=${JOB_STATUS}&event=${EVENT}&error=${JOB_ERROR}',
            associatedUuid:  '',
        },
        initialize: function(parameters) {
            if (parameters.projectUuid) {
                this.projectUuid = parameters.projectUuid;
            }
        },
        url: function() {
            return '/files/v2/media/system/data.vdjserver.org//projects/' + this.projectUuid + '/files/';
        },
    });

    Backbone.Agave.Model.Notification = Notification;
    return Notification;
});
