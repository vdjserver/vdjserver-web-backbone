(function (window) {

    'use strict';

    var Backbone = window.Backbone;

    var Job = Backbone.Agave.Model.extend({
        defaults: {
            appId: '',
            archive: true,
            archivePath: '',
            archiveSystem: '',
            batchQueue: '',
            endTime: '',
            executionSystem: '',
            id: 0,
            inputs: {},
            localId: '',
            memoryPerNode: '',
            message: '',
            name: '',
            nodeCount: 0,
            notifications: [],
            outputPath: '',
            owner: '',
            parameters: {},
            processorsPerNode: 0,
            maxRunTime: '',
            retries: 0,
            startTime: '',
            status: '',
            submitTime: '',
            workPath: ''
        },
        url: function() {
            return '/jobs/v2/';
        }
    });

    Backbone.Agave.Model.Job = Job;
    return Job;
})(this);
