
'use strict';

//
// adc-cache-collections.js
// Backbone collections for ADC download cache
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2021 The University of Texas Southwestern Medical Center
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
import { StudyCache, RepertoireCache } from 'Scripts/models/adc-cache';

export var StudyCacheCollection = Backbone.Collection.extend({
    model: StudyCache,
    comparator: 'study_id',
    apiHost: EnvironmentConfig.vdjApi.hostname,
    url: function() {
        return this.apiHost + '/adc/cache/study';
    },
    parse: function(response) {
        if (response.result) {
            return response.result;
        }
        return response;
    },
});

export var RepertoireCacheCollection = Backbone.Collection.extend({
    model: RepertoireCache,
    comparator: 'study_id',
    apiHost: EnvironmentConfig.vdjApi.hostname,
    url: function() {
        return this.apiHost + '/adc/cache/repertoire';
    },
    parse: function(response) {
        if (response.result) {
            return response.result;
        }
        return response;
    },
});
