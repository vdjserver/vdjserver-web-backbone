define(['app'], function(App){
    'use strict';

    var AppViews = {};

    // layouts
    AppViews.HeaderLayout = Backbone.Layout.extend();
    AppViews.MainLayout   = Backbone.Layout.extend();
    AppViews.FooterLayout = Backbone.Layout.extend();

    // app views
    AppViews.Nav = Backbone.View.extend({
        template: 'nav',
        initialize: function() {
            //this.setView('.login-state', new AppViews.LoginState({model: this.model}));
            this.model.on('change', this.render, this);
        },
        serialize: function() {
            console.log("login status is: " + App.isLoggedIn());
            return {
                isLoggedIn: App.isLoggedIn(),
                account: this.model.toJSON()
            }
        }
    });

    AppViews.LoginState = Backbone.View.extend({
        template: 'logged-out',
        initialize: function() {
            this.model.on('change', this.render, this);
        },
        beforeRender: function() {
            if (App.isLoggedIn()) {
                this.template = 'logged-in';
            } else {
                this.template = 'logged-out';
            }
        },
        serialize: function() {
            return this.model.toJSON();
        }
    });

    AppViews.Home = Backbone.View.extend({
        template: 'home',
        serialize: function() {
            return App.isLoggedIn();
        }
    });

    AppViews.Footer = Backbone.View.extend({
        template: 'footer',
        className: 'footer'
    });



    App.Views.AppViews = AppViews;
    return AppViews;
});
