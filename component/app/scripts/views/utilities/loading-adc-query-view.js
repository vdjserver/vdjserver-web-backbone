//
// loading-adc-query-view.js
// Animated loading message for Community Data Portal
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2024 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
// Author: Olivia Dorsey <olivia.dorsey@utsouthwestern.edu>
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

import Marionette from 'backbone.marionette';
import template from 'Templates/util/loading-adc-query.html';
import Handlebars from 'handlebars';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    initialize(parameters) {
        this.queried_studies = 0;
        this.total_studies = 0;
        if (parameters) {
            if (parameters.queried_studies)
                this.queried_studies = parameters.queried_studies;
            if (parameters.total_studies)
                this.total_studies = parameters.total_studies;
        }
    },

    templateContext() {
        return {
            queried_studies: this.queried_studies,
            total_studies: this.total_studies
        };
    }
});
