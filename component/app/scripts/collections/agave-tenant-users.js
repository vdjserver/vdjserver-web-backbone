define(['backbone'], function(Backbone) {

    'use strict';

    var TenantUsers = {};

    TenantUsers = Backbone.Agave.Collection.extend({
        model: Backbone.Agave.Model.TenantUser,
        comparator: 'username',
        url: function() {
            return '/profiles/v2/';
        },
    });

    Backbone.Agave.Collection.TenantUsers = TenantUsers;
    return TenantUsers;
});
