define([
    'backbone',
    'moment',
], function(Backbone, moment) {

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
        // Sort by reverse date order
        comparator: function(modelA, modelB) {
            var modelAEndDate = moment(modelA.get('created'));
            var modelBEndDate = moment(modelB.get('created'));

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
            return '/meta/v2/data?q='
                + encodeURIComponent('{'
                    + '"name":"projectJob",'
                    + '"value.projectUuid":"' + this.projectUuid + '"'
                + '}');
        },
    });

    Jobs.Workflows = Backbone.Agave.MetadataCollection.extend({

        // Public Methods
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

            var preconfiguredWorkflows = this._preconfiguredWorkflows();

            for (var i = 0; i < preconfiguredWorkflows.length; i++) {
                var preconfiguredWorkflow = preconfiguredWorkflows[i];

                var workflow = new Backbone.Agave.Model.Job.Workflow();
                workflow.sync = workflow.fakeSync;
                workflow.set('predefined', true);

                workflow.setConfigFromPreconfiguredData(preconfiguredWorkflow);
                this.unshift(workflow);
            }
        },

        // Private Methods
        _preconfiguredWorkflows: function() {

            var workflows = [
                // Paired read workflows are temporarily disabled for the time being.
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
                        {
                            'custom_demultiplex': {
                                'reverse': true,
                                'custom_location': '1',
                                'elements': [
                                    {
                                        'custom_type': '5\'',
                                        'max_mismatches': 1,
                                        'required': true,
                                        'score_name': 'MID1-score',
                                        'value_name': 'MID1',
                                        'start': {},
                                        'cut_lower': {
                                            'after': 0,
                                        },
                                        'custom_trim': true,
                                        'custom_histogram': true,
                                    },
                                ],
                            },
                        },
                        {
                            'custom_j_primer_trimming': {},
                        },
                        {
                            'custom_v_primer_trimming': {},
                        },
                        {
                            'length_filter': {
                                'min': 200,
                            },
                        },
                        {
                            'average_quality_filter': 35,
                        },
                        {
                            'homopolymer_filter': 20,
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
                                'out_group_unique':'.fasta',
                                'group_variable': 'MID1',
                            },
                        },
                    ],
                },
            ];

            return workflows;
        },
        _getPredefinedWorkflowNames: function() {
            var predefinedWorkflowNames = [
                'Single Reads',
                'Paired Reads',
            ];

            return predefinedWorkflowNames;
        },
    });

    Backbone.Agave.Collection.Jobs = Jobs;
    return Jobs;
});
