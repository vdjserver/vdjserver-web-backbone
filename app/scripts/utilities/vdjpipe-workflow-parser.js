define(['app'], function(App) {

    'use strict';

    var VdjpipeWorkflowParser = {};

    // Public Methods
    VdjpipeWorkflowParser.GetWorkflowName = function(formData) {
        var name = formData['workflow-name'];

        return name;
    };

    VdjpipeWorkflowParser.ConvertFormDataToWorkflowConfig = function(parameters, fileMetadatas, allFileMetadatas) {

        var readType = VdjpipeWorkflowParser._ReadType(parameters);

        var inputFileReadDirections;

        if (readType['paired_reads']) {
            inputFileReadDirections = VdjpipeWorkflowParser._GetInputFilePairedReadDirections(fileMetadatas, allFileMetadatas);
        }
        else {
            inputFileReadDirections = VdjpipeWorkflowParser._GetInputFileSingleReadDirections(fileMetadatas, allFileMetadatas);
        }

        var paramOutput = VdjpipeWorkflowParser._ParseConfigParameters(parameters);

        var outputConfig = {
            'base_path_input': '',
            'base_path_output': '',
            'input': inputFileReadDirections,
            'steps': paramOutput,
        };

        _.extend(outputConfig, readType);

        return outputConfig;
    };

    VdjpipeWorkflowParser._ReadType = function(parameters) {

        var readType = {};

        // Just as with Highlander, there can only be one (read direction)
        if (parameters['paired_reads']) {
            readType['paired_reads'] = true;
        }
        else {
            readType['single_reads'] = true;
        }

        return readType;
    };

    VdjpipeWorkflowParser._ParseConfigParameters = function(parameters) {

        var paramOutput = [];

        for (var key in parameters) {

            if (parameters.hasOwnProperty(key)) {
                if (key !== 'formtype' && key !== 'job-name') {
                    var keyCounterIndex = key.indexOf('-') + 1;
                    var parameterName = key.slice(keyCounterIndex);

                    var serializer = new VdjpipeWorkflowParser._Serializer(parameters, key);

                    switch (parameterName) {

                        case 'ambiguous_window_filter':
                            paramOutput.push(
                                serializer.getAmbiguousWindowFilter()
                            );

                            break;

                        case 'average_quality_filter':
                            paramOutput.push(
                                serializer.getAverageQualityFilter()
                            );

                            break;

                        case 'average_quality_window_filter':
                            paramOutput.push(
                                serializer.getAverageQualityWindowFilter()
                            );

                            break;

                        case 'character_filter':
                            paramOutput.push(
                                serializer.getCharacterFilter()
                            );

                            break;

                        case 'composition_stats':
                            paramOutput.push(
                                serializer.getCompositionStats()
                            );

                            break;

                        case 'custom_demultiplex':
                            paramOutput.push(
                                serializer.getCustomDemultiplex(paramOutput)
                            );

                            break;

                        case 'custom_j_primer_trimming':
                            paramOutput.push(
                                serializer.getCustomJPrimerTrimming(paramOutput)
                            );

                            break;

                        case 'custom_v_primer_trimming':
                            paramOutput.push(
                                serializer.getCustomVPrimerTrimming(paramOutput)
                            );

                            break;

                        case 'eMID_map':
                            paramOutput.push(
                                serializer.getEmidMap()
                            );

                            break;

                        case 'find_shared':
                            var jobName = parameters['job-name'];

                            paramOutput.push(
                                serializer.getFindShared(paramOutput, jobName)
                            );

                            break;

                        case 'histogram':
                            paramOutput.push(
                                serializer.getHistogram()
                            );

                            break;

                        case 'homopolymer_filter':
                            paramOutput.push(
                                serializer.getHomopolymerFilter()
                            );

                            break;

                        case 'length_filter':
                            paramOutput.push(
                                serializer.getLengthFilter()
                            );

                            break;

                        case 'merge_paired':
                            paramOutput.push(
                                serializer.getMergePaired()
                            );

                            break;

                        case 'min_quality_filter':
                            paramOutput.push(
                                serializer.getMinQualityFilter()
                            );

                            break;

                        case 'min_quality_window_filter':
                            paramOutput.push(
                                serializer.getMinQualityWindowFilter()
                            );

                            break;

                        case 'quality_stats':
                            paramOutput.push(
                                serializer.getQualityStats()
                            );

                            break;

                        case 'write_sequence':
                            paramOutput.push(
                                serializer.getWriteSequence(paramOutput)
                            );

                            break;

                        case 'write_value':
                            paramOutput.push(
                                serializer.getWriteValue(paramOutput)
                            );

                            break;

                        default:
                            break;
                    }
                }
            }
        }

        return paramOutput;
    };

    // Private Methods
    VdjpipeWorkflowParser._Serializer = function(parameters, key) {

        var that = this;

        this.getAmbiguousWindowFilter = function() {
            var configuredParameter = {
                'ambiguous_window_filter': {
                    'min_length':    parseInt(parameters[key + '-min-length']),
                    'max_ambiguous': parseInt(parameters[key + '-max-ambiguous']),
                }
            };

            return that.wrapIfPairedReads(parameters, key, configuredParameter);
        };

        this.getAverageQualityFilter = function() {
            var configuredParameter = {
                'average_quality_filter': {
                    'min_quality': parseFloat(parameters[key]),
                },
            };

            return that.wrapIfPairedReads(parameters, key, configuredParameter);
        };

        this.getAverageQualityWindowFilter = function() {
            var configuredParameter = {
                'average_quality_window_filter': {
                    'min_quality':   parseFloat(parameters[key + '-min-quality']),
                    'window_length': parseInt(parameters[key + '-window-length']),
                    'min_length':    parseInt(parameters[key + '-min-length']),
                },
            };

            return that.wrapIfPairedReads(parameters, key, configuredParameter);
        };

        this.getCharacterFilter = function() {
            var configuredParameter = {
                'character_filter': {
                    'chars': parameters[key],
                },
            };

            return that.wrapIfPairedReads(parameters, key, configuredParameter);
        };

        this.getCompositionStats = function() {
            var configuredParameter = {
                'composition_stats': {
                    'out_prefix': parameters[key + '-out-prefix'],
                },
            };

            return that.wrapIfPairedReads(parameters, key, configuredParameter);
        };

        this.getCustomDemultiplex = function() {

            var reverse = parameters[key + '-reverse-complement'];
            var barcodeLocation = parameters[key + '-custom-location'];

            // Combination custom options
            var combinations = false;

            if (parameters[key + '-combination-value-name']) {

                combinations = [
                    {
                        'csv_file': {
                            'path': parameters[key + '-combination-csv-file'],
                            'values_column': [{}],
                            'skip_header': parameters[key + '-skip-header'],
                        },
                        'value_name': parameters[key + '-combination-value-name'],
                    },
                ];

                if (parameters[key + '-custom-combination-histogram']) {
                    combinations[0]['custom_histogram'] = parameters[key + '-custom-combination-histogram'];
                }
            }

            var elements = [];

            if (parameters[key + '-elements']) {
                for (var i = 0; i < parameters[key + '-elements'].length; i++) {

                    var element = {};
                    var elementCounter = parameters[key + '-elements'][i];

                    var barcodeType = parameters[key + '-' + elementCounter + '-element-custom-type'];
                    if (barcodeType) {
                        element['custom_type'] = barcodeType;
                    }

                    var customHistogram = parameters[key + '-' + elementCounter + '-element-custom-histogram'];
                    if (customHistogram) {
                        element['custom_histogram'] = customHistogram;
                    }

                    var maxMismatches = parameters[key + '-' + elementCounter + '-element-maximum-mismatches'];
                    if (maxMismatches) {
                        // Convert to int
                        maxMismatches = parseInt(maxMismatches);

                        element['max_mismatches'] = maxMismatches;
                    }

                    var required = parameters[key + '-' + elementCounter + '-element-required'];
                    if (required) {
                        element.required = required;
                    }

                    var scoreName = parameters[key + '-' + elementCounter + '-element-score-name'];
                    if (scoreName) {
                        element['score_name'] = scoreName;
                    }

                    var seqFile   = parameters[key + '-' + elementCounter + '-element-sequence-file'];
                    if (seqFile) {
                        element['seq_file'] = seqFile;
                    }

                    var valueName = parameters[key + '-' + elementCounter + '-element-value-name'];
                    if (valueName) {
                        element['value_name'] = valueName;
                    }

                    var trim = parameters[key + '-' + elementCounter + '-element-custom-trim'];
                    if (trim) {
                        element['custom_trim'] = trim;
                    }

                    // Combination
                    if (combinations) {
                        combinations[0]['csv_file']['values_column'][0][valueName] = parseInt(
                            parameters[key + '-' + elementCounter + '-element-barcode-column-order']
                        );
                    }

                    // Save element
                    elements.push(element);
                }
            }

            var configuredParameter = {
                'custom_demultiplex': {
                    'reverse': reverse,
                    'custom_location': barcodeLocation,
                },
            };

            if (elements) {
                configuredParameter['custom_demultiplex'].elements = elements;
            }

            if (combinations) {
                configuredParameter['custom_demultiplex'].combinations = combinations;
            }

            return that.wrapIfPairedReads(parameters, key, configuredParameter);
        };

        this._setupCustomPrimerTrimmingDictionary = function(parameters) {
            var dictionary = {
                'require_best': false
            };

            var required = parameters[key + '-required'];
            if (required) {
                dictionary.required = required;
            }

            var maxMismatches = parameters[key + '-maximum-mismatches'];
            if (maxMismatches) {
                // Convert to int
                maxMismatches = parseInt(maxMismatches);
                dictionary['max_mismatches'] = maxMismatches;
            }

            var trimPrimer = parameters[key + '-trim-primer'];
            if (trimPrimer) {
                dictionary['custom_trim'] = true;
            }

            var fastaFile = parameters[key + '-primer-file'];
            if (fastaFile) {
                dictionary['seq_file'] = fastaFile;
            }

            return dictionary;
        };

        this.getCustomJPrimerTrimming = function() {
            var dictionary = this._setupCustomPrimerTrimmingDictionary(parameters);

            var configuredParameter = {
                'custom_j_primer_trimming': {
                    'elements': [dictionary],
                },
            };

            return that.wrapIfPairedReads(parameters, key, configuredParameter);
        };

        this.getCustomVPrimerTrimming = function() {
            var dictionary = this._setupCustomPrimerTrimmingDictionary(parameters);

            var configuredParameter = {
                'custom_v_primer_trimming': {
                    'elements': [dictionary],
                },
            };

            return that.wrapIfPairedReads(parameters, key, configuredParameter);
        };

        this.getEmidMap = function() {
            var configuredParameter = {
                'eMID_map': {
                    'value_name': parameters[key + '-value-name'],
                    'fasta_path': parameters[key + '-fasta-file'],
                    'pairs_path': parameters[key + '-pairs-file'],
                },
            };

            return that.wrapIfPairedReads(parameters, key, configuredParameter);
        };

        this.getFindShared = function(config, jobName) {

            // Default value
            var findSharedVariables = '';

            var demultiplexVariables = this.extractDemultiplexValueVariables(config);

            // If demultiplex vars are available, then overwrite the default findSharedVariables value
            if (demultiplexVariables && demultiplexVariables.length > 0) {

                for (var i = 0; i < demultiplexVariables.length; i++) {
                    findSharedVariables += '{' + demultiplexVariables[i] + '}';

                    if (i < demultiplexVariables.length - 1) {
                        findSharedVariables += '-';
                    }
                }
            }

            var configuredParameter = {
                'find_shared': {},
            };

            if (findSharedVariables.length > 0) {
                configuredParameter.find_shared = {
                    'out_group_unique': findSharedVariables
                                        + '-u'
                                        + parameters[key + '-out-group-unique'],
                };
            }
            else {
                configuredParameter.find_shared = {
                    'out_unique': jobName
                                  + '-u'
                                  + parameters[key + '-out-group-unique'],
                };
            }

            return that.wrapIfPairedReads(parameters, key, configuredParameter);

/*
            if (parameters[key + '-group-variable']) {
                returnValue['find_shared']['group_variable'] = parameters[key + '-group-variable'];
            }

            if (parameters[key + '-min-length']) {
                tmpFindShared['find_shared']['min_length'] = parseInt(parameters[key + '-min-length']);
            }

            if (parameters[key + '-fraction-match']) {
                tmpFindShared['find_shared']['fraction_match'] = parseFloat(parameters[key + '-fraction-match']);
            }
            else if (parameters[key + '-ignore-ends']) {
                tmpFindShared['find_shared']['ignore_ends'] = parseInt(parameters[key + '-ignore-ends']);
            }

            if (tmpFindShared['find_shared'].length === 0) {
                tmpFindShared['find_shared']['out_group_unique'] = '.fasta';
            }
*/

            //return tmpFindShared;
        };

        this.getHistogram = function() {
            var configuredParameter = {
                'histogram': {
                    'name': parameters[key + '-name'],
                    'out_path': parameters[key + '-out-path'],
                },
            };

            return that.wrapIfPairedReads(parameters, key, configuredParameter);
        };

        this.getHomopolymerFilter = function() {
            var configuredParameter = {
                'homopolymer_filter': {
                    'max_length': parseInt(parameters[key]),
                },
            };

            return that.wrapIfPairedReads(parameters, key, configuredParameter);
        };

        this.getLengthFilter = function() {

            var configuredParameter = {
                'length_filter': {},
            };

            if (parameters[key + '-min']) {
                configuredParameter['length_filter']['min'] = parseInt(parameters[key + '-min']);
            }

            if (parameters[key + '-max']) {
                configuredParameter['length_filter']['max'] = parseInt(parameters[key + '-max']);
            }

            return that.wrapIfPairedReads(parameters, key, configuredParameter);
        };

        this.getMergePaired = function() {
            var configuredParameter = {
                'merge_paired': {
                    'min_score': parseInt(parameters[key]),
                },
            };

            return that.wrapIfPairedReads(parameters, key, configuredParameter);
        };

        this.getMinQualityFilter = function() {
            var configuredParameter = {
                'min_quality_filter': {
                    'min_quality': parseInt(parameters[key]),
                },
            };

            return that.wrapIfPairedReads(parameters, key, configuredParameter);
        };

        this.getMinQualityWindowFilter = function() {

            var configuredParameter = {
                'min_quality_window_filter': {
                    'min_quality': parseInt(parameters[key + '-min-quality']),
                    'min_length': parseInt(parameters[key + '-min-length']),
                },
            };

            return that.wrapIfPairedReads(parameters, key, configuredParameter);
        };

        this.getQualityStats = function() {

            var configuredParameter = {
                'quality_stats': {
                    'out_prefix': parameters[key + '-out-prefix'],
                },
            };

            return that.wrapIfPairedReads(parameters, key, configuredParameter);
        };

        this.getWriteSequence = function(paramOutput) {

            // extract demultiplex variables
            var demultiplexVariablePath = this.createDemultiplexBarcodeVariablePath(paramOutput);

            var configuredParameter = {
                'write_sequence': {
                    'out_path': demultiplexVariablePath,
                    'unset_value': parameters[key + '-unset-value'],
                },
            };

            if (parameters[key + '-trimmed']) {
                configuredParameter['write_sequence']['trimmed'] = parameters[key + '-trimmed'];
            }

            if (parameters[key + '-reverse-complemented']) {
                configuredParameter['write_sequence']['reverse_complemented'] = parameters[key + '-reverse-complemented'];
            }

            if (parameters[key + '-skip-empty']) {
                configuredParameter['write_sequence']['skip_empty'] = parameters[key + '-skip-empty'];
            }

            return that.wrapIfPairedReads(parameters, key, configuredParameter);
        };

        this.getWriteValue = function(paramOutput) {

            var writeValuesNames = parameters[key + '-names'];
            writeValuesNames = writeValuesNames.split(',');

            var configuredParameter = {
                'write_value': {
                    'names': writeValuesNames,
                    'out_path': this.createDemultiplexBarcodeVariablePath(paramOutput),
                    'unset_value': parameters[key + '-unset-value'],
                },
            };

            return that.wrapIfPairedReads(parameters, key, configuredParameter);
        };

        // Extras
        this.wrapIfPairedReads = function(parameters, key, configuredParameter) {

            if (parameters[key + '-paired-read-direction']) {
                return {
                    'apply': {
                        'to': parameters[key + '-paired-read-direction'],
                        'step': configuredParameter,
                    },
                };
            }

            return configuredParameter;
        };

        this.extractDemultiplexValueVariables = function(config) {

            var demultiplexVariables = [];

            for (var i = 0; i < config.length; i++) {

                var key = Object.keys(config[i]);

                if (key[0] && key[0] === 'custom_demultiplex') {
                    var demultiplexStanza = config[i]['custom_demultiplex'];

                    for (var j = 0; j < demultiplexStanza['elements'].length; j++) {
                        var demultiplexVariable = demultiplexStanza['elements'][j]['value_name'];

                        demultiplexVariables.push(demultiplexVariable);
                    }
                }
            }

            return demultiplexVariables;
        };

        this.createDemultiplexBarcodeVariablePath = function(config) {

            var demultiplexVariables = this.extractDemultiplexValueVariables(config);

            var demultiplexVariablePath = '';

            for (var i = 0; i < demultiplexVariables.length; i++) {
                if (i === 0) {
                    demultiplexVariablePath += demultiplexVariables[i];
                }
                else {
                    demultiplexVariablePath += '-' + demultiplexVariables[i];
                }
            }

            demultiplexVariablePath += '.fasta';

            return demultiplexVariablePath;
        };
    };

    VdjpipeWorkflowParser._GetInputFileSingleReadDirections = function(fileMetadatas, allFileMetadatas) {
        var readDirections = [];

        if (fileMetadatas && fileMetadatas.length > 0) {
            for (var i = 0; i < fileMetadatas.length; i++) {
                var value = fileMetadatas.at([i]).get('value');

                // Scenario A: Fasta w/ qual
                var qualUuid = value['qualityScoreMetadataUuid'];

                if (qualUuid) {
                    var qualMetadata = allFileMetadatas.get(qualUuid);
                    var qualValue = qualMetadata.get('value');

                    if (value['readDirection'] === 'F') {
                        readDirections.push({
                            'sequence': value.name,
                            'quality': qualValue.name,
                        });
                    }
                    else if (value['readDirection'] === 'R') {
                        readDirections.push({
                            'sequence': value.name,
                            'is_reverse': true,
                            'quality': qualValue.name,
                        });
                    }
                    else {

                        // Default: assume forward reads
                        readDirections.push({
                            'sequence': value.name,
                            'quality': qualValue.name,
                        });
                    }

                    // Skip to next iteration so we don't include this a 2nd time
                    continue;
                }

                // Scenario B: All others
                if (value['readDirection'] === 'F') {
                    readDirections.push({
                        'sequence': value.name,
                    });
                }
                else if (value['readDirection'] === 'R') {
                    readDirections.push({
                        'sequence': value.name,
                        'is_reverse': true,
                    });
                }
                else {
                    // Default: assume forward reads
                    readDirections.push({
                        'sequence': value.name,
                    });
                }
            }
        }

        return readDirections;
    };

    VdjpipeWorkflowParser._GetInputFilePairedReadDirections = function(fileMetadatas, allFileMetadatas) {
        var readDirections = [];

        // Separate input files into paired and non paired reads
        var pairedReadCollection = fileMetadatas.getPairedReadCollection();
        var pairedReads = pairedReadCollection.getOrganizedPairedReads();

        for (var i = 0; i < pairedReads.length; i++) {

            var stanza = {};

            for (var j = 0; j < pairedReads[i].length; j++) {
                var model = pairedReads[i][j];

                if (model.getReadDirection() === 'F') {
                    stanza['forward_seq'] = model.get('value')['name'];
                }
                else {
                    stanza['reverse_seq'] = model.get('value')['name'];
                }

                if (model.getQualityScoreMetadataUuid()) {
                    var qualModel = allFileMetadatas.get(model.getQualityScoreMetadataUuid());

                    if (qualModel.getReadDirection() === 'F') {
                        stanza['forward_qual'] = qualModel.get('value')['name'];
                    }
                    else {
                        stanza['reverse_qual'] = qualModel.get('value')['name'];
                    }
                }
            }

            readDirections.push(stanza);
        }

        return readDirections;
    };

    App.Utilities.Vdjpipe.WorkflowParser = VdjpipeWorkflowParser;
    return VdjpipeWorkflowParser;
});
