import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import 'bootstrap-select';
import { File } from 'Scripts/models/agave-file';

import parameter_template from 'Templates/project/analyses/tools/project-analyses-igblast.html';

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

        // Determine strain options based on species
        let strainOptions = [];
        if (value.species === 'mouse') {
            strainOptions = [
                { value: 'C57BL/6', label: 'C57BL/6' },
                { value: 'BALB/c', label: 'BALB/c' },
                { value: '129S1', label: '129S1' },
                { value: 'DBA/2', label: 'DBA/2' }
            ];
        } else {
            strainOptions = [{ value: '', label: 'N/A' }];
        }

        return {
            locus_enum: locus.enum,
            strain_options: strainOptions,
            germline_dbs: EnvironmentConfig.germlines
        };
    },

    onAttach: function () {
        $('.selectpicker').selectpicker();
        this.$('#tr-db-select').hide();
    },

    events: {
//         'change #project-analyses-igblast-parameters-species-select': function (e) {
//             this.model.species = e.target.value;
//             this.render(); // re-render to update strain options
//             this.$('.selectpicker').selectpicker(); // refresh selectpicker
//         },
//         'change #project-analyses-igblast-parameters-strain-select': function (e) {this.model.strain = e.target.value;},
//         'change #project-analyses-igblast-parameters-locus-select': function (e) {this.model.locus = e.target.value;},
//         'change #project-analyses-igblast-parameters-germline-db-select': function (e) {this.model.germlineDb = e.target.value;}
        // 'change #project-analyses-igblast-parameters-locus-select': function(e) {
        //     var ig_db_select = $("project-analyses-igblast-parameters-germline-db-select-ig");
        //     // ig_db_select.style.display = "none";
        //     ig_db_select.selectpicker('hide');
        //     $('.selectpicker').selectpicker('render');
            
        // },
        'change #project-analyses-igblast-parameters-locus-select': function(e) {
            const ig_db_select = this.$('#ig-db-select');
            const tr_db_select = this.$('#tr-db-select');
            const locus = $(e.target).val();
            if (locus === 'IG') {
                ig_db_select.show();
                tr_db_select.hide();
            } else {
                ig_db_select.hide();
                tr_db_select.show();
            }
        },
        'change .form-control-igblast' : function(e) {this.controller.updateField(e, this.model);},
        'change .form-control-igblast-select' : function(e) {this.controller.updateSelect(e, this.model);},
        'change .form-control-igblast-toggle' : function(e) {this.controller.updateToggle(e, this.model, false, null);}
    }
});
