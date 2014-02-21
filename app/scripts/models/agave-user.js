(function (window) {

    'use strict';

    var Backbone = window.Backbone;

    var User = {};

    User = Backbone.Agave.Model.extend({
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

    Backbone.Agave.Model.User = User;
    return User;
})(this);
