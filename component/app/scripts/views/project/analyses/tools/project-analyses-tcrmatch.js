
import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import 'bootstrap-select';

import parameter_template from 'Templates/project/analyses/tools/project-analyses-tcrmatch.html';
export var TCRMatchParameterView = Marionette.View.extend({
    template: Handlebars.compile(parameter_template),
    toolName: 'tcrmatch',

    initialize: function (parameters) {
        if (parameters)
            if (parameters.controller) this.controller = parameters.controller;
            if (parameters.parentModel) this.parentModel = parameters.parentModel;
    },

    templateContext() {
        return {
            view_mode: this.parentModel.view_mode,
        }
    },

    onAttach() {
        // init boostrap-select
        $('.selectpicker').selectpicker();
    },
});
