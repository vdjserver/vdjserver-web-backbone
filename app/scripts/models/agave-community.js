define(
    [
        'backbone',
        'environment-config'
    ],
function(Backbone, EnvironmentConfig) {

    'use strict';

    var Community = Backbone.Agave.Model.extend({
        defaults: {

            sraStudy: '',
            pubMedId: '',
            organism: '',
            receptor: '',
            study: '',
            description: '',
            experiments: '',
            runs: '',
            sraSubmission: '',
            notes: '',
            // name: '',
            // description: '',


        },
        // apiRoot: EnvironmentConfig.vdjauthRoot,
        apiRoot: 'http://localhost:9001',
        url: function() {
          // return '/community'
          return '/data/community.json'
        },
        requiresAuth: false,

    });

    Backbone.Agave.Model.Community = Community;
    return Community;
});
