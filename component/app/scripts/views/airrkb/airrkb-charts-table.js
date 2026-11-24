//
// airrkb-charts-table.js
// Manages the airrkb data page
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2020 The University of Texas Southwestern Medical Center
//
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
import Handlebars, { template } from 'handlebars';

import airrkb_charts_table_body_template from 'Templates/airrkb/airrkb-charts-table-body.html';
export var AirrkbChartsInfoView = Marionette.View.extend({
    template: Handlebars.compile(airrkb_charts_table_body_template),
    
    initialize(parameters) {
        if (parameters) {
            // our controller
            if (parameters.controller) this.controller = parameters.controller;
            if (parameters.spacing) this.spacing = parameters.spacing;
            if (parameters.fields) this.fields = parameters.fields;
            else this.fields = [];
        }
    },

    templateContext: function() {
        let values = { body1: '', body2: '', body3:'', body4:'', body5:'', body6:'' };
        for (let i = 0; i < this.fields.length; ++i) {
            let f = this.fields[i];
            let fv = this.model.get(f);
            // ontology field?
            if (typeof fv === 'object' && fv !== null && !Array.isArray(fv))
                if (fv['term_label']) fv = fv['term_label'];
            if (f && fv) values['body' + (i + 1)] = fv;
        }
        return {...values, ...this.spacing}
    }
});

import airrkb_charts_table_header_template from 'Templates/airrkb/airrkb-charts-table-header.html';
export var AirrkbChartsInfoViewTable = Marionette.CollectionView.extend({
    template: Handlebars.compile(airrkb_charts_table_header_template),
    childViewContainer: '.airrkb-charts-table-body',
    
    initialize(parameters) {
        if (parameters) {
            // our controller
            if (parameters.controller) this.controller = parameters.controller;
            if (parameters.collection) this.collection = parameters.collection;
            if (parameters.headers) this.headers = parameters.headers;
            if (parameters.spacing) this.spacing = parameters.spacing;
            if (parameters.fields) this.fields = parameters.fields;
            if (parameters.tableName) this.tableName = parameters.tableName;
        }
        this.childView = AirrkbChartsInfoView;
        this.childViewOptions = { controller: this.controller, headers: this.headers, spacing: this.spacing, fields: this.fields};
    },

    templateContext: function() {
        return {...this.headers, ...this.spacing}
    }
});