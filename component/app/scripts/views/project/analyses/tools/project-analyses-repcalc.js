import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import 'bootstrap-select';

import parameter_template from 'Templates/project/analyses/tools/project-analyses-repcalc.html';
export var RepCalcParameterView = Marionette.View.extend({
    template: Handlebars.compile(parameter_template),
    toolName: 'repcalc',

    initialize: function (parameters) {
        if (parameters)
            if (parameters.controller) this.controller = parameters.controller;
            if (parameters.parentModel) this.parentModel = parameters.parentModel;
    },

    templateContext() {
        var ctrl_model_value = this.controller.analysisDetailView.model.get('value');
        return {
            status: ctrl_model_value.status,
            cid: this.cid,
            view_mode: this.parentModel.view_mode,
        }
    },

    onAttach() {
        // init boostrap-select
        $('.selectpicker').selectpicker();
    },

    events: {
        'change .form-control-repcalc' : function(e) {this.controller.updateField(e, this.model);}, 
        'change .form-control-repcalc-select' : function(e) {this.controller.updateSelect(e, this.model);}, 
        'change .form-control-repcalc-toggle' : function(e) {this.controller.updateToggle(e, this.model, false, null);}
    },
});
