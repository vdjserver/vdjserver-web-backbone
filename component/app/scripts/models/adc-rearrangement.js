
'use strict';

//
// adc-rearrangement.js
// AIRR Rearrangement model from AIRR Data Commons
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2024 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
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

import { ADC } from 'Scripts/backbone/backbone-adc';

// AIRR Schema
import { airr } from 'airr-js';

// AIRR Rearrangement model
//
var rearrangementSchema = null;
export var ADCRearrangement = ADC.Model.extend({
    initialize: function(parameters) {
        ADC.Model.prototype.initialize.apply(this, [parameters]);

        // Use AIRR schema Repertoire object as basis
        if (! rearrangementSchema) rearrangementSchema = new airr.SchemaDefinition('Rearrangement');
        this.schema = rearrangementSchema;
    },
    url: function() {
        return this.apiHost + ADC.Repositories()[this.repository]['adc_path'] + '/rearrangement/' + this.get('sequence_id');
    },

    // this is not generic but customized for our objects
    // rearrangement object is essentially flat
    getValuesForField(field) {
        var paths = field.split('.');
        if (paths.length == 1) return this.get(paths[0]);
        else return null;
    },
});

