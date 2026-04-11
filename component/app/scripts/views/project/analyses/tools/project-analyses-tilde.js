import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import 'bootstrap-select';

import parameter_template from 'Templates/project/analyses/tools/project-analyses-tilde.html';
export var TILDEParameterView = Marionette.View.extend({
    template: Handlebars.compile(parameter_template),
    toolName: 'tilde',

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
        // we are a view for a sub model
        if (parameters && parameters.parentModel)
            this.parentModel = parameters.parentModel;
    },

    templateContext() {
        // check if disabled
        let pv = this.parentModel.get('value');
        let should_disable = false;
        if (pv == "SUBMITTED") should_disable = true;

        return {
            should_disable: should_disable,
            cid: this.cid
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
