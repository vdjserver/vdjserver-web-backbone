import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import 'bootstrap-select';

import parameter_template from 'Templates/project/analyses/project-analyses-output-files.html';
export var OutputFilesView = Marionette.View.extend({
    template: Handlebars.compile(parameter_template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
        this.analysisDetailView = parameters.analysisDetailView;

        let archive_files = {
            "vdjserver:project_job_file:cdr3_length_data.zip": {
                "vdjserver:type": "app:outputs",
                "vdjserver:project_job_file": "cdr3_length_data.zip",
                "vdjserver:tags": "cdr3_length_archive",
                "vdjserver:description": "Archive of CDR3 Length Histogram chart data",
                "vdjserver:format": "zip"
            },
            "vdjserver:project_job_file:cdr3_sharing_data.zip": {
                "vdjserver:type": "app:outputs",
                "vdjserver:project_job_file": "cdr3_sharing_data.zip",
                "vdjserver:tags": "cdr3_sharing_archive",
                "vdjserver:description": "Archive of Shared/Unique CDR3 chart data",
                "vdjserver:format": "zip"
            },
            "vdjserver:project_job_file:cdr3_distribution_data.zip": {
                "vdjserver:type": "app:outputs",
                "vdjserver:project_job_file": "cdr3_distribution_data.zip",
                "vdjserver:tags": "cdr3_distribution_archive",
                "vdjserver:description": "Archive of CDR3 Distribution chart data",
                "vdjserver:format": "zip"
            },
            "vdjserver:project_job_file:clonal_abundance_data.zip": {
                "vdjserver:type": "app:outputs",
                "vdjserver:project_job_file": "clonal_abundance_data.zip",
                "vdjserver:tags": "clonal_abundance_archive",
                "vdjserver:description": "Archive of Clonal Abundance chart data",
                "vdjserver:format": "zip"
            },
            "vdjserver:project_job_file:diversity_curve_data.zip": {
                "vdjserver:type": "app:outputs",
                "vdjserver:project_job_file": "diversity_curve_data.zip",
                "vdjserver:tags": "diversity_curve_archive",
                "vdjserver:description": "Archive of Diversity Curve chart data",
                "vdjserver:format": "zip"
            },
            "vdjserver:project_job_file:segment_counts_data.zip": {
                "vdjserver:type": "app:outputs",
                "vdjserver:project_job_file": "segment_counts_data.zip",
                "vdjserver:tags": "gene_segment_usage_archive",
                "vdjserver:description": "Gene Segment Usage chart data archive",
                "vdjserver:format": "zip"
            },
            "vdjserver:project_job_file:segment_combos_data.zip": {
                "vdjserver:type": "app:outputs",
                "vdjserver:project_job_file": "segment_combos_data.zip",
                "vdjserver:tags": "gene_segment_combos_archive",
                "vdjserver:description": "Gene Segment Combinations chart data archive",
                "vdjserver:format": "zip"
            },
        }

        this.archive_files = Object.entries(archive_files).map(([key, value]) => ({
            id: key,
            name: value["vdjserver:project_job_file"],
            tags: value["vdjserver:tags"],
            description: value["vdjserver:description"]
        }));
    },

    templateContext() {
        return {
            archive_files : this.archive_files,
            individual_files : []
        }        
    },

    // uncomment import statement 
    onAttach() {
        // init bootstrap-select
        $('.selectpicker').selectpicker();
    },

    events: {
        'change #analysis-output-select':function(e) {
            $("#project-analyses-view-output").prop("disabled", false);
            $("#project-analyses-download-output").prop("disabled", false);
        }
    },
});
