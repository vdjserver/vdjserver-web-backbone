
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

export var ADCRepertoireCollection = ADC.Collection.extend({
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

    // apply filters to generate a new collection
    filterCollection(filters) {
        var filtered = new ADCRepertoireCollection();

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
                // if filter value is null, skip
                if (f['value'] == null) continue;

                var value = model.getValueForField(f['field']);
                if (f['value'] == 'null' && value == null) continue;
                if (value != f['value']) {
                    valid = false;
                    break;
                }
            }

            if (valid) filtered.add(model);
        }

        return filtered;
    }
});

export var ADCStudyCollection = ADC.Collection.extend({
    model: Backbone.Model,

    initialize(parameters) {
        this.sort_by = 'study.study_title';
        this.comparator = this.collectionSortBy;
    },

    // The AIRR Repertoire model is in denormalized form with
    // study, subject, and etc., duplicated in each repertoire.
    //
    // This function inserts normalized objects for
    // Study, Subject, SampleProcessing, and DataProcessing
    normalize(repertoires) {
        //this.reset();
        for (var i = 0; i < repertoires.length; ++i) {
            var model = repertoires.at(i);

            // use study_id to separate studies
            // TODO: blank study_id?
            var study = this.get(model.get('study')['study_id']);
            if (! study) {
                study = new Backbone.Model();
                study.set('id', model.get('study')['study_id']);
                study.set('study', new Project({value: model.get('study')}));
                this.add(study);

                study.set('subjects', new Backbone.Collection());
                study.set('samples', new Backbone.Collection());
                study.set('data_processings', new Backbone.Collection());
                study.set('repertoires', new Backbone.Collection());
            }
            var subjects = study.get('subjects');
            var samples = study.get('samples');
            var data_processings = study.get('data_processings');
            var reps = study.get('repertoires');

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
            reps.add(model);
        }

        return this;
    },

    // sort comparator for the collection
    collectionSortBy(modela, modelb) {
        if (!this.sort_by) this.sort_by = 'study.study_title';

        // we have a pre-defined set of sorts
        switch (this.sort_by) {
            case 'study.study_title': {
                let ma = modela.get('study');
                let va = ma.get('value');
                let mb = modelb.get('study');
                let vb = mb.get('value');
                if (va['study_title'].toLowerCase() > vb['study_title'].toLowerCase()) return 1;
                if (va['study_title'].toLowerCase() < vb['study_title'].toLowerCase()) return -1;
                return 0;
            }
            case 'num_repertoires': {
                let ma = modela.get('repertoires');
                let mb = modelb.get('repertoires');
                if (ma.length > mb.length) return -1;
                if (ma.length < mb.length) return 1;
                return 0;
            }
        }
    },

    getValueForField(field) {
        var paths = field.split('.');
        for (var i = 0; i < this.length; ++i) {
            var model = this.at(i);
            if (paths.length == 1) return model.get(paths[0]);
            else {
                switch(paths[0]) {
                    case 'study':
                        return model.get('study')[paths[1]];
                    case 'subject':
                        return model.get('subject')[paths[1]];
                    case 'diagnosis':
                        return null;
                    case 'sample':
                    case 'data_processing':
                        return null;
                    case 'repertoire':
                        return null;
                    default:
                        return null;
                }
            }
        }
        return null;
    },

    countBySubject(field) {
        var counts = {};
        var paths = field.split('.');
        for (var i = 0; i < this.length; ++i) {
            var model = this.at(i);
            var subjects = model.get('subjects');
            for (var j = 0; j < subjects.length; ++j) {
                var subject = subjects.at(j);
                var value = subject.get('value');
                var field = value[paths[1]];
                if (field == null) field = "null";
                var entry = counts[field];
                if (entry == null) counts[field] = 1;
                else counts[field] += 1;
            }
        }
        return counts;
    },

    countByField(field, by_group) {
        var paths = field.split('.');
        switch(paths[0]) {
            case 'study':
                return null;
            case 'subject':
                return this.countBySubject(field);
            case 'diagnosis':
                return null;
            case 'sample':
            case 'data_processing':
                return null;
            case 'repertoire':
                return null;
            default:
                return null;
        }
    },

});
