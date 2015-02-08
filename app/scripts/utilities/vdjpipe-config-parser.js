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

            var isPaired = false;

            if (option['apply']) {
                option = option['apply']['step'];
                isPaired = true;
            }

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
                                option['custom_demultiplex']['elements'][j]['end'] = VdjpipeConfigParser._get3PrimeBarcode();

                                if (elements[j]['custom_trim']) {

                                    option['custom_demultiplex']['elements'][j] = _.extend(
                                        {},
                                        option['custom_demultiplex']['elements'][j],
                                        VdjpipeConfigParser._get3PrimeBarcodeCustomTrim()
                                    );
                                }

                                break;

                            case '5\'':

                                option['custom_demultiplex']['elements'][j]['start'] = VdjpipeConfigParser._get5PrimeBarcode();

                                if (elements[j]['custom_trim']) {
                                    option['custom_demultiplex']['elements'][j] = _.extend(
                                        {},
                                        option['custom_demultiplex']['elements'][j],
                                        VdjpipeConfigParser._get5PrimeBarcodeCustomTrim()
                                    );
                                }

                                break;

                            default:
                                break;
                        }

                    }
                    else if (j === 1) {

                        var previousBarcodeType = elements[j - 1]['custom_type'];

                        switch (barcodeType) {
                            case '3\'':

                                // Barcode type settings will depend on the first barcode
                                if (previousBarcodeType === '3\'') {
                                    option['custom_demultiplex']['elements'][j]['end'] = VdjpipeConfigParser._get3PrimeBarcodeAfter3PrimeBarcode();
                                }
                                else if (previousBarcodeType === '5\'') {
                                    option['custom_demultiplex']['elements'][j]['end'] = VdjpipeConfigParser._get3PrimeBarcodeAfter5PrimeBarcode();
                                }

                                // Set barcode trim
                                if (elements[j]['custom_trim']) {

                                    option['custom_demultiplex']['elements'][j] = _.extend(
                                        {},
                                        option['custom_demultiplex']['elements'][j],
                                        VdjpipeConfigParser._get3PrimeBarcodeCustomTrim()
                                    );
                                }

                                break;

                            case '5\'':
                                // For 5', the barcode type setting does NOT depend on the first barcode
                                option['custom_demultiplex']['elements'][j]['start'] = VdjpipeConfigParser._get5PrimeBarcode();

                                if (elements[j]['custom_trim']) {
                                    option['custom_demultiplex']['elements'][j] = _.extend(
                                        {},
                                        option['custom_demultiplex']['elements'][j],
                                        VdjpipeConfigParser._get5PrimeBarcodeCustomTrim()
                                    );
                                }

                                break;

                            default:
                                // code
                        }

                    }

                    delete option['custom_demultiplex']['elements'][j]['custom_type'];
                    delete option['custom_demultiplex']['elements'][j]['custom_trim'];

                    // Set histograms
                    if (option['custom_demultiplex']['elements'][j]['custom_histogram'] === true) {

                        var histogramData = VdjpipeConfigParser._parseDemultiplexBarcodeHistograms(option['custom_demultiplex']['elements'][j]);

                        tmpBarcodeVariables.push(histogramData.barcodeVariable);
                        newConfig.push(histogramData.histogram1);
                        newConfig.push(histogramData.histogram2);

                        delete option['custom_demultiplex']['elements'][j]['custom_histogram'];
                    }
                }

                // Combinations
                if (option['custom_demultiplex']['combinations'] && option['custom_demultiplex']['combinations'][0]['custom_histogram']) {

                    var combinationHistogram = VdjpipeConfigParser._parseDemultiplexCombinationHistograms(
                        option['custom_demultiplex']['combinations']
                    );

                    newConfig.push(combinationHistogram);

                    option['custom_demultiplex']['combinations'][0]['custom_histogram'];
                }

                delete option['custom_demultiplex']['custom_location'];

                // Insert converted config and remove workflow config
                if (isPaired) {
                    newConfig[i]['apply']['step']['match'] = option['custom_demultiplex'];
                    delete newConfig[i]['apply']['step']['custom_demultiplex'];
                }
                else {
                    newConfig[i]['match'] = newConfig[i]['custom_demultiplex'];
                    delete newConfig[i]['custom_demultiplex'];
                }

            }

            ////////////////////
            // J PRIMER TRIMMING
            ////////////////////
            if (option['custom_j_primer_trimming']) {

                // Insert converted config and remove workflow config
                if (isPaired) {
                    newConfig[i]['apply']['step']['match'] = VdjpipeConfigParser._parsePrimerTrimming(newConfig[i]['custom_j_primer_trimming']);
                    delete newConfig[i]['apply']['step']['custom_j_primer_trimming'];
                }
                else {
                    newConfig[i]['match'] = VdjpipeConfigParser._parsePrimerTrimming(newConfig[i]['custom_j_primer_trimming']);
                    delete newConfig[i]['custom_j_primer_trimming'];
                }
            }

            ////////////////////
            // V PRIMER TRIMMING
            ////////////////////
            if (option['custom_v_primer_trimming']) {

                // Insert converted config and remove workflow config
                if (isPaired) {
                    newConfig[i]['apply']['step']['match'] = VdjpipeConfigParser._parsePrimerTrimming(newConfig[i]['custom_v_primer_trimming']);
                    delete newConfig[i]['apply']['step']['custom_v_primer_trimming'];
                }
                else {
                    newConfig[i]['match'] = VdjpipeConfigParser._parsePrimerTrimming(newConfig[i]['custom_v_primer_trimming']);
                    delete newConfig[i]['custom_v_primer_trimming'];
                }
            }
        }

        if (workflowConfig['steps']) {
            workflowConfig['steps'] = newConfig;
        }

        return workflowConfig;
    };

    // Private Methods
    VdjpipeConfigParser._get3PrimeBarcode = function() {
        return {
            'after': 0,
        };
    };

    VdjpipeConfigParser._get5PrimeBarcode = function() {
        return {};
    };

    VdjpipeConfigParser._get3PrimeBarcodeAfter3PrimeBarcode = function() {
        return {
            'before': 'MID1',
            'pos': -2,
        };
    };

    VdjpipeConfigParser._get3PrimeBarcodeAfter5PrimeBarcode = function() {
        return {
            'after': '',
        };
    };

    VdjpipeConfigParser._get3PrimeBarcodeCustomTrim = function() {

        var response = {
            'cut_upper': {
                'before': 0,
            },
        };

        return response;
    };

    VdjpipeConfigParser._get5PrimeBarcodeCustomTrim = function() {

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
