define([
    'app',
], function(App) {

    'use strict';

    var Navbar = {};

    Navbar.Navigation = Backbone.View.extend({
        template: 'navbar/navbar-project',
        initialize: function() {

            var that = this;

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
    });

    Navbar.Public = Backbone.View.extend({
        template: 'navbar/navbar-public',
    });

    App.Views.Navbar = Navbar;
    return Navbar;
});
