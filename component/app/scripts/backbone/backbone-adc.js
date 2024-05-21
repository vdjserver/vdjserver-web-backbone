
'use strict';

//
// backbone-ADC.js
// Core Backbone for AIRR Data Commons
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

import Backbone from 'backbone';
import moment from 'moment';

export var ADC = { };

ADC.Repositories = function() {
    return JSON.parse(JSON.stringify(EnvironmentConfig.adc));
};

// Extension of default Backbone.Model for ADC
ADC.Model = Backbone.Model.extend({
    initialize: function(parameters) {
        this.repository = 'vdjserver';
        if (parameters && parameters.repository) {
            this.repository = parameters.repository;
        }
        if (this.repository) {
            this.apiHost = EnvironmentConfig.adc[this.repository]['hostname'];
        }
    },
    apiHost: EnvironmentConfig.adc['vdjserver']['hostname'],
    requiresAuth: false,

    sync: function(method, model, options) {
        return Backbone.sync(method, model, options);
    },

    // flatten all values into a single string for easy search
    generateFullText: function(context) {
        var text = '';
        if ((typeof context) == 'string') {
            text += ' ' + context;
            return text;
        }
        if (context instanceof Backbone.Model) {
            text += this.generateFullText(context['attributes']);
            return text;
        }
        if (context instanceof Backbone.Collection) {
            for (var i = 0; i < context.length; ++i) {
                let model = context.at(i);
                text += this.generateFullText(model['attributes']);
            }
            return text;
        }
        if ((typeof context) == 'object') {
            for (var o in context)
                text += this.generateFullText(context[o]);
            return text;
        }
        if (Array.isArray(context)) {
            for (var i = 0; i < context.length; ++i)
                text += this.generateFullText(context[i]);
            return text;
        }
    },

    // this is mainly to handle the different types of values
    // whether it be a string, an ontology id, or something else
    addUniqueValue: function(values, obj) {
        if (obj == null) return;
        if (typeof obj === 'object') {
            // assume it is an ontology field
            if (obj['id'] == null) return;
            let found = false;
            for (let k = 0; k < values.length; ++k) {
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
    },
});

// Extension of default Backbone.Collection for ADC
ADC.Collection = Backbone.Collection.extend({
    initialize: function(models, parameters) {
        this.repository = 'vdjserver';
        if (parameters && parameters.repository) {
            this.repository = parameters.repository;
        }
        if (this.repository) {
            this.apiHost = EnvironmentConfig.adc[this.repository]['hostname'];
        }
    },
    apiHost: EnvironmentConfig.adc['vdjserver']['hostname'],
    requiresAuth: false,

    sync: function(method, model, options) {

        switch (method) {

            case 'read':
                options.type = 'POST';
                if (! this.data) options.data = '{}';
                else options.data = JSON.stringify(this.data);
                break;

            case 'create':
                return false;

            case 'update':
                return false;

            case 'delete':
                return false;
        }

        options.headers = {
            'Content-Type': 'application/json',
        };

        return Backbone.sync(method, model, options);
    },

    // unique values used by filters
    getAllUniqueValues(field) {
        let values = [];

        // loop through the models and collect unique values
        for (let i = 0; i < this.length; ++i) {
            var model = this.at(i);
            let obj = model.getValuesForField(field);
            if (!obj) continue;
            if (Array.isArray(obj))
                for (let j = 0; j < obj.length; ++j)
                    model.addUniqueValue(values, obj[j]);
            else
                model.addUniqueValue(values, obj);
        }
        return values;
    },

    // override default clone so we can copy custom attributes
    clone: function() {
        var d = Backbone.Collection.prototype.clone.apply(this);
        d['apiHost'] = this['apiHost'];
        d['repository'] = this['repository'];
        return d;
    },

    // apply filters to generate a new collection
    filterCollection(filters) {
        var filtered = this.clone();
        filtered.reset();
//        var filtered = new RepertoireCollection({projectUuid: this.projectUuid});

        var fts_fields = [];
        if (filters['full_text_search']) fts_fields = filters['full_text_search'].toLowerCase().split(/\s+/);

        for (var i = 0; i < this.length; ++i) {
            var valid = true;
            var model = this.at(i);

            // apply full text search
            if (!model.get('full_text')) {
                var text = model.generateFullText(model['attributes']);
                model.set('full_text', text.toLowerCase());
            }
            for (var j = 0; j < fts_fields.length; ++j) {
                var result = model.get('full_text').indexOf(fts_fields[j]);
                if (result < 0) {
                    valid = false;
                    break;
                }
            }

            // apply individual filters
            for (var j = 0; j < filters['filters'].length; ++j) {
                var f = filters['filters'][j];
                var value = model.getValuesForField(f['field']);
                // handle ontologies versus regular values
                if (f['object']) {
                    if (f['object'] == 'null' && value == null) continue;
                    if (value == null) { valid = false; break; }
                    if (Array.isArray(value)) {
                        // if array then value only needs to be found once
                        let found = false;
                        for (let k = 0; k < value.length; ++k) {
                            if (value[k]['id'] == f['object']) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            valid = false;
                            break;
                        }
                    } else {
                        if (value['id'] != f['object']) {
                            valid = false;
                            break;
                        }
                    }
                } else {
                    // if filter value is null, skip
                    if (f['value'] == null) continue;

                    if (f['value'] == 'null' && value == null) continue;
                    if (value == null) { valid = false; break; }
                    if (Array.isArray(value)) {
                        // if array then value only needs to be found once
                        let found = false;
                        for (let k = 0; k < value.length; ++k) {
                            if (value[k] == f['value']) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            valid = false;
                            break;
                        }
                    } else {
                        if (value != f['value']) {
                            valid = false;
                            break;
                        }
                    }
                }
            }

            if (valid) filtered.add(model);
        }

        return filtered;
    },
});
