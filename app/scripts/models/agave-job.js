(function (window) {

    'use strict';

    var Backbone = window.Backbone;

    var Job = {};

    Job.AgaveGeneric = Backbone.Agave.JobModel.extend({
    });

    Job.VdjPipe = Backbone.Agave.JobModel.extend({
        generateVdjPipeConfig: function(parameters) {

            var outputConfig = {
                "base_path_input": "sample_data",
                "base_path_output": "out/temp/paired",
                "csv_file_delimiter": "\t",
                'single_read_pipe': [],
            };

            //outputConfig.forward_seq

            var paramOutput = []
            var inputOutput = [];

            for (var key in parameters) {

                if (parameters.hasOwnProperty(key)) {
                    console.log('key is: ' + key);
                    if (key !== 'formtype' && key !== 'job-name') {
                        console.log("past if");
                        var keyCounterIndex = key.indexOf('-') + 1;
                        var keyCounter = key.slice(0, keyCounterIndex);
                        var vdjPipeParam = key.slice(keyCounterIndex);

                        console.log("keyCounterIndex is: " + keyCounterIndex);
                        console.log("keyCounter is: " + keyCounter);
                        console.log("vdjPipeParam is: " + vdjPipeParam);

                        switch(vdjPipeParam) {
                            case 'quality-stats':
                                paramOutput.push({
                                    'quality_stats': {'out_prefix': '_pre'}
                                });
                                break;

                            case 'composition-stats':
                                paramOutput.push({
                                    'composition_stats': {'out_prefix': '_pre'}
                                })
                                break;

                            case 'forward-seq':
                                inputOutput.push({
                                    'forward_seq': parameters[key]
                                });
                                break;

                            case 'reverse-seq':
                                inputOutput.push({
                                    'reverse_seq': parameters[key]
                                });
                                break;

                            case 'nucleotide-filter':
                                paramOutput.push({
                                    'character_filter': parameters[key]
                                });
                                break;

                            case 'length-filter':
                                paramOutput.push({
                                    'length_filter': {
                                        'min': parameters[keyCounter + 'length-filter-min'],
                                        'max': parameters[keyCounter + 'length-filter-max']
                                    }
                                });
                                break;

                            case 'homopolymer-filter':
                                paramOutput.push({
                                    'homopolymer_filter': parameters[key]
                                });
                                break;

                            case 'minimal-quality-filter':
                                paramOutput.push({
                                    'min_quality_filter': parameters[key]
                                });
                                break;

                            case 'minimal-average-quality-filter':
                                paramOutput.push({
                                    'average_quality_filter': parameters[key]
                                });
                                break;

                            case 'minimal-quality-window-filter':
                                paramOutput.push({
                                    'min_quaity_window_filter': {
                                        'min_quality': parameters[key + '-min-quality'],
                                        'min_length': parameters[key + '-min-length']
                                    }
                                });
                                break;

                            case 'average-quality-window-filter':
                                paramOutput.push({
                                    'average_quality_window_filter': {
                                        'min_quality': parameters[key + '-min-quality'],
                                        'window_length': parameters[key + '-window-length'],
                                        'min_length': parameters[key + '-min-length']
                                    }
                                });
                                break;

                            case 'ambiguous-nucleotide-window-filter':
                                paramOutput.push({
                                    'ambiguous_window_filter': {
                                        'min_length': parameters[key + '-min-length'],
                                        'max_ambiguous': parameters[key + '-max-ambiguous']
                                    }
                                });
                                break;

                            case 'histogram':
                                paramOutput.push({
                                    'histogram': {
                                        'name': parameters[key],
                                        'out_path': 'TODO'
                                    }
                                });
                                break;

                            case 'find-unique-sequences':
                                paramOutput.push({
                                    'find_unique': {
                                        'min_length': parameters[key + '-min-length'],
                                        'ignore_ends': parameters[key + '-ignore-ends'],
                                        'fraction_match': parameters[key + '-fraction-match'],
                                       // Could add out_path_fasta or out_path_duplicates
                                    }
                                });
                                break;

                            default:
                                break;
                        }
                    }
                }
            }

            console.log("paramOutput is: " + JSON.stringify(paramOutput));
            console.log("inputOutput is: " + JSON.stringify(inputOutput));

            outputConfig.input = inputOutput;

            outputConfig.single_read_pipe = paramOutput;


            console.log("outputConfig is: " + JSON.stringify(outputConfig));
        },
    });

    Backbone.Agave.Model.Job = Job;
    return Job;
})(this);
