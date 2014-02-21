(function (window) {

    'use strict';

    var Backbone = window.Backbone;

    var Users = {};

    Users = Backbone.Agave.Collection.extend({
        model: Backbone.Agave.Model.User,
        comparator: 'username',
        url: function() {
            return '/users/'
        }
    });

    Backbone.Agave.Collection.Users = Users;
    return Users;
})(this);
