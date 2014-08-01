define([
    'app',
], function(App) {

    'use strict';

    var VdjpipeViewHelpers = {};

    VdjpipeViewHelpers.GenerateVdjpipeWorkflowViews = function(config) {
        var parameters = config['single_read_pipe'];

        var workflowViews = [];

        for (var counter = 0; counter < parameters.length; counter++) {

            var key = Object.keys(parameters[counter])[0];
            var options = parameters[counter][key];

            var vdjPipeView = VdjpipeViewHelpers.GetVdjpipeView(
                key,
                counter,
                options
            );

            workflowViews.push(vdjPipeView);
        }

        return workflowViews;
    };

    VdjpipeViewHelpers.GetVdjpipeView = function(key, counter, options) {

        var vdjPipeView;

        switch(key) {

            case 'ambiguous_window_filter':

                vdjPipeView = new App.Views.Vdjpipe.VdjpipeAmbiguousWindowFilter({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'average_quality_filter':
                vdjPipeView = new App.Views.Vdjpipe.VdjpipeMinAverageQualityFilter({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'average_quality_window_filter':
                vdjPipeView = new App.Views.Vdjpipe.VdjpipeAverageQualityWindowFilter({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'character_filter':
                vdjPipeView = new App.Views.Vdjpipe.VdjpipeNucleotideFilter({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'composition_stats':
                vdjPipeView = new App.Views.Vdjpipe.VdjpipeTextImmutable({
                    parameterName: 'Base Composition Statistics',
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'eMID_map':
                vdjPipeView = new App.Views.Vdjpipe.VdjpipeMatchExternalMolecularIdentifier({
                    parameterType: key,
                    inputCount: counter,
                    files: this.selectedFileListings,
                    options: options,
                });

                break;

            case 'find_intersection':
                vdjPipeView = new App.Views.Vdjpipe.VdjpipeFindSequencesFromMultipleGroups({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'find_unique':
                vdjPipeView = new App.Views.Vdjpipe.VdjpipeFindUniqueSequences({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'histogram':
                vdjPipeView = new App.Views.Vdjpipe.VdjpipeHistogram({
                    parameterName: 'Histogram',
                    parameterType: key,
                    placeholderText: '',
                    inputLabel: 'Name',
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'homopolymer_filter':
                vdjPipeView = new App.Views.Vdjpipe.VdjpipeNumberMutable({
                    parameterName: 'Homopolymer Filter',
                    parameterType: key,
                    inputLabel: 'Max',
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'length_filter':
                vdjPipeView = new App.Views.Vdjpipe.VdjpipeLengthFilter({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'match':
                vdjPipeView = new App.Views.Vdjpipe.VdjpipeMatchSequenceElement({
                    parameterType: key,
                    inputCount: counter,
                    files: this.selectedFileListings,
                    options: options,
                });

                break;

            case 'merge_paired':
                vdjPipeView = new App.Views.Vdjpipe.VdjpipeNumberMutable({
                    parameterName: 'Merge Paired Reads',
                    parameterType: key,
                    inputLabel: 'Minimum Score',
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'min_quality_filter':
                vdjPipeView = new App.Views.Vdjpipe.VdjpipeNumberMutable({
                    parameterName: 'Minimal Quality Filter',
                    parameterType: key,
                    inputLabel: '',
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'min_quality_window_filter':
                vdjPipeView = new App.Views.Vdjpipe.VdjpipeMinimalQualityWindowFilter({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'quality_stats':
                vdjPipeView = new App.Views.Vdjpipe.VdjpipeTextImmutable({
                    parameterName: 'Read Quality Statistics',
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'write_sequence':
                vdjPipeView = new App.Views.Vdjpipe.VdjpipeWriteSequence({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'write_value':
                vdjPipeView = new App.Views.Vdjpipe.VdjpipeWriteValue({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            default:
                break;
        }

        return vdjPipeView;
    };

    App.Views.Helpers.VdjpipeViewHelpers = VdjpipeViewHelpers;
    return VdjpipeViewHelpers;
});
