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

            initDisplayName: function() {
                var dName = this.get('displayName');
                if (!dName) this.set('displayName', this.get('name'));
            },

            archiveJob: function() {
                var jqxhr = $.ajax({
                    headers: Backbone.Agave.basicAuthHeader(),
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        jobId: this.get('id')
                    }),
                    url: EnvironmentConfig.vdjApi.hostname
                        + '/jobs/archive/' + this.get('id')
                });

                return jqxhr;
            },

            unarchiveJob: function() {
                var jqxhr = $.ajax({
                    headers: Backbone.Agave.basicAuthHeader(),
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        jobId: this.get('id')
                    }),
                    url: EnvironmentConfig.vdjApi.hostname
                        + '/jobs/unarchive/' + this.get('id')
                });

                return jqxhr;
            },

            linkToJob: function(jobMetadata) {
                if (!jobMetadata) return;
                var value = jobMetadata.get('value');
                this.set('metadataLink', jobMetadata.get('uuid'));
                this.initDisplayName();
                if (value.displayName) this.set('displayName', value.displayName);
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

    Job.OutputFile = Backbone.Agave.MetadataModel.extend(
        _.extend({}, FileTransferMixins, {
            idAttribute: 'uuid',
            sync: function(method, model, options) {
                return Backbone.Agave.PutOverrideSync(method, this, options);
            },
            url: function() {
                return '/meta/v2/data/' + this.get('uuid');
            },
            downloadFileToCache: function() {

                var value = this.get('value');
                var url = EnvironmentConfig.agave.hostname
                         + '/jobs'
                         + '/v2'
                         + '/' + value.jobUuid
                         + '/outputs/media/'
                         + '/' + value.name;

                var jqxhr = Backbone.Agave.ajax({
                    headers: Backbone.Agave.oauthHeader(),
                    type:    'GET',
                    url:     url,
                });
                return jqxhr;
            },
            downloadFileToDisk: function() {

                var value = this.get('value');
                var url = EnvironmentConfig.agave.hostname
                         + '/jobs'
                         + '/v2'
                         + '/' + value.jobUuid
                         + '/outputs/media/'
                         + '/' + value.name;
                //var url = this.get('_links').self.href;
                //url = this._fixBadAgaveUrl(url);
                url = this._urlencodeOutputPath(url);

                var jqxhr = this.downloadUrlByPostit(url);

                return jqxhr;
            },
            downloadFileListToDisk: function(files) {
                function downloadNext(i) {
                    if (i >= files.length) {
                        return;
                    }

                    var jqxhr = files[i].downloadFileToDisk();

                    setTimeout(function () { downloadNext(i + 1); }, 5000);

                    return jqxhr;
                }

                return downloadNext(0);
            },
            getFilePath: function() {

                var value = this.get('value');
                var filePath = '';

                if (this.get('name') === 'projectFile') {

                    filePath = '/projects'
                             + '/' + value['projectUuid']
                             + '/files'
                             + '/' + encodeURIComponent(value['name'])
                             ;
                }
                else if (this.get('name') === 'projectJobFile') {

                    filePath = '/projects'
                             + '/' + value['projectUuid']
                             + '/analyses'
                             + '/' + value['relativeArchivePath']
                             + '/' + encodeURIComponent(value['name'])
                             ;
                }

                return filePath;
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
            return '/meta/v2/data?q='
                + encodeURIComponent('{'
                    + '"name":"projectJob",'
                    + '"associationIds":"' + this.get('jobId') + '"'
                + '}')
                + '&limit=1';
        },
    });

    Job.ProcessMetadata = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'processMetadata',
                    owner: '',
                    value: {
                    },
                }
            );
        },
        url: function() {
            return '/meta/v2/data?q='
                + encodeURIComponent('{'
                    + '"name":"processMetadata",'
                    + '"associationIds":"' + this.get('jobId') + '"'
                + '}')
                + '&limit=1';
        },
        getDescriptionForFilename: function(filename) {
            var value = this.get('value');
            if (!value) return null;
            if (!value['files']) return null;

            var files = value['files'];
            for (var f in files) {
                for (var t in files[f]) {
                    if (files[f][t]['value'] == filename) return files[f][t]['description'];
                }
            }
            return null;
        },

        getProjectFileOutputList: function() {
            var pmFiles = [];

            var processMetadata = this.get('value');
            if (!processMetadata) return pmFiles;
            if (!processMetadata.process) return pmFiles;

            for (var group in processMetadata.groups) {
                if (processMetadata.groups[group]['type'] == 'file') {
                    if (processMetadata.groups[group][processMetadata.process.appName]) {
                        var fileKey = processMetadata.groups[group][processMetadata.process.appName]['files'];
                        for (var fileEntry in processMetadata.files[fileKey]) {
                            pmFiles.push(processMetadata.files[fileKey][fileEntry]['value']);
                        }
                    }
                }
            }

            return pmFiles;
        },

        getSampleKeyNameFromUuid: function(sampleUuid) {
            var processMetadata = this.get('value');
            if (!processMetadata) return null;
            if (!processMetadata.process) return null;

            for (var group in processMetadata.groups) {
                if (processMetadata.groups[group]['type'] == 'sample') {
                    for (var sample in processMetadata.groups[group]['samples'])
                        if (sample == sampleUuid) return group;
                }
            }
            return null;
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
                        appName: 'igBlast',
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
                parameters['Creator'] = Backbone.Agave.instance.token().get('username');

                this.set('parameters', parameters);

                this.set('name', formData['job-name']);

                this._setArchivePath(projectUuid);

                this._setFilesParameter(selectedFileMetadatas);
            },
            _serializeFormData: function(formData) {
                var parameters = {
                    'species': formData['species'],
                    'ig_seqtype': formData['sequence-type'],
                    'domain_system': 'imgt',
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

    Job.RepCalc = Backbone.Agave.JobModel.extend(
        {
            // Public Methods
            defaults: function() {
                return _.extend(
                    {},
                    Backbone.Agave.JobModel.prototype.defaults,
                    {
                        appId: EnvironmentConfig.agave.systems.execution.ls5.apps.RepCalc,
                        appName: 'RepCalc',
                        inputs: {
                            vdjml: '',
                            summary: '',
                        },
                        parameters: {
                        },
                    }
                );
            },
            initialize: function(options) {
                Backbone.Agave.JobModel.prototype.initialize.apply(this, [options]);

                //this.inputParameterName = 'query';
            },
            prepareJob: function(formData, VDJMLFileMetadatas, SummaryFileMetadatas, ChangeOFileMetadatas, allFileMetadatas, projectUuid) {

                var parameters = this._serializeFormData(formData);
                parameters['Creator'] = Backbone.Agave.instance.token().get('username');

                this.set('name', formData['job-name']);

                this._setArchivePath(projectUuid);

                var inputFiles = {};
                this._serializeFileInputs(
                    inputFiles,
                    formData,
                    VDJMLFileMetadatas,
                    SummaryFileMetadatas,
                    ChangeOFileMetadatas,
                    allFileMetadatas
                );
                this.set('inputs', inputFiles);

                var metaList = [];
                for (var i = 0; i < VDJMLFileMetadatas.models.length; i++) {
                    var fileMetadata = VDJMLFileMetadatas.at(i);
                    metaList.push(fileMetadata.get('uuid'));
                }
                parameters['VDJMLFileMetadata'] = metaList;

                var metaList = [];
                for (var i = 0; i < SummaryFileMetadatas.models.length; i++) {
                    var fileMetadata = SummaryFileMetadatas.at(i);
                    metaList.push(fileMetadata.get('uuid'));
                }
                parameters['SummaryFileMetadata'] = metaList;

                var metaList = [];
                for (var i = 0; i < ChangeOFileMetadatas.models.length; i++) {
                    var fileMetadata = ChangeOFileMetadatas.at(i);
                    metaList.push(fileMetadata.get('uuid'));
                }
                parameters['ChangeOFileMetadata'] = metaList;

                this.set('parameters', parameters);
            },
            // Private Methods
            _serializeFormData: function(formData) {
                var parameters = {};
                var list = [];

                parameters['JobSelected'] = formData['job-selected'];

                // gene segment usage
                if (formData.hasOwnProperty('gene-segment-usage')) {
                    parameters['GeneSegmentFlag'] = true;

                    list = [];
                    if (formData['gs-absolute']) list.push('absolute');
                    if (formData['gs-relative']) list.push('relative');
                    if (formData['gs-average']) list.push('average');
                    if (list.length > 0) parameters['GeneSegmentOperations'] = list;

                    list = [];
                    if (formData['filter-productive']) list.push('productive');
                    if (list.length > 0) parameters['GeneSegmentFilters'] = list;
                }

                // CDR3
                if (formData.hasOwnProperty('cdr3-analysis')) {
                    parameters['CDR3Flag'] = true;

                    list = [];
                    if (formData['cdr3-nucleotide']) list.push('nucleotide');
                    if (formData['cdr3-aa']) list.push('aa');
                    if (list.length > 0) parameters['CDR3Levels'] = list;

                    list = [];
                    if (formData['cdr3-absolute']) list.push('absolute');
                    if (formData['cdr3-relative']) list.push('relative');
                    if (formData['cdr3-length']) list.push('length');
                    if (formData['cdr3-shared']) list.push('shared');
                    if (formData['cdr3-unique']) list.push('unique');
                    if (list.length > 0) parameters['CDR3Operations'] = list;

                    list = [];
                    if (formData['filter-productive']) list.push('productive');
                    if (list.length > 0) parameters['CDR3Filters'] = list;
                }

                // Clones
                if (formData.hasOwnProperty('clonal-analysis')) {
                    parameters['ClonalFlag'] = true;

                    list = [];
                    if (formData['clonal-abundance']) list.push('abundance');
                    if (list.length > 0) parameters['ClonalOperations'] = list;

                    list = [];
                    if (formData['filter-productive']) list.push('productive');
                    if (list.length > 0) parameters['ClonalFilters'] = list;
                }

                // Diversity
                if (formData.hasOwnProperty('diversity-analysis')) {
                    parameters['DiversityFlag'] = true;

                    list = [];
                    if (formData['diversity-type']) list.push('type');
                    if (formData['diversity-family']) list.push('family');
                    if (formData['diversity-gene']) list.push('gene');
                    if (formData['diversity-allele']) list.push('allele');
                    if (formData['diversity-nucleotide']) list.push('nucleotide');
                    if (formData['diversity-aa']) list.push('aa');
                    if (list.length > 0) parameters['DiversityLevels'] = list;

                    list = [];
                    if (formData['diversity-shannon']) list.push('shannon');
                    if (formData['diversity-profile']) list.push('profile');
                    if (list.length > 0) parameters['DiversityOperations'] = list;

                    list = [];
                    if (formData['filter-productive']) list.push('productive');
                    if (list.length > 0) parameters['DiversityFilters'] = list;
                }

                // Mutations
                if (formData.hasOwnProperty('mutational-analysis')) {
                    parameters['MutationalFlag'] = true;

                    list = [];
                    if (formData['clonal-selection']) list.push('selection');
                    if (list.length > 0) parameters['MutationalOperations'] = list;

                    list = [];
                    if (formData['filter-productive']) list.push('productive');
                    if (list.length > 0) parameters['MutationalFilters'] = list;
                }


                return parameters;
            },
            _serializeFileInputs: function(fileInputs, formData, VDJMLFileMetadatas, SummaryFileMetadatas, ChangeOFileMetadatas, allFileMetadatas) {
                fileInputs['VDJMLFiles'] = this._getTranslatedFilePaths(VDJMLFileMetadatas);
                fileInputs['SummaryFiles'] = this._getTranslatedFilePaths(SummaryFileMetadatas);
                fileInputs['ChangeOFiles'] = this._getTranslatedFilePaths(ChangeOFileMetadatas);
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
                    appName: 'vdjPipe',
                }
            );
        },
        initialize: function(options) {
            Backbone.Agave.JobModel.prototype.initialize.apply(this, [options]);
        },
        prepareJob: function(formData, selectedFileMetadatas, allFileMetadatas, projectUuid) {

            //this._setJobConfigFromWorkflowFormData(formData, selectedFileMetadatas, allFileMetadatas);
            this.set('name', formData['job-name']);
            this._setArchivePath(projectUuid);

            var parameters = this._serializeFormData(formData);
            parameters['Creator'] = Backbone.Agave.instance.token().get('username');

            var inputFiles = {};
            inputFiles = this._serializeFileInputs(
                inputFiles,
                formData,
                selectedFileMetadatas,
                allFileMetadatas
            );
            this.set('inputs', inputFiles);

            this.set('parameters', parameters);
        },

        // Private Methods
        _serializeFileInputs: function(fileInputs, formData, selectedFileMetadatas, allFileMetadatas) {

            if (formData.hasOwnProperty('barcode-file')) {
                fileInputs['BarcodeFile'] = this._getTranslatedFilePath(formData['barcode-file'], allFileMetadatas);
            }

            if (formData.hasOwnProperty('custom_v_primer_trimming-primer-file')) {
                fileInputs['ForwardPrimerFile'] = this._getTranslatedFilePath(formData['custom_v_primer_trimming-primer-file'], allFileMetadatas);
            }

            if (formData.hasOwnProperty('custom_j_primer_trimming-primer-file')) {
                fileInputs['ReversePrimerFile'] = this._getTranslatedFilePath(formData['custom_j_primer_trimming-primer-file'], allFileMetadatas);
            }

            var pairedReads = selectedFileMetadatas.getOrganizedPairedReadCollection();
            if (pairedReads.length > 0) {
              fileInputs['SequenceForwardPairedFiles'] = this._getTranslatedFilePaths(pairedReads[0]);
              fileInputs['SequenceReversePairedFiles'] = this._getTranslatedFilePaths(pairedReads[1]);
            }

            var qualReads = selectedFileMetadatas.getOrganizedPairedQualityCollection(allFileMetadatas);
            if (qualReads.length > 0) {
              fileInputs['SequenceFASTA'] = this._getTranslatedFilePaths(qualReads[0]);
              fileInputs['SequenceQualityFiles'] = this._getTranslatedFilePaths(qualReads[1]);
            }

            var singleReads = selectedFileMetadatas.getNonPairedReadCollection();
            fileInputs['SequenceFASTQ'] = this._getTranslatedFilePaths(singleReads);

            return fileInputs;
        },

        _serializeFormData: function(formData) {

            var parameters = {};

            // workflow
            if (formData.hasOwnProperty('paired_reads')) {
                parameters['Workflow'] = 'paired';
                if (formData.hasOwnProperty('merge_paired-min-score'))
                    parameters['MergeMinimumScore'] = parseInt(formData['merge_paired-min-score']);
                if (formData.hasOwnProperty('merge_write_sequence-out-prefix'))
                    if (formData['merge_write_sequence-out-prefix'].length != 0)
                        parameters['MergeOutputFilename'] = formData['merge_write_sequence-out-prefix'] + ".fastq";
            } else
                parameters['Workflow'] = 'single';

            // statistics
            parameters['PreFilterStatisticsFlag'] = false;
            if (formData.hasOwnProperty('pre_statistics')) {
                parameters['PreFilterStatisticsFlag'] = true;
                parameters['PreFilterStatisticsFilename'] = 'pre-filter_';
            }
            if (formData.hasOwnProperty('statistics')) {
                parameters['PreFilterStatisticsFlag'] = true;
                parameters['PreFilterStatisticsFilename'] = 'stats_';
            }

            if (formData.hasOwnProperty('post_statistics')) {
                parameters['PostFilterStatisticsFlag'] = true;
                parameters['PostFilterStatisticsFilename'] = 'post-filter_';
            } else
                parameters['PostFilterStatisticsFlag'] = false;

            // filtering
            if (formData.hasOwnProperty('length_filter')) {
                parameters['FilterFlag'] = true;
                parameters['MinimumLength'] = parseInt(formData['length_filter-min']);
                parameters['MinimumAverageQuality'] = parseInt(formData['average_quality_filter-min']);
                parameters['MaximumHomopolymer'] = parseInt(formData['homopolymer_filter-max']);
            } else
                parameters['FilterFlag'] = false;

            // barcode
            if (formData.hasOwnProperty('barcode')) {
                parameters['Barcode'] = true;
                parameters['BarcodeLocation'] = formData['barcode-location'];
                parameters['BarcodeDiscard'] = formData['barcode-discard'];
                parameters['BarcodeMaximumMismatches'] = parseInt(formData['barcode-maximum-mismatches']);
                parameters['BarcodeTrim'] = formData['barcode-trim'];
                parameters['BarcodeSearchWindow'] = parseInt(formData['barcode-search-window']);
                parameters['BarcodeSplitFlag'] = formData['barcode-split-flag'];
            } else
                parameters['Barcode'] = false;

            // forward primer
            if (formData.hasOwnProperty('custom_v_primer_trimming')) {
                parameters['ForwardPrimer'] = true;
                parameters['ForwardPrimerMaximumMismatches'] = parseInt(formData['custom_v_primer_trimming-maximum-mismatches']);
                parameters['ForwardPrimerTrim'] = formData['custom_v_primer_trimming-trim-primer'];
                parameters['ForwardPrimerSearchWindow'] = parseInt(formData['custom_v_primer_trimming-element-length']);
            }
            else
                parameters['ForwardPrimer'] = false;

            // reverse primer
            if (formData.hasOwnProperty('custom_j_primer_trimming')) {
                parameters['ReversePrimer'] = true;
                parameters['ReversePrimerMaximumMismatches'] = parseInt(formData['custom_j_primer_trimming-maximum-mismatches']);
                parameters['ReversePrimerTrim'] = formData['custom_j_primer_trimming-trim-primer'];
                parameters['ReversePrimerSearchWindow'] = parseInt(formData['custom_j_primer_trimming-element-length']);
            }
            else
                parameters['ReversePrimer'] = false;

            // find unique
            if (formData.hasOwnProperty('find_shared')) {
                parameters['FindUniqueFlag'] = true;
                if (formData.hasOwnProperty('find_shared-out-prefix'))
                    if (formData['find_shared-out-prefix'].length != 0) {
                        parameters['FindUniqueOutputFilename'] = formData['find_shared-out-prefix'] + ".fasta";
                        parameters['FindUniqueDuplicatesFilename'] = formData['find_shared-out-prefix'] + "-duplicates.tsv";
                    }
            } else
                parameters['FindUniqueFlag'] = false;

            // write final sequences
            if (formData.hasOwnProperty('write_sequence')) {
                if (formData.hasOwnProperty('write_sequence-out-prefix'))
                    if (formData['write_sequence-out-prefix'].length != 0)
                        if (parameters['BarcodeSplitFlag']) {
                            parameters['FinalOutputFilename'] = formData['write_sequence-out-prefix'] + "-{MID}.fastq";
                        } else {
                            parameters['FinalOutputFilename'] = formData['write_sequence-out-prefix'] + ".fastq";
                        }
            }

            return parameters;
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
                    appName: 'presto',
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
        prepareJob: function(formData, selectedFileMetadatas, allFileMetadatas, projectUuid) {

            this.set('name', formData['job-name']);
            this._setArchivePath(projectUuid);

            var parameters = this._serializeFormData(formData);
            parameters['Creator'] = Backbone.Agave.instance.token().get('username');
            //parameters.SequenceFiles = this._getSequenceFilenames(
            //    parameters,
            //    selectedFileMetadatas
            //);

            var inputFiles = {};
            inputFiles = this._serializeFileInputs(
                inputFiles,
                formData,
                selectedFileMetadatas,
                allFileMetadatas
            );
            this.set('inputs', inputFiles);

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
                fileInputs['BarcodeFile'] = this._getTranslatedFilePath(formData['barcode-file'], allFileMetadatas);
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

            if (formData.hasOwnProperty('barcode-file'))
                parameters['Barcode'] = true;
            else
                parameters['Barcode'] = false;

            if (formData.hasOwnProperty('barcode-max-error')) {
                parameters['BarcodeMaxError'] = parseFloat(formData['barcode-max-error']);
            }

            if (formData.hasOwnProperty('barcode-start-position')) {
                parameters['BarcodeStartPosition'] = parseInt(formData['barcode-start-position']);
            }

            if (formData.hasOwnProperty('barcode-split-flag')) {
                parameters['BarcodeSplitFlag'] = formData['barcode-split-flag'];
            }

            if (formData.hasOwnProperty('umi-consensus')) {
                parameters['UMIConsensus'] = formData['umi-consensus'];

                if (formData.hasOwnProperty('umi-max-error')) {
                    parameters['UMIMaxError'] = parseFloat(formData['umi-max-error']);
                }

                if (formData.hasOwnProperty('umi-max-gap')) {
                    parameters['UMIMaxGap'] = parseFloat(formData['umi-max-gap']);
                }

                if (formData.hasOwnProperty('umi-min-frequency')) {
                    parameters['UMIMinFrequency'] = parseFloat(formData['umi-min-frequency']);
                }
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
                parameters['JPrimer'] = formData['j-primer-type'];

                if (formData.hasOwnProperty('reverse-umi'))
                    parameters['JPrimerUMI'] = formData['reverse-umi'];

                if (formData.hasOwnProperty('j-primer-max-error'))
                    parameters['JPrimerMaxError'] = parseFloat(formData['j-primer-max-error']);

                if (formData.hasOwnProperty('j-primer-max-length'))
                    parameters['JPrimerMaxLength'] = parseInt(formData['j-primer-max-length']);

                if (formData.hasOwnProperty('j-primer-start-position'))
                    parameters['JPrimerStartPosition'] = parseInt(formData['j-primer-start-position']);
            }
            else {
                parameters['JPrimer'] = 'none';
            }

            if (formData.hasOwnProperty('v-primer-type')) {
                parameters['VPrimer'] = formData['v-primer-type'];

                if (formData.hasOwnProperty('forward-umi'))
                    parameters['VPrimerUMI'] = formData['forward-umi'];

                if (formData.hasOwnProperty('v-primer-max-error'))
                    parameters['VPrimerMaxError'] = parseFloat(formData['v-primer-max-error']);

                if (formData.hasOwnProperty('v-primer-max-length'))
                    parameters['VPrimerMaxLength'] = parseInt(formData['v-primer-max-length']);

                if (formData.hasOwnProperty('v-primer-start-position'))
                    parameters['VPrimerStartPosition'] = parseInt(formData['v-primer-start-position']);
            }
            else {
                parameters['VPrimer'] = 'none';
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

/*
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
    }); */

    Backbone.Agave.Model.Job = Job;
    return Job;
});
