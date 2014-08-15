define(['backbone'], function(Backbone) {

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

    Jobs.OutputFiles = Backbone.Agave.Collection.extend({
        model: Backbone.Agave.Model.Job.OutputFile,
        initialize: function(parameters) {
            if (parameters.jobId) {
                this.jobId = parameters.jobId;
            }
        },
        comparator: 'name',
        url: function() {
            return '/jobs/v2/' + this.jobId + '/outputs/listings';
        },
    });

    Jobs.Listings = Backbone.Agave.MetadataCollection.extend({
        model: Backbone.Agave.Model.Job.Listing,
        initialize: function(parameters) {
            if (parameters && parameters.projectUuid) {
                this.projectUuid = parameters.projectUuid;
            }
        },
        url: function() {
            return '/meta/v2/data?q='
                + encodeURIComponent('{'
                    + '"name":"projectJob",'
                    + '"value.projectUuid":"' + this.projectUuid + '"'
                + '}');
        },
    });

    Jobs.Workflows = Backbone.Agave.MetadataCollection.extend({
        model: Backbone.Agave.Model.Job.Workflow,
        url: function() {
            return '/meta/v2/data?q='
                + encodeURIComponent('{'
                    + '"name":"vdjpipeWorkflow"'
                + '}');
        },
        getWorkflowNames: function() {
            var values = this.pluck('value');

            var workflowNames = _.pluck(values, 'workflowName');

            return workflowNames;
        },
        getPredefinedWorkflowNames: function() {
            var predefinedWorkflowNames = [
                'Single Reads',
                'Paired Reads',
            ];

            return predefinedWorkflowNames;
        },
        checkIfPredefinedWorkflow: function(workflowName) {
            
            var predefinedWorkflowNames = this.getPredefinedWorkflowNames();
            var predefinedClash = _.indexOf(predefinedWorkflowNames, workflowName);

            if (predefinedClash >= 0) {
                return true;
            }
            else {
                return false;
            }
        },
        setPredefinedWorkflows: function() {

            for (var i = 0; i < this.preconfiguredWorkflows.length; i++) {
                var preconfiguredWorkflow = this.preconfiguredWorkflows[i];

                var workflow = new Backbone.Agave.Model.Job.Workflow();
                workflow.sync = workflow.fakeSync;
                workflow.set('predefined', true);

                workflow.setConfigFromPreconfiguredData(preconfiguredWorkflow);
                this.unshift(workflow);
            };
        },
        preconfiguredWorkflows: [
            {
                'workflow-name': 'Paired Reads',
                'summary_output_path': 'summary.txt',
                'paired_read_pipe': [
                    {
                        'apply': {
                            'to': ['forward', 'reverse'],
                            'step': {'quality_stats': {'out_prefix': 'pre-filter_'}}
                        }
                    },
                    {
                        'apply': {
                            'to': ['forward', 'reverse'],
                            'step': {'composition_stats': {'out_prefix': 'pre-filter_'}}
                        }
                    },
                    {
                        'merge_paired': {'min_score': 50}
                    },
                    {
                        'apply': {
                            'to': 'merged',
                            'step': {
                                'match': {
                                    'elements': [
                                        { /* forward barcode element */
                                            'start': {},
                                            'length': '30',
                                            'min_score': 20,
                                            'sequence': [
                                                'forward barcode sequence1',
                                                'forward barcode sequence2'
                                            ],
                                            'cut_lower': {'after': 0},
                                            'required': true,
                                            'require_best': true,
                                            'value_name': 'MID1', 'score_name': 'MID1-score'
                                        },
                                        { /* reverse barcode element */
                                            'end': {'after': ''},
                                            'length': 30,
                                            'min_score': 20,
                                            'sequence': [
                                                'reverse barcode sequence1',
                                                'reverse barcode sequence2'
                                            ],
                                            'cut_upper': {'before': 0},
                                            'required': true,
                                            'require_best': true,
                                            'value_name': 'MID2',
                                            'score_name': 'MID2-score'
                                        }
                                     /* similar elements for primers */
                                    ]
                                }
                            }
                        }
                    },
                    {
                        'histogram': {
                            'name': 'MID1',
                            'out_path': 'MID1.csv'
                        }
                    },
                    {
                        'histogram': {
                            'name': 'MID2',
                            'out_path': 'MID2.csv'
                        }
                    },
                    {
                        'histogram': {
                            'name': 'MID1-score',
                            'out_path': 'MID1-score.csv'
                        }
                    },
                    {
                        'histogram': {
                            'name': 'MID2-score',
                            'out_path': 'MID2-score.csv'
                        }
                    },
                    {
                        'apply': {
                            'to': 'merged',
                            'step': {
                                'length_filter': {'min': 200}
                            }
                        }
                    },
                    {
                        'apply': {
                            'to': 'merged',
                            'step': {'average_quality_filter': 35}
                        }
                    },
                    {
                        'apply': {
                            'to': 'merged',
                            'step': {'homopolymer_filter': 20}
                        }
                    },
                    {
                        'apply': {
                            'to': 'merged',
                            'step': {
                                'quality_stats': {'out_prefix': 'post-filter_'}
                            }
                        }
                    },
                    {
                        'apply': {
                            'to': 'merged',
                            'step': {
                                'composition_stats': {'out_prefix': 'post-filter_'}
                            }
                        }
                    },
                    {
                        'apply': {
                            'to': 'merged',
                            'step': {
                                'find_intersection': {'out_unique':'.fasta'}
                            }
                        }
                    }
                ]
            },
            {

                'workflow-name': 'Single Reads',
                'summary_output_path': 'summary.txt',
                'single_read_pipe': [
                    {'quality_stats': {'out_prefix': 'pre-filter_'}},
                    {'composition_stats': {'out_prefix': 'pre-filter_'}},
                    {
                        'match': {
                            'reverse': true,
                            'elements': [
                                { /* barcode element */
                                    'start': {},
                                    'sequence': [
                                        'forward barcode sequence1',
                                        'forward barcode sequence2'
                                    ],
                                    'cut_lower': {'after': 0},
                                    'required': true,
                                    'require_best': true,
                                    'value_name': 'MID', 'score_name': 'MID-score'
                                }
                            ]
                        }
                    },
                    {'histogram': {'name': 'MID', 'out_path': 'MID.csv'}},
                    {'length_filter': {'min': 200}},
                    {'average_quality_filter': 35},
                    {'homopolymer_filter': 20},
                    {'quality_stats': {'out_prefix': 'post-filter_'}},
                    {'composition_stats': {'out_prefix': 'post-filter_'}},
                    {
                        'find_intersection': {
                            'out_unique':'.fasta'
                        }
                    }
                ]
            }
        ],
    });

    Backbone.Agave.Collection.Jobs = Jobs;
    return Jobs;
});
