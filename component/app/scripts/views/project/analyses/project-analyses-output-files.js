import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
// import 'bootstrap-select';

import parameter_template from 'Templates/project/analyses/project-analyses-output-files.html';
export var OutputFilesView = Marionette.View.extend({
    template: Handlebars.compile(parameter_template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
        this.analysisDetailView = parameters.analysisDetailView;
    },

    templateContext() {
        let name = this.model.get("vdjserver:project_job_file");
        let description = this.model.get("vdjserver:description");
        let format = this.model.get("vdjserver:format");
        let tags = this.model.get("vdjserver:tags");
        return {
            name:name,
            description:description,
            format:format,
            tags:tags
        }        
    },

    events: {
        
    },

});

import table_template from 'Templates/project/analyses/project-analyses-output-files-table.html';
export var OutputFilesViewTable = Marionette.CollectionView.extend({
    template: Handlebars.compile(table_template),
    childViewContainer: '.project-analyses-outfiles-table',

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        this.childView = OutputFilesView;
        this.childViewOptions = { controller: this.controller };
    },
});