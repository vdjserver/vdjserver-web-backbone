import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import 'bootstrap-select';

import parameter_template from 'Templates/project/analyses/tools/project-analyses-repcalc.html';
export var RepCalcParameterView = Marionette.View.extend({
    template: Handlebars.compile(parameter_template),
    toolName: 'repcalc',

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

    events: {
        'change .form-control-repcalc' : function(e) {this.controller.updateField(e, this.model);}, 
        'change .form-control-repcalc-select' : function(e) {this.controller.updateSelect(e, this.model);}, 
    },
});
