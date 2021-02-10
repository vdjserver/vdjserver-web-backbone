//
// loading-adc-view.js
// Animated loading message for Community Data Portal
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2020 The University of Texas Southwestern Medical Center
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
import template from 'Templates/util/loading-adc.html';
import Handlebars from 'handlebars';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    initialize(parameters) {
        this.loaded_repertoires = 0;
        this.loaded_repositories = 0;
        this.total_repositories = 0;
        if (parameters) {
            if (parameters.loaded_repertoires)
                this.loaded_repertoires = parameters.loaded_repertoires;
            if (parameters.loaded_repositories)
                this.loaded_repositories = parameters.loaded_repositories;
            if (parameters.total_repositories)
                this.total_repositories = parameters.total_repositories;
        }
    },

    templateContext() {
        return {
            loaded_repertoires: this.loaded_repertoires,
            loaded_repositories: this.loaded_repositories,
            total_repositories: this.total_repositories
        };
    }
});
