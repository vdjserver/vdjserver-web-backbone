define(
    [
        'app',
        'backbone',
    ],
function(
    App,
    Backbone
) {

    'use strict';

    var Job = {};

    Job.Detail = Backbone.Agave.Model.extend(
        {
            defaults: {
                id: '',
            },
            url: function() {
                return '/jobs/v2/' + this.get('id');
            },
        },
        {
            CHART_TYPE_0: 'composition',
            CHART_TYPE_1: 'gcHistogram',
            CHART_TYPE_2: 'heatMap',
            CHART_TYPE_3: 'lengthHistogram',
            CHART_TYPE_4: 'meanQualityScoreHistogram',
            CHART_TYPE_5: 'qualityScore',
            CHART_TYPE_6: 'giantTable',
            CHART_TYPE_7: 'cdr3',
            CHART_TYPE_8: 'geneDistribution',

            getChartType: function(filename) {

                var chartType = false;

                switch (filename) {
                    case 'pre-filter_composition.csv':
                    case 'post-filter_composition.csv':
                    case 'pre-filter-fwd-composition.csv':
                    case 'post-filter-fwd-composition.csv':
                    case 'pre-filter-rev-composition.csv':
                    case 'post-filter-rev-composition.csv':
                    case 'merged-composition.csv':
                    case 'forward-composition.csv':
                    case 'reverse-composition.csv':
                        chartType = this.CHART_TYPE_0;
                        break;

                    case 'pre-filter_gc_hist.csv':
                    case 'post-filter_gc_hist.csv':
                    case 'pre-filter-fwd-gc_hist.csv':
                    case 'post-filter-fwd-gc_hist.csv':
                    case 'pre-filter-rev-gc_hist.csv':
                    case 'post-filter-rev-gc_hist.csv':
                    case 'merged-gc_hist.csv':
                    case 'forward-gc_hist.csv':
                    case 'reverse-gc_hist.csv':
                        chartType = this.CHART_TYPE_1;
                        break;

                    case 'pre-heat_map.csv':
                    case 'post-heat_map.csv':
                    case 'pre-filter-fwd-heat_map.csv':
                    case 'post-filter-fwd-heat_map.csv':
                    case 'pre-filter-rev-heat_map.csv':
                    case 'post-filter-rev-heat_map.csv':
                    case 'merged-heat_map.csv':
                    case 'forward-heat_map.csv':
                    case 'reverse-heat_map.csv':
                        break;

                    case 'pre-filter_len_hist.csv':
                    case 'post-filter_len_hist.csv':
                    case 'pre-filter-fwd-len_hist.csv':
                    case 'post-filter-fwd-len_hist.csv':
                    case 'pre-filter-rev-len_hist.csv':
                    case 'post-filter-rev-len_hist.csv':
                    case 'merged-len_hist.csv':
                    case 'forward-len_hist.csv':
                    case 'reverse-len_hist.csv':
                        chartType = this.CHART_TYPE_3;
                        break;

                    case 'pre-filter_mean_q_hist.csv':
                    case 'post-filter_mean_q_hist.csv':
                    case 'pre-filter-fwd-mean_q_hist.csv':
                    case 'post-filter-fwd-mean_q_hist.csv':
                    case 'pre-filter-rev-mean_q_hist.csv':
                    case 'post-filter-rev-mean_q_hist.csv':
                    case 'merged-mean_q_hist.csv':
                    case 'forward-mean_q_hist.csv':
                    case 'reverse-mean_q_hist.csv':
                        chartType = this.CHART_TYPE_4;
                        break;

                    case 'pre-filter_qstats.csv':
                    case 'post-filter_qstats.csv':
                    case 'pre-filter-fwd-qstats.csv':
                    case 'post-filter-fwd-qstats.csv':
                    case 'pre-filter-rev-qstats.csv':
                    case 'post-filter-rev-qstats.csv':
                    case 'merged-qstats.csv':
                    case 'forward-qstats.csv':
                    case 'reverse-qstats.csv':
                        chartType = this.CHART_TYPE_5;
                        break;

                    default:
                        break;
                }

                if (filename.substr(-11) === '.rc_out.tsv') {
                    chartType = this.CHART_TYPE_6;
                }

                if (filename.substr(-14) === '.cdr3_hist.tsv') {
                    chartType = this.CHART_TYPE_7;
                }

                if (filename.substr(-20) === '.segment_counts.json') {
                    chartType = this.CHART_TYPE_8;
                }

                return chartType;
            },
        }
    );

    Job.OutputFile = Backbone.Agave.Model.extend({
        idAttribute: 'name',
        downloadFileToCache: function() {
            var jqxhr = $.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type:    'GET',
                url:     this.get('_links').self.href,
            });
            return jqxhr;
        },
        downloadFileToDisk: function() {
            var that = this;

            var xhr = new XMLHttpRequest();
            xhr.open(
                'get',
                this.get('_links').self.href
            );

            xhr.responseType = 'blob';
            xhr.setRequestHeader('Authorization', 'Bearer ' + Backbone.Agave.instance.token().get('access_token'));

            xhr.onload = function() {
                if (this.status === 200 || this.status === 202) {
                    window.saveAs(
                        new Blob([this.response]),
                        that.get('name')
                    );
                }
            };

            xhr.send();

            return xhr;
        },
    });

    Job.Listing = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'projectJob',
                    owner: '',
                    value: {
                        'projectUuid': '',
                        'jobUuid': '',
                    },
                }
            );
        },
        url: function() {
            return '/meta/v2/data/' + this.get('uuid');
        },
    });

    Job.IgBlast = Backbone.Agave.JobModel.extend({
        // Public Methods
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.JobModel.prototype.defaults,
                {
                    appId: 'igblast-lonestar-1.4.0u6',
                    inputs: {
                        query: '',
                    },
                    parameters: {
                        species: '',
                        ig_seqtype: '',
                        domain_system: '',
                    },
                }
            );
        },
        initialize: function(options) {
            Backbone.Agave.JobModel.prototype.initialize.apply(this, [options]);

            this.inputParameterName = 'query';
        },
        prepareJob: function(formData, selectedFileMetadatas, allFileMetadatas, projectUuid) {

            var parameters = this._serializeFormData(formData);

            this.set('parameters', parameters);

            this.set('name', formData['job-name']);

            this._setArchivePath(projectUuid);

            this._setFilesParameter(selectedFileMetadatas);
        },
        _serializeFormData: function(formData) {
            var parameters = {
                'species': formData['species'],
                'ig_seqtype': formData['sequence-type'],
                'domain_system': formData['domain-system'],
            };

            return parameters;
        },
    });

    Job.VdjPipe = Backbone.Agave.JobModel.extend({
        // Public Methods
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.JobModel.prototype.defaults,
                {
                    appId: 'vdj_pipe-0.1.2u6',
                }
            );
        },
        initialize: function(options) {
            Backbone.Agave.JobModel.prototype.initialize.apply(this, [options]);
        },
        prepareJob: function(formData, selectedFileMetadatas, allFileMetadatas, projectUuid) {

            this._setJobConfigFromWorkflowFormData(formData, selectedFileMetadatas, allFileMetadatas);
            this._setArchivePath(projectUuid);

            selectedFileMetadatas = this._updateSelectedFileMetadatasForBarcodes(
                formData,
                selectedFileMetadatas,
                allFileMetadatas
            );

            selectedFileMetadatas = this._updateSelectedFileMetadatasForBarcodeQualityScores(
                formData,
                selectedFileMetadatas,
                allFileMetadatas
            );

            selectedFileMetadatas = this._updateSelectedFileMetadatasForCombinationCsv(
                formData,
                selectedFileMetadatas,
                allFileMetadatas
            );

            this._setFilesParameter(selectedFileMetadatas);
        },

        // Private Methods
        _updateSelectedFileMetadatasForBarcodeQualityScores: function(formData, selectedFileMetadatas, allFileMetadatas) {

            for (var i = 0; i < selectedFileMetadatas.models.length; i++) {

                var selectedFileMetadata = selectedFileMetadatas.at(i);

                var qualUuid = selectedFileMetadata.getQualityScoreMetadataUuid();

                if (qualUuid) {
                    var qualFileMetadata = allFileMetadatas.get(qualUuid);

                    selectedFileMetadatas.add(qualFileMetadata);
                }
            }

            return selectedFileMetadatas;
        },
        _updateSelectedFileMetadatasForBarcodes: function(formData, selectedFileMetadatas, allFileMetadatas) {
            var keys = Object.keys(formData);

            // Find if any keys known to have extra files are present
            var matches = [];

            (function() {
                for (var i = 0; i < keys.length; i++) {
                    var search = keys[i].search('element-sequence-file');

                    if (search > -1) {
                        matches.push(keys[i]);
                    }
                }
            })();

            // Extract filenames from form
            var files = [];

            (function() {
                for (var i = 0; i < matches.length; i++) {
                    var fasta = formData[matches[i]];

                    files.push(fasta);
                }
            })();

            // Extract file metadata for filenames
            (function() {

                for (var i = 0; i < files.length; i++) {
                    var fastaMetadata = allFileMetadatas.getModelForName(files[i]);

                    // Add qual files
                    var qualUuid = fastaMetadata.getQualityScoreMetadataUuid();

                    var qualMetadata = allFileMetadatas.get(qualUuid);

                    selectedFileMetadatas.add(fastaMetadata);
                    selectedFileMetadatas.add(qualMetadata);
                }

            })();

            return selectedFileMetadatas;
        },

        _updateSelectedFileMetadatasForCombinationCsv: function(formData, selectedFileMetadatas, allFileMetadatas) {
            var keys = Object.keys(formData);

            // Find if any keys known to have extra files are present
            var matches = [];

            (function() {
                for (var i = 0; i < keys.length; i++) {
                    var search = keys[i].search('combination-csv-file');

                    if (search > -1) {
                        matches.push(keys[i]);
                    }
                }
            })();

            // Extract filenames from form
            var files = [];

            (function() {
                for (var i = 0; i < matches.length; i++) {
                    var fasta = formData[matches[i]];

                    files.push(fasta);
                }
            })();

            // Extract file metadata for filenames
            (function() {

                for (var i = 0; i < files.length; i++) {
                    var csvMetadata = allFileMetadatas.getModelForName(files[i]);

                    selectedFileMetadatas.add(csvMetadata);
                }

            })();

            return selectedFileMetadatas;
        },

        _setJobConfigFromWorkflowFormData: function(formData, fileMetadatas, allFileMetadatas) {

            var workflowConfig = App.Utilities.Vdjpipe.WorkflowParser.ConvertFormDataToWorkflowConfig(
                formData,
                fileMetadatas,
                allFileMetadatas
            );

            var jobConfig = App.Utilities.Vdjpipe.ConfigParser.ConvertWorkflowConfigToVdjpipeConfig(workflowConfig);

            this.set('name', formData['job-name']);

            this.set(
                'parameters',
                {
                    'json': JSON.stringify(jobConfig),
                }
            );
        },
    });

    Job.Workflow = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'vdjpipeWorkflow',
                    owner: '',
                    value: {
                        'config': '',
                        'workflowName': '',
                    },
                }
            );
        },
        fakeSync: function() {
            var deferred = $.Deferred();

            deferred.resolve = true;

            return deferred;
        },
        url: function() {
            return '/meta/v2/data/' + this.get('uuid');
        },
        setConfigFromFormData: function(formData) {

            var workflowConfig = App.Utilities.Vdjpipe.WorkflowParser.ConvertFormDataToWorkflowConfig(formData);

            var workflowName = App.Utilities.Vdjpipe.WorkflowParser.GetWorkflowName(formData);

            this.set(
                'value',
                {
                    'config': workflowConfig,
                    'workflowName': workflowName,
                }
            );
        },
        setConfigFromPreconfiguredData: function(data) {

            var workflowName = data['workflow-name'];
            delete data['workflow-name'];

            this.set(
                'value',
                {
                    'config': data,
                    'workflowName': workflowName,
                }
            );

            this.set(
                'uuid',
                workflowName
            );
        },
        validate: function() {
            var value = this.get('value');
            var config = value.config;

            var errors = [];

            if (!value.workflowName) {
                errors.push({
                    'message': 'Missing Workflow Name.',
                    'type': 'workflow-name',
                });
            }

            if (config['steps'] && config['steps'].length === 0) {
                errors.push({
                    'message': 'Missing Configuration Steps.',
                    'type': 'configuration-steps',
                });
            }

            if (errors.length > 0) {
                return errors;
            }
        },
    });

    Backbone.Agave.Model.Job = Job;
    return Job;
});
