import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
// import 'bootstrap-select';

import parameter_template from 'Templates/project/analyses/tools/project-analyses-presto.html';
export var PrestoParameterView = Marionette.View.extend({
    template: Handlebars.compile(parameter_template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

    },

    templateContext() {
        return {

        }
    },
});
