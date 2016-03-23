define(['app'], function(App) {

    'use strict';

    var Notification = Backbone.Model.extend(
        {
            defaults: {
                type: '',
                notification: {},
            },
        },
        {
            JOB_NOTIFICATION: 'jobNotification',
            FILE_IMPORT_NOTIFICATION: 'fileImportNotification',
        }
    );

    App.Models.Notification = Notification;
    return Notification;
});
