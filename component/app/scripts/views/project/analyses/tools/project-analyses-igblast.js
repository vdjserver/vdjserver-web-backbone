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
        this.analysisDetailView = parameters.analysisDetailView;

        // Initialize model defaults if missing
        if (!this.model) this.model = {};
        this.model.species = this.model.species || 'Homo sapiens';
        this.model.strain = this.model.strain || '';
        this.model.locus = this.model.locus || 'IG';
        this.model.germlineDb = this.model.germlineDb || 'db.2019.01.23.tgz';
    },

    templateContext: function () {
        // Determine strain options based on species
        let strainOptions = [];
        if (this.model.species === 'Mus musculus') {
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
            species_list: [
                { id: 'NCBITAXON:9606', value: 'Homo sapiens', label: 'Homo sapiens' },
                { id: 'NCBITAXON:10088', value: 'Mus musculus', label: 'Mus musculus' },
                { id: 'NCBITAXON:9544', value: 'Macaca mulatta', label: 'Macaca mulatta' }
            ],
            strain_options: strainOptions,
            locus_options: [
                { value: 'IG', label: 'IG' },
                { value: 'TR', label: 'TR' }
            ],
            germline_dbs: [
                { value: 'db.2019.01.23.tgz', label: 'VDJServer IMGT 2019.01.23' },
                { value: 'db.2025.10.22.tgz', label: 'OGRDB:IGLambda_VJ.3' },
                { value: 'Other_DB', label: 'Other DB' }
            ],
            model: this.model // needed for selected options in template
        };
    },

    onAttach: function () {
        $('.selectpicker').selectpicker();
    },

    events: {
        'change #project-analyses-igblast-parameters-species-select': function (e) {
            this.model.species = e.target.value;
            this.render(); // re-render to update strain options
            this.$('.selectpicker').selectpicker(); // refresh selectpicker
        },
        'change #project-analyses-igblast-parameters-strain-select': function (e) {this.model.strain = e.target.value;},
        'change #project-analyses-igblast-parameters-locus-select': function (e) {this.model.locus = e.target.value;},
        'change #project-analyses-igblast-parameters-germline-db-select': function (e) {this.model.germlineDb = e.target.value;}
    }
});
