import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import 'bootstrap-select';

import parameter_template from 'Templates/project/analyses/tools/project-analyses-cellranger.html';
export var CellRangerParameterView = Marionette.View.extend({
    template: Handlebars.compile(parameter_template),
    toolName: 'cellranger',

    initialize: function (parameters) {
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },

    templateContext: function () {
        let model_value = this.model.get('value');
        var ctrl_model_value = this.controller.analysisDetailView.model.get('value')

        return {
            status: ctrl_model_value.status,
            species: EnvironmentConfig.species,
            germline_dbs: EnvironmentConfig.germlines,
            // view_mode: this.controller.view_mode, // find view mode so I can grey out finshed jobs boxes.
        };
    },

    onAttach: function () {
        $('.selectpicker').selectpicker();
    },

    events: {
//         'change #project-analyses-cellranger-parameters-species-select': function(e) {
//             this.model.updateField(e.target.name, e.target.selectedOptions[0]['id']);
//         },
        'change .form-control-cellranger' : function(e) {
            this.controller.updateField(e, this.model);
        },
    }
});
