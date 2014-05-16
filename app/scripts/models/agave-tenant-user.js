define(['backbone'], function(Backbone) {

    'use strict';

    var TenantUser = {};

    TenantUser = Backbone.Agave.Model.extend({
        defaults: {
            create_time: '',
            email:       '',
            first_name:  '',
            full_name:   '',
            last_name:   '',
            mobile_phone: '',
            phone:  '',
            status: '',
            uid: 0,
            username: ''
        },
        idAttribute: 'username'
    });

    Backbone.Agave.Model.TenantUser = TenantUser;
    return TenantUser;
});
