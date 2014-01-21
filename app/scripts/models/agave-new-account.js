(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    //var _ = window._;

    var NewAccount = {};

    NewAccount = Backbone.Agave.Model.extend({
        defaults: {
            username:  '',
            password:  '',
            email:     ''
        },
        apiRoot: Backbone.Agave.authRoot,
        url: function() {
            return '/user';
        },
        requiresAuth: false
    });

    Backbone.Agave.Model.NewAccount = NewAccount;
    return NewAccount;
})(this);
