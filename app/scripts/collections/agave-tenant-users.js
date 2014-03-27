(function (window) {

    'use strict';

    var Backbone = window.Backbone;

    var TenantUsers = {};

    TenantUsers = Backbone.Agave.Collection.extend({
        model: Backbone.Agave.Model.TenantUser,
        comparator: 'username',
        url: function() {
            return '/users/'
        }
    });

    Backbone.Agave.Collection.TenantUsers = TenantUsers;
    return TenantUsers;
})(this);
