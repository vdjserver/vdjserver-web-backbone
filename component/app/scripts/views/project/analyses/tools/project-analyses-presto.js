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
        'click #presto-parameters-filter-toggle' : function(e) {this.analysisDetailView.toggleChildren('presto-parameters-filter-child', e)},
        'click #presto-parameters-barcode-toggle' : function(e) {this.analysisDetailView.toggleChildren('presto-parameters-barcode-child', e)},
        'click #presto-parameters-forward-primer-toggle' : function(e) {this.analysisDetailView.toggleChildren('presto-parameters-forward-primer-child', e)},
        'click #presto-parameters-reverse-primer-toggle' : function(e) {this.analysisDetailView.toggleChildren('presto-parameters-reverse-primer-child', e)},
    },
});
