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
                this._addNotificationAlert();
                console.log("array change!");
                var subview = new App.Views.Notifications.Job({notification: model});
                that.subviews.unshift(subview);
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

            // TODO:
            // add latest 5 new notifications
            var length = this.subviews.length;
            //var adjustedLength = this.subviews.length - 5;
            //this.subviews = this.subviews.splice(5, adjustedLength);

            for (var j = 4; j < length; j++) {
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
        _addNotificationAlert() {
            $('#notification-menu').removeClass('notification-empty');
        },
        _clearNotificationAlerts() {
            $('#notification-menu').addClass('notification-empty');
        },
    });

    Navbar.Public = Backbone.View.extend({
        template: 'navbar/navbar-public',
    });

    App.Views.Navbar = Navbar;
    return Navbar;
});
