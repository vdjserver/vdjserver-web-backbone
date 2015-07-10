define([
    'backbone',
    'environment-config'
], function(
    Backbone,
    EnvironmentConfig
) {

    'use strict';

    var CommunityData = Backbone.Agave.MetadataModel.extend({
        /*
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
        */

        url: function() {
            return '/meta/v2/data/' + this.get('uuid');
        },
    });

    Backbone.Agave.Model.CommunityData = CommunityData;
    return CommunityData;
});
