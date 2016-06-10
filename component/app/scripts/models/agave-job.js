define(
    [
        'app',
        'backbone',
        'file-transfer-mixins',
    ],
function(
    App,
    Backbone,
    FileTransferMixins
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
                    case 'stats_composition.csv':
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

                    case 'stats_gc_hist.csv':
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

                    case 'stats_heat_map.csv':
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

                    case 'stats_len_hist.csv':
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

                    case 'stats_mean_q_hist.csv':
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

                    case 'stats_qstats.csv':
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

                // 27/May/2015 - Temporarily disabled due to
                // problems rendering BAT for large files.
                /*
                if (filename.substr(-11) === '.rc_out.tsv') {
                    chartType = this.CHART_TYPE_6;
                }
                */

                if (filename.substr(-16) === '.composition.csv') {
                    chartType = this.CHART_TYPE_0;
                }

                if (filename.substr(-12) === '.gc_hist.csv') {
                    chartType = this.CHART_TYPE_1;
                }

                if (filename.substr(-13) === '.heat_map.csv') {
                    //chartType = this.CHART_TYPE_2;
                }

                if (filename.substr(-13) === '.len_hist.csv') {
                    chartType = this.CHART_TYPE_3;
                }

                if (filename.substr(-16) === '.mean_q_hist.csv') {
                    chartType = this.CHART_TYPE_4;
                }

                if (filename.substr(-11) === '.qstats.csv') {
                    chartType = this.CHART_TYPE_5;
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

    Job.OutputFile = Backbone.Agave.Model.extend(
        _.extend({}, FileTransferMixins, {
            idAttribute: 'name',
            downloadFileToCache: function() {

                var url = this.get('_links').self.href;
                url = this._fixBadAgaveUrl(url);

                var jqxhr = Backbone.Agave.ajax({
                    headers: Backbone.Agave.oauthHeader(),
                    type:    'GET',
                    url:     url,
                });
                return jqxhr;
            },
            downloadFileToDisk: function() {

                var url = this.get('_links').self.href;
                url = this._fixBadAgaveUrl(url);
                url = this._urlencodeOutputPath(url);

                var jqxhr = this.downloadUrlByPostit(url);

                return jqxhr;
            },
            _fixBadAgaveUrl: function(url) {
                var url = url.split('/');
                url[4] = 'v2';
                url = url.join('/');

                return url;
            },
            _urlencodeOutputPath: function(url) {
                var url = url.split('/');
                url[url.length - 1] = encodeURIComponent(url[url.length - 1]);
                url = url.join('/');

                return url;
            },
        })
    );

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

    Job.IgBlast = Backbone.Agave.JobModel.extend(
        {
            // Public Methods
            defaults: function() {
                return _.extend(
                    {},
                    Backbone.Agave.JobModel.prototype.defaults,
                    {
                        appId: EnvironmentConfig.agave.systems.execution.ls5.apps.igBlast,
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
            configureLargeExecutionHost: function(systemName) {

                this.set({
                    'appId': EnvironmentConfig.agave.systems.execution[systemName].apps.igBlast,
                    'executionSystem': EnvironmentConfig.agave.systems.execution[systemName].hostname,
                });
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
        },
        {
            isChartableOutput: function(filename) {
                if (
                    filename.substr(-11) === 'sample.json'
                    ||
                    filename.substr(-10) === 'combo.json'
                ) {
                    return true;
                }
                else {
                    return false;
                }
            },
        }
    );

    Job.VdjPipe = Backbone.Agave.JobModel.extend({
        // Public Methods
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.JobModel.prototype.defaults,
                {
                    appId: EnvironmentConfig.agave.systems.execution.ls5.apps.vdjPipe,
                }
            );
        },
        initialize: function(options) {
            Backbone.Agave.JobModel.prototype.initialize.apply(this, [options]);
        },
        configureExecutionHostForFileSize: function(fileSize) {

            if (_.isNumber(fileSize)) {
                if (fileSize < 5000000) {

                    // TODO: pull in upStatus from the systems collection and automatically switch to another system if this one is down
                    var smallExecutionSystem = EnvironmentConfig.agave.systems.smallExecutionSystemPreference[0];

                    this.set({
                        'appId': EnvironmentConfig.agave.systems.execution[smallExecutionSystem].apps.vdjPipe,
                        'executionSystem': EnvironmentConfig.agave.systems.execution[smallExecutionSystem].hostname,
                    });

                    this.unset('maxRunTime');
                    this.unset('nodeCount');
                    this.unset('processorsPerNode');
                }
            }
        },
        configureLargeExecutionHost: function(systemName) {

            this.set({
                'appId': EnvironmentConfig.agave.systems.execution[systemName].apps.vdjPipe,
                'executionSystem': EnvironmentConfig.agave.systems.execution[systemName].hostname,
            });
        },
        prepareJob: function(formData, selectedFileMetadatas, allFileMetadatas, projectUuid) {

            this._setJobConfigFromWorkflowFormData(formData, selectedFileMetadatas, allFileMetadatas);
            this._setArchivePath(projectUuid);

            selectedFileMetadatas = this._updateSelectedFileMetadatasForPrimers(
                formData,
                selectedFileMetadatas,
                allFileMetadatas
            );

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
        setPairedReadConfig: function(pairedReadConfig) {
            var jobParameters = this.get('parameters');
            jobParameters['paired_json'] = JSON.stringify(pairedReadConfig);
            jobParameters['workflow'] = 'paired';

            // the input for the standard json needs to be the output of paired_json
            var fileName = pairedReadConfig['steps'][1]['apply']['step']['write_sequence']['out_path'];
            var workConfig = JSON.parse(jobParameters.json);
            workConfig['input'] = [{'sequence': fileName}];
            jobParameters['json'] = JSON.stringify(workConfig);

            this.set('parameters', jobParameters);
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
        _updateSelectedFileMetadatasForPrimers: function(formData, selectedFileMetadatas, allFileMetadatas) {
            var keys = Object.keys(formData);

            // Find if any keys known to have extra files are present
            var matches = [];

            (function() {
                for (var i = 0; i < keys.length; i++) {
                    var search = keys[i].search('primer-file');

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
                    var primerMetadata = allFileMetadatas.getModelForName(files[i]);

                    selectedFileMetadatas.add(primerMetadata);
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

            this.set('name', formData['job-name']);

            this.set(
                'parameters',
                {
                    'json': JSON.stringify(workflowConfig),
                    'workflow': 'single',
                }
            );
        },
    });

    Job.Presto = Backbone.Agave.JobModel.extend({
        // Public Methods
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.JobModel.prototype.defaults,
                {
                    appId: EnvironmentConfig.agave.systems.execution.ls5.apps.presto,
                    inputs: {
                        query: '',
                    },
                    parameters: {
                    },
                }
            );
        },
        initialize: function(options) {
            Backbone.Agave.JobModel.prototype.initialize.apply(this, [options]);
        },
        configureLargeExecutionHost: function(systemName) {

            this.set({
                'appId': EnvironmentConfig.agave.systems.execution[systemName].apps.presto,
                'executionSystem': EnvironmentConfig.agave.systems.execution[systemName].hostname,
            });
        },
        prepareJob: function(formData, selectedFileMetadatas, allFileMetadatas, projectUuid) {

            this.set('name', formData['job-name']);
            this._setArchivePath(projectUuid);

            var parameters = this._serializeFormData(formData);
            parameters.SequenceFiles = this._getSequenceFilenames(
                parameters,
                selectedFileMetadatas
            );

            var inputFiles = {};
            inputFiles = this._serializeFileInputs(
                inputFiles,
                formData,
                selectedFileMetadatas,
                allFileMetadatas
            );
            this.set('input', inputFiles);

            if (inputFiles['SequenceForwardPairedFiles'] !== undefined)
                parameters['Workflow'] = 'paired';

            this.set('parameters', parameters);
        },
        _getSequenceFilenames: function(parameters, selectedFileMetadatas) {

            var sequenceFiles = selectedFileMetadatas.map(function(fileMetadata) {
                return fileMetadata.get('value').name;
            });

            return sequenceFiles;
        },
        _serializeFileInputs: function(fileInputs, formData, selectedFileMetadatas, allFileMetadatas) {

            if (formData.hasOwnProperty('barcode-file')) {
                fileInputs['BarcodeOrUMIFile'] = this._getTranslatedFilePath(formData['barcode-file'], allFileMetadatas);
            }

            if (formData.hasOwnProperty('j-primer-file')) {
                fileInputs['JPrimerFile'] = this._getTranslatedFilePath(formData['j-primer-file'], allFileMetadatas);
            }

            if (formData.hasOwnProperty('v-primer-file')) {
                fileInputs['VPrimerFile'] = this._getTranslatedFilePath(formData['v-primer-file'], allFileMetadatas);
            }

            var pairedReads = selectedFileMetadatas.getOrganizedPairedReadCollection();
            if (pairedReads.length > 0) {
              fileInputs['SequenceForwardPairedFiles'] = this._getTranslatedFilePaths(pairedReads[0]);
              fileInputs['SequenceReversePairedFiles'] = this._getTranslatedFilePaths(pairedReads[1]);
            }

            var singleReads = selectedFileMetadatas.getNonPairedReadCollection();
            fileInputs['SequenceFiles'] = this._getTranslatedFilePaths(singleReads);

            return fileInputs;
        },
        _serializeFormData: function(formData) {

            var parameters = {};

            // default to single but overridden if paired-end read files selected
            parameters['Workflow'] = 'single';

            if (formData.hasOwnProperty('barcode-or-umi'))
                parameters['Barcode'] = formData['barcode-or-umi'];
            else
                parameters['Barcode'] = 'none';

            if (formData.hasOwnProperty('barcode-max-error')) {
                parameters['BarcodeMaxError'] = parseFloat(formData['barcode-max-error']);
            }

            if (formData.hasOwnProperty('barcode-start-position')) {
                parameters['BarcodeStartPosition'] = parseInt(formData['barcode-start-position']);
            }

            if (formData.hasOwnProperty('barcode-split-flag')) {
                parameters['BarcodeSplitFlag'] = formData['barcode-split-flag'];
            }

            if (formData.hasOwnProperty('umi-max-error')) {
                parameters['UMIMaxError'] = parseFloat(formData['umi-max-error']);
            }

            if (formData.hasOwnProperty('umi-max-gap')) {
                parameters['UMIMaxGap'] = parseFloat(formData['umi-max-gap']);
            }

            if (formData.hasOwnProperty('umi-min-frequency')) {
                parameters['UMIMinFrequency'] = parseFloat(formData['umi-min-frequency']);
            }

            if (formData.hasOwnProperty('final-output-filename')) {
                parameters['FinalOutputFilename'] = formData['final-output-filename'];
            }

            if (formData.hasOwnProperty('find-unique-max-nucleotides')) {
                parameters['FindUniqueFlag'] = true;
                parameters['FindUniqueMaxNucleotides'] = parseInt(formData['find-unique-max-nucleotides']);
            }

            if (formData.hasOwnProperty('find-unique-exclude')) {
                parameters['FindUniqueFlag'] = true;
                parameters['FindUniqueExclude'] = formData['find-unique-exclude'];
            }

            if (formData.hasOwnProperty('j-primer-type')) {
                parameters['JPrimerFlag'] = formData['j-primer-type'];

                if (formData.hasOwnProperty('j-primer-max-error'))
                    parameters['JPrimerMaxError'] = parseFloat(formData['j-primer-max-error']);

                if (formData.hasOwnProperty('j-primer-max-length'))
                    parameters['JPrimerMaxLength'] = parseInt(formData['j-primer-max-length']);

                if (formData.hasOwnProperty('j-primer-start-position'))
                    parameters['JPrimerStartPosition'] = parseInt(formData['j-primer-start-position']);
            }
            else {
                parameters['JPrimerFlag'] = 'none';
            }

            if (formData.hasOwnProperty('v-primer-type')) {
                parameters['VPrimerFlag'] = formData['v-primer-type'];

                if (formData.hasOwnProperty('v-primer-max-error'))
                    parameters['VPrimerMaxError'] = parseFloat(formData['v-primer-max-error']);

                if (formData.hasOwnProperty('v-primer-max-length'))
                    parameters['VPrimerMaxLength'] = parseInt(formData['v-primer-max-length']);

                if (formData.hasOwnProperty('v-primer-start-position'))
                    parameters['VPrimerStartPosition'] = parseInt(formData['v-primer-start-position']);
            }
            else {
                parameters['VPrimerFlag'] = 'none';
            }

            if (formData.hasOwnProperty('output-file-prefix')) {
                parameters['OutputFilePrefix'] = formData['output-file-prefix'];
            }

            if (formData.hasOwnProperty('minimum-length')) {
                parameters['FilterFlag'] = true;
                parameters['MinimumLength'] = parseInt(formData['minimum-length']);
                parameters['PreFilterStatisticsFlag'] = true;
                parameters['PostFilterStatisticsFlag'] = true;
            }

            if (formData.hasOwnProperty('minimum-quality')) {
                parameters['FilterFlag'] = true;
                parameters['MinimumQuality'] = parseInt(formData['minimum-quality']);
                parameters['PreFilterStatisticsFlag'] = true;
                parameters['PostFilterStatisticsFlag'] = true;
            }

            if (formData.hasOwnProperty('sequence-file-types')) {
                parameters['SequenceFileTypes'] = formData['sequence-file-types'];
            }

            return parameters;
        },
    });

    Job.VdjpipeWorkflow = Backbone.Agave.MetadataModel.extend({
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
