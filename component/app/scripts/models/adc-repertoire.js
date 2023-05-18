
'use strict';

//
// adc-repertoire.js
// AIRR Repertoire model from AIRR Data Commons
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2020 The University of Texas Southwestern Medical Center
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
import AIRRSchema from 'airr-schema';
import repertoire_template from 'airr-repertoire-template';

// AIRR Repertoire model
//
// This comes back from an ADC query in denormalized form.
//
export var ADCRepertoire = ADC.Model.extend({
    initialize: function(parameters) {
        ADC.Model.prototype.initialize.apply(this, [parameters]);

        // Use AIRR schema Repertoire object as basis
        this.airr_schema = AIRRSchema['Repertoire'];
    },
    url: function() {
        return this.apiHost + ADC.Repositories()[this.repository]['adc_path'] + '/repertoire/' + this.get('repertoire_id');
    },

    // this is not generic but customized for our objects
    getValuesForField(field) {
        var paths = field.split('.');
        if (paths.length == 1) return this.get(paths[0]);
        else {
            switch(paths[0]) {
                case 'study':
                    return this.get('study')[paths[1]];
                case 'subject':
                    return this.get('subject')[paths[1]];
                case 'diagnosis':
                    var subject = this.get('subject');
                    var diagnosis = subject['diagnosis'];
                    if (! diagnosis) return null;
                    if (diagnosis.length == 0) return null;
                    var values = [];
                    for (var d = 0; d < diagnosis.length; ++d) {
                        var obj = diagnosis[d][paths[1]];
                        if (obj == null) continue;
                        if (typeof obj === 'object') {
                            // assume it is an ontology field
                            if (obj['id'] == null) continue;
                            let found = false;
                            for (var k = 0; k < values.length; ++k) {
                                if (values[k]['id'] == obj['id']) {
                                    found = true;
                                    break;
                                }
                            }
                            if (! found) values.push(obj);
                        } else {
                            // plain value
                            if (values.indexOf(obj) < 0) values.push(obj);
                        }
                    }
                    if (values.length == 0) return null;
                    return values;
                case 'sample':
                case 'data_processing':
                    return null;
                case 'repertoire':
                    return null;
                default:
                    return null;
            }
        }
    },
});

export var ADCStudy = ADC.Model.extend({

    // this is not generic but customized for our objects
    getValuesForField(field) {
        var values = [];
        var paths = field.split('.');
        if (paths.length != 2) return values; // what are you asking for?

        switch(paths[0]) {
            case 'study':
                var study = this.get('study');
                var value = study.get('value');
                var obj = value[paths[1]];
                if (obj == null) return values;
                if (typeof obj === 'object') {
                    // assume it is an ontology field
                    if (obj['id'] == null) return values;
                    let found = false;
                    for (var k = 0; k < values.length; ++k) {
                        if (values[k]['id'] == obj['id']) {
                            found = true;
                            break;
                        }
                    }
                    if (! found) values.push(obj);
                } else {
                    // plain value
                    if (values.indexOf(obj) < 0) values.push(obj);
                }
                break;
            case 'subject':
                var subjects = this.get('subjects');
                for (var j = 0; j < subjects.length; ++j) {
                    var subject_model = subjects.at(j);
                    var value = subject_model.get('value');
                    var obj = value[paths[1]];
                    if (obj == null) return values;
                    if (typeof obj === 'object') {
                        // assume it is an ontology field
                        if (obj['id'] == null) return values;
                        let found = false;
                        for (var k = 0; k < values.length; ++k) {
                            if (values[k]['id'] == obj['id']) {
                                found = true;
                                break;
                            }
                        }
                        if (! found) values.push(obj);
                    } else {
                        // plain value
                        if (values.indexOf(obj) < 0) values.push(obj);
                    }
                }
                break;
            case 'diagnosis':
                var subjects = this.get('subjects');
                for (var j = 0; j < subjects.length; ++j) {
                    var subject_model = subjects.at(j);
                    var value = subject_model.get('value');
                    var diagnosis = value['diagnosis'];
                    if (diagnosis == null) continue;
                    for (var d = 0; d < diagnosis.length; ++d) {
                        var obj = diagnosis[d][paths[1]];
                        if (obj == null) continue;
                        if (typeof obj === 'object') {
                            // assume it is an ontology field
                            if (obj['id'] == null) continue;
                            let found = false;
                            for (var k = 0; k < values.length; ++k) {
                                if (values[k]['id'] == obj['id']) {
                                    found = true;
                                    break;
                                }
                            }
                            if (! found) values.push(obj);
                        } else {
                            // plain value
                            if (values.indexOf(obj) < 0) values.push(obj);
                        }
                    }
                }
                break;
            case 'sample':
            case 'data_processing':
                return values;
            case 'repertoire':
                return values;
            default:
                return values;
        }
        return values;
    },

});

