
'use strict';

//
// adc-cache.js
// ADC download cache models
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

export var StudyCache = Backbone.Model.extend({
    apiHost: EnvironmentConfig.vdjApi.hostname,
    idAttribute: 'study_id',
    url: function() {
        return this.apiHost + '/adc/cache/study/' + this.get('cache_uuid');
    },
    requiresAuth: false,
});

export var RepertoireCache = Backbone.Model.extend({
    apiHost: EnvironmentConfig.vdjApi.hostname,
    url: function() {
        return this.apiHost + '/adc/cache/repertiore/' + this.get('cache_uuid');
    },
    requiresAuth: false,
});
