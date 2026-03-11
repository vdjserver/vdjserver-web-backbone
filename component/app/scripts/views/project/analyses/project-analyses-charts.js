import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';

import parameter_template from 'Templates/project/analyses/project-analyses-charts.html';
export var ChartsView = Marionette.View.extend({
    template: Handlebars.compile(parameter_template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
        this.analysisDetailView = parameters.analysisDetailView;
    },

    events: {
        'click .view-table' : 'viewTable',
        'click .hide-table' : 'hideTable',
        'click #project-file-download': 'downloadFile',
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

    downloadFile: function(e) {
        e.preventDefault();

        this.model.downloadFileToDisk()
            .fail(function(error) {
                // TODO: handle error
                console.log(error);
            });
    },
});

import table_template from 'Templates/project/analyses/project-analyses-charts-table.html';
export var ChartsViewTable = Marionette.CollectionView.extend({
    template: Handlebars.compile(table_template),
    childViewContainer: '.project-analyses-charts-table',

    initialize: function(parameters) {
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        this.childView = ChartsView;
        this.childViewOptions = { controller: this.controller };
    },
});