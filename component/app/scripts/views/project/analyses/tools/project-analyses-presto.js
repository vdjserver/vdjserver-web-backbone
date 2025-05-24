import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import 'bootstrap-select';

import parameter_template from 'Templates/project/analyses/tools/project-analyses-presto.html';
export var PrestoParameterView = Marionette.View.extend({
    template: Handlebars.compile(parameter_template),
    toolName: 'presto',

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
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
        'change #presto-parameters-filter-toggle' : function(e) {this.controller.updateToggle(e, this.model, this, 'presto-parameters-filter-child')},
        'change #presto-parameters-barcode-toggle' : function(e) {this.controller.updateToggle(e, this.model, this, 'presto-parameters-barcode-child')},
        'change #presto-parameters-forward-primer-toggle' : function(e) {this.controller.updateToggle(e, this.model, this, 'presto-parameters-forward-primer-child')},
        'change #presto-parameters-reverse-primer-toggle' : function(e) {this.controller.updateToggle(e, this.model, this, 'presto-parameters-reverse-primer-child')},
    },
});
