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

                vdjPipeView = new App.Views.Vdjpipe.AmbiguousWindowFilter({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'average_quality_filter':
                vdjPipeView = new App.Views.Vdjpipe.MinimalAverageQualityFilter({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'average_quality_window_filter':
                vdjPipeView = new App.Views.Vdjpipe.AverageQualityWindowFilter({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'character_filter':
                vdjPipeView = new App.Views.Vdjpipe.NucleotideFilter({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'composition_stats':
                vdjPipeView = new App.Views.Vdjpipe.TextImmutable({
                    parameterName: 'Base Composition Statistics',
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'eMID_map':
                vdjPipeView = new App.Views.Vdjpipe.MatchExternalMolecularIdentifier({
                    parameterType: key,
                    inputCount: counter,
                    files: this.selectedFileListings,
                    options: options,
                });

                break;

            case 'find_intersection':
                vdjPipeView = new App.Views.Vdjpipe.FindSequencesFromMultipleGroups({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'find_unique':
                vdjPipeView = new App.Views.Vdjpipe.FindUniqueSequences({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'histogram':
                vdjPipeView = new App.Views.Vdjpipe.Histogram({
                    parameterName: 'Histogram',
                    parameterType: key,
                    placeholderText: '',
                    inputLabel: 'Name',
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'homopolymer_filter':
                vdjPipeView = new App.Views.Vdjpipe.HomopolymerFilter({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'length_filter':
                vdjPipeView = new App.Views.Vdjpipe.LengthFilter({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'match':
                vdjPipeView = new App.Views.Vdjpipe.MatchSequenceElement({
                    parameterType: key,
                    inputCount: counter,
                    files: this.selectedFileListings,
                    options: options,
                });

                break;

            case 'merge_paired':
                vdjPipeView = new App.Views.Vdjpipe.MergePairedReads({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'min_quality_filter':
                vdjPipeView = new App.Views.Vdjpipe.MinimalQualityFilter({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'min_quality_window_filter':
                vdjPipeView = new App.Views.Vdjpipe.MinimalQualityWindowFilter({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'quality_stats':
                vdjPipeView = new App.Views.Vdjpipe.TextImmutable({
                    parameterName: 'Read Quality Statistics',
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'write_sequence':
                vdjPipeView = new App.Views.Vdjpipe.WriteSequence({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'write_value':
                vdjPipeView = new App.Views.Vdjpipe.WriteValue({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            default:
                console.log("key " + key + " is falling into default");
                break;
        }

        return vdjPipeView;
    };

    App.Views.Helpers.VdjpipeViewHelpers = VdjpipeViewHelpers;
    return VdjpipeViewHelpers;
});