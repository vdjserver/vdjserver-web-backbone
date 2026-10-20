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
        var locus = this.model.schema.spec('locus');

        return {
            status: ctrl_model_value.status,
            locus_enum: locus.enum,
            species: EnvironmentConfig.species,
            germline_dbs: EnvironmentConfig.germlines,
        };
    },

    onAttach: function () {
        $('.selectpicker').selectpicker();

        const value = this.model.get('value');

        // germlines
        if (value.locus == 'IG') {
            this.$('#tr-db-select').hide();
        } else if (value.locus == 'TR') {
            this.$('#ig-db-select').hide();
        }
    },

    events: {
        'change #project-analyses-cellranger-parameters-locus-select': function(e) {
            const ig_db_select = this.$('#ig-db-select');
            const tr_db_select = this.$('#tr-db-select');
            const locus = $(e.target).val();
            if (locus === "IG") {
                ig_db_select.show();
                tr_db_select.hide();
            } else if (locus === "TR") {
                ig_db_select.hide();
                tr_db_select.show();
            }
        },
        'change .form-control-cellranger-species' : function(e) {
            this.model.updateField(e.target.name, e.target.selectedOptions[0]['id']);
        },
        'change .form-control-cellranger' : function(e) {
            this.controller.updateField(e, this.model);
            let new_el, new_event;
            let double_change = false;
            if (e.target.name === "locus") {
                // locus & germline_db
                double_change = true;
                if (e.target.value === "IG") {
                    new_el = $(this.el).find("#project-analyses-cellranger-parameters-germline-select-ig");
                } else if (e.target.value === "TR") {
                    new_el = $(this.el).find("#project-analyses-cellranger-parameters-germline-select-tr");
                }
            }
            if (double_change) {
                this.model.updateField(new_el.attr("name"), new_el.val());
                double_change = false;
            }
        },
    }
});
