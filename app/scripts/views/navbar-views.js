define([
    'app',
], function(App) {

    'use strict';

    var Navbar = {};

    Navbar.Navigation = Backbone.View.extend({
        template: 'navbar/navbar-project',
        serialize: function() {
            return {
                token: App.Agave.token().toJSON()
            };
        },
    });

    Navbar.Public = Backbone.View.extend({
        template: 'navbar/navbar-public',
    });

    App.Views.Navbar = Navbar;
    return Navbar;
});
