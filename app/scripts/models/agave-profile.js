(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    //var _ = window._;

    var Agave = Backbone.Agave;

    var Profile = {};

    Profile = Agave.Model.extend({
        defaults: {
            firstName: '',
            lastName:  '',
            email:     '',
            city:      '',
            state:     ''
        },
        url: function() {
            return '/user/profile';
        }
    });

    Backbone.Agave.Model.Profile = Profile;
    return Profile;
})(this);
