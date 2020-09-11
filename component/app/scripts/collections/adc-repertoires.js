
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
import ADCRepertoire from 'Scripts/models/adc-repertoire';

import Project from 'Scripts/models/agave-project';
import { Subject, Diagnosis, Sample, Repertoire } from 'Scripts/models/agave-metadata';

export default ADC.Collection.extend({
    model: ADCRepertoire,
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

        for (var i = 0; i < this.length; ++i) {
            var model = this.at(i);

            // use study_id to separate studies
            // TODO: blank study_id?
            var study = studies.get(model.get('study')['study_id']);
            if (! study) {
                study = new Backbone.Model();
                study.set('id', model.get('study')['study_id']);
                study.set('study', new Project({value: model.get('study')}));
                studies.add(study);

                study.set('subjects', new Backbone.Collection());
                study.set('samples', new Backbone.Collection());
                study.set('data_processings', new Backbone.Collection());
                study.set('repertoires', new Backbone.Collection());
            }
            var subjects = study.get('subjects');
            var samples = study.get('samples');
            var data_processings = study.get('data_processings');
            var repertoires = study.get('repertoires');

            // use subject_id to separate subjects
            // TODO: blank subject_id?
            var subject = subjects.get(model.get('subject')['subject_id']);
            if (! subject) {
                subject = new Subject({value: model.get('subject')});
                subject.set('id', model.get('subject')['subject_id']);
                subjects.add(subject);
            }

            // use sample_processing_id but it may be blank
            var sample_list = model.get('sample');
            for (var j = 0; j < sample_list.length; ++j) {
                var s = sample_list[j];
                var sp_id = s['sample_processing_id'];
                var sample = null;
                if (sp_id) sample = samples.get(sp_id);
                if (! sample) {
                    sample = new Sample({value: s});
                    if (sp_id) sample.set('id', sp_id);
                    samples.add(sample);
                }
            }

            // skip data_processing for now

            // TODO: how to handle repertoires?
            repertoires.add(model);
        }

        return studies;
    }
});
