
'use strict';

//
// agave-metadata-collections.js
// AIRR Repertoire metadata collections
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

import { Repertoire, Subject, SampleProcessing, DataProcessing } from 'Scripts/models/agave-metadata';

import { Comparators } from 'Scripts/collections/mixins/comparators-mixin';
import { FileTransfers } from 'Scripts/models/mixins/file-transfer-mixins';

export var RepertoireCollection = Agave.MetadataCollection.extend(
    _.extend({}, Comparators.reverseChronologicalCreatedTime, FileTransfers, {
        model: Repertoire,
        initialize: function(models, parameters) {
            Agave.MetadataCollection.prototype.initialize.apply(this, [models, parameters]);

            this.sort_by = 'repertoire_name';
            this.comparator = this.collectionSortBy;
        },
        url: function() {
            return '/project/' + this.projectUuid + '/metadata/name/repertoire';
/*            return '/meta/v2/data?q='
                   + encodeURIComponent('{"name":"repertoire","associationIds":"' + this.projectUuid + '"}')
                   + '&limit=' + this.limit
                   + '&offset=' + this.offset
                   ; */
        },

        collectionSortBy(modela, modelb) {
            if (!this.sort_by) this.sort_by = 'repertoire_name';
            switch (this.sort_by) {
                case 'repertoire_name': {
                    let sub_a = modela.get('value').repertoire_name;
                    let sub_b = modelb.get('value').repertoire_name;
                    if (sub_a > sub_b) return 1;
                    if (sub_a < sub_b) return -1;
                    return 0;
                }
                case 'subject_id': {
                    let sub_a = modela.get('value').subject;
                    sub_a = sub_a.get('value').subject_id;
                    let sub_b = modelb.get('value').subject;
                    sub_b = sub_b.get('value').subject_id;
                    if (sub_a > sub_b) return 1;
                    if (sub_a < sub_b) return -1;
                    return 0;
                }
                case 'sample_id': {
                    let sub_a = modela.get('value').sample;
                    if (sub_a.length > 0) {
                        sub_a = sub_a.at(0);
                        sub_a = sub_a.get('value').sample_id;
                    } else sub_a = null;
                    let sub_b = modelb.get('value').sample;
                    if (sub_b.length > 0) {
                        sub_b = sub_b.at(0);
                        sub_b = sub_b.get('value').sample_id;
                    } else sub_b = null;
                    if (sub_a > sub_b) return 1;
                    if (sub_a < sub_b) return -1;
                    return 0;
                }
                case 'tissue': {
                    let sub_a = modela.get('value').sample;
                    if (sub_a.length > 0) {
                        sub_a = sub_a.at(0);
                        sub_a = sub_a.get('value').tissue;
                        if (sub_a) sub_a = sub_a['label'];
                    } else sub_a = null;
                    let sub_b = modelb.get('value').sample;
                    if (sub_b.length > 0) {
                        sub_b = sub_b.at(0);
                        sub_b = sub_b.get('value').tissue;
                        if (sub_b) sub_b = sub_b['label'];
                    } else sub_b = null;
                    if (sub_a > sub_b) return 1;
                    if (sub_a < sub_b) return -1;
                    return 0;
                }
                case 'disease_state_sample': {
                    let sub_a = modela.get('value').sample;
                    if (sub_a.length > 0) {
                        sub_a = sub_a.at(0);
                        sub_a = sub_a.get('value').disease_state_sample;
                    } else sub_a = null;
                    let sub_b = modelb.get('value').sample;
                    if (sub_b.length > 0) {
                        sub_b = sub_b.at(0);
                        sub_b = sub_b.get('value').disease_state_sample;
                    } else sub_b = null;
                    if (sub_a > sub_b) return 1;
                    if (sub_a < sub_b) return -1;
                    return 0;
                }
                case 'cell_subset': {
                    let sub_a = modela.get('value').sample;
                    if (sub_a.length > 0) {
                        sub_a = sub_a.at(0);
                        sub_a = sub_a.get('value').cell_subset;
                        if (sub_a) sub_a = sub_a['label'];
                    } else sub_a = null;
                    let sub_b = modelb.get('value').sample;
                    if (sub_b.length > 0) {
                        sub_b = sub_b.at(0);
                        sub_b = sub_b.get('value').cell_subset;
                        if (sub_b) sub_b = sub_b['label'];
                    } else sub_b = null;
                    if (sub_a > sub_b) return 1;
                    if (sub_a < sub_b) return -1;
                    return 0;
                }
            }
        },

/*
        createExportFile: function() {
            var jqxhr = $.ajax({
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'GET',
                url: EnvironmentConfig.vdjApi.hostname
                    + '/projects/' + this.projectUuid + '/metadata/export'
                    + '?format=JSON&type=subject',
            });

            return jqxhr;
        },

        downloadExportFileToDisk: function() {
            var url = EnvironmentConfig.agave.hostname
                    + '/files'
                    + '/v2'
                    + '/media'
                    + '/system'
                    + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname
                    + '//projects/' + this.projectUuid + '/deleted/subject_metadata.tsv'
                    ;

            var jqxhr = this.downloadUrlByPostit(url);

            return jqxhr;
        },

        importFromFile: function(file, op) {
            var value = file.get('value');

            var jqxhr = $.ajax({
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    fileUuid: file.get('uuid'),
                    fileName: value.name,
                    operation: op,
                    type: 'subject'
                }),
                url: EnvironmentConfig.vdjApi.hostname
                    + '/projects/' + this.projectUuid + '/metadata/import'
            });

            return jqxhr;
        }, */
    })
);

export var SubjectCollection = Agave.MetadataCollection.extend(
    _.extend({}, Comparators.reverseChronologicalCreatedTime, FileTransfers, {
        model: Subject,
        initialize: function(models, parameters) {
            Agave.MetadataCollection.prototype.initialize.apply(this, [models, parameters]);

            this.sort_by = 'subjectid';
            this.comparator = this.collectionSortBy;
        },
        url: function() {
            return '/project/' + this.projectUuid + '/metadata/name/subject';
/*            return '/meta/v2/data?q='
                   + encodeURIComponent('{"name":"subject","associationIds":"' + this.projectUuid + '"}')
                   + '&limit=' + this.limit
                   + '&offset=' + this.offset
                   ; */
        },

        checkDuplicates() {
            var duplicates = this.clone();
            duplicates.reset();
            for (let i = 0; i < this.length; ++i) {
                var modeli = this.at(i);
                var valuei = modeli.get('value');
                for (let j = i+1; j < this.length; ++j) {
                    var modelj = this.at(j);
                    var valuej = modelj.get('value');
                    if (valuei['subject_id'] == valuej['subject_id']) {
                        duplicates.add(modeli);
                        duplicates.add(modelj);
                    }
                }
            }
            return duplicates;
        },

        collectionSortBy(modela, modelb) {
            if (!this.sort_by) this.sort_by = 'subjectid';
            switch (this.sort_by) {
                case 'subjectid': {
                    let sub_a = modela.get('value').subject_id;
                    let sub_b = modelb.get('value').subject_id;
                    if(sub_a>sub_b) return 1;
                    if(sub_a<sub_b) return -1;
                    return 0;
                }
                case 'sex': {
                    let sub_a = modela.get('value').sex;
                    let sub_b = modelb.get('value').sex;
                    if(sub_a>sub_b) return 1;
                    if(sub_a<sub_b) return -1;
                    return 0;
                }
                case 'age': {
                    let sub_a_max = modela.get('value').age_max;
                    let sub_a_min = modela.get('value').age_min;
                    let sub_b_max = modelb.get('value').age_max;
                    let sub_b_min = modelb.get('value').age_min;
                    let sub_a = (sub_a_max + sub_a_min)/2;
                    let sub_b = (sub_b_max + sub_b_min)/2;
                    //hour, day, week, month, year
                    let sub_a_hours = this.toHours(modela.get('value').age_unit.id,sub_a);
                    let sub_b_hours = this.toHours(modelb.get('value').age_unit.id,sub_b);
                    if(sub_a_hours>sub_b_hours) return 1;
                    if(sub_a_hours<sub_b_hours) return -1;
                    return 0;
                }
            }
        },

        toHours(time_unit, age) {
            var hours = 0;
            switch(time_unit) {
                case 'UO:0000032': { //hour
                    hours = age;
                    break;
                }
                case 'UO:0000033': { //day
                    hours = age * 24;
                    break;
                }
                case 'UO:0000034': { //week
                    hours = age * 7 * 24;
                    break;
                }
                case 'UO:0000035': { //month
                    hours = age * (365.25/12) * 24;
                    break;
                }
                case 'UO:0000036': { //year
                    hours = age * 365.25 * 24;
                    break;
                }
            }
            return hours;
        },
    })
);

export var SampleCollection = Agave.MetadataCollection.extend(
    _.extend({}, Comparators.reverseChronologicalCreatedTime, FileTransfers, {
        model: SampleProcessing,
        initialize: function(models, parameters) {
            Agave.MetadataCollection.prototype.initialize.apply(this, [models, parameters]);
        },
        url: function() {
            return '/project/' + this.projectUuid + '/metadata/name/sample_processing';
/*            return '/meta/v2/data?q='
                   + encodeURIComponent('{"name":"sample_processing","associationIds":"' + this.projectUuid + '"}')
                   + '&limit=' + this.limit
                   + '&offset=' + this.offset
                   ; */
        },
        checkDuplicates() {
            var duplicates = this.clone();
            duplicates.reset();
            for (let i = 0; i < this.length; ++i) {
                var modeli = this.at(i);
                var valuei = modeli.get('value');
                for (let j = i+1; j < this.length; ++j) {
                    var modelj = this.at(j);
                    var valuej = modelj.get('value');
                    if (valuei['sample_id'] == valuej['sample_id']) {
                        duplicates.add(modeli);
                        duplicates.add(modelj);
                    }
                }
            }
            return duplicates;
        },

    })
);

export var DataProcessingCollection = Agave.MetadataCollection.extend({
    model: DataProcessing,
    initialize: function(models, parameters) {
        Agave.MetadataCollection.prototype.initialize.apply(this, [models, parameters]);
    },
    url: function() {
        return '/project/' + this.projectUuid + '/metadata/name/data_processing';
/*        return '/meta/v2/data?q='
               + encodeURIComponent('{"name":"data_processing","associationIds":"' + this.projectUuid + '"}')
               + '&limit=' + this.limit
               + '&offset=' + this.offset
               ; */
    },
});

