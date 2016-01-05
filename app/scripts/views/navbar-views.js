define([
    'app',
], function(App) {

    'use strict';

    var Navbar = {};

    Navbar.Navigation = Backbone.View.extend({
        template: 'navbar/navbar-project',
        initialize: function() {

            this.subviews = [];

            var that = this;

            this.listenTo(App.Datastore.Notifications, 'add', function(model) {

                var subview = undefined;

                switch(model.get('type')) {
                    case App.Models.Notification.JOB_NOTIFICATION:
                        subview = new App.Views.Notifications.Job({notification: model});
                        break;

                    case App.Models.Notification.FILE_IMPORT_NOTIFICATION:
                        subview = new App.Views.Notifications.FileImport({notification: model});
                        break;

                    default:
                        break;
                }

                if (subview !== undefined) {
                    that.subviews.unshift(subview);
                    this._addNotificationAlert();
                }
            });
        },
        serialize: function() {
            return {
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
            $('#notification-menu').removeClass('notification-empty');
        },
        _clearNotificationAlerts: function() {
            $('#notification-menu').addClass('notification-empty');
        },
    });

    Navbar.Public = Backbone.View.extend({
        template: 'navbar/navbar-public',
    });

    App.Views.Navbar = Navbar;
    return Navbar;
});
