define([
    'app',
], function(App) {

    'use strict';

    var Navbar = {};

    Navbar.Navigation = Backbone.View.extend({
        template: 'navbar/navbar-project',
        initialize: function() {

            var that = this;
            this.subviews = [];

            this.listenTo(App.Datastore.Notifications, 'add', function(model) {

                var subview = undefined;

                switch (model.get('type')) {
                    case App.Models.Notification.JOB_NOTIFICATION:

                        if (model.get('notification').jobStatus.toLowerCase() === 'finished') {
                            subview = new App.Views.Notifications.Job({notification: model});
                        }

                        break;

                    case App.Models.Notification.FILE_IMPORT_NOTIFICATION:

                        if (model.get('notification').fileImportStatus.toLowerCase() === 'finished') {
                            subview = new App.Views.Notifications.FileImport({notification: model});
                        }

                        break;

                    default:
                        break;
                }

                if (subview !== undefined) {
                    that.subviews.unshift(subview);
                    this._addNotificationAlert();
                }
            });

            App.Datastore.Collection.ProjectCollection.on('change add remove destroy', function() {
                that.render();
            });
        },
        serialize: function() {
            return {
                projects: App.Datastore.Collection.ProjectCollection.toJSON(),
                token: App.Agave.token().toJSON(),
            };
        },
        events: {
            'click #notification-menu': '_readNotifications',
        },
        _readNotifications: function() {

            this._clearNotificationAlerts();

            /*
            var notificationLimit = 5;

            if (this.subviews.length < 5) {
                notificationLimit = subviews.length;
            }
            */

            // remove all notifications except the 5 most recent ones
            for (var j = 4; j < this.subviews.length; j++) {
                this.subviews.pop();
            };

            // clear out old subviews so we can make a new list
            this.removeView('#notification-list');

            for (var i = 0; i < this.subviews.length; i++) {
                var view = this.subviews[i];
                this.insertView('#notification-list', view);
                view.render();
            };
        },
        _addNotificationAlert: function() {
            $('#notification-menu')
                .addClass('swing animated')
                .removeClass('notification-empty')
                ;
        },
        _clearNotificationAlerts: function() {
            $('#notification-menu')
                .addClass('notification-empty')
                .removeClass('swing animated')
                ;
        },
    });

    Navbar.Public = Backbone.View.extend({
        template: 'navbar/navbar-public',
    });

    App.Views.Navbar = Navbar;
    return Navbar;
});
