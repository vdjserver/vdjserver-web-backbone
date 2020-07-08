
'use strict';

//
// admin-vdjserver.js
// Backbone models for VDJServer administration
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

import { Agave } from 'Scripts/backbone/backbone-agave';

// AIRR Schema
import AIRRSchema from 'airr-schema';
import repertoire_template from 'airr-repertoire-template';

//
// Study loading into the data repository
//

// Project load record
export var ProjectLoad = Agave.MetadataModel.extend({
    defaults: function() {

        return _.extend(
            {},
            Agave.MetadataModel.prototype.defaults,
            {
                name: 'projectLoad',
                value: {}
            }
        );
    },
    initialize: function(parameters) {
        Agave.MetadataModel.prototype.initialize.apply(this, [parameters]);

        if (parameters && parameters.projectUuid) {
            this.projectUuid = parameters.projectUuid;
            this.set('associationIds', [ parameters.projectUuid ]);
        }
    },
    url: function() {
        return '/meta/v2/data/' + this.get('uuid');
    },
    sync: function(method, model, options) {
        return Agave.PutOverrideSync(method, this, options);
    },
});

// Rearrangement load record
export var RearrangementLoad = Agave.MetadataModel.extend({
    defaults: function() {

        return _.extend(
            {},
            Agave.MetadataModel.prototype.defaults,
            {
                name: 'rearrangementLoad',
                value: {}
            }
        );
    },
    initialize: function(parameters) {
        Agave.MetadataModel.prototype.initialize.apply(this, [parameters]);

        if (parameters && parameters.projectUuid) {
            this.projectUuid = parameters.projectUuid;
            this.set('associationIds', [ parameters.projectUuid ]);
        }
    },
    url: function() {
        return '/meta/v2/data/' + this.get('uuid');
    },
    sync: function(method, model, options) {
        return Agave.PutOverrideSync(method, this, options);
    },
});


