
'use strict';

//
// comparators-mixins.js
// Backbone collection mixins for sorting models
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

import moment from 'moment';

export var Comparators = {};

Comparators.reverseChronologicalCreatedTime = {};
Comparators.reverseChronologicalCreatedTime.comparator = function(modelA, modelB) {
    var modelAEndDate = moment(modelA.get('created'));
    var modelBEndDate = moment(modelB.get('created'));

    if (modelAEndDate > modelBEndDate) {
        return -1;
    }
    else if (modelBEndDate > modelAEndDate) {
        return 1;
    }

    // Equal
    return 0;
};

Comparators.Name = {};
Comparators.Name.comparator = function(modelA, modelB) {
    var modelAValue = modelA.get('value');
    var modelBValue = modelB.get('value');

    if (modelAValue && modelAValue.name && modelBValue && modelBValue.name) {
        if (modelAValue.name < modelBValue.name) {
            return -1;
        }
        if (modelBValue.name < modelAValue.name) {
            return 1;
        }
    }

    // Equal
    return 0;
};
