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
            strain_options: EnvironmentConfig.strains,
            germline_dbs: EnvironmentConfig.germlines,
            // view_mode: this.controller.view_mode, // find view mode so I can grey out finshed jobs boxes.
        };
    },

    onAttach: function () {
        $('.selectpicker').selectpicker();

        // uncomment once all species and strains are available
        // // strains
        const value = this.model.get('value');
        this.$('[id$="-strain-select"]').hide();
        this.$(`#${value.species}-strain-select`).show();

        // germlines
//         if (value.locus == 'IG') {
//             this.$('#tr-db-select').hide();
//         } else if (value.locus == 'TR') {
//             this.$('#ig-db-select').hide();
//         }
    },

    events: {
        // uncomment once all species and strains are available
        'change #project-analyses-cellranger-parameters-species-select': function(e) {
            const strain = $(e.target).val();
            this.$('[id$="-strain-select"]').hide();
            this.$(`#${strain}-strain-select`).show();
        },
//         'change #project-analyses-cellranger-parameters-locus-select': function(e) {
//             const ig_db_select = this.$('#ig-db-select');
//             const tr_db_select = this.$('#tr-db-select');
//             const locus = $(e.target).val();
//             if (locus === "IG") {
//                 ig_db_select.show();
//                 tr_db_select.hide();
//             } else if (locus === "TR") {
//                 ig_db_select.hide();
//                 tr_db_select.show();
//             }
//         },
        'change .form-control-cellranger' : function(e) {
            this.controller.updateField(e, this.model);
            let new_el, new_event;
            let double_change = false;
            if (e.target.name === "species") {
//                 // locus & germline_db
//                 double_change = true;
//                 if (e.target.value === "IG") {
//                     new_el = $(this.el).find("#project-analyses-cellranger-parameters-germline-select-ig");
//                 } else if (e.target.value === "TR") {
//                     new_el = $(this.el).find("#project-analyses-cellranger-parameters-germline-select-tr");
//                 }
//             } else if (e.target.name === "species") {
                // species & strain
                double_change = true;
                if (e.target.value === "human") {
                    new_el = $(this.el).find("#project-analyses-cellranger-parameters-human-strain-select");
                } else if (e.target.value === "macaque") {
                    new_el = $(this.el).find("#project-analyses-cellranger-parameters-macaque-strain-select");
                } else if (e.target.value === "mouse") {
                    new_el = $(this.el).find("#project-analyses-cellranger-parameters-mouse-strain-select");
                }
            }
            if (double_change) {
                this.model.updateField(new_el.attr("name"), new_el.val());
                double_change = false;
            }
        },
        'change .form-control-cellranger-select' : function(e) {this.controller.updateSelect(e, this.model);},
        'change .form-control-cellranger-toggle' : function(e) {this.controller.updateToggle(e, this.model, false, null);}
    }
});
