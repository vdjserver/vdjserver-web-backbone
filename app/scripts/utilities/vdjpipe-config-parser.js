define(['app'], function(App) {

    'use strict';

    var VdjpipeConfigParser = {};

    // Public Methods
    VdjpipeConfigParser.ConvertWorkflowConfigToVdjpipeConfig = function(workflowConfig) {

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

                    if (j === 0) {

                        switch (barcodeType) {
                            case '3\'':
                                newConfig[i]['custom_demultiplex']['elements'][j]['end'] = {
                                    'after': 0,
                                };

                                if (elements[j]['custom_trim']) {

                                    newConfig[i]['custom_demultiplex']['elements'][j] = _.extend(
                                        {},
                                        newConfig[i]['custom_demultiplex']['elements'][j],
                                        VdjpipeConfigParser._set3PrimeBarcodeCustomTrim()
                                    );
                                }

                                break;

                            case '5\'':

                                newConfig[i]['custom_demultiplex']['elements'][j]['start'] = {};

                                if (elements[j]['custom_trim']) {
                                    newConfig[i]['custom_demultiplex']['elements'][j] = _.extend(
                                        {},
                                        newConfig[i]['custom_demultiplex']['elements'][j],
                                        VdjpipeConfigParser._set5PrimeBarcodeCustomTrim()
                                    );
                                }

                                break;

                            default:
                                break;
                        }

                    }
                    else if (j === 1) {

                        var previousBarcodeType = elements[j-1]['custom_type'];

                        switch (barcodeType) {
                            case '3\'':

                                // Barcode type settings will depend on the first barcode
                                if (previousBarcodeType === '3\'') {
                                    newConfig[i]['custom_demultiplex']['elements'][j]['end'] = {
                                        'before': 'MID1',
                                        'pos': -2,
                                    };
                                }
                                else if (previousBarcodeType === '5\'') {
                                    elements[j]['end'] = {
                                        'after': '',
                                    };
                                }

                                // Set barcode trim
                                if (elements[j]['custom_trim']) {

                                    newConfig[i]['custom_demultiplex']['elements'][j] = _.extend(
                                        {},
                                        newConfig[i]['custom_demultiplex']['elements'][j],
                                        VdjpipeConfigParser._set3PrimeBarcodeCustomTrim()
                                    );
                                }

                                break;

                            case '5\'':
                                // For 5', the barcode type setting does NOT depend on the first barcode
                                newConfig[i]['custom_demultiplex']['elements'][j]['start'] = {};

                                if (elements[j]['custom_trim']) {
                                    newConfig[i]['custom_demultiplex']['elements'][j] = _.extend(
                                        {},
                                        newConfig[i]['custom_demultiplex']['elements'][j],
                                        VdjpipeConfigParser._set5PrimeBarcodeCustomTrim()
                                    );
                                }

                                break;

                            default:
                                // code
                        }

                    }

                    delete newConfig[i]['custom_demultiplex']['elements'][j]['custom_type'];
                    delete newConfig[i]['custom_demultiplex']['elements'][j]['custom_trim'];

                    // Set histograms
                    if (newConfig[i]['custom_demultiplex']['elements'][j]['custom_histogram'] === true) {

                        var histogramData = VdjpipeConfigParser._parseDemultiplexBarcodeHistograms(newConfig[i]['custom_demultiplex']['elements'][j]);

                        tmpBarcodeVariables.push(histogramData.barcodeVariable);
                        newConfig.push(histogramData.histogram1);
                        newConfig.push(histogramData.histogram2);

                        delete newConfig[i]['custom_demultiplex']['elements'][j]['custom_histogram'];
                    }
                }

                // Combinations
                if (option['custom_demultiplex']['combinations'] && option['custom_demultiplex']['combinations'][0]['custom_histogram']) {

                    var combinationHistogram = VdjpipeConfigParser._parseDemultiplexCombinationHistograms(option['custom_demultiplex']['combinations']);
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

                newConfig[i]['match'] = VdjpipeConfigParser._parsePrimerTrimming(newConfig[i]['custom_j_primer_trimming']);
                delete newConfig[i]['custom_j_primer_trimming'];
            }

            ////////////////////
            // V PRIMER TRIMMING
            ////////////////////
            if (option['custom_v_primer_trimming']) {

                newConfig[i]['match'] = VdjpipeConfigParser._parsePrimerTrimming(newConfig[i]['custom_v_primer_trimming']);
                delete newConfig[i]['custom_v_primer_trimming'];
            }
        }

        if (workflowConfig['steps']) {
            workflowConfig['steps'] = newConfig;
        }

        return workflowConfig;
    };

    // Private Methods

    VdjpipeConfigParser._set3PrimeBarcodeCustomTrim = function() {

        var response = {
            'cut_upper': {
                'before': 0,
            },
        };

        return response;
    };

    VdjpipeConfigParser._set5PrimeBarcodeCustomTrim = function() {

        var response = {
            'cut_lower': {
                'after': 0,
            },
        };

        return response;
    };

    VdjpipeConfigParser._parseDemultiplexBarcodeHistograms = function(barcodeParameter) {

        var response = {};

        var barcodeVariable = barcodeParameter['value_name'];

        var histogram1 = {
            'histogram': {
                'name': barcodeVariable,
                'out_path': barcodeVariable + '.csv',
            },
        };

        var histogram2 = {
            'histogram': {
                'name': barcodeParameter['score_name'],
                'out_path': barcodeParameter['score_name'] + '.csv',
            },
        };

        response.barcodeVariable = barcodeVariable;
        response.histogram1 = histogram1;
        response.histogram2 = histogram2;

        return response;
    };

    VdjpipeConfigParser._parseDemultiplexCombinationHistograms = function(combinationParameter) {

        var combinationHistogram = {
            'histogram': {
                'name': combinationParameter[0]['value_name'],
            },
        };

        return combinationHistogram;
    };

    VdjpipeConfigParser._parsePrimerTrimming = function(primerParameter) {
        if (primerParameter['elements'][0]['custom_trim']) {
            primerParameter['elements'][0]['cut_lower'] = {
                'after': 0,
            };
        }

        delete primerParameter['elements'][0]['custom_trim'];

        return primerParameter;
    };

    App.Utilities.Vdjpipe.ConfigParser = VdjpipeConfigParser;
    return VdjpipeConfigParser;
});
