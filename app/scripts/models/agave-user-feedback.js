define(['backbone'], function(Backbone) {

    'use strict';

    var UserFeedback = {};

    UserFeedback = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'user-feedback',
                    value: {
                      feedback: '',
                    },
                }
            );
        },
        url: function() {
            return '/meta/v2/data?q='
                   + encodeURIComponent(
                       '{'
                         + '"owner":' + '"' + Backbone.Agave.instance.token().get('username') + '",'
                         + '"name":"user-feedback"'
                     + '}'
                   );
        }
    });

    Backbone.Agave.Model.UserFeedback = UserFeedback;
    return UserFeedback;
});
