(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    //var _ = window._;

    var Agave = Backbone.Agave;

    var Account = {};

    Account = Agave.Model.extend({
        defaults: {
            username:  '',
            password:  '',
            email:     ''
        },
        url: function() {
            return '/auth';
        }
    });

    Backbone.Agave.Model.Account = Account;
    return Account;
})(this);
