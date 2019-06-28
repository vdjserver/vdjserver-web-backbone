define([
    'backbone',
    'moment',
    'comparators-mixin',
], function(Backbone, moment, ComparatorsMixin) {

    'use strict';

    var Jobs = {};

    Jobs = Backbone.Agave.Collection.extend({
        model: Backbone.Agave.Model.Job.Detail,

        // TODO: we really want submission time
        // Sort by reverse date order
        comparator: function(modelA, modelB) {
            // pending/queued/running etc on top
            if (modelA.get('status') !== 'FINISHED' && modelA.get('status') !== 'FAILED') return -1;
            if (modelA.get('submitTime').length == 0) return -1;

            var modelAEndDate = moment(modelA.get('submitTime'));
            var modelBEndDate = moment(modelB.get('submitTime'));

            if (modelAEndDate > modelBEndDate) {
                return -1;
            }
            else if (modelBEndDate > modelAEndDate) {
                return 1;
            }

            // Equal
            return 0;
        },
        url: function() {
            return '/jobs/v2/?filter=*&archivePath.like=/projects/' + this.projectUuid + '*';
        },
        getFinishedVDJAssignmentJobs: function() {
            var jobModels = _.filter(this.models, function(model) {
                return model.get('status') === 'FINISHED'
                        && model.get('appId').substr(0, 7) === 'igblast'
                       ;
            });

            var newCollection = this.clone();
            newCollection.reset();
            newCollection.add(jobModels);

            return newCollection;
        },
    });

    Jobs.Pending = Backbone.Agave.Collection.extend({
        model: Backbone.Agave.Model.Job.Detail,
        apiHost: EnvironmentConfig.vdjApi.hostname,
        authType: 'basic',
        url: function() {
            return '/jobs/queue/pending/?projectUuid=' + this.projectUuid;
        },
    });

    Jobs.Subset = Backbone.Agave.Collection.extend({
        model: Backbone.Agave.Model.Job.Detail,
        comparator: function(modelA, modelB) {
            // pending/queued/running etc on top
            if (modelA.get('submitTime').length == 0) return -1;

            var modelAEndDate = moment(modelA.get('submitTime'));
            var modelBEndDate = moment(modelB.get('submitTime'));

            if (modelAEndDate > modelBEndDate) {
                return -1;
            }
            else if (modelBEndDate > modelAEndDate) {
                return 1;
            }

            // Equal
            return 0;
        },
        url: function() {
            return '/jobs/v2/?filter=*&id.in=' + this.jobList;
        },
    });

    Jobs.OutputFiles = Backbone.Agave.PaginatedCollection.extend({
        model: Backbone.Agave.Model.Job.OutputFile,
        initialize: function(parameters) {

            Backbone.Agave.PaginatedCollection.prototype.initialize.apply(this, [parameters]);

            if (parameters.jobId) {
                this.jobId = parameters.jobId;
            }
        },
        //comparator: 'name',
        url: function() {
                return '/meta/v2/data?q='
                    + encodeURIComponent('{'
                        + '"name":"projectJobFile",'
                        + '"value.jobUuid":"' + this.jobId + '"'
                    + '}')
                    + '&limit=' + this.limit
                    + '&offset=' + this.offset
                    ;
        /*
            return '/jobs'
                   + '/v2'
                   + '/' + this.jobId
                   + '/outputs'
                   + '/listings'
                   + '?limit=' + this.limit
                   + '&offset=' + this.offset
                   ; */
        },
        getProcessMetadataFile: function() {
            for (var j = 0; j < this.models.length; j++) {
                var model = this.at([j]);

                var modelName = model.get('value').name;

                if (modelName === 'process_metadata.json') return model;
            }
            return undefined;
        },
        getStudyMetadataFile: function() {
            for (var j = 0; j < this.models.length; j++) {
                var model = this.at([j]);

                var modelName = model.get('value').name;

                if (modelName === 'study_metadata.json') return model;
            }
            return undefined;
        },
        getFileByName: function(name) {
            for (var j = 0; j < this.models.length; j++) {
                var model = this.at([j]);

                var modelName = model.get('value').name;

                if (modelName === name) return model;
            }
            return undefined;
        },
        getProjectFileOutput: function(processMetadata) {
            var pmFiles = [];
            if (processMetadata) pmFiles = processMetadata.getProjectFileOutputList();

            var filteredCollection = this.filter(function(model) {

                var value = model.get('value');
                if (value.name) {

                    // only those in process metadata
                    if (processMetadata) {
                        var idx = pmFiles.indexOf(value.name);
                        if (idx >= 0) return true;
                        else return false;
                    } else {
                        // otherwise go by file extension
                        var filename = value.name;

                        var fileNameSplit = filename.split('.');
                        var fileExtension = fileNameSplit[fileNameSplit.length - 1];

                        var doubleFileExtension = fileNameSplit[fileNameSplit.length - 2] + '.' + fileNameSplit[fileNameSplit.length - 1];

                        var test = fileNameSplit[fileNameSplit.length - 100];

                        // Whitelisted files
                        if (fileExtension === 'fasta'
                            ||
                            fileExtension === 'fastq'
                            ||
                            fileExtension === 'vdjml'
                            ||
                            fileExtension === 'zip'
                            ||
                            doubleFileExtension === 'rc_out.tsv'
                            ||
                            doubleFileExtension === 'duplicates.tsv'
                        ) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                }
            });

            var newCollection = this.clone();
            newCollection.reset();
            newCollection.add(filteredCollection);

            return newCollection;
        },
        getChartFileOutput: function() {
            var filteredCollection = this.filter(function(model) {

                var value = model.get('value');
                if (value.name) {

                    var hasChart = Backbone.Agave.Model.Job.Detail.getChartType(value.name);

                    var filename = value.name;

                    var fileNameSplit = filename.split('.');
                    var fileExtension = fileNameSplit[fileNameSplit.length - 1];

                    // Small hack to include files that belong with chartable files but don't actually have charts yet
                    if (
                        hasChart
                        ||
                        fileExtension === 'csv'
                        ||
                        Backbone.Agave.Model.Job.IgBlast.isChartableOutput(filename)
                    ) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            });

            var newCollection = this.clone();
            newCollection.reset();
            newCollection.add(filteredCollection);

            return newCollection;
        },
        getLogFileOutput: function(processMetadata) {
            var pmFiles = [];
            if (processMetadata) pmFiles = processMetadata.getLogAndMetadataFileList();

            var filteredCollection = this.filter(function(model) {

                var value = model.get('value');
                if (value.name) {

                    // only those in process metadata
                    if (processMetadata) {
                        for (var i = 0; i < pmFiles.length; ++i) {
                            if (pmFiles[i]['value'] == value.name) {
                              if (pmFiles[i]['type'] == 'zip') model.set('noShowLog', true);
                              return true;
                            }
                        }
                        return false;
                    } else {
                        var filename = value.name;

                        var fileNameSplit = filename.split('.');
                        var fileExtension = fileNameSplit[fileNameSplit.length - 1];

                        // Whitelisted files
                        if (
                            fileExtension === 'err'
                            ||
                            fileExtension === 'out'
                            ||
                            filename === 'vdjpipe_config.json'
                            ||
                            filename === 'vdjpipe_paired_config.json'
                            ||
                            filename === 'summary.txt'
                            ||
                            filename === 'merge_summary.txt'
                            ||
                            filename === 'process_metadata.json'
                            ||
                            filename === 'study_metadata.json'
                        ) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                }
            });

            var newCollection = this.clone();
            newCollection.reset();
            newCollection.add(filteredCollection);

            return newCollection;
        },
        getShowInProjectData: function() {
            var filteredCollection = this.filter(function(model) {

                var value = model.get('value');
                if (value.showInProjectData) return true;
                else return false;
            });

            var newCollection = this.clone();
            newCollection.reset();
            newCollection.add(filteredCollection);

            return newCollection;
        },
    });
/*
    Jobs.ProjectDataFiles = Jobs.OutputFiles.extend({
        initialize: function(parameters) {

            Jobs.OutputFiles.prototype.initialize.apply(this, [parameters]);

            if (parameters && parameters.projectUuid) {
                this.projectUuid = parameters.projectUuid;
            }
        },
        url: function() {
            return '/meta/v2/data?q='
                   + encodeURIComponent('{'
                       + '"name": "projectJobFile",'
                       + '"value.projectUuid":"' + this.projectUuid + '",'
                       + '"value.isDeleted":false,"value.showInProjectData":true'
                   + '}')
                   + '&limit=' + this.limit
                   + '&offset=' + this.offset
                   ;
        },
        getFilesForJobId: function(jobId) {

            // Filter down to files for the given job
            var fileModels = _.filter(this.models, function(model) {
                var value = model.get('value');
                return value.jobUuid === jobId;
            });

            var fileCollection = this.clone();
            fileCollection.reset();
            fileCollection.add(fileModels);

            return fileCollection;
        },
    });
*/
    Jobs.Listings = Backbone.Agave.MetadataCollection.extend(
        _.extend({}, ComparatorsMixin.reverseChronologicalCreatedTime, {
            model: Backbone.Agave.Model.Job.Listing,
            initialize: function(parameters) {

                Backbone.Agave.MetadataCollection.prototype.initialize.apply(this, [parameters]);

                if (parameters && parameters.projectUuid) {
                    this.projectUuid = parameters.projectUuid;
                }
            },
            url: function() {
                return '/meta/v2/data?q='
                    + encodeURIComponent('{'
                        + '"name":"projectJob",'
                        + '"value.projectUuid":"' + this.projectUuid + '"'
                    + '}')
                    + '&limit=' + this.limit
                    + '&offset=' + this.offset
                    ;
            },
            linkToJobs: function(jobList) {
                for (var i = 0; i < this.length; ++i) {
                    var m = this.at(i);
                    var value = m.get('value');
                    var job = jobList.get(value.jobUuid);
                    if (job) {
                        job.set('metadataLink', m.get('uuid'));
                        job.initDisplayName();
                        if (value.displayName) job.set('displayName', value.displayName);
                        job.set('isArchived', false);
                    }
                }
            },
        })
    );

    Jobs.Archived = Backbone.Agave.MetadataCollection.extend(
        _.extend({}, ComparatorsMixin.reverseChronologicalCreatedTime, {
            model: Backbone.Agave.Model.Job.Listing,
            initialize: function(parameters) {

                Backbone.Agave.MetadataCollection.prototype.initialize.apply(this, [parameters]);

                if (parameters && parameters.projectUuid) {
                    this.projectUuid = parameters.projectUuid;
                }
            },
            url: function() {
                return '/meta/v2/data?q='
                    + encodeURIComponent('{'
                        + '"name":"projectJobArchive",'
                        + '"value.projectUuid":"' + this.projectUuid + '"'
                    + '}')
                    + '&limit=' + this.limit
                    + '&offset=' + this.offset
                    ;
            },
            linkToJobs: function(jobList) {
                for (var i = 0; i < this.length; ++i) {
                    var m = this.at(i);
                    var value = m.get('value');
                    var job = jobList.get(value.jobUuid);
                    if (job) {
                        job.set('metadataArchive', m.get('uuid'));
                        job.initDisplayName();
                        if (value.displayName) job.set('displayName', value.displayName);
                        job.set('isArchived', true);
                    }
                }
            },
            jobUuids: function() {
                var jobUuids = [];
                for (var i = 0; i < this.length; ++i) {
                    var m = this.at(i);
                    var value = m.get('value');
                    jobUuids.push(value.jobUuid);
                }
                return jobUuids;
            },
        })
    );

    Jobs.PrestoWorkflows = Backbone.Agave.MetadataCollection.extend({
        model: Backbone.Agave.MetadataModel,
        initialize: function(parameters) {
            Backbone.Agave.MetadataCollection.prototype.initialize.apply(this, [parameters]);
        },
        getWorkflows: function() {

            var workflows = [
                {
                    'workflow-name': 'Single Read',
                    'steps': [
                        'sequenceType',
                        'qualityLengthFilter',
                        'barcode',
                        'UMI',
                        'forwardPrimer',
                        'reversePrimer',
                        'findUnique',
                    ],
                },
            ];

            return workflows;
        },
    });

    Jobs.RepCalcWorkflows = Backbone.Agave.MetadataCollection.extend({
        model: Backbone.Agave.MetadataModel,
        initialize: function(parameters) {
            Backbone.Agave.MetadataCollection.prototype.initialize.apply(this, [parameters]);
        },
        getWorkflowNames: function() {
            var workflows = this.getWorkflows();

            var workflowNames = _.pluck(workflows, 'workflow-name');

            return workflowNames;
        },
        workflowWithName: function(name) {
            var workflows = this.getWorkflows();
            for (var i = 0; i < workflows.length; ++i) {
                if (workflows[i]['workflow-name'] == name) return workflows[i];
            }
            return null;
        },
        getWorkflows: function() {

            var workflows = [
                {
                    'workflow-name': 'Repertoire Calculations',
                    'steps': [
                        'geneSegment',
                        'CDR3',
                        'clones',
                        'diversity',
                        'mutations',
                        'lineage'
                    ],
                }
            ];

            return workflows;
        },
    });

    Jobs.VdjpipeWorkflows = Backbone.Agave.MetadataCollection.extend({
        model: Backbone.Agave.MetadataModel,
        initialize: function(parameters) {
            Backbone.Agave.MetadataCollection.prototype.initialize.apply(this, [parameters]);
        },
        getWorkflowNames: function() {
            var workflows = this.getWorkflows();

            var workflowNames = _.pluck(workflows, 'workflow-name');

            return workflowNames;
        },
        workflowWithName: function(name) {
            var workflows = this.getWorkflows();
            for (var i = 0; i < workflows.length; ++i) {
                if (workflows[i]['workflow-name'] == name) return workflows[i];
            }
            return null;
        },
        getMergePairedReadsConfig: function() {
            var config = {
                'workflow-name': 'Merge Paired Reads',
                'steps': [
                    {
                        'merge_paired': {
                            'min_score': 10,
                        },
                    },
                ],
            };

            return config;
        },
        getWorkflows: function() {
            var workflows = [
                {
                    'workflow-name': 'All Processing Steps',
                    'complete': true,
                    'steps': [
                        {
                            'pre_statistics': {},
                        },
                        {
                            'barcode': {
                            },
                        },
                        {
                            'custom_v_primer_trimming': {},
                        },
                        {
                            'custom_j_primer_trimming': {},
                        },
                        {
                            'length_filter': {
                                'min': 0,
                            },
                        },
                        {
                            'average_quality_filter': {
                                'custom_value': 35,
                            },
                        },
                        {
                            'homopolymer_filter': {
                                'custom_value': 20,
                            },
                        },
                        {
                            'post_statistics': {},
                        },
                        {
                            'write_sequence': {
                            },
                        },
                        {
                            'find_shared': {
                            },
                        },
                    ],
                },

                {
                    'workflow-name': 'Sequence Statistics',
                    'single': true,
                    'steps': [
                        {
                            'statistics': {},
                        },
                    ],
                },

                {
                    'workflow-name': 'Sequence Filters',
                    'single': true,
                    'steps': [
                        {
                            'length_filter': {
                                //'min': 200,
                                'min': 0,
                            },
                        },
                        {
                            'average_quality_filter': {
                                'custom_value': 35,
                            },
                        },
                        {
                            'homopolymer_filter': {
                                'custom_value': 20,
                            },
                        },
                        {
                            'write_sequence': {
                            },
                        },
                    ],
                },

                {
                    'workflow-name': 'Barcode Demultiplexing',
                    'single': true,
                    'steps': [
                        {
                            'barcode': {
                            },
                        },
                        {
                            'write_sequence': {
                            },
                        },
                    ],
                },

                {
                    'workflow-name': 'Primer Triming',
                    'single': true,
                    'steps': [
                        {
                            'custom_v_primer_trimming': {},
                        },
                        {
                            'custom_j_primer_trimming': {},
                        },
                        {
                            'write_sequence': {
                            },
                        },
                    ],
                },

                {
                    'workflow-name': 'Find Unique Sequences',
                    'single': true,
                    'steps': [
                        {
                            'find_shared': {
                            },
                        },
                    ],
                },

                // These steps are blank because we auto insert merging for paired
                // reads, and this allows merging to be an individual workflow. The
                // actual settings for merging are above in getMergePairedReadsConfig()
                {
                    'workflow-name': 'Merge Paired Reads',
                    'single': true,
                    'steps': [
                    ],
                },
            ];

            return workflows;
        },
    });

    Backbone.Agave.Collection.Jobs = Jobs;
    return Jobs;
});
