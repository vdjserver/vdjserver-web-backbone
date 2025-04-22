
import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import 'bootstrap-select';

import parameter_template from 'Templates/project/analyses/tools/project-analyses-trust4.html';
export var TRUST4ParameterView = Marionette.View.extend({
    template: Handlebars.compile(parameter_template),
    toolName: 'trust4',

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
