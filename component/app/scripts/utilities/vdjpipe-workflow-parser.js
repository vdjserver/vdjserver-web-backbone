define(['app'], function(App) {

    'use strict';

    var demultiplexHistograms = [];
    var combinationValue = '';
    var sharedVariables = [];

    var VdjpipeWorkflowParser = {};

    var resetSharedValues = function() {
        // TODO: pass/return these via tuples in ES6
        demultiplexHistograms = [];
        combinationValue = '';
        sharedVariables = [];
    };

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
            'summary_output_path': 'summary.txt',
            'input': inputFileReadDirections,
            'steps': paramOutput,
        };

        //if (readType['paired_reads']) {
        //    _.extend(outputConfig, readType);
        //}

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

        resetSharedValues();

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

                        case 'match':
                            paramOutput.push(
                                serializer.getCustomDemultiplex()
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

        for (var i = 0; i < demultiplexHistograms.length; i++) {

            paramOutput.push(demultiplexHistograms[i]);
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

            // Combination custom options

            var elements = [];

            var combinations = this._setupCustomDemultiplexCombinationStanza();

            if (parameters[key + '-elements']) {
                for (var i = 0; i < parameters[key + '-elements'].length; i++) {

                    var element = {};
                    var elementCounter = parameters[key + '-elements'][i];

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

                    var length = parameters[key + '-' + elementCounter + '-element-length'];
                    if (length) {
                        element.length = length;
                    }

                    var seqFile   = parameters[key + '-' + elementCounter + '-element-sequence-file'];
                    if (seqFile) {
                        element['seq_file'] = seqFile;
                    }

                    var scoreName = parameters[key + '-' + elementCounter + '-element-score-name'];
                    if (scoreName) {
                        element['score_name'] = scoreName;
                    }

                    var valueName = parameters[key + '-' + elementCounter + '-element-value-name'];
                    if (valueName) {
                        element['value_name'] = valueName;
                        sharedVariables.push(valueName);
                    }

                    var customHistogram = parameters[key + '-' + elementCounter + '-element-custom-histogram'];
                    if (customHistogram) {
                        demultiplexHistograms.push(
                            {
                                'histogram': {
                                    'name': valueName,
                                    'out_path': valueName + '.csv',
                                },
                            }
                        );

                        demultiplexHistograms.push(
                            {
                                'histogram': {
                                    'name': scoreName,
                                    'out_path': scoreName + '.csv',
                                },
                            }
                        );
                    }

                    var trim = parameters[key + '-' + elementCounter + '-element-custom-trim'];
                    var barcodeType = parameters[key + '-' + elementCounter + '-element-custom-type'];

                    if (barcodeType) {

                        switch (barcodeType) {
                            case '3\'':
                                if (i === 0) {
                                    element['end'] = this.getDemultiplex3PrimeBarcode();
                                }
                                else {
                                    var previousBarcode = parameters[key + '-' + (elementCounter - 1) + '-element-custom-type'];
                                    if (previousBarcode === '3\'') {
                                        var previousValue = parameters[key + '-' + (elementCounter - 1) + '-element-value-name'];
                                        element['end'] = this.getDemultiplex3PrimeBarcodeAfter3PrimeBarcode(previousValue);
                                    }
                                    else if (previousBarcode === '5\'') {
                                        element['end'] = this.getDemultiplex3PrimeBarcodeAfter5PrimeBarcode();
                                    }
                                }

                                if (trim) {
                                    element = _.extend(
                                        {},
                                        element,
                                        this.getDemultiplex3PrimeBarcodeCustomTrim()
                                    );
                                }

                                break;

                            case '5\'':

                                element['start'] = this.getDemultiplex5PrimeBarcode();

                                if (trim) {
                                    element = _.extend(
                                        {},
                                        element,
                                        this.getDemultiplex5PrimeBarcodeCustomTrim()
                                    );
                                }

                                break;

                            default:
                                // code
                                break;
                        }
                    }

                    var isMultibarcode = parameters[key + '-' + elementCounter + '-element-multibarcode'];
                    if (isMultibarcode) {
                        element['csv_file'] = {
                            path: parameters[key + '-combination-csv-file'],
                        };

                        if (parseInt(elementCounter) === 1) {
                            element['csv_file']['sequences_column'] = parameters[key + '-combination-first-barcode-column'];
                        }
                        else {
                            element['csv_file']['sequences_column'] = parameters[key + '-combination-second-barcode-column'];
                        }
                    }

                    // Save element
                    elements.push(element);
                }
            }

            var configuredParameter = {
                'match': {
                    'reverse': parameters[key + '-reverse-complement'],
                    'elements': elements,
                },
            };

            if (combinations) {
                configuredParameter['match'].combinations = combinations;
            }

            return that.wrapIfPairedReads(parameters, key, configuredParameter);
        };

        /*
        this._detectSecondBarcodeColumn = function() {
            var columnA = parseInt(parameters[key + '-combination-names-column']);
            var columnB = parameters[key + '-combination-first-barcode-column'];
            var columnC = false;

            var columnSet = new Set();
            columnSet.add(columnA);
            columnSet.add(columnB);

            for (var i = 0; i < 3; i++) {
                if (columnSet.has(i) === false) {
                    columnC = i;
                    break;
                }
            };

            return columnC;
        };
        */

        this._setupCustomDemultiplexCombinationStanza = function() {
            var combinations = false;

            if (parameters[key + '-combination-value-name']) {

                combinationValue = parameters[key + '-combination-value-name'];

                var valuesColumn = [];

                for (var i = 0; i < parameters[key + '-elements'].length; i++) {
                    var elementCounter = parameters[key + '-elements'][i];
                    var valueName = parameters[key + '-' + elementCounter + '-element-value-name'];
                    var columnNumber = false;

                    // TODO: refactor names like '-combination-first-barcode-column' to use ints instead of spelled numbers
                    if (parseInt(elementCounter) === 1) {
                        columnNumber = parameters[key + '-combination-first-barcode-column'];
                    }
                    else {
                        columnNumber = parameters[key + '-combination-second-barcode-column'];
                    }

                    var valueHash = {};
                    valueHash[valueName] = columnNumber;
                    valuesColumn.push(valueHash);
                }

                combinations = [
                    {
                        'csv_file': {
                            'path': parameters[key + '-combination-csv-file'],
                            'values_column': valuesColumn,
                            'skip_header': parameters[key + '-combination-skip-header'],
                            // -1 is a hack for now. vdj_pipe starts counting on 0, but humans tend to like starting on 1 for some reason.
                            'names_column': parseInt(parameters[key + '-combination-names-column']),
                        },
                        'value_name': parameters[key + '-combination-value-name'],
                    },
                ];

                if (parameters[key + '-combination-histogram']) {

                    demultiplexHistograms.push(
                        {
                            'histogram': {
                                'name': parameters[key + '-combination-value-name'],
                                'out_path': parameters[key + '-combination-value-name'] + '.csv',
                            },
                        }
                    );
                }
            }

            return combinations;
        };

        this._setupCustomPrimerTrimmingDictionary = function(parameters) {
            // NOTE 13/May/2015: don't add "reverse": true to primer trimming.
            // It will crash vdj_pipe.
            var dictionary = {
                'require_best': false,
                'required': true,
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

            var fastaFile = parameters[key + '-primer-file'];
            if (fastaFile) {
                dictionary['seq_file'] = fastaFile;
            }

            var length = parameters[key + '-element-length'];
            if (length) {
                dictionary['length'] = length;
            }

            return dictionary;
        };

        this.getCustomJPrimerTrimming = function() {
            // General primer config
            var dictionary = this._setupCustomPrimerTrimmingDictionary(parameters);

            // J Primer specific config
            var trimPrimer = parameters[key + '-trim-primer'];
            if (trimPrimer) {
                dictionary['cut_upper'] = {
                    'before': 0,
                };
            }

            dictionary['end'] = {
                'after': '',
            };

            // Done
            var configuredParameter = {
                'match': {
                    'elements': [dictionary],
                },
            };

            return that.wrapIfPairedReads(parameters, key, configuredParameter);
        };

        this.getCustomVPrimerTrimming = function() {
            // General primer config
            var dictionary = this._setupCustomPrimerTrimmingDictionary(parameters);

            // V Primer specific config
            var trimPrimer = parameters[key + '-trim-primer'];
            if (trimPrimer) {
                dictionary['cut_lower'] = {
                    'after': 0,
                };
            }

            dictionary['start'] = {
                'before': '',
            };

            // Done
            var configuredParameter = {
                'match': {
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

            if (combinationValue.length > 0) {
                findSharedVariables = '{' + combinationValue + '}';
            }
            else {
                for (var i = 0; i < sharedVariables.length; i++) {
                    findSharedVariables += '{' + sharedVariables[i] + '}';

                    if (i < sharedVariables.length - 1) {
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
                                        + '-unique'
                                        + '.fasta'
                                        //+ parameters[key + '-out-group-unique']
                                        ,
                    'out_group_duplicates': findSharedVariables
                                        + '-unique'
                                        + '.duplicates.tsv'
                                        ,
                    'out_summary': 'find-unique-summary.txt',
                };
            }
            else {
                configuredParameter.find_shared = {
                    'out_group_unique': 'find-' + parameters[key + '-out-prefix'] + '.fasta',
                    'out_duplicates': 'find-unique.duplicates.tsv',
                };
            }

            return that.wrapIfPairedReads(parameters, key, configuredParameter);
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

            return configuredParameter;
            //return that.wrapIfPairedReads(parameters, key, configuredParameter);
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

            // Default value
            var writeSequenceVariables = '';

            if (parameters['paired_reads']) {
                writeSequenceVariables = 'merged';
            }

            if (combinationValue.length > 0) {
                writeSequenceVariables = '{' + combinationValue + '}';
            }
            else {
                for (var i = 0; i < sharedVariables.length; i++) {
                    writeSequenceVariables += '{' + sharedVariables[i] + '}';

                    if (i < sharedVariables.length - 1) {
                        writeSequenceVariables += '-';
                    }
                }
            }

            var configuredParameter = {
                'write_sequence': {},
            };

            if (writeSequenceVariables.length > 0) {
                configuredParameter.write_sequence = {
                    'out_path': parameters[key + '-out-prefix']
                                + writeSequenceVariables
                                + '.fastq'
                };
            }
            else {
                configuredParameter.write_sequence = {
                    'out_path': parameters[key + '-out-prefix']
                                + '.fastq'
                };
            }

/*
            //TODO: fix/update this section
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
*/

            return that.wrapIfPairedReads(parameters, key, configuredParameter);
        };

        this.getWriteValue = function(paramOutput) {

            //TODO: fix/update this section

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

            //if (parameters[key + '-paired-read-direction']) {
            if (parameters['paired_reads']) {
                return {
                    'apply': {
                        'to': 'merged',
                        'step': configuredParameter,
                    },
                };
            }

            return configuredParameter;
        };

        this.getDemultiplex3PrimeBarcode = function() {
            return {
                'after': '',
            };
        };

        this.getDemultiplex5PrimeBarcode = function() {
            return {
                'before':''
            };
        };

        this.getDemultiplex3PrimeBarcodeAfter3PrimeBarcode = function(previousValue) {
            return {
                //TODO: refactor
                'before': previousValue,
                'pos': 0,
            };
        };

        this.getDemultiplex3PrimeBarcodeAfter5PrimeBarcode = function() {
            return {
                'after': '',
            };
        };

        this.getDemultiplex3PrimeBarcodeCustomTrim = function() {

            var response = {
                'cut_upper': {
                    'before': 0,
                },
            };

            return response;
        };

        this.getDemultiplex5PrimeBarcodeCustomTrim = function() {

            var response = {
                'cut_lower': {
                    'after': 0,
                },
            };

            return response;
        };

        //TODO: remove this section
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

        //TODO: remove this section
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

                    if (model.getReadDirection() === 'F') {
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
