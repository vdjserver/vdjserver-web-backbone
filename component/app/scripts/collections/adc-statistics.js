
'use strict';

//
// adc-statistics.js
// iR+ statistics for ADC
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
import { ADC } from 'Scripts/backbone/backbone-adc';

import Project from 'Scripts/models/agave-project';
import { Subject, Diagnosis, Sample, Repertoire } from 'Scripts/models/agave-metadata';

export var RearrangementCounts = ADC.Collection.extend({
    model: ADC.Model,
    initialize: function(models, parameters) {

        if (parameters && parameters.repertoires) {
            this.repertoires = parameters.repertoires;
            if (! parameters.repository) parameters['repository'] = this.repertoires.repository;
        }

        ADC.Collection.prototype.initialize.apply(this, [models, parameters]);

        if (this.repertoires) {
            this.data = { repertoires: [], statistics: ["rearrangement_count", "duplicate_count", "rearrangement_count_productive", "duplicate_count_productive"]};

            for (let i = 0; i < this.repertoires.length; ++i) {
            //for (let i = 0; i < 3; ++i) {
                let model = this.repertoires.at(i);
                let obj = { repertoire: { repertoire_id: model.get('repertoire_id') }};
                this.data['repertoires'].push(obj);
            }
        }
    },
    url: function() {
        return this.apiHost + ADC.Repositories()[this.repository]['stats_path'] + '/rearrangement/count';
    },

    parse: function(response) {

        if (response && response['Result']) {
            console.log(response);
            // flatten out the response
            var objs = [];
            for (let i = 0; i < response['Result'].length; ++i) {
                let stat = response['Result'][i];
                // TODO: should be repertoire singular, https://github.com/ireceptor-plus/issues/issues/89
                let obj = {
                    id: stat['repertoires']['repertoire_id'],
                    repertoire_id: stat['repertoires']['repertoire_id'],
                    data_processing_id: stat['repertoires']['data_processing_id'],
                    sample_processing_id: stat['repertoires']['sample_processing_id']
                };
                for (let j = 0; j < stat['statistics'].length; ++j) {
                    obj[stat['statistics'][j]['statistic_name']] = stat['statistics'][j]['total'];
                }
                objs.push(obj);
            }

            return objs;
        }

        return;
    },

});


