
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
import { ADCRepertoire, ADCStudy } from 'Scripts/models/adc-repertoire';

import Project from 'Scripts/models/agave-project';
import { Subject, SampleProcessing, Repertoire } from 'Scripts/models/agave-metadata';

export var ADCRepertoireCollection = ADC.Collection.extend({
    model: ADCRepertoire,
    initialize: function(models, parameters) {
        ADC.Collection.prototype.initialize.apply(this, [models, parameters]);
    },
    url: function() {
        return this.apiHost + ADC.Repositories()[this.repository]['adc_path'] + '/repertoire';
    },

    parse: function(response) {

        if (response && response['Repertoire']) {

            for (var i = 0; i < response['Repertoire'].length; ++i)
                response['Repertoire'][i]['repository'] = this.repository;
            return response['Repertoire'];
        }

        return;
    },

});

export var ADCStudyCollection = ADC.Collection.extend({
    model: ADCStudy,

    initialize(parameters) {
        this.sort_by = 'newest';
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
                study = new ADCStudy({repository: model['repository']});
                study.set('id', model.get('study')['study_id']);
                study.set('study', new Project({value: model.get('study')}));

                study.set('repository', []);
                study.set('repos', new Backbone.Model());
                study.set('repertoires', new Backbone.Collection());
                study.set('subjects', new Backbone.Collection());
                study.set('samples', new Backbone.Collection());
                study.set('data_processings', new Backbone.Collection());
                this.add(study);
            }

            // same study in multiple repositories?
            // we keep a full list, and lists separated by their repository
            var repository_id = repertoires['repository'];
            var repos = study.get('repos');
            var repository = repos.get(repository_id);
            var repo = study.get('repository');
            if (repo.indexOf(repository_id) < 0) {
                // new repository, so add
                repo.push(repository_id);
                repository = new Backbone.Model();
                repos.set(repository_id, repository);
                repository.set('repertoires', new Backbone.Collection());
                repository.set('subjects', new Backbone.Collection());
                repository.set('samples', new Backbone.Collection());
                repository.set('data_processings', new Backbone.Collection());
            }
            var study_reps = study.get('repertoires');
            var repository_reps = repository.get('repertoires');

            var study_subjects = study.get('subjects');
            var subjects = repository.get('subjects');
            var study_samples = study.get('samples');
            var samples = repository.get('samples');
            var study_data_processings = study.get('data_processings');
            var data_processings = repository.get('data_processings');

            // Use subject_id to separate subjects.
            // The subject IDs should be the same across repositories, if not then
            // cannot really collapse and they get double counted
            // TODO: blank subject_id?
            var subject = study_subjects.get(model.get('subject')['subject_id']);
            if (! subject) {
                subject = new Subject({value: model.get('subject')});
                subject.set('id', model.get('subject')['subject_id']);
                subject.set('uuid', model.get('subject')['subject_id']);
                study_subjects.add(subject);
            }
            if (! subjects.get(model.get('subject')['subject_id'])) {
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
                    sample = new SampleProcessing({value: s});
                    if (sp_id) sample.set('id', sp_id);
                    samples.add(sample);
                    study_samples.add(sample);
                }
            }

            // skip data_processing for now

            // TODO: how to handle repertoires?
            study_reps.add(model);
            repository_reps.add(model);
        }

        return this;
    },

    // attach download cache for studies
    attachCacheEntries(cache_entries) {
        for (var i = 0; i < this.length; ++i) {
            var model = this.at(i);
            var study = model.get('study');
            var value = study.get('value');
            var entry = cache_entries.get(value['study_id']);
            if (entry) model.set('study_cache', entry);
        }
        return null;
    },

    // attach count statistics to studies
    attachCountStatistics(rearrangementCounts) {
        for (var i = 0; i < this.length; ++i) {
            var model = this.at(i);
            var repos = model.get('repository');
            for (let j = 0; j < repos.length; ++j) {
                let repo_study = model.get('repos').get(repos[j]);
                let counts = rearrangementCounts[repos[j]];
                let stats = repo_study.get('statistics');
                if (! stats) stats = {};
                let reps = repo_study.get('repertoires');
                var num_rearrangements = 0;
                if (counts) {
                    for (let k = 0; k < reps.length; ++k) {
                        let m = reps.at(k);
                        let s = counts.get(m.get('repertoire_id'))
                        if (s) num_rearrangements += s.get('duplicate_count');
                    }
                }
                stats['num_rearrangements'] = num_rearrangements;
                repo_study.set('statistics', stats);
            }
        }
        return null;
    },

    // sort comparator for the collection
    collectionSortBy(modela, modelb) {
        if (!this.sort_by) this.sort_by = 'newest';

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
            case 'newest': {
                let ma = modela.get('study');
                let va = ma.get('value');
                let mb = modelb.get('study');
                let vb = mb.get('value');
                let da = va['adc_publish_date'];
                if (va['adc_update_date']) da = va['adc_update_date'];
                let db = vb['adc_publish_date'];
                if (vb['adc_update_date']) db = vb['adc_update_date'];

                // nulls always at the back of the line
                if (!da && !db) return 0;
                if (!da) return 1;
                if (!db) return -1;
                let nda = new Date(da);
                let ndb = new Date(db);
                return (ndb > nda) - (ndb < nda);
            }
            case 'oldest': {
                let ma = modela.get('study');
                let va = ma.get('value');
                let mb = modelb.get('study');
                let vb = mb.get('value');
                let da = va['adc_publish_date'];
                if (va['adc_update_date']) da = va['adc_update_date'];
                let db = vb['adc_publish_date'];
                if (vb['adc_update_date']) db = vb['adc_update_date'];

                // nulls always at the back of the line
                if (!da && !db) return 0;
                if (!da) return 1;
                if (!db) return -1;
                let nda = new Date(da);
                let ndb = new Date(db);
                return (nda > ndb) - (nda < ndb);
            }
        }
    },

/*
    // this is not generic but customized for our objects
    getAllUniqueValues(field) {
        var values = [];
        var paths = field.split('.');
        if (paths.length != 2) return values; // what are you asking for?

        // loop through the studies
        for (var i = 0; i < this.length; ++i) {
            var model = this.at(i);

            switch(paths[0]) {
                case 'study':
                    var study = model.get('study');
                    var value = study.get('value');
                    var obj = value[paths[1]];
                    if (obj == null) continue;
                    if (typeof obj === 'object') {
                        // assume it is an ontology field
                        if (obj['id'] == null) continue;
                        let found = false;
                        for (var k = 0; k < values.length; ++k) {
                            if (values[k]['id'] == obj['id']) {
                                found = true;
                                break;
                            }
                        }
                        if (! found) values.push(obj);
                    } else {
                        // plain value
                        if (values.indexOf(obj) < 0) values.push(obj);
                    }
                    break;
                case 'subject':
                    var subjects = model.get('subjects');
                    for (var j = 0; j < subjects.length; ++j) {
                        var subject_model = subjects.at(j);
                        var value = subject_model.get('value');
                        var obj = value[paths[1]];
                        if (obj == null) continue;
                        if (typeof obj === 'object') {
                            // assume it is an ontology field
                            if (obj['id'] == null) continue;
                            let found = false;
                            for (var k = 0; k < values.length; ++k) {
                                if (values[k]['id'] == obj['id']) {
                                    found = true;
                                    break;
                                }
                            }
                            if (! found) values.push(obj);
                        } else {
                            // plain value
                            if (values.indexOf(obj) < 0) values.push(obj);
                        }
                    }
                    break;
                case 'diagnosis':
                    var subjects = model.get('subjects');
                    for (var j = 0; j < subjects.length; ++j) {
                        var subject_model = subjects.at(j);
                        var value = subject_model.get('value');
                        var diagnosis = value['diagnosis'];
                        if (diagnosis == null) continue;
                        for (var d = 0; d < diagnosis.length; ++d) {
                            var obj = diagnosis[d][paths[1]];
                            if (obj == null) continue;
                            if (typeof obj === 'object') {
                                // assume it is an ontology field
                                if (obj['id'] == null) continue;
                                let found = false;
                                for (var k = 0; k < values.length; ++k) {
                                    if (values[k]['id'] == obj['id']) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (! found) values.push(obj);
                            } else {
                                // plain value
                                if (values.indexOf(obj) < 0) values.push(obj);
                            }
                        }
                    }
                    break;
                case 'sample':
                case 'data_processing':
                    return values;
                case 'repertoire':
                    return values;
                default:
                    return values;
            }
        }
        return values;
    }, */

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
