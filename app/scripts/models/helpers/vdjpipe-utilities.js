define(['app'], function(App) {

    'use strict';

    var VdjPipeUtilities = {};

    VdjPipeUtilities.GetWorkflowName = function(formData) {
        var name = formData['workflow-name'];

        return name;
    };

    VdjPipeUtilities.GetReadDirections = function(fileMetadata) {

        var readDirections = [];

        if (fileMetadata && fileMetadata.length > 0) {
            for (var i = 0; i < fileMetadata.length; i++) {
                ////console.log("values are: " + JSON.stringify(fileMetadata.at([i])));

                var value = fileMetadata.at([i]).get('value');

                // Hack to prevent .fasta files from being added
                if (value.name.split('.').pop() === '.fasta') {
                    continue;
                }

                var privateAttributes = value.privateAttributes;

                if (privateAttributes['forward-reads']) {
                    readDirections.push({
                        'forward_seq': value.name
                    });
                }

                if (privateAttributes['reverse-reads']) {
                    readDirections.push({
                        'reverse_seq': value.name
                    });
                }
            }
        }

        return readDirections;
    };

    VdjPipeUtilities.Serializer = function(parameters, key) {

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
                'average_quality_filter': parseFloat(parameters[key]),
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
                'character_filter': parameters[key],
            };
        };

        this.getCompositionStats = function() {
            return {
                //'composition_stats': {'out_prefix': parameters[key]}
                'composition_stats': {'out_prefix': 'pre-'},
            };
        };

        this.getCustomDemultiplex = function() {

            var reverse = parameters[key + '-reverse-complement'];
            var barcodeLocation = parameters[key + '-custom-location'];

            var elements = [];


            if (parameters[key + '-elements']) {
                for (var i = 0; i < parameters[key + '-elements'].length; i++) {
                    var element = {};
                    var elementCounter = parameters[key + '-elements'][i];
                    ////console.log("elementCounter is: " + JSON.stringify(elementCounter));

                    var barcodeType = parameters[key + '-' + elementCounter + '-element-barcode-type'];

                    var minScore = parameters[key + '-' + elementCounter + '-element-minimum-score'];
                    var required = parameters[key + '-' + elementCounter + '-element-required'];
                    var scoreName = parameters[key + '-' + elementCounter + '-element-score-name'];
                    var seqFile   = parameters[key + '-' + elementCounter + '-element-sequence-file'];
                    var valueName = parameters[key + '-' + elementCounter + '-element-value-name'];

                    if (barcodeType) {
                        element['custom_type'] = barcodeType;
                    }

                    if (minScore) {

                        // Convert to int
                        minScore = parseInt(minScore);

                        element['min_score'] = minScore;
                    }

                    if (required) {
                        element.required = required;
                    }

                    if (scoreName) {
                        element['score_name'] = scoreName;
                    }

                    if (seqFile) {
                        element['seq_file'] = seqFile;
                    }

                    if (valueName) {
                        element['value_name'] = valueName;
                    }

                    ////console.log("element finished: " + JSON.stringify(element));
                    elements.push(element);
                }

                // Barcodes & Trimming
                var barcodeCount = parameters[key + '-elements'].length;
                ////console.log("barcodeCount is: " + barcodeCount);
                ////console.log("barcodeCount type is: " + typeof(barcodeCount));
                if (barcodeCount === 1) {

                    var onlyBarcode = parameters[key + '-' + 1 + '-element-barcode-type'];

                    switch (onlyBarcode) {
                        case '3\'':
                            ////console.log("barcodeCount 1. 3' hit ok.");
                            elements[0]['end'] = {
                                'after': '',
                            };

                            if (parameters[key + '-' + 1 + '-element-trim-barcode']) {
                                ////console.log("barcodeCount 1. 3' trim ok.");
                                elements[0]['cut_upper'] = {
                                    'before': 0,
                                };

                                elements[0]['custom_trim'] = true;
                            }

                            break;

                        case '5\'':
                            ////console.log("barcodeCount 1. 5' hit ok.");

                            elements[0]['start'] = {};

                            if (parameters[key + '-' + 1 + '-element-trim-barcode']) {
                                ////console.log("barcodeCount 1. 5' trim ok.");
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
                    ////console.log("barcodeCount 2 ok. first is: " + firstBarcodeType);
                    var secondBarcodeType = parameters[key + '-' + 2 + '-element-barcode-type'];
                    ////console.log("barcodeCount 2 ok. second is: " + secondBarcodeType);
                    ////console.log("barcodeCount 2 ok. third is: " + parameters[key + '-' + 2 + '-element-barcode-type']);

                    switch (firstBarcodeType) {
                        case '3\'':
                            ////console.log("barcodeCount 2. 3' hit ok.");
                            elements[0]['end'] = {
                                'after': '',
                            };

                            if (parameters[key + '-' + 1 + '-element-trim-barcode']) {
                                ////console.log("barcodeCount 2. 3' trim ok.");
                                elements[0]['cut_upper'] = {
                                    'before': 0,
                                };

                                elements[0]['custom_trim'] = true;
                            }
                            break;

                        case '5\'':
                            ////console.log("barcodeCount 2. 5' hit ok.");

                            elements[0]['start'] = {};

                            if (parameters[key + '-' + 1 + '-element-trim-barcode']) {
                                ////console.log("barcodeCount 2. 5' trim ok.");
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

            //////console.log("matchObject is: " + JSON.stringify(matchObject));

            return matchObject;
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
            var tmpFindShared = {
                'find_shared': {},
            };

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
                tmpFindShared['find_shared']['out_unique'] = '.fasta';
            }

            return tmpFindShared;
        };

        this.getHistogram = function() {
            return {
                'histogram': {
                    'name': parameters[key + '-name'],
                    //'out_path': 'TODO',
                },
            };
        };

        this.getHomopolymerFilter = function() {
            return {
                'homopolymer_filter': parseInt(parameters[key]),
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

        this.getMatch = function() {

            var reverse = parameters[key + '-reverse-complement'];
            var trimmed = parameters[key + '-trimmed'];

            var elements = [];

            if (parameters[key + '-elements']) {
                for (var i = 0; i < parameters[key + '-elements'].length; i++) {
                    var elementCounter = parameters[key + '-elements'][i];
                    ////console.log("elementCounter is: " + JSON.stringify(elementCounter));

                    var startPosition = parameters[key + '-' + elementCounter + '-element-start-position'];
                    var startPositionLocation = parameters[key + '-' + elementCounter + '-element-start-position-location'];
                    var startPositionLocationSequence = parameters[key + '-' + elementCounter + '-element-start-position-location-sequence'];

                    var endPosition = parameters[key + '-' + elementCounter + '-element-end-position'];
                    var endPositionLocation = parameters[key + '-' + elementCounter + '-element-end-position-location'];
                    var endPositionLocationSequence = parameters[key + '-' + elementCounter + '-element-end-position-location-sequence'];

                    var sequenceFile = parameters[key + '-' + elementCounter + '-element-sequence-file'];
                    var csvSequencesFile = parameters[key + '-' + elementCounter + '-element-csv-path'];
                    var csvSequencesColumn = parameters[key + '-' + elementCounter + '-element-csv-column-name'];
                    var required = parameters[key + '-' + elementCounter + '-element-required'];
                    var minScore = parameters[key + '-' + elementCounter + '-element-minimum-score'];
                    var allowGaps = parameters[key + '-' + elementCounter + '-element-allow-gaps'];
                    var minMatchLength = parameters[key + '-' + elementCounter + '-element-minimum-match-length'];
                    var valueName = parameters[key + '-' + elementCounter + '-element-value-name'];
                    var scoreName = parameters[key + '-' + elementCounter + '-element-score-name'];
                    var identityName = parameters[key + '-' + elementCounter + '-element-identity-name'];
                    var cutLowerLocation = parameters[key + '-' + elementCounter + '-element-cut-lower-location'];
                    var cutLowerLocationSequence = parameters[key + '-' + elementCounter + '-element-cut-lower-location-sequence'];
                    var cutUpperLocation = parameters[key + '-' + elementCounter + '-element-cut-upper-location'];
                    var cutUpperLocationSequence = parameters[key + '-' + elementCounter + '-element-cut-upper-location-sequence'];

                    var element = {};

                    if (startPosition) {

                        // Convert to int
                        startPosition = parseInt(startPosition);

                        element.start = {};
                        element.start.pos = startPosition;

                        if (startPositionLocation && startPositionLocationSequence) {
                            if (startPositionLocation === 'before') {
                                element.start.before = startPositionLocationSequence;
                            }
                            else if (startPositionLocation === 'after') {
                                element.start.after = startPositionLocationSequence;
                            }
                        }
                    }

                    if (endPosition) {

                        // Convert to int
                        endPosition = parseInt(endPosition);

                        element.end = {};
                        element.end.pos = endPosition;

                        if (endPositionLocation && endPositionLocationSequence) {
                            if (endPositionLocation === 'before') {
                                element.end.before = endPositionLocationSequence;
                            }
                            else if (endPositionLocation === 'after') {
                                element.end.after = endPositionLocationSequence;
                            }
                        }
                    }

                    if (sequenceFile) {
                        element.seq_file = sequenceFile;
                    }

                    if (csvSequencesColumn || csvSequencesFile) {

                        element.csv_file = {};

                        if (csvSequencesColumn) {
                            element.csv_file.sequences_column = csvSequencesColumn;
                        }

                        if (csvSequencesFile) {
                            element.csv_file.path = csvSequencesFile;
                        }
                    }

                    if (required) {
                        element.required = required;
                    }

                    if (minScore) {

                        // Convert to int
                        minScore = parseInt(minScore);

                        element.min_score = minScore;
                    }

                    if (allowGaps) {
                        element.allow_gaps = allowGaps;
                    }

                    if (minMatchLength) {

                        // Convert to int
                        minMatchLength = parseInt(minMatchLength);

                        element.min_match_length = minMatchLength;
                    }

                    if (valueName) {
                        element.value_name = valueName;
                    }

                    if (scoreName) {
                        element.score_name = scoreName;
                    }

                    if (identityName) {

                        element.identity_name = identityName;
                    }

                    if (cutLowerLocation && cutLowerLocationSequence) {

                        // Convert to int
                        cutLowerLocationSequence = parseInt(cutLowerLocationSequence);

                        element.cut_lower = {};

                        if (cutLowerLocation === 'before') {
                            element.cut_lower.before = cutLowerLocationSequence;
                        }
                        else if (cutLowerLocation === 'after') {
                            element.cut_lower.after = cutLowerLocationSequence;
                        }
                    }

                    if (cutUpperLocation && cutUpperLocationSequence) {

                        // Convert to int
                        cutUpperLocationSequence = parseInt(cutUpperLocationSequence);

                        element.cut_upper = {};

                        if (cutUpperLocation === 'before') {
                            element.cut_upper.before = cutUpperLocationSequence;
                        }
                        else if (cutUpperLocation === 'after') {
                            element.cut_upper.after = cutUpperLocationSequence;
                        }
                    }

                    ////console.log("element finished: " + JSON.stringify(element));
                    elements.push(element);
                }
            }

            var combinationObjects = [];

            if (parameters[key + '-combination-objects']) {

                for (var combinationCounter = 0; combinationCounter < parameters[key + '-combination-objects'].length; combinationCounter++) {

                    var combinationObject = {};

                    var objectCounter = parameters[key + '-combination-objects'][combinationCounter];
                    ////console.log("objectCounter is: " + JSON.stringify(objectCounter));

                    var objectFile = parameters[key + '-' + objectCounter + '-combination-object-file'];
                    var objectValueName = parameters[key + '-' + objectCounter + '-combination-object-value-name'];
                    var valuesColumn = parameters[key + '-' + objectCounter + '-combination-object-values-column'];
                    var namesColumn = parameters[key + '-' + objectCounter + '-combination-object-names-column'];

                    /*
                    //console.log("obj file is: " + objectFile);
                    //console.log("obj value is: " + valueName);
                    //console.log("obj values2 is: " + valuesColumn);
                    //console.log("obj names is: " + namesColumn);
                    */

                    if (objectFile && valuesColumn && namesColumn) {
                        combinationObject.path = objectFile;
                        combinationObject.values_column = valuesColumn;
                        combinationObject.names_column = namesColumn;

                        if (objectValueName) {
                            combinationObject.value_name = objectValueName;
                        }

                        combinationObjects.push(combinationObject);
                    }
                }
            }

            var matchObject = {
                'match': {
                    'reverse': reverse,
                    'trimmed': trimmed,
                },
            };

            if (elements) {
                matchObject.match.elements = elements;
            }

            if (combinationObjects.length > 0) {
                matchObject.match.combinations = combinationObjects;
            }

            //console.log("combinationObjects are: " + JSON.stringify(combinationObjects));
            ////console.log("matchObject is: " + JSON.stringify(matchObject));

            return matchObject;
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
                'min_quality_filter': parseInt(parameters[key]),
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
                //'quality_stats': {'out_prefix': parameters[key]}
                'quality_stats': {'out_prefix': 'pre-'},
            };
        };

        this.getWriteSequence = function() {
            return {
                'write_sequence': {
                    'out_path': parameters[key + '-output-path'],
                    'unset_value': parameters[key + '-unset-value'],
                    'trimmed': parameters[key + '-trimmed'],
                    'reverse_complemented': parameters[key + '-reverse-complemented'],
                    'skip_empty': parameters[key + '-skip-empty'],
                },
            };
        };

        this.getWriteValue = function() {

            var writeValuesNames = parameters[key + '-names'];
            writeValuesNames = writeValuesNames.split(',');

            return {
                'write_value': {
                    'names': writeValuesNames,
                    'out_path': parameters[key + '-out-path'],
                    'unset_value': parameters[key + '-unset-value'],
                },
            };
        };
    };

    VdjPipeUtilities.SerializeWorkflowConfig = function(parameters, fileMetadatas) {

        ////console.log("workflowSerialize start");

        var outputConfig = {
            'base_path_input': '',
            'base_path_output': '',
            'csv_file_delimiter': '\\t',
        };

        var paramOutput = [];

        ////console.log("workflow config - all parameters are: " + JSON.stringify(parameters));

        for (var key in parameters) {

            if (parameters.hasOwnProperty(key)) {
                if (key !== 'formtype' && key !== 'job-name') {
                    var keyCounterIndex = key.indexOf('-') + 1;
                    //var keyCounter = key.slice(0, keyCounterIndex);
                    var parameterName = key.slice(keyCounterIndex);

                    var serializer = new VdjPipeUtilities.Serializer(parameters, key);

                    ////console.log("workflow config - parameterName is: " + parameterName);

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
                                serializer.getCustomDemultiplex()
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

                        case 'match':
                            paramOutput.push(
                                serializer.getMatch()
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
                                serializer.getWriteSequence()
                            );

                            break;

                        case 'write_value':
                            paramOutput.push(
                                serializer.getWriteValue()
                            );

                            break;

                        default:
                            break;
                    }
                }
            }
        }

        ////console.log("workflow config - paramOutput is: " + JSON.stringify(paramOutput));

        // Set file read directions
        var readDirections = VdjPipeUtilities.GetReadDirections(fileMetadatas);
        outputConfig.input = readDirections;

        ////console.log("workflow config - readDirections is: " + JSON.stringify(readDirections));
        ////console.log("workflow config - outputConfig is: " + JSON.stringify(outputConfig));

        // Choose read direction and add params
        // Just as with Highlander, there can only be one
        if (parameters['single-reads']) {
            ////console.log("workflow config - parameter single-read hit");
            outputConfig['single_read_pipe'] = paramOutput;
        }
        else if (parameters['paired-reads']) {
            ////console.log("workflow config - parameter paired-reads hit");
            outputConfig['paired_read_pipe'] = paramOutput;
        }

        ////console.log("workflow config - final outputConfig is: " + JSON.stringify(outputConfig));

        //////console.log("paramOutput is: " + JSON.stringify(paramOutput));
        //////console.log("inputOutput is: " + JSON.stringify(inputOutput));
        //////console.log('outputConfig is: ' + JSON.stringify(outputConfig));

        return outputConfig;
    };

    // Convert workflowConfig to vdjpipeConfig
    VdjPipeUtilities.ConvertWorkflowConfigToVdjpipeConfig = function(workflowConfig) {

        var readConfig = {};
        if (workflowConfig['single_read_pipe']) {
            readConfig = workflowConfig['single_read_pipe'];
        }
        else if (workflowConfig['paired_read_pipe']) {
            readConfig = workflowConfig['paired_read_pipe'];
        }

        // Deep copy
        var newConfig = $.extend(true, [], readConfig);

        for (var i = 0; i < readConfig.length; i++) {
            var option = readConfig[i];

            //var parameterName = Object.keys(option[0]);

            if (option['custom_demultiplex']) {
                var elements = option['custom_demultiplex']['elements'];

                for (var j = 0; j < elements.length; j++) {

                    var barcodeLocation = elements[j]['custom_location'];

                    if (barcodeLocation) {

                        switch (barcodeLocation) {
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

                        delete newConfig[i]['custom_demultiplex']['elements'][j]['custom_location'];
                        newConfig[i]['custom_demultiplex']['elements'][j]['start'] = {};
                    }

                }

                newConfig[i]['match'] = newConfig[i]['custom_demultiplex'];
                delete newConfig[i]['custom_demultiplex'];
            }
        }

        if (workflowConfig['single_read_pipe']) {
            workflowConfig['single_read_pipe'] = newConfig;
        }
        else if (workflowConfig['paired_read_pipe']) {
            workflowConfig['paired_read_pipe'] = newConfig;
        }

        return workflowConfig;
    };

    App.Models.Helpers.VdjPipeUtilities = VdjPipeUtilities;
    return VdjPipeUtilities;
});
