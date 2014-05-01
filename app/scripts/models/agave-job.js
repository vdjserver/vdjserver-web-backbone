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
            };

            //outputConfig.forward_seq

            for (var i = 0; i < parameters.length; i++) {
                var currentParam = parameters[i]

                switch(currentParam) {
                    case currentParam.input:
                        outputConfig.input = [];
                        outputConfig.input.push(currentParam);
                        // code
                        break;
                    
                    default:
                        // code
                }
            };
        },
    });

    Backbone.Agave.Model.Job = Job;
    return Job;
})(this);
