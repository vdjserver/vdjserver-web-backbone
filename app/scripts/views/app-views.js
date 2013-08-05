define(['app'], function(App){
    var AppViews = {};

    // layouts
    AppViews.HeaderLayout = Backbone.Layout.extend();
    AppViews.MainLayout   = Backbone.Layout.extend();
    AppViews.FooterLayout = Backbone.Layout.extend();

    // Handlebars Helpers
    //Handlebars.registerHelper("LoginStatus", function(resource) {})

    // app views
    AppViews.Nav = Backbone.View.extend({
        tagName: 'nav',
        template: 'nav',
        className: 'navbar navbar-fixed-top'
    /*
        serialize: function() {
            json = this.model.toJSON();
            return json;
        }
    ,
        initialize: function() {
            App.listenTo(App.Agave, 'Agave:tokenChanged', this.render());
        }
    */
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

    AppViews.Header = Backbone.View.extend({
        template: 'header',
        className: 'header',
        initialize: function() {
            this.setView('.login-state', new AppViews.LoginState({model: this.model}));
        }
    });

    AppViews.Home = Backbone.View.extend({
        template: 'home'
    });

    AppViews.Footer = Backbone.View.extend({
        template: 'footer',
        className: 'footer'
    });



    App.Views.AppViews = AppViews;
    return AppViews;
});
