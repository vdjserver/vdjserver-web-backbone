//
// airrkb-filter-query-view.js
// Generic filter view, used in toolbar
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2020 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
// Author: Olivia Dorsey <olivia.dorsey@utsouthwestern.edu>
// Author: Sam Wollenburg <samuel.wollenburg@utsouthwestern.edu>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import 'bootstrap-select';

import GermlineLabels from 'Scripts/utilities/germline-labels/germline-labels.js';

// Filter View
// toolbar under the navigation bar
import airrkb_filter_query_summary_template from 'Templates/util/airrkb-filter-query-summary.html';
import airrkb_filter_query_template from 'Templates/util/airrkb-filter-query.html';
import airrkb_filter_query_template_2 from 'Templates/util/airrkb-filter-query-2.html';
import airrkb_filter_query_template_3 from 'Templates/util/airrkb-filter-query-3.html';
import airrkb_filter_query_template_4 from 'Templates/util/airrkb-filter-query-4.html';
export default Marionette.View.extend({
    templates: {
        summary: Handlebars.compile(airrkb_filter_query_summary_template),
        horizontal: Handlebars.compile(airrkb_filter_query_template),
        vertical: Handlebars.compile(airrkb_filter_query_template_2),
        horizontal_ig: Handlebars.compile(airrkb_filter_query_template_3),
        vertical_ig: Handlebars.compile(airrkb_filter_query_template_4),
    },

    initialize(parameters) {
        if (parameters) {
            // our controller
            if (parameters.controller) this.controller = parameters.controller;

            // construct base filters
            if (parameters.filter_type) this.filter_type = parameters.filter_type;
            if (parameters.filters) this.filters = parameters.filters;
            if (parameters.filters) this.germline_labels = GermlineLabels[this.filters.host_species]
        }
        // Select template
        if (EnvironmentConfig.airrkb.filter.layout == "horizontal") {this.template = this.templates.horizontal;}
        if (EnvironmentConfig.airrkb.filter.layout == "vertical") {this.template = this.templates.vertical;}
        if (EnvironmentConfig.airrkb.filter.layout == "horizontal-ig") {this.template = this.templates.horizontal_ig;}
        if (EnvironmentConfig.airrkb.filter.layout == "vertical-ig") {this.template = this.templates.vertical_ig;}
        if (parameters.summary) {this.template = this.templates.summary}

        this.genotype_alleles = [];
    },

    templateContext() {
        if (!this.controller) return {};

        if(this.filters.host_species) {
            switch(this.filters.receptor_type) {
                case 'alpha-beta':
                    if(this.germline_labels.TRA) this.genotype_alleles.push(...Object.values(this.germline_labels.TRA.V.allele));
                    if(this.germline_labels.TRA) this.genotype_alleles.push(...Object.values(this.germline_labels.TRA.J.allele));
                    if(this.germline_labels.TRB) this.genotype_alleles.push(...Object.values(this.germline_labels.TRB.V.allele));
                    if(this.germline_labels.TRB) this.genotype_alleles.push(...Object.values(this.germline_labels.TRB.J.allele));
                    break;
                case 'gamma-delta':
                    if(this.germline_labels.TRG) this.genotype_alleles.push(...Object.values(this.germline_labels.TRG.V.allele));
                    if(this.germline_labels.TRG) this.genotype_alleles.push(...Object.values(this.germline_labels.TRG.J.allele));
                    if(this.germline_labels.TRD) this.genotype_alleles.push(...Object.values(this.germline_labels.TRD.V.allele));
                    if(this.germline_labels.TRD) this.genotype_alleles.push(...Object.values(this.germline_labels.TRD.J.allele));
                    break;
                case 'heavy-kl':
                    if(this.germline_labels.IGH) this.genotype_alleles.push(...Object.values(this.germline_labels.IGH.V.allele));
                    if(this.germline_labels.IGH) this.genotype_alleles.push(...Object.values(this.germline_labels.IGH.J.allele));
                    if(this.germline_labels.IGK) this.genotype_alleles.push(...Object.values(this.germline_labels.IGK.V.allele));
                    if(this.germline_labels.IGK) this.genotype_alleles.push(...Object.values(this.germline_labels.IGK.J.allele));
                    if(this.germline_labels.IGL) this.genotype_alleles.push(...Object.values(this.germline_labels.IGL.V.allele));
                    if(this.germline_labels.IGL) this.genotype_alleles.push(...Object.values(this.germline_labels.IGL.J.allele));
                    break;
                case 'heavy-kappa':
                    if(this.germline_labels.IGH) this.genotype_alleles.push(...Object.values(this.germline_labels.IGH.V.allele));
                    if(this.germline_labels.IGH) this.genotype_alleles.push(...Object.values(this.germline_labels.IGH.J.allele));
                    if(this.germline_labels.IGK) this.genotype_alleles.push(...Object.values(this.germline_labels.IGK.V.allele));
                    if(this.germline_labels.IGK) this.genotype_alleles.push(...Object.values(this.germline_labels.IGK.J.allele));
                    break;
                case 'heavy-lambda':
                    if(this.germline_labels.IGH) this.genotype_alleles.push(...Object.values(this.germline_labels.IGH.V.allele));
                    if(this.germline_labels.IGH) this.genotype_alleles.push(...Object.values(this.germline_labels.IGH.J.allele));
                    if(this.germline_labels.IGL) this.genotype_alleles.push(...Object.values(this.germline_labels.IGL.V.allele));
                    if(this.germline_labels.IGL) this.genotype_alleles.push(...Object.values(this.germline_labels.IGL.J.allele));
                    break;
            }
        }

        return {
            filters: this.filters,
            species: this.getSpeciesFromID(this.filters['host_species']),
            germline_labels: this.germline_labels,
            genotype_alleles: this.genotype_alleles
        }

    },

    onAttach() {
        $('.selectpicker').selectpicker();
       
        // Repertoire section
        // --- Tissue ---
        var that = this;
        $('#filter-query-tissue').autoComplete({
            minLength: 1,
            preventEnter: true,
            resolver: 'custom',
            events: {
                search: function(qry, callback) {
                    var results = [];
                    for (var i = 0; i < that.controller.controller.tissueOntology.models.length; ++i) {
                        var tissue = that.controller.controller.tissueOntology.models[i];
                        if (tissue.get('term_label').toLocaleLowerCase().indexOf(qry.toLocaleLowerCase()) >= 0)
                            results.push({value: i, id: tissue.get('term_id'), text: tissue.get('term_label')});
                    }
                    callback(results);
                },
            }
        });
        if (this.filters.tissue)
            if (this.filters.tissue.label)
                $('#filter-query-tissue').autoComplete('set', {
                    id: this.filters.tissue.id,
                    text: this.filters.tissue.label,
                    value: this.filters.tissue.label
                });
        
        // --- Disease ---
        var that = this;
        $('#filter-query-disease').autoComplete({
            minLength: 1,
            preventEnter: true,
            resolver: 'custom',
            events: {
                search: function(qry, callback) {
                    var results = [];
                    for (var i = 0; i < that.controller.controller.diseaseOntology.models.length; ++i) {
                        var disease = that.controller.controller.diseaseOntology.models[i];
                        if (disease.get('term_label').toLocaleLowerCase().indexOf(qry.toLocaleLowerCase()) >= 0)
                            results.push({value: i, id: disease.get('term_id'), text: disease.get('term_label')});
                    }
                    callback(results);
                },
            }
        });
        if (this.filters.disease)
            if (this.filters.disease.label)
                $('#filter-query-disease').autoComplete('set', {
                    id: this.filters.disease.id,
                    text: this.filters.disease.label,
                    value: this.filters.disease.label
                });
            
        // --- Assay ---
        var that = this;
        $('#filter-query-assay-type').autoComplete({
            minLength: 1,
            preventEnter: true,
            resolver: 'custom',
            events: {
                search: function(qry, callback) {
                    var results = [];
                    for (var i = 0; i < that.controller.controller.assayTypeOntology.models.length; ++i) {
                        var assayType = that.controller.controller.assayTypeOntology.models[i];
                        if (assayType.get('term_label').toLocaleLowerCase().indexOf(qry.toLocaleLowerCase()) >= 0)
                            results.push({value: i, id: assayType.get('term_id'), text: assayType.get('term_label')});
                    }
                    callback(results);
                },
            }
        });
        if (this.filters.assayType)
            if (this.filters.assayType.label)
                $('#filter-query-assay-type').autoComplete('set', {
                    id: this.filters.assayType.id,
                    text: this.filters.assayType.label,
                    value: this.filters.assayType.label
                });

        // Antigen
        // --- Organism ---
        var that = this;
        $('#filter-query-antigen-organism').autoComplete({
            minLength: 1,
            preventEnter: true,
            resolver: 'custom',
            events: {
                search: function(qry, callback) {
                    var results = [];
                    for (var i = 0; i < that.controller.controller.antigenOrganismOntology.models.length; ++i) {
                        var antigen_organism = that.controller.controller.antigenOrganismOntology.models[i];
                        if (antigen_organism.get('term_label').toLocaleLowerCase().indexOf(qry.toLocaleLowerCase()) >= 0)
                            results.push({value: i, id: antigen_organism.get('term_id'), text: antigen_organism.get('term_label')});
                    }
                    callback(results);
                },
            }
        });
        if (this.filters.antigen_organism)
            if (this.filters.antigen_organism.label)
                $('#filter-query-antigen-organism').autoComplete('set', {
                    id: this.filters.antigen_organism.id,
                    text: this.filters.antigen_organism.label,
                    value: this.filters.antigen_organism.label
                });
        
        // --- MHC restriction ---
        var that = this;
        $('#filter-query-mhc').autoComplete({
            minLength: 1,
            preventEnter: true,
            resolver: 'custom',
            events: {
                search: function(qry, callback) {
                    var results = [];
                    for (var i = 0; i < that.controller.controller.mhcOntology.models.length; ++i) {
                        var mhc = that.controller.controller.mhcOntology.models[i];
                        if (mhc.get('term_label').toLocaleLowerCase().indexOf(qry.toLocaleLowerCase()) >= 0)
                            results.push({value: i, id: mhc.get('term_id'), text: mhc.get('term_label')});
                    }
                    callback(results);
                },
            }
        });
        if (this.filters.mhc)
            if (this.filters.mhc.label)
                $('#filter-query-mhc').autoComplete('set', {
                    id: this.filters.mhc.id,
                    text: this.filters.mhc.label,
                    value: this.filters.mhc.label
                });
    },

    events: {
        //
        // Events for the primary search fields
        //

        // when user clicks search button
        'click #filter-query-apply': function(e) {
            if(EnvironmentConfig.debug.airrkb) console.log('apply filter');
            this.controller.applyFilter(this.extractFilters());
            // $('#airrkb-download').removeAttr('disabled');
        },

        // when user clicks clear button
        'click #filter-query-clear': function(e) {
            this.controller.clearFilter();
            this.controller.show_filter = 'true';
            // $('#airrkb-download').attr('disabled', true);
        },

        // when user needs example AIRRKB
        'click #filter-query-apply-airrkb-example': function(e) {
            let receptor_type = $('#filter-query-chain-selectpicker').val();
            let species = $('#filter-query-species-selectpicker').val();
            var examples = EnvironmentConfig.airrkb.examples[receptor_type][species];
            if (!examples) return;
            if (examples.length == 0) return;

            var randIdx = Math.floor(Math.random() * examples.length);
            this.filters = examples[randIdx];
            this.controller.clearFilter();
            this.controller.applyFilter(this.filters, true);
        },

        'change #filter-query-chain-selectpicker': function(e) {
            this.controller.clearFilter();
            this.controller.switchFilter("receptor_type", $(e.target).val());
            this.controller.showFilter();
        },

        'change #filter-query-species-selectpicker': function(e) {
            let species = $(e.target).val();
            if (species == 'any') species = null;
            this.controller.clearFilter();
            this.controller.switchFilter("host_species", species);
            this.controller.showFilter();
        },


        'changed.bs.select #filter-query-genotype-allele-selectpicker': function (e, clickedIndex, isSelected) {
            var $el = $('#filter-query-genotype-allele-selectpicker');
            var $any = $el.find('optgroup[label="All"] option[value="any"]');
            var $alleles = $el.find('optgroup[label="Allele"] option');

            // handles specific option
            if (clickedIndex != null)
                if ($el[0].options[clickedIndex].value === 'any' && isSelected)
                    $alleles.prop('selected', false);

            // handles select/deselect all
            var hasAllelesSelected = $alleles.filter(':selected').length > 0;
            $any.prop('selected', !hasAllelesSelected);

            $el.selectpicker('refresh');
        },

        'autocomplete.select': function(e, item) {
            switch(e.target.id) {
                case 'filter-query-tissue':
                    if (item) this.filters.tissue = {"label":item.text, "id":item.id};
                    else this.filters.tissue = {"label": null, "id":null};
                    break;
                case 'filter-query-disease':
                    if (item) this.filters.disease = {"label":item.text, "id":item.id};
                    else this.filters.disease = {"label":null, "id":null};
                    break;
                case 'filter-query-assay-type':
                    if (item) this.filters.assayType = {"label":item.text, "id":item.id};
                    else this.filters.assayType = {"label":null, "id":null};
                    break;
                case 'filter-query-antigen-organism':
                    if (item) this.filters.antigen_organism = {"label":item.text, "id":item.id};
                    else this.filters.antigen_organism = {"label":null, "id":null};
                    break;
                case 'filter-query-mhc':
                    if (item) this.filters.mhc = {"label":item.text, "id":item.id};
                    else this.filters.mhc = {"label":null, "id":null};
                    break;
                default:
                    if(EnvironmentConfig.debug.airrkb) console.log(e.target.id, ' not added to autcomplete.select event; item not added: ',  item)
            }
        }
    },

    // construct filters from view state
    extractFilters() {
        var filters = { 
            "receptor_type": null, "host_species": null, "junction1": null, "v1": null, "j1": null, "junction2": null, "v2": null, "j2": null,
            "epitope_sequence_aa": null, "genotype_allele_set": [], 'full_text_search': null, 'publication': null
        };

        // --- Receptor ---

        filters['receptor_type'] = $('#filter-query-chain-selectpicker').val();
        var host_species = $('#filter-query-species-selectpicker').val();
        if (host_species != 'any') filters['host_species'] = host_species;
        filters['paired_chain_only'] = $('#paired-chain-only')[0].checked;

        if (filters['receptor_type'] == 'alpha-beta') {
            var junction1 = $('#alpha-junction').val();
            if (junction1.length > 0) filters['junction1'] = junction1.toUpperCase();
            var v1 = $('#alpha-v-selectpicker').val()
            if (v1 != 'any') {
                filters['v1'] = v1;
                filters['v1_optgroup'] = $('#alpha-v-selectpicker').find(':selected').parent('optgroup').attr('label');
            }
            var j1 = $('#alpha-j-selectpicker').val()
            if (j1 != 'any') {
                filters['j1'] = j1;
                filters['j1_optgroup'] = $('#alpha-j-selectpicker').find(':selected').parent('optgroup').attr('label');
            }

            var junction2 = $('#beta-junction').val();
            if (junction2.length > 0) filters['junction2'] = junction2.toUpperCase();
            var v2 = $('#beta-v-selectpicker').val()
            if (v2 != 'any') {
                filters['v2'] = v2;
                filters['v2_optgroup'] = $('#beta-v-selectpicker').find(':selected').parent('optgroup').attr('label');
            }
            var j2 = $('#beta-j-selectpicker').val()
            if (j2 != 'any') {
                filters['j2'] = j2;
                filters['j2_optgroup'] = $('#beta-j-selectpicker').find(':selected').parent('optgroup').attr('label');
            }
        } else if (filters['receptor_type'] == 'gamma-delta') {
            var junction1 = $('#gamma-junction').val();
            if (junction1.length > 0) filters['junction1'] = junction1.toUpperCase();
            var v1 = $('#gamma-v-selectpicker').val()
            if (v1 != 'any') {
                filters['v1'] = v1;
                filters['v1_optgroup'] = $('#gamma-v-selectpicker').find(':selected').parent('optgroup').attr('label');
            }
            var j1 = $('#gamma-j-selectpicker').val()
            if (j1 != 'any') {
                filters['j1'] = j1;
                filters['j1_optgroup'] = $('#gamma-j-selectpicker').find(':selected').parent('optgroup').attr('label');
            }

            var junction2 = $('#delta-junction').val();
            if (junction2.length > 0) filters['junction2'] = junction2.toUpperCase();
            var v2 = $('#delta-v-selectpicker').val()
            if (v2 != 'any') {
                filters['v2'] = v2;
                filters['v2_optgroup'] = $('#delta-v-selectpicker').find(':selected').parent('optgroup').attr('label');
            }
            var j2 = $('#delta-j-selectpicker').val()
            if (j2 != 'any') {
                filters['j2'] = j2;
                filters['j2_optgroup'] = $('#delta-j-selectpicker').find(':selected').parent('optgroup').attr('label');
            }
        } else if (filters['receptor_type'] == 'heavy-kl') {
            var junction1 = $('#heavy-junction').val();
            if (junction1.length > 0) filters['junction1'] = junction1.toUpperCase();
            var v1 = $('#heavy-v-selectpicker').val()
            if (v1 != 'any') {
                filters['v1'] = v1;
                filters['v1_optgroup'] = $('#heavy-v-selectpicker').find(':selected').parent('optgroup').attr('label');
            }
            var j1 = $('#heavy-j-selectpicker').val()
            if (j1 != 'any') {
                filters['j1'] = j1;
                filters['j1_optgroup'] = $('#heavy-j-selectpicker').find(':selected').parent('optgroup').attr('label');
            }

            var junction2 = $('#kl-junction').val();
            if (junction2.length > 0) filters['junction2'] = junction2.toUpperCase();
            var v2 = $('#kl-v-selectpicker').val()
            if (v2 != 'any') {
                filters['v2'] = v2;
                filters['v2_optgroup'] = $('#kl-v-selectpicker').find(':selected').parent('optgroup').attr('label');
            }
            var j2 = $('#kl-j-selectpicker').val()
            if (j2 != 'any') {
                filters['j2'] = j2;
                filters['j2_optgroup'] = $('#kl-j-selectpicker').find(':selected').parent('optgroup').attr('label');
            }
        } else if (filters['receptor_type'] == 'heavy-kappa') {
            var junction1 = $('#heavy-junction').val();
            if (junction1.length > 0) filters['junction1'] = junction1.toUpperCase();
            var v1 = $('#heavy-v-selectpicker').val()
            if (v1 != 'any') {
                filters['v1'] = v1;
                filters['v1_optgroup'] = $('#heavy-v-selectpicker').find(':selected').parent('optgroup').attr('label');
            }
            var j1 = $('#heavy-j-selectpicker').val()
            if (j1 != 'any') {
                filters['j1'] = j1;
                filters['j1_optgroup'] = $('#heavy-j-selectpicker').find(':selected').parent('optgroup').attr('label');
            }

            var junction2 = $('#kappa-junction').val();
            if (junction2.length > 0) filters['junction2'] = junction2.toUpperCase();
            var v2 = $('#kappa-v-selectpicker').val()
            if (v2 != 'any') {
                filters['v2'] = v2;
                filters['v2_optgroup'] = $('#kappa-v-selectpicker').find(':selected').parent('optgroup').attr('label');
            }
            var j2 = $('#kappa-j-selectpicker').val()
            if (j2 != 'any') {
                filters['j2'] = j2;
                filters['j2_optgroup'] = $('#kappa-j-selectpicker').find(':selected').parent('optgroup').attr('label');
            }
        } else if (filters['receptor_type'] == 'heavy-lambda') {
            var junction1 = $('#heavy-junction').val();
            if (junction1.length > 0) filters['junction1'] = junction1.toUpperCase();
            var v1 = $('#heavy-v-selectpicker').val()
            if (v1 != 'any') {
                filters['v1'] = v1;
                filters['v1_optgroup'] = $('#heavy-v-selectpicker').find(':selected').parent('optgroup').attr('label');
            }
            var j1 = $('#heavy-j-selectpicker').val()
            if (j1 != 'any') {
                filters['j1'] = j1;
                filters['j1_optgroup'] = $('#heavy-j-selectpicker').find(':selected').parent('optgroup').attr('label');
            }

            var junction2 = $('#lambda-junction').val();
            if (junction2.length > 0) filters['junction2'] = junction2.toUpperCase();
            var v2 = $('#lambda-v-selectpicker').val()
            if (v2 != 'any') {
                filters['v2'] = v2;
                filters['v2_optgroup'] = $('#lambda-v-selectpicker').find(':selected').parent('optgroup').attr('label');
            }
            var j2 = $('#lambda-j-selectpicker').val()
            if (j2 != 'any') {
                filters['j2'] = j2;
                filters['j2_optgroup'] = $('#lambda-j-selectpicker').find(':selected').parent('optgroup').attr('label');
            }
        }

        // --- Antigen ---
        if ($('#filter-query-antigen-organism').val().length === 0) this.filters.antigen_organism = {'label':null, 'id':null};
        else if (this.filters.mhc) filters['antigen_organism'] = this.filters.antigen_organism;
        var epitope_sequence_aa = $('#filter-query-epitope-sequence-aa').val();
        if (epitope_sequence_aa.length > 0) filters['epitope_sequence_aa'] = epitope_sequence_aa.toUpperCase();
        if ($('#filter-query-mhc').val().length === 0) this.filters.mhc = {'label':null, 'id':null};
        else if (this.filters.mhc) filters['mhc'] = this.filters.mhc;

        // --- Data ---
        var full_text_search = $('#filter-query-text-search').val();
        if (full_text_search.length > 0) filters['full_text_search'] = full_text_search;
        
        // --- Repertoire ---
        if ($('#filter-query-tissue').val().length === 0) this.filters.tissue = {'label':null, 'id':null};
        else if (this.filters.tissue) filters['tissue'] = this.filters.tissue;
        if ($('#filter-query-disease').val().length === 0) this.filters.disease = {'label':null, 'id':null};
        else if (this.filters.disease) filters['disease'] = this.filters.disease;
        if ($('#filter-query-assay-type').val().length === 0) this.filters.assayType = {'label':null, 'id':null};
        else if (this.filters.assayType) filters['assay_type'] = this.filters.assayType;
        var publication = $('#filter-query-publication').val().replace(/\s/g, "");
        if (publication.length > 0) filters['publication'] = publication;
        var genotype_allele_set = $('#filter-query-genotype-allele-selectpicker').val();
        if (genotype_allele_set[0] != 'any') filters['genotype_allele_set'] = genotype_allele_set;

        this.filters = filters;
        return this.filters;
    },


    getSpeciesFromID: function(id){
        if (id === null) 
            return 'Any';

        // Temporary until germline label is fixed
        if (id === 'NCBITAXON:10090')
            return 'Mouse';

        for (const [species, strains] of Object.entries(EnvironmentConfig.species)) {
            for (const strain of strains) {
                if(strain['id'] === id) {
                    return String(species).charAt(0).toLocaleUpperCase() + String(species).slice(1);  // Exit immediately
                }
            }
        }
        
        return 'Not found';
    }
});

