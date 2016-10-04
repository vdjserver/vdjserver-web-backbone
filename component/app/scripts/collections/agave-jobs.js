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
        getFileByName: function(name) {
            for (var j = 0; j < this.models.length; j++) {
                var model = this.at([j]);

                var modelName = model.get('value').name;

                if (modelName === name) return model;
            }
            return undefined;
        },
        getProjectFileOutput: function() {
            var filteredCollection = this.filter(function(model) {

                var value = model.get('value');
                if (value.name) {

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
        getLogFileOutput: function() {
            var filteredCollection = this.filter(function(model) {

                var value = model.get('value');
                if (value.name) {

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
    });

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
                        'outputFilePrefix',
                        'qualityLengthFilter',
                        'barcode',
                        'UMI',
                        'forwardPrimer',
                        'reversePrimer',
                        'findUnique',
                        'finalOutputFilename',
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
                    'workflow-name': 'Gene Segment Usage',
                    'steps': [
                        'geneSegment',
                    ],
                },
                {
                    'workflow-name': 'CDR3 Analysis',
                    'steps': [
                        'CDR3',
                    ],
                },
                {
                    'workflow-name': 'Diversity Analysis',
                    'steps': [
                        'diversity',
                    ],
                },
                {
                    'workflow-name': 'Mutational Analysis',
                    'steps': [
                        'mutations',
                    ],
                },
                {
                    'workflow-name': 'Clonal Analysis',
                    'steps': [
                        'clones',
                    ],
                },
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
                    {
                        'merge_write_sequence': {
                            'out_prefix': '',
                            'out_path': 'merged.fastq',
                        }
                    },
                ],
            };

            return config;
        },
        getWorkflows: function() {
            var tmpName = (Math.round(Math.random() * 0x10000)).toString(16);

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
                            'find_shared': {
                                'out_prefix': 'unique-' + tmpName,
                                'out_group_unique':'.fasta',
                                'group_variable': 'MID1',
                                'out_group_duplicates': 'unique_duplicates.tsv',
                            },
                        },
                        {
                            'write_sequence': {
                                'out_prefix': 'final_reads-' + tmpName,
                                'out_path':'.fastq',
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
                                'out_prefix': 'filtered_reads-' + tmpName,
                                'out_path':'.fastq',
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
                                'out_prefix': '',
                                'out_path':'.fastq',
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
                                'out_prefix': 'primer_trimmed_reads-' + tmpName,
                                'out_path':'.fastq',
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
                                'out_prefix': 'unique-' + tmpName,
                                'out_group_unique':'.fasta',
                                'group_variable': 'MID1',
                                'out_group_duplicates': 'unique_duplicates.tsv',
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

/*
    Jobs.VdjpipeWorkflows = Backbone.Agave.MetadataCollection.extend({

        // Public Methods
        model: Backbone.Agave.Model.Job.VdjpipeWorkflow,
        url: function() {
            return '/meta/v2/data?q='
                + encodeURIComponent('{'
                    + '"name":"vdjpipeWorkflow"'
                + '}')
                + '&limit=' + this.limit
                + '&offset=' + this.offset
                ;
        },
        getWorkflowNames: function() {
            var values = this.pluck('value');

            var workflowNames = _.pluck(values, 'workflowName');

            return workflowNames;
        },
        checkIfPredefinedWorkflow: function(workflowName) {

            var predefinedWorkflowNames = this._getPredefinedWorkflowNames();
            var predefinedClash = _.indexOf(predefinedWorkflowNames, workflowName);

            if (predefinedClash >= 0) {
                return true;
            }
            else {
                return false;
            }
        },
        setPredefinedWorkflows: function() {

            // unique identifier to add to output filenames
            var tmpName = (Math.round(Math.random() * 0x10000)).toString(16);

            // single function workflows
            var preconfiguredWorkflows = this._preconfiguredWorkflows(tmpName);
            for (var i = 0; i < preconfiguredWorkflows.length; i++) {
                var preconfiguredWorkflow = preconfiguredWorkflows[i];

                var workflow = new Backbone.Agave.Model.Job.VdjpipeWorkflow();
                workflow.sync = workflow.fakeSync;
                workflow.set('predefined', true);
                workflow.set('single', true);

                workflow.setConfigFromPreconfiguredData(preconfiguredWorkflow);
                this.unshift(workflow);
            }

            // complete workflows
            var preconfiguredCompleteWorkflows = this._preconfiguredCompleteWorkflows(tmpName);
            for (var j = 0; j < preconfiguredCompleteWorkflows.length; j++) {
                var preconfiguredCompleteWorkflow = preconfiguredCompleteWorkflows[j];

                var completeWorkflow = new Backbone.Agave.Model.Job.VdjpipeWorkflow();
                completeWorkflow.sync = completeWorkflow.fakeSync;
                completeWorkflow.set('predefined', true);
                completeWorkflow.set('complete', true);

                completeWorkflow.setConfigFromPreconfiguredData(preconfiguredCompleteWorkflow);
                this.unshift(completeWorkflow);
            }
        },

        // Private Methods
        _preconfiguredCompleteWorkflows: function(tmpName) {

            var workflows = [

                {
                    'workflow-name': 'All Processing Steps',
                    'summary_output_path': 'summary.txt',
                    'steps': [
                        {
                            'quality_stats': {
                                'out_prefix': 'pre-filter_',
                            },
                        },
                        {
                            'composition_stats': {
                                'out_prefix': 'pre-filter_',
                            },
                        },
                        {
                            'match': {
                                'reverse': true,
                                'elements': [
                                    {
                                        'max_mismatches': 1,
                                        'required': true,
                                        'start': {},
                                        'cut_lower': {
                                            'after': 0,
                                        },
                                    },
                                ],
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
                            'quality_stats': {
                                'out_prefix': 'post-filter_',
                            },
                        },
                        {
                            'composition_stats': {
                                'out_prefix': 'post-filter_',
                            },
                        },
                        {
                            'find_shared': {
                                'out_prefix': 'unique-' + tmpName,
                                'out_group_unique':'.fasta',
                                'group_variable': 'MID1',
                                'out_group_duplicates': 'unique_duplicates.tsv',
                            },
                        },
                        {
                            'write_sequence': {
                                'out_prefix': 'final_reads-' + tmpName,
                                'out_path':'.fastq',
                            },
                        },
                    ],
                },

            ];

            return workflows;
        },
        _preconfiguredWorkflows: function(tmpName) {

            var workflows = [

                {
                    'workflow-name': 'Merge Paired Reads',
                    'summary_output_path': 'summary.txt',
                    'steps': [
                    ],
                },

                {
                    'workflow-name': 'Find Unique Sequences',
                    'summary_output_path': 'unique_summary.txt',
                    'steps': [
                        {
                            'find_shared': {
                                'out_prefix': 'unique-' + tmpName,
                                'out_group_unique':'.fasta',
                                'group_variable': 'MID1',
                                'out_group_duplicates': 'unique_duplicates.tsv',
                            },
                        },
                    ],
                },

                {
                    'workflow-name': 'Primer Triming',
                    'summary_output_path': 'primer_summary.txt',
                    'steps': [
                        {
                            'custom_v_primer_trimming': {},
                        },
                        {
                            'custom_j_primer_trimming': {},
                        },
                        {
                            'write_sequence': {
                                'out_prefix': 'primer_trimmed_reads-' + tmpName,
                                'out_path':'.fastq',
                            },
                        },
                    ],
                },

                {
                    'workflow-name': 'Barcode Demultiplexing',
                    'summary_output_path': 'barcode_summary.txt',
                    'steps': [
                        {
                            'match': {
                                'reverse': true,
                                'elements': [
                                    {
                                        'max_mismatches': 1,
                                        'required': true,
                                        'start': {},
                                        'cut_lower': {
                                            'after': 0,
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            'write_sequence': {
                                'out_prefix': '',
                                'out_path':'.fastq',
                            },
                        },
                    ],
                },

                {
                    'workflow-name': 'Sequence Filters',
                    'summary_output_path': 'filter_summary.txt',
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
                                'out_prefix': 'filtered_reads-' + tmpName,
                                'out_path':'.fastq',
                            },
                        },
                    ],
                },

                {
                    'workflow-name': 'Sequence Statistics',
                    'summary_output_path': 'stats_summary.txt',
                    'steps': [
                        {
                            'quality_stats': {
                                'out_prefix': 'stats_',
                            },
                        },
                        {
                            'composition_stats': {
                                'out_prefix': 'stats_',
                            },
                        },
                    ],
                },

            ];

            return workflows;
        },
        _getPredefinedWorkflowNames: function() {
            var predefinedWorkflowNames = [
                'Merge Paired Reads',
                'Find Unique Sequences',
                'Primer Trimming',
                'Barcode Demultiplexing',
                'Sequence Filters',
                'Sequence Statistics',
                //'Paired Reads',
            ];

            return predefinedWorkflowNames;
        },
        getMergePairedReadsConfig: function() {
            var config = {
                'workflow-name': 'Merge Paired Reads',
                'summary_output_path': 'merge_summary.txt',
                'paired_reads': true,
                'steps': [
                    {
                        'merge_paired': {
                            'min_score': 10,
                        },
                    },
                    {
                        'apply': {
                            'to': 'merged',
                            'step': {
                                'write_sequence': {
                                    'out_prefix': '',
                                    'out_path': 'merged.fastq',
                                }
                            }
                        },
                    },
                ],
            };

            return config;
        },
    }); */

    Backbone.Agave.Collection.Jobs = Jobs;
    return Jobs;
});
