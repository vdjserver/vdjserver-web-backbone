define(
    [
        'backbone',
        'environment-config'
    ],
function(Backbone, EnvironmentConfig) {

    'use strict';

    var CommunityProject = Backbone.Agave.Model.extend({
        defaults: {
            title: '',
            bioProjectType: '',
            sraAbstract: '',
            paper: '',
            sraStudy: '',
            bioProject: '',
            organism: '',
            vdjServerProcessing: '',

            sraExperiment: [],
            biosample: [],
            sampleDescription: [],
            sraRun: [],
            layout: [],
            platform: [],
            readCount: [],
            sequenceLength: [],
            fastqSRA: [],
            qcFilteredOutput: [],
            igBlastOutput: []
        },
        // apiRoot: EnvironmentConfig.vdjauthRoot,
        apiRoot: 'http://localhost:9001',
        url: function() {
          // return '/community'
          return '/data/community-project.json'
        },
        requiresAuth: false,

    });

    Backbone.Agave.Model.CommunityProject = CommunityProject;
    return CommunityProject;
});
