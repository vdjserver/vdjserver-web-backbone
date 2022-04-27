
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
    return EnvironmentConfig.adc;
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
});
