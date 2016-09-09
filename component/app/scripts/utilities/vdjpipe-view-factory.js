define([
    'app',
], function(App) {

    'use strict';

    var VdjpipeViewFactory = {};

    VdjpipeViewFactory.GenerateVdjpipeWorkflowViews = function(config) {
        var workflowViews = [];

        for (var counter = 0; counter < config.length; counter++) {

            var key = Object.keys(config[counter])[0];
            var options = config[counter][key];

            var vdjPipeView = VdjpipeViewFactory.GetVdjpipeView(
                key,
                counter,
                options
            );

            workflowViews.push(vdjPipeView);
        }

        return workflowViews;
    };

    VdjpipeViewFactory.UnwrapPairedReadKey = function(key, options) {

        if (key === 'apply') {
            var unwrappedKey = Object.keys(options['step'])[0];

            return unwrappedKey;
        }

        return key;
    };

    VdjpipeViewFactory.UnwrapPairedReadOptions = function(key, options) {

        if (key === 'apply') {
            var unwrappedKey = Object.keys(options['step'])[0];

            var unwrappedOptions = options['step'][unwrappedKey];

            if (options['to']) {
                unwrappedOptions['custom_paired_options'] = {};
                unwrappedOptions['custom_paired_options']['to'] = options['to'];
            }

            return unwrappedOptions;
        }

        return options;
    };

    VdjpipeViewFactory.GetVdjpipeView = function(key, counter, options) {

        //var unwrappedKey = VdjpipeViewFactory.UnwrapPairedReadKey(key, options);
        //var unwrappedOptions = VdjpipeViewFactory.UnwrapPairedReadOptions(key, options);

        //key = unwrappedKey;
        //options = unwrappedOptions;

        var initAttributes = {
            'parameterType': key,
            'inputCount': counter,
            'options': options,
            'files': this.selectedFileListings,
        };

        var vdjPipeView;

        switch (key) {

            case 'ambiguous_window_filter':
                vdjPipeView = new App.Views.Vdjpipe.AmbiguousWindowFilter(initAttributes);

                break;

            case 'average_quality_filter':
                vdjPipeView = new App.Views.Vdjpipe.MinimalAverageQualityFilter(initAttributes);

                break;

            case 'average_quality_window_filter':
                vdjPipeView = new App.Views.Vdjpipe.AverageQualityWindowFilter(initAttributes);

                break;

            case 'character_filter':
                vdjPipeView = new App.Views.Vdjpipe.NucleotideFilter(initAttributes);

                break;

            case 'composition_stats':
            case 'pre_composition_stats':
            case 'post_composition_stats':
                vdjPipeView = new App.Views.Vdjpipe.CompositionStats(initAttributes);

                break;

            case 'custom_j_primer_trimming':
                vdjPipeView = new App.Views.Vdjpipe.CustomJPrimerTrimming(initAttributes);

                break;

            case 'custom_v_primer_trimming':
                vdjPipeView = new App.Views.Vdjpipe.CustomVPrimerTrimming(initAttributes);

                break;

            case 'eMID_map':
                vdjPipeView = new App.Views.Vdjpipe.MatchExternalMolecularIdentifier(initAttributes);

                break;

            case 'find_shared':
                vdjPipeView = new App.Views.Vdjpipe.FindSharedSequences(initAttributes);

                break;

            case 'histogram':
                vdjPipeView = new App.Views.Vdjpipe.Histogram(initAttributes);

                break;

            case 'homopolymer_filter':
                vdjPipeView = new App.Views.Vdjpipe.HomopolymerFilter(initAttributes);

                break;

            case 'length_filter':
                vdjPipeView = new App.Views.Vdjpipe.LengthFilter(initAttributes);

                break;
/*
            case 'match':
                //TODO: switch between match types here w/ detection

                if (
                        _.has(initAttributes, 'options')
                        &&
                        _.has(initAttributes.options, 'elements')
                        &&
                        (
                                _.some(initAttributes.options.elements, function(element) {
                                    if (_.has(element, 'cut_lower')) {
                                        return true;
                                    }
                                })
                                ||
                                _.some(initAttributes.options.elements, function(element) {
                                    if (_.has(element, 'cut_upper')) {
                                        return true;
                                    }
                                })
                        )
                ) {
                    vdjPipeView = new App.Views.Vdjpipe.CustomDemultiplex(initAttributes);
                }
                else {

                }

                break;
*/
            case 'barcode':
                vdjPipeView = new App.Views.Vdjpipe.BarcodeDemultiplex(initAttributes);

                break;

            case 'merge_paired':
                vdjPipeView = new App.Views.Vdjpipe.MergePairedReads(initAttributes);

                break;

            case 'min_quality_filter':
                vdjPipeView = new App.Views.Vdjpipe.MinimalQualityFilter(initAttributes);

                break;

            case 'min_quality_window_filter':
                vdjPipeView = new App.Views.Vdjpipe.MinimalQualityWindowFilter(initAttributes);

                break;

            case 'statistics':
            case 'pre_statistics':
            case 'post_statistics':
                vdjPipeView = new App.Views.Vdjpipe.Statistics(initAttributes);

                break;

            case 'write_sequence':
            case 'merge_write_sequence':
                vdjPipeView = new App.Views.Vdjpipe.WriteSequence(initAttributes);

                break;

            case 'write_value':
                vdjPipeView = new App.Views.Vdjpipe.WriteValue(initAttributes);

                break;

            default:
                break;
        }

        return vdjPipeView;
    };

    App.Utilities.VdjpipeViewFactory = VdjpipeViewFactory;
    return VdjpipeViewFactory;
});
