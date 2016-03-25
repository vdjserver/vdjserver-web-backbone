define([
    'backbone',
    'moment',
    'comparators-mixin',
], function(Backbone, moment, ComparatorsMixin) {

    'use strict';

    var Jobs = {};

    Jobs = Backbone.Agave.Collection.extend({
        model: Backbone.Agave.Model.Job.Detail,

        // Sort by reverse date order
        comparator: function(modelA, modelB) {
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
    });

    Jobs.Pending = Backbone.Agave.Collection.extend({
        model: Backbone.Agave.Model.Job.Detail,
        apiHost: EnvironmentConfig.vdjApi.host,
        authType: 'basic',
        url: function() {
            return '/jobs/queue/pending/?projectUuid=' + this.projectUuid;
        },
    });

    Jobs.OutputFiles = Backbone.Agave.Collection.extend({
        model: Backbone.Agave.Model.Job.OutputFile,
        initialize: function(parameters) {

            Backbone.Agave.Collection.prototype.initialize.apply(this, [parameters]);

            if (parameters.jobId) {
                this.jobId = parameters.jobId;
            }
        },
        comparator: 'name',
        url: function() {
            return '/jobs/v2/' + this.jobId + '/outputs/listings?limit=1000';
        },
        getProjectFileOutput: function() {
            var filteredCollection = this.filter(function(model) {

                if (model.get('name')) {

                    var filename = model.get('name');

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
                        doubleFileExtension === 'rc_out.tsv'
                        ||
                        doubleFileExtension === 'duplicates.tsv'
                        ||
                        filename === 'summary.txt'
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

                if (model.get('name')) {

                    var hasChart = Backbone.Agave.Model.Job.Detail.getChartType(model.get('name'));

                    var filename = model.get('name');

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

                if (model.get('name')) {

                    var filename = model.get('name');

                    var fileNameSplit = filename.split('.');
                    var fileExtension = fileNameSplit[fileNameSplit.length - 1];

                    // Whitelisted files
                    if (
                        fileExtension === 'err'
                        ||
                        fileExtension === 'out'
                        ||
                        filename === 'vdjpipe_config.json'
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
                    + '&limit=5000'
                    ;
            },
        })
    );

    Jobs.Workflows = Backbone.Agave.MetadataCollection.extend({

        // Public Methods
        model: Backbone.Agave.Model.Job.Workflow,
        url: function() {
            return '/meta/v2/data?q='
                + encodeURIComponent('{'
                    + '"name":"vdjpipeWorkflow"'
                + '}')
                + '&limit=5000'
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

                var workflow = new Backbone.Agave.Model.Job.Workflow();
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

                var completeWorkflow = new Backbone.Agave.Model.Job.Workflow();
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
/*
                {
                    'workflow-name': 'Paired Reads',
                    'base_path_input': '',
                    'base_path_output': '',
                    'paired_reads': true,
                    'input': [
                        {
                            'forward_seq': 'sample_01f.fasta',
                            'forward_qual': 'sample_01f.qual',
                            'reverse_seq': 'sample_01r.fasta',
                            'reverse_qual': 'sample_01r.qual',
                        },
                        {
                            'forward_seq': 'emid_1_frw.fastq',
                            'reverse_seq': 'emid_1_rev.fastq',
                        },
                    ],
                    'steps': [
                        {
                            'apply': {
                                'to': 'forward',
                                'step': {
                                    'quality_stats': {
                                        'out_prefix': 'pre-filter-fwd-',
                                    },
                                },
                            },
                        },
                        {
                            'apply': {
                                'to': 'reverse',
                                'step': {
                                    'quality_stats': {
                                        'out_prefix': 'pre-filter-rev-',
                                    },
                                },
                            },
                        },
                        {
                            'apply': {
                                'to': 'forward',
                                'step': {
                                    'composition_stats': {
                                        'out_prefix': 'pre-filter-fwd-',
                                    },
                                },
                            },
                        },
                        {
                            'apply': {
                                'to': 'reverse',
                                'step': {
                                    'composition_stats': {
                                        'out_prefix': 'pre-filter-rev-',
                                    },
                                },
                            },
                        },
                        {
                            'merge_paired': {
                                'min_score': {
                                    'custom_value': 50,
                                },
                            },
                        },
                        {
                            'apply': {
                                'to': 'merged',
                                'step': {
                                    'match': {
                                        'elements': [
                                            // forward barcode element
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
                            },
                        },
                        //{
                        //  'apply': {
                        //      'to': 'merged',
                        //      'step': {
                        //          'custom_demultiplex': {
                        //              'custom_location': '1',
                        //              'elements': [
                        //                  // forward barcode element
                        //                  {
                        //                      'custom_histogram': true,
                        //                      'custom_trim': true,
                        //                      'cut_lower': {
                        //                          'after': 0,
                        //                      },
                        //                      'max_mismatches': 1,
                        //                      'require_best': true,
                        //                      'required': true,
                        //                      'score_name': 'MID1-score',
                        //                      'seq_file': 'mid1.fasta',
                        //                      'start': {},
                        //                      'value_name': 'MID1',
                        //                  },
                        //              ],
                        //          },
                        //      },
                        //  },
                        //},

    //These histograms should be generated as part of custom_demultiplex
    //
    //                    {
    //                        'histogram': {
    //                            'name': 'DemultiplexBarcode1',
    //                            'out_path': 'DemultiplexBarcode1.csv',
    //                        },
    //                    },
    //                    {
    //                        'histogram': {
    //                            'name': 'DemultiplexBarcode1-score',
    //                            'out_path': 'DemultiplexBarcode1-score.csv',
    //                        },
    //                    },

                        {
                            'apply': {
                                'to': 'merged',
                                'step': {
                                    'length_filter': {
                                        'min': 200,
                                    },
                                },
                            },
                        },
                        {
                            'apply': {
                                'to': 'merged',
                                'step': {
                                    'average_quality_filter': {
                                        'custom_value': 35,
                                    },
                                },
                            },
                        },
                        {
                            'apply': {
                                'to': 'merged',
                                'step': {
                                    'homopolymer_filter': {
                                        'custom_value': 20,
                                    },
                                },
                            },
                        },
                        {
                            'apply': {
                                'to': 'merged',
                                'step': {
                                    'quality_stats': {
                                        'out_prefix': 'merged-',
                                    },
                                },
                            },
                        },
                        {
                            'apply': {
                                'to': 'merged',
                                'step': {
                                    'composition_stats': {
                                        'out_prefix': 'merged-',
                                    },
                                },
                            },
                        },
                        {
                            'apply': {
                                'to': 'merged',
                                'step': {
                                    'find_shared': {
                                        'out_group_unique': '.fasta',
                                    },
                                },
                            },
                        },
                    ],
                },
*/
                {
                    'workflow-name': 'Single Reads',
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
/*
                        {
                            'custom_demultiplex': {
                                'reverse': true,
                                'custom_location': '1',
                                'elements': [
                                    {
                                        'custom_histogram': true,
                                        'custom_trim': true,
                                        'custom_type': '5\'',
                                        'cut_lower': {
                                            'after': 0,
                                        },
                                        'max_mismatches': 1,
                                        'required': true,
                                        'score_name': 'MID1-score',
                                        'start': {},
                                        'value_name': 'MID1',
                                    },
                                ],
                            },
                        },
*/
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
                //'Single Reads',
                'Find Unique Sequences',
                'Primer Trimming',
                'Barcode Demultiplexing',
                'Sequence Filters',
                'Sequence Statistics',
                //'Paired Reads',
            ];

            return predefinedWorkflowNames;
        },
    });

    Backbone.Agave.Collection.Jobs = Jobs;
    return Jobs;
});
