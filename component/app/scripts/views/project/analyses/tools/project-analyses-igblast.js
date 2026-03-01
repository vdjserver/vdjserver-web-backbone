import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import 'bootstrap-select';
import { File } from 'Scripts/models/agave-file';

import parameter_template from 'Templates/project/analyses/tools/project-analyses-igblast.html';
import bootstrapSelect from 'bootstrap-select';

export var IgBlastParameterView = Marionette.View.extend({
    template: Handlebars.compile(parameter_template),
    toolName: 'igblast',

    initialize: function (parameters) {
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },

    templateContext: function () {
        let value = this.model.get('value');
        var locus = this.model.schema.spec('locus');

        return {
            locus_enum: locus.enum,
            strain_options: EnvironmentConfig.strains,
            germline_dbs: EnvironmentConfig.germlines
        };
    },

    onAttach: function () {
        $('.selectpicker').selectpicker();

        // uncomment once all species and strains are available
        // // strains
        const value = this.model.get('value');
        if (value.species == 'human') {
            this.$('#macaque-strain-select').hide();
            this.$('#mouse-strain-select').hide();
        } else if (value.species == 'macaque') {
            this.$('#human-strain-select').hide();
            this.$('#mouse-strain-select').hide();
        } else if (value.species == 'mouse') {
            this.$('#human-strain-select').hide();
            this.$('#macaque-strain-select').hide();
        }
        // germlines
        if (value.locus == 'IG') {
            this.$('#tr-db-select').hide();
        } else if (value.locus == 'TR') {
            this.$('#ig-db-select').hide();
        }
    },

    events: {
        // uncomment once all species and strains are available
        'change #project-analyses-igblast-parameters-species-select': function(e) {
            const human_strain_select = this.$('#human-strain-select');
            const macaque_strain_select = this.$('#macaque-strain-select');
            const mouse_strain_select = this.$('#mouse-strain-select');
            const strain = $(e.target).val();
            if (strain === "human") {
                human_strain_select.show();
                macaque_strain_select.hide();
                mouse_strain_select.hide();
            } else if (strain === "macaque") {
                human_strain_select.hide();
                macaque_strain_select.show();
                mouse_strain_select.hide();
            } else if (strain === "mouse") {
                human_strain_select.hide();
                macaque_strain_select.hide();
                mouse_strain_select.show();
            }

        },
        'change #project-analyses-igblast-parameters-locus-select': function(e) {
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
        'change .form-control-igblast' : function(e) {
            this.controller.updateField(e, this.model);
            let new_el, new_event;
            let double_change = false;
            if (e.target.name === "locus") {
                // locus & germline_db
                double_change = true;
                if (e.target.value === "IG") {
                    new_el = $(this.el).find("#project-analyses-igblast-parameters-germline-select-ig");
                } else if (e.target.value === "TR") {
                    new_el = $(this.el).find("#project-analyses-igblast-parameters-germline-select-tr");
                }
            } else if (e.target.name === "species") {
                // species & strain
                double_change = true;
                if (e.target.value === "human") {
                    new_el = $(this.el).find("#project-analyses-igblast-parameters-human-strain-select");
                } else if (e.target.value === "macaque") {
                    new_el = $(this.el).find("#project-analyses-igblast-parameters-macaque-strain-select");
                } else if (e.target.value === "mouse") {
                    new_el = $(this.el).find("#project-analyses-igblast-parameters-mouse-strain-select");
                }
            }
            if (double_change) {
                this.model.updateField(new_el.attr("name"), new_el.val());
                double_change = false;
            }
        },
        'change .form-control-igblast-select' : function(e) {this.controller.updateSelect(e, this.model);},
        'change .form-control-igblast-toggle' : function(e) {this.controller.updateToggle(e, this.model, false, null);}
    }
});
