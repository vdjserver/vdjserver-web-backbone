import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
// import 'bootstrap-select';

import parameter_template from 'Templates/project/analyses/project-analyses-tool-buttons.html';
export var ToolButtonsView = Marionette.View.extend({
    template: Handlebars.compile(parameter_template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
        this.analysisDetailView = this.controller.analysisDetailView;
    },

    templateContext() {
        var ctrl_model_value = this.analysisDetailView.model.get('value');
        return {
            status: ctrl_model_value.status
        }
    },

    // uncomment import statement 
    // onAttach() {
    //     // init bootstrap-select
    //     $('.selectpicker').selectpicker();
    // },

    events: {

    },
});
