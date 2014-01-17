(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    var _ = window._;

    var Agave = Backbone.Agave;

    var Profile = {};

    Profile = Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Agave.MetadataModel.prototype.defaults,
                {
                    name: 'profile',
                    value: {
                        firstName: '',
                        lastName:  '',
                        email:     '',
                        city:      '',
                        state:     ''
                    }
                }
            );
        },
        url: function() {
            return '/meta/2.0/data?q=' + encodeURIComponent('{"owner":' + '"' + this.agaveToken.get('username') + '","name":"profile"}');
        }
    });

    Backbone.Agave.Model.Profile = Profile;
    return Profile;
})(this);
