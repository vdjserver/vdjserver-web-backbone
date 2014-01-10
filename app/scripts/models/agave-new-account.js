(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    //var _ = window._;

    var Agave = Backbone.Agave;

    var NewAccount = {};

    NewAccount = Agave.Model.extend({
        defaults: {
            username:  '',
            password:  '',
            email:     ''
        },
        apiRoot: Agave.authRoot,
        url: function() {
            return '/user';
        },
        requiresAuth: false
    });

    Backbone.Agave.Model.NewAccount = NewAccount;
    return NewAccount;
})(this);
