
'use strict';

//
// admins-vdjserver.js
// Backbone collections for VDJServer administration
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

import { ProjectLoad, RearrangementLoad } from 'Scripts/models/admin-vdjserver';
import { Comparators } from 'Scripts/collections/mixins/comparators-mixin';

//export var ProjectLoadCollection = Agave.MetadataCollection.extend(
export var ProjectLoadCollection = Agave.Collection.extend(
    _.extend({}, Comparators.reverseChronologicalCreatedTime, {
        model: ProjectLoad,
        initialize: function(parameters) {
            Agave.Collection.prototype.initialize.apply(this, [parameters]);

            //if (parameters && parameters.projectUuid) {
            if (parameters) {
                this.projectUuid = parameters.projectUuid;
                this.collection = parameters.collection;
                this.shouldLoad = parameters.shouldLoad;
                this.isLoaded = parameters.isLoaded;
                this.repertoireMetadataLoaded = parameters.repertoireMetadataLoaded;
                this.rearrangementDataLoaded = parameters.rearrangementDataLoaded;
            }
        },
        apiHost: EnvironmentConfig.vdjApi.hostname,
        url: function() {
/*            return '/meta/v2/data?q='
                   + encodeURIComponent('{"name":"projectLoad"}')
                   + '&limit=' + this.limit
                   + '&offset=' + this.offset
                   ;
*/
            var mark = false;
            var url = '/admin/project/load';
            if (this.projectUuid != null) {
                if (mark) url += '&';
                else url += '?';
                mark = true;
                url += 'project_uuid=' + this.projectUuid;
            };
            if (this.collection != null) {
                if (mark) url += '&';
                else url += '?';
                mark = true;
                url += 'collection=' + this.collection;
            };
            if (this.shouldLoad != null) {
                if (mark) url += '&';
                else url += '?';
                mark = true;
                url += 'should_load=' + this.shouldLoad;
            };
            if (this.isLoaded != null) {
                if (mark) url += '&';
                else url += '?';
                mark = true;
                url += 'is_loaded=' + this.isLoaded;
            };
            if (this.repertoireMetadataLoaded != null) {
                if (mark) url += '&';
                else url += '?';
                mark = true;
                url += 'repertoire_loaded=' + this.repertoireMetadataLoaded;
            };
            if (this.rearrangementDataLoaded != null) {
                if (mark) url += '&';
                else url += '?';
                mark = true;
                url += 'rearrangement_loaded=' + this.rearrangementDataLoaded;
            };
            return url;
        },
    })
);

//export var RearrangementLoadCollection = Agave.MetadataCollection.extend(
export var RearrangementLoadCollection = Agave.Collection.extend(
    _.extend({}, Comparators.reverseChronologicalCreatedTime, {
        model: ProjectLoad,
        initialize: function(parameters) {
            //Agave.MetadataCollection.prototype.initialize.apply(this, [parameters]);
            Agave.Collection.prototype.initialize.apply(this, [parameters]);

            if (parameters && parameters.projectUuid) {
                this.projectUuid = parameters.projectUuid;
            }
        },
        url: function() {
            return '/meta/v2/data?q='
                   + encodeURIComponent('{"name":"rearrangementLoad"}')
                   + '&limit=' + this.limit
                   + '&offset=' + this.offset
                   ;
        },
    })
);
