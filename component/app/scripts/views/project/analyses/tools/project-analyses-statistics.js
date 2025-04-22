
import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import 'bootstrap-select';

import parameter_template from 'Templates/project/analyses/tools/project-analyses-statistics.html';
export var StatisticsParameterView = Marionette.View.extend({
    template: Handlebars.compile(parameter_template),
    toolName: 'statistics',

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
        this.analysisDetailView = parameters.analysisDetailView;
    },

    templateContext() {
        return {

        }
    },

    onAttach() {
        // init boostrap-select
        $('.selectpicker').selectpicker();
    },
});
