
'use strict';

//
// agave-projects.js
// Private projects collection
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
import { Project, PublicProject, ArchivedProject } from 'Scripts/models/agave-project';
import { Comparators } from 'Scripts/collections/mixins/comparators-mixin';

export var ProjectList = Agave.MetadataCollection.extend(
    _.extend({}, Comparators.reverseChronologicalCreatedTime, {
        model: Project,
        apiHost: EnvironmentConfig.vdjApi.hostname,
        url: function() {
            return '/project/metadata';
        },
    })
);

export var PublicProjectCollection = Agave.MetadataCollection.extend(
    _.extend({}, Comparators.reverseChronologicalCreatedTime, {
        model: PublicProject,
        apiHost: EnvironmentConfig.vdjApi.hostname,
        url: function() {
            return '/public/project/metadata';
        },
    })
);
