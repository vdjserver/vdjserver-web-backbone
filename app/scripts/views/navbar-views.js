define([
    'app',
], function(App) {

    'use strict';

    var Navbar = {};

    Navbar.Navigation = Backbone.View.extend({
        template: 'navbar/navigation',
        serialize: function() {
            return {
                token: App.Agave.token().toJSON()
            };
        },
    });

    App.Views.Navbar = Navbar;
    return Navbar;
});
