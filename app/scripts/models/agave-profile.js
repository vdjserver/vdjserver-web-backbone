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
            return '/meta/v2/data?q='
                   + encodeURIComponent(
                       '{'
                         + '"name":"profile",'
                         + '"value.name":' + '"' + Backbone.Agave.instance.token().get('username') + '"'
                     + '}'
                   )
                   + '&limit=5000'
                   ;
        }
    });

    Backbone.Agave.Model.Profile = Profile;
    return Profile;
});
