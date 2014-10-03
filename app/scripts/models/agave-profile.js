define(['backbone'], function(Backbone) {

    'use strict';

    var Profile = {};

    Profile = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'profile',
                    value: {
                        firstName: '',
                        lastName:  '',
                        email:     '',
                        city:      '',
                        state:     '',
                    },
                }
            );
        },
        url: function() {
            return  '/meta/v2/data?q='
                    + encodeURIComponent(
                        '{'
                          + '"owner":' + '"' + Backbone.Agave.instance.token().get('username') + '",'
                          + '"name":"profile"'
                      + '}'
                    );
        }
    });

    Backbone.Agave.Model.Profile = Profile;
    return Profile;
});
