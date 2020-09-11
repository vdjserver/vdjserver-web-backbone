
'use strict';

//
// adc-repertoires.js
// AIRR Repertoire collection from ADC query
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
import Repertoire from 'Scripts/models/adc-repertoire';

import Project from 'Scripts/models/agave-project';

export default ADC.Collection.extend({
    model: Repertoire,
    url: function() {
        return this.apiHost + '/repertoire';
    },

    parse: function(response) {

        if (response && response['Repertoire']) {

            return response['Repertoire'];
        }

        return;
    },

    // The AIRR Repertoire model is in denormalized form with
    // study, subject, and etc., duplicated in each repertoire.
    //
    // This function returns normalized VDJServer objects for
    // Study, Subject, SampleProcessing, DataProcessing and Repertoire
    normalize: function() {
        var studies = new Backbone.Collection();

        // use study_id to separate studies
        for (var i = 0; i < this.length; ++i) {
            var model = this.at(i);
            var study = studies.get(model.get('study')['study_id']);
            if (! study) {
                study = new Backbone.Model();
                study.set('id', model.get('study')['study_id']);
                study.set('study', new Project({value: model.get('study')}));
                studies.add(study);
            }
        }

        return studies;
    }
});
