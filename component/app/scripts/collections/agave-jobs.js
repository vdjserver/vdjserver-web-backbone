
'use strict';

//
// agave-job.js
// Job models
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2022 The University of Texas Southwestern Medical Center
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
import { AnalysisDocument } from 'Scripts/models/agave-job';
import moment from 'moment';

export var ProjectAnalyses = Agave.MetadataCollection.extend({
    model: AnalysisDocument,
    initialize: function(models, parameters) {

        Agave.MetadataCollection.prototype.initialize.apply(this, [models, parameters]);

        if (parameters && parameters.projectUuid) {
            this.projectUuid = parameters.projectUuid;
        }

        this.sort_by = 'last_updated';
        this.comparator = this.collectionSortBy;
    },
    apiHost: EnvironmentConfig.vdjApi.hostname,
    url: function() {
        return '/project/' + this.projectUuid + '/metadata/name/analysis_document';
    },

    collectionSortBy: function(modela, modelb) {
        if (!this.sort_by) this.sort_by = 'last_updated';
        switch (this.sort_by) {
            case 'workflow_name': {
                let sub_a = modela.get('value').workflow_name;
                let sub_b = modelb.get('value').workflow_name;
                if (sub_a > sub_b) return 1;
                if (sub_a < sub_b) return -1;
                return 0;
            }
            case 'last_updated': {
                let sub_a = modela.get('lastUpdated');
                let sub_b = modelb.get('lastUpdated');
                if (sub_a < sub_b) return 1;
                if (sub_a > sub_b) return -1;
                return 0;
            }
            case 'last_created': {
                let sub_a = modela.get('created');
                let sub_b = modelb.get('created');
                if (sub_a < sub_b) return 1;
                if (sub_a > sub_b) return -1;
                return 0;
            }
            case 'first_created': {
                let sub_a = modela.get('created');
                let sub_b = modelb.get('created');
                if (sub_a > sub_b) return 1;
                if (sub_a < sub_b) return -1;
                return 0;
            }
        }
    },

    // determine appropriate previous analyses that
    // can be used as input for the given activity
    getPreviousAnalyses: function(analysis_name) {
        let newCollection = this.clone();
        newCollection.reset();

        // which analyses can be used as input
        if (EnvironmentConfig.apps[analysis_name]) {
            let input_list = EnvironmentConfig.apps[analysis_name]['vdjserver:activity:inputs'];

            // no defined inputs
            if (!input_list) return newCollection;

            for (let i = 0; i < this.length; i++) {
                let model = this.at(i);
                let value = model.get('value');

                if (value['status'] != 'FINISHED') continue;
                if (input_list.indexOf(value['workflow_mode']) >= 0)
                    newCollection.add(model);
            }
        }

        return newCollection;
    },

});

export var ArchivedAnalyses = ProjectAnalyses.extend({
    url: function() {
        return '/project/' + this.projectUuid + '/metadata/name/archived_analysis';
    },

});

