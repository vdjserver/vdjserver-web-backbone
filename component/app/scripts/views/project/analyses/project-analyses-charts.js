import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
// import 'bootstrap-select';

import parameter_template from 'Templates/project/analyses/project-analyses-charts.html';
export var ChartsView = Marionette.View.extend({
    template: Handlebars.compile(parameter_template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
        this.analysisDetailView = parameters.analysisDetailView;
    },

    templateContext() {
        // let name = this.model.get("vdjserver:project_job_file");
        // let description = this.model.get("vdjserver:description");
        // let format = this.model.get("vdjserver:format");
        // let tags = this.model.get("vdjserver:tags");
        // return {
        //     name:name,
        //     description:description,
        //     format:format,
        //     tags:tags
        // }        
    },


    // uncomment import statement 
    // onAttach() {
    //     // init bootstrap-select
    //     $('.selectpicker').selectpicker();
    // },

    events: {
        'click .view-table' : 'viewTable',
        'click .hide-table' : 'hideTable',
    },

    viewTable: function(e) {
        e.preventDefault();

        var $btn = this.$(e.currentTarget);
        $btn.attr('hidden', true);
        $btn.siblings('.hide-table').removeAttr('hidden');
    },

    hideTable: function(e) {
        e.preventDefault();
        
        var $btn = this.$(e.currentTargetEntitiesWithTag);
        $btn.attr('hidden', true);
        $btn.siblings('.view-table').removeAttr('hidden');
    },
});

import table_template from 'Templates/project/analyses/project-analyses-charts-table.html';
export var ChartsViewTable = Marionette.CollectionView.extend({
    template: Handlebars.compile(table_template),
    childViewContainer: '.project-analyses-charts-table',

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        this.childView = ChartsView;
        this.childViewOptions = { controller: this.controller };
    },
});