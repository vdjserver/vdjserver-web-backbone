
'use strict';

//
// filter-manager.js
// Manage base and custom filters
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2022 The University of Texas Southwestern Medical Center
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

import { Agave } from 'Scripts/backbone/backbone-agave';
import AIRRSchema from 'airr-schema';

export default Agave.MetadataModel.extend({
    filter_type: null,
    base_filters: null,

    defaults: function() {
        return _.extend(
            {},
            Agave.MetadataModel.prototype.defaults,
            {
                name: 'custom_filter',
                value: {
                    filter_type: null,
                    additional: []
                },
            }
        );
    },

    initialize: function(parameters) {
        Agave.MetadataModel.prototype.initialize.apply(this, [parameters]);

        if (parameters && parameters.filter_type) {
            this.filter_type = parameters.filter_type;
        }
        if (! this.filter_type) {
            console.error('No filter name provided for filter manager.');
            return;
        }

        // find filter in environment config
        if (! EnvironmentConfig['filters']) {
            console.error('Cannot find filters in EnvironmentConfig.');
            return;
        }
        if (! EnvironmentConfig['filters'][this.filter_type]) {
            console.error('Cannot find filter name (' + this.filter_type + ') in EnvironmentConfig filters.');
            return;
        }

        let value = this.get('value');
        value['filter_type'] = this.filter_type;
        this.set('value', value);

        // make a deep copy from the config
        this.base_filters = JSON.parse(JSON.stringify(EnvironmentConfig['filters'][this.filter_type]));
        console.log(this.base_filters);

    },

    // custom user filters
    url: function() {
        return '/meta/v2/data?q='
               + encodeURIComponent(
                   '{'
                     + '"name":"custom_filter",'
                     + '"value.filter_type":"' + this.filter_type + '",'
                     + '"owner":' + '"' + Agave.instance.token().get('username') + '"'
                 + '}'
               )
               + '&limit=1'
               ;
    },

    baseFilters: function() {
        return this.base_filters;
    },

    customFilters: function() {
        return [];
    },

    // fill in the values
    // 1. enum from schema
    // 2. values from the data
    // 3. no values
    constructValues: function(collection) {
        // for each filter field
        for (let i in this.base_filters) {
            // enum from schema
            if (this.base_filters[i]['schema']) {
                let object = this.base_filters[i]['schema']['object'];
                let property = this.base_filters[i]['schema']['property'];
                if ((!object) || (!property)) {
                    console.error('Invalid schema object for (' + this.base_filters[i]['title'] + ') in EnvironmentConfig filters.');
                } else {
                    if (AIRRSchema[object]['properties'][property]['enum'])
                        this.base_filters[i]['values'] = AIRRSchema[object]['properties'][property]['enum'];
                    else if (AIRRSchema[object]['properties'][property]['items'])
                        this.base_filters[i]['values'] = AIRRSchema[object]['properties'][property]['items']['enum'];
                }
            }

            // values from the data
            if (this.base_filters[i]['data']) {
                var values = collection.getAllUniqueValues(this.base_filters[i]['field']);
                console.log(values);
                if (values.length > 0) {
                    let entry = values[0];
                    if (typeof entry === 'object') this.base_filters[i]['objects'] = values;
                    else this.base_filters[i]['values'] = values;
                }
                console.log(this.base_filters[i]);
            }
        }

        // for each custom field
    }
});

