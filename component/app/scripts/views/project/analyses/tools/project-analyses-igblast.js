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
        console.log(locus);

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
            locus_options: [
                { value: 'IG', label: 'IG' },
                { value: 'TR', label: 'TR' }
            ],
            germline_dbs: [
                { value: 'db.2019.01.23.tgz', label: 'VDJServer IMGT 2019.01.23' },
                { value: 'db.2025.10.22.tgz', label: 'OGRDB:IGLambda_VJ.3' },
                { value: 'Other_DB', label: 'Other DB' }
            ]
        };
    },

    onAttach: function () {
        $('.selectpicker').selectpicker();
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

        'change .form-control-igblast' : function(e) {this.controller.updateField(e, this.model);},
        'change .form-control-igblast-select' : function(e) {this.controller.updateSelect(e, this.model);},
        'change .form-control-igblast-toggle' : function(e) {this.controller.updateToggle(e, this.model, false, null);}
    }
});
