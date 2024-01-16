
'use strict';

//
// mutational-hedgehog.js
// Circular barplot over V gene aa positions
// Mutational percentages summarized by
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

import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import Highcharts from 'highcharts';

// TODO: should call generateVisualization() on the project to generate the
// visualization on the server, then display the appropriate image cache file.

//    <div id="chart-4-region" class="col-md-6">
//        <img src="/image_cache/c0c74878-3ce0-4f1d-a896-91af28c20f3b.png" width="600" height="600">
//    </div>

export default Marionette.View.extend({
    template: Handlebars.compile('<div id="mutational-hedgehog"></div>'),

    initialize: function(parameters) {
        this.series = null;
        if (parameters) {
            // our controller
            if (parameters.controller) this.controller = parameters.controller;
            if (parameters.title) this.title = parameters.title;
            if (parameters.subtitle) this.subtitle = parameters.subtitle;
            if (parameters.series) this.series = parameters.series;
            if (parameters.drilldown) this.drilldown = parameters.drilldown;
        }
    },

    showChart: function() {
        // Send visualize API request

    }
});
