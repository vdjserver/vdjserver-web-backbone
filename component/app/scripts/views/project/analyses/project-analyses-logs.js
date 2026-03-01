import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
// import 'bootstrap-select';

import parameter_template from 'Templates/project/analyses/project-analyses-logs.html';
export var LogsView = Marionette.View.extend({
    template: Handlebars.compile(parameter_template),

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

    // uncomment import statement 
    // onAttach() {
    //     // init bootstrap-select
    //     $('.selectpicker').selectpicker();
    // },

    events: {

    },
});
