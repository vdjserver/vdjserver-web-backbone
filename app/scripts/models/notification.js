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
            DROPBOX_FILE_IMPORT_NOTIFICATION: 'dropboxFileImportNotification',
        }
    );

    App.Models.Notification = Notification;
    return Notification;
});
