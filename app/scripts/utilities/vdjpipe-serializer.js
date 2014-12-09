define(['app'], function(App) {

    'use strict';

    var VdjpipeSerializer = {};

    // Public Methods

    VdjpipeSerializer.GetWorkflowName = function(formData) {
        var name = formData['workflow-name'];

        return name;
    };

    VdjpipeSerializer.SerializeWorkflowConfig = function(parameters, fileMetadatas, allFileMetadatas) {

        var outputConfig = {
            'base_path_input': '',
            'base_path_output': '',
            //'csv_file_delimiter': "\t",
        };

        var paramOutput = [];

        for (var key in parameters) {

            if (parameters.hasOwnProperty(key)) {
                if (key !== 'formtype' && key !== 'job-name') {
                    var keyCounterIndex = key.indexOf('-') + 1;
                    var parameterName = key.slice(keyCounterIndex);

                    var serializer = new VdjpipeSerializer._Serializer(parameters, key);

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
                            paramOutput.push(
                                serializer.getFindShared()
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
/*
                        case 'match':
                            paramOutput.push(
                                serializer.getMatch()
                            );

                            break;
*/
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

        // Set file read directions
        var readDirections = VdjpipeSerializer._GetReadDirections(fileMetadatas, allFileMetadatas);
        outputConfig.input = readDirections;

        // Choose read direction and add params
        // Just as with Highlander, there can only be one
        if (parameters['single-reads']) {
            outputConfig['steps'] = paramOutput;
        }

        return outputConfig;
    };

    // Private Methods
    VdjpipeSerializer._Serializer = function(parameters, key) {

        this.parameters = parameters;
        this.key = key;

        this.getAmbiguousWindowFilter = function() {
            return {
                'ambiguous_window_filter': {
                    'min_length':    parseInt(parameters[key + '-min-length']),
                    'max_ambiguous': parseInt(parameters[key + '-max-ambiguous']),
                }
            };
        };

        this.getAverageQualityFilter = function() {
            return {
                'average_quality_filter': {
                    'min_quality': parseFloat(parameters[key]),
                },
            };
        };

        this.getAverageQualityWindowFilter = function() {
            return {
                'average_quality_window_filter': {
                    'min_quality':   parseFloat(parameters[key + '-min-quality']),
                    'window_length': parseInt(parameters[key + '-window-length']),
                    'min_length':    parseInt(parameters[key + '-min-length']),
                },
            };
        };

        this.getCharacterFilter = function() {
            return {
                'character_filter': {
                    'chars': parameters[key],
                },
            };
        };

        this.getCompositionStats = function() {
            return {
                'composition_stats': {
                    'out_prefix': parameters[key + '-out-prefix'],
                },
            };
        };

        this.getCustomDemultiplex = function() {

            var reverse = parameters[key + '-reverse-complement'];
            var barcodeLocation = parameters[key + '-custom-location'];

            // Combination custom options
            var combinations = [
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

            var elements = [];

            if (parameters[key + '-elements']) {
                for (var i = 0; i < parameters[key + '-elements'].length; i++) {

                    var element = {};
                    var elementCounter = parameters[key + '-elements'][i];


                    var barcodeType = parameters[key + '-' + elementCounter + '-element-barcode-type'];
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

                    // Combination
                    combinations[0]['csv_file']['values_column'][0][valueName] = parseInt(parameters[key + '-' + elementCounter + '-element-barcode-column-order']);

                    // Save element
                    elements.push(element);
                }

                // Barcodes & Trimming
                var barcodeCount = parameters[key + '-elements'].length;

                if (barcodeCount === 1) {

                    var onlyBarcode = parameters[key + '-' + 1 + '-element-barcode-type'];

                    switch (onlyBarcode) {
                        case '3\'':
                            elements[0]['end'] = {
                                'after': '',
                            };

                            if (parameters[key + '-' + 1 + '-element-trim-barcode']) {
                                elements[0]['cut_upper'] = {
                                    'before': 0,
                                };

                                elements[0]['custom_trim'] = true;
                            }

                            break;

                        case '5\'':
                            elements[0]['start'] = {};

                            if (parameters[key + '-' + 1 + '-element-trim-barcode']) {
                                elements[0]['cut_lower'] = {
                                    'after': 0,
                                };

                                elements[0]['custom_trim'] = true;
                            }

                            break;

                        default:
                            // code
                    }
                }
                else if (barcodeCount === 2) {
                    //var tmpElementCounter = parameters[key + '-elements'][0];

                    var firstBarcodeType = parameters[key + '-' + 1 + '-element-barcode-type'];
                    var secondBarcodeType = parameters[key + '-' + 2 + '-element-barcode-type'];

                    switch (firstBarcodeType) {
                        case '3\'':
                            elements[0]['end'] = {
                                'after': '',
                            };

                            if (parameters[key + '-' + 1 + '-element-trim-barcode']) {
                                elements[0]['cut_upper'] = {
                                    'before': 0,
                                };

                                elements[0]['custom_trim'] = true;
                            }
                            break;

                        case '5\'':
                            elements[0]['start'] = {};

                            if (parameters[key + '-' + 1 + '-element-trim-barcode']) {
                                elements[0]['cut_lower'] = {
                                    'after': 0,
                                };

                                elements[0]['custom_trim'] = true;
                            }

                            break;

                        default:
                            // code
                    }

                    switch (secondBarcodeType) {
                        case '3\'':

                            // Barcode type settings will depend on the first barcode
                            if (firstBarcodeType === '3\'') {
                                elements[1]['end'] = {
                                    'before': 'MID1',
                                    'pos': -2,
                                };
                            }
                            else if (firstBarcodeType === '5\'') {
                                elements[1]['end'] = {
                                    'after': '',
                                };
                            }

                            // Set barcode trim
                            if (parameters[key + '-' + 2 + '-element-trim-barcode']) {
                                elements[1]['cut_upper'] = {
                                    'before': 0,
                                };

                                elements[1]['custom_trim'] = true;
                            }
                            break;

                        case '5\'':
                            // For 5', the barcode type setting does NOT depend on the first barcode
                            elements[1]['start'] = {};

                            // Set barcode trim
                            if (parameters[key + '-' + 2 + '-element-trim-barcode']) {
                                elements[1]['cut_lower'] = {
                                    'after': 0,
                                };

                                elements[1]['custom_trim'] = true;
                            }

                            break;

                        default:
                            // code
                    }
                }
            }

            var matchObject = {
                'custom_demultiplex': {
                    'reverse': reverse,
                    'custom_location': barcodeLocation,
                },
            };

            if (elements) {
                matchObject['custom_demultiplex'].elements = elements;
            }

            if (combinations) {
                matchObject['custom_demultiplex'].combinations = combinations;
            }

            return matchObject;
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
            var dictionary = this._customPrimerTrimmingDictionary(parameters);

            return {
                'custom_j_primer_trimming': {
                    'elements': [dictionary],
                },
            };
        };

        this.getCustomVPrimerTrimming = function() {
            var dictionary = this._customPrimerTrimmingDictionary(parameters);

            return {
                'custom_v_primer_trimming': {
                    'elements': [dictionary],
                },
            };
        };

        this.getEmidMap = function() {
            return {
                'eMID_map': {
                    'value_name': parameters[key + '-value-name'],
                    'fasta_path': parameters[key + '-fasta-file'],
                    'pairs_path': parameters[key + '-pairs-file'],
                },
            };
        };

        this.getFindShared = function() {

            var returnValue = {
                'find_shared': {
                    'out_group_unique': parameters[key + '-out-group-unique'],
                },
            };
/*
            if (parameters[key + '-group-variable']) {
                returnValue['find_shared']['group_variable'] = parameters[key + '-group-variable'];
            }
*/
            return returnValue;

/*
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
            return {
                'histogram': {
                    'name': parameters[key + '-name'],
                    'out_path': parameters[key + '-out-path'],
                },
            };
        };

        this.getHomopolymerFilter = function() {
            return {
                'homopolymer_filter': {
                    'max_length': parseInt(parameters[key]),
                },
            };
        };

        this.getLengthFilter = function() {

            var lengthFilter = {
                'length_filter': {},
            };

            if (parameters[key + '-min']) {
                lengthFilter['length_filter']['min'] = parseInt(parameters[key + '-min']);
            }

            if (parameters[key + '-max']) {
                lengthFilter['length_filter']['max'] = parseInt(parameters[key + '-max']);
            }

            return lengthFilter;
        };

        this.getMergePaired = function() {
            return {
                'merge_paired': {
                    'min_score': parseInt(parameters[key]),
                },
            };
        };

        this.getMinQualityFilter = function() {
            return {
                'min_quality_filter': {
                    'min_quality': parseInt(parameters[key]),
                },
            };
        };

        this.getMinQualityWindowFilter = function() {
            return {
                'min_quality_window_filter': {
                    'min_quality': parseInt(parameters[key + '-min-quality']),
                    'min_length': parseInt(parameters[key + '-min-length']),
                },
            };
        };

        this.getQualityStats = function() {
            return {
                'quality_stats': {
                    'out_prefix': parameters[key + '-out-prefix'],
                },
            };
        };

        this.getWriteSequence = function(paramOutput) {

            // extract demultiplex variables
            var demultiplexVariablePath = this.createDemultiplexBarcodeVariablePath(paramOutput);

            var returnValue = {
                'write_sequence': {
                    'out_path': demultiplexVariablePath,
                    'unset_value': parameters[key + '-unset-value'],
                },
            };

            if (parameters[key + '-trimmed']) {
                returnValue['write_sequence']['trimmed'] = parameters[key + '-trimmed'];
            }

            if (parameters[key + '-reverse-complemented']) {
                returnValue['write_sequence']['reverse_complemented'] = parameters[key + '-reverse-complemented'];
            }

            if (parameters[key + '-skip-empty']) {
                returnValue['write_sequence']['skip_empty'] = parameters[key + '-skip-empty'];
            }

            return returnValue;
        };

        this.getWriteValue = function(paramOutput) {

            var writeValuesNames = parameters[key + '-names'];
            writeValuesNames = writeValuesNames.split(',');

            return {
                'write_value': {
                    'names': writeValuesNames,
                    'out_path': this.createDemultiplexBarcodeVariablePath(paramOutput),
                    'unset_value': parameters[key + '-unset-value'],
                },
            };
        };

        // Extras
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

    VdjpipeSerializer._GetReadDirections = function(fileMetadatas, allFileMetadatas) {
        var readDirections = [];

        if (fileMetadatas && fileMetadatas.length > 0) {
            for (var i = 0; i < fileMetadatas.length; i++) {
                var value = fileMetadatas.at([i]).get('value');
                var privateAttributes = value.privateAttributes;

                if (value.name.split('.').pop() === 'fasta') {

                    var qualUuid = privateAttributes['quality-score-metadata-uuid'];

                    if (qualUuid) {
                        var qualMetadata = allFileMetadatas.get(qualUuid);
                        var qualValue = qualMetadata.get('value');

                        if (privateAttributes['read-direction'] === 'F') {
                            readDirections.push({
                                'sequence': value.name,
                                'quality': qualValue.name,
                            });
                        }

                        if (privateAttributes['read-direction'] === 'R') {
                            readDirections.push({
                                'sequence': value.name,
                                'is_reverse': true,
                                'quality': qualValue.name,
                            });
                        }

                        continue;
                    }
                }

                if (privateAttributes['read-direction'] === 'F') {
                    readDirections.push({
                        'sequence': value.name,
                    });
                }
                else if (privateAttributes['read-direction'] === 'R') {
                    readDirections.push({
                        'sequence': value.name,
                        'is_reverse': true,
                    });
                }
            }
        }

        return readDirections;
    };

    // Convert workflowConfig to vdjpipeConfig
    VdjpipeSerializer.ConvertWorkflowConfigToVdjpipeConfig = function(workflowConfig) {

        var readConfig = {};
        if (workflowConfig['steps']) {
            readConfig = workflowConfig['steps'];
        }

        // Deep copy
        var newConfig = $.extend(true, [], readConfig);

        var tmpBarcodeVariables = [];

        for (var i = 0; i < readConfig.length; i++) {
            var option = readConfig[i];

            //////////////
            // DEMULTIPLEX
            //////////////
            if (option['custom_demultiplex']) {

                // Elements
                var elements = option['custom_demultiplex']['elements'];

                for (var j = 0; j < elements.length; j++) {

                    var barcodeType = elements[j]['custom_type'];

                    if (barcodeType) {
                        switch (barcodeType) {
                            case '3\'':
                                newConfig[i]['custom_demultiplex']['elements'][j]['cut_upper'] = {
                                    'before': 0,
                                };

                                break;

                            case '5\'':
                                newConfig[i]['custom_demultiplex']['elements'][j]['cut_lower'] = {
                                    'after': 0,
                                };

                                break;

                            case 'both':
                                // code
                                break;

                            default:
                                // code
                        }

                        delete newConfig[i]['custom_demultiplex']['elements'][j]['custom_type'];
                        delete newConfig[i]['custom_demultiplex']['elements'][j]['custom_trim'];
                        newConfig[i]['custom_demultiplex']['elements'][j]['start'] = {};

                        // Set histograms
                        if (newConfig[i]['custom_demultiplex']['elements'][j]['custom_histogram'] === true) {
                            var tmpBarcodeVariableName = newConfig[i]['custom_demultiplex']['elements'][j]['value_name'];
                            tmpBarcodeVariables.push(tmpBarcodeVariableName);

                            var histogram1 = {
                                'histogram': {
                                    'name': tmpBarcodeVariableName,
                                    'out_path': newConfig[i]['custom_demultiplex']['elements'][j]['value_name'] + '.csv',
                                },
                            };

                            var histogram2 = {
                                'histogram': {
                                    'name': newConfig[i]['custom_demultiplex']['elements'][j]['score_name'],
                                    'out_path': newConfig[i]['custom_demultiplex']['elements'][j]['score_name'] + '.csv',
                                },
                            };

                            newConfig.push(histogram1);
                            newConfig.push(histogram2);

                            delete newConfig[i]['custom_demultiplex']['elements'][j]['custom_histogram'];
                        }
                    }
                }

                // Combinations
                if (option['custom_demultiplex']['combinations'] && option['custom_demultiplex']['combinations'][0]['custom_histogram']) {

                    var combinationHistogram = {
                        'histogram': {
                            'name': option['custom_demultiplex']['combinations'][0]['value_name'],
                        },
                    };
                    newConfig.push(combinationHistogram);

                    delete newConfig[i]['custom_demultiplex']['combinations'][0]['custom_histogram'];
                }

                delete newConfig[i]['custom_demultiplex']['custom_location'];

                newConfig[i]['match'] = newConfig[i]['custom_demultiplex'];
                delete newConfig[i]['custom_demultiplex'];
            }

            ////////////////////
            // J PRIMER TRIMMING
            ////////////////////
            if (option['custom_j_primer_trimming']) {

                if (newConfig[i]['custom_j_primer_trimming']['elements'][0]['custom_trim']) {
                    newConfig[i]['custom_j_primer_trimming']['elements'][0]['cut_upper'] = {
                        'before': 0,
                    };
                }

                delete newConfig[i]['custom_j_primer_trimming']['elements'][0]['custom_trim'];

                newConfig[i]['match'] = newConfig[i]['custom_j_primer_trimming'];
                delete newConfig[i]['custom_j_primer_trimming'];
            }

            ////////////////////
            // V PRIMER TRIMMING
            ////////////////////
            if (option['custom_v_primer_trimming']) {

                if (newConfig[i]['custom_v_primer_trimming']['elements'][0]['custom_trim']) {
                    newConfig[i]['custom_v_primer_trimming']['elements'][0]['cut_lower'] = {
                        'after': 0,
                    };
                }

                delete newConfig[i]['custom_v_primer_trimming']['elements'][0]['custom_trim'];

                newConfig[i]['match'] = newConfig[i]['custom_v_primer_trimming'];
                delete newConfig[i]['custom_v_primer_trimming'];
            }
        }

        if (workflowConfig['steps']) {
            workflowConfig['steps'] = newConfig;
        }

        return workflowConfig;
    };

    App.Utilities.VdjpipeSerializer = VdjpipeSerializer;
    return VdjpipeSerializer;
});
