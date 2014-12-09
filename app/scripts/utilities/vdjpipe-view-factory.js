define([
    'app',
], function(App) {

    'use strict';

    var VdjpipeViewFactory = {};

    VdjpipeViewFactory.GenerateVdjpipeWorkflowViews = function(config) {
        var parameters;

        if (config['steps']) {
            parameters = config['steps'];
        }

        var workflowViews = [];

        for (var counter = 0; counter < parameters.length; counter++) {

            var key = Object.keys(parameters[counter])[0];
            var options = parameters[counter][key];

            var vdjPipeView = VdjpipeViewFactory.GetVdjpipeView(
                key,
                counter,
                options
            );

            workflowViews.push(vdjPipeView);
        }

        return workflowViews;
    };

    VdjpipeViewFactory.GetVdjpipeView = function(key, counter, options) {
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
                vdjPipeView = new App.Views.Vdjpipe.CompositionStats(initAttributes);

                break;

            case 'custom_demultiplex':
                vdjPipeView = new App.Views.Vdjpipe.CustomDemultiplex(initAttributes);

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

            case 'match':
                vdjPipeView = new App.Views.Vdjpipe.MatchSequenceElement(initAttributes);

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

            case 'quality_stats':
                vdjPipeView = new App.Views.Vdjpipe.QualityStats(initAttributes);

                break;

            case 'write_sequence':
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
