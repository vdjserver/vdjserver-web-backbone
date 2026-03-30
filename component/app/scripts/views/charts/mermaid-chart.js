'use strict';

//
// mermaid-plots.js
// Generic Mermaid Chart
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2020 The University of Texas Southwestern Medical Center
//
// Author: Sam Wollenburg <Samuel.Wollenburg@utsouthwestern.edu>
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
import mermaid from 'mermaid';
// import mermaid from 'mermaid/dist/mermaid.min.js';

export default Marionette.View.extend({
    template: Handlebars.compile('<div class="mermaid" id="mermaid_chart"></div>'),

    initialize: function(parameters) {
        this.chartDefinition = '';

        if (parameters) {
            if (parameters.chartDefinition) this.chartDefinition = parameters.chartDefinition;
        }

        mermaid.initialize({ 
            startOnLoad: false,
            securityLevel: 'loose'
        });
    },

    onAttach: function() {
        this.showChart();
    },

    showChart: function() {
        const el = this.$('#mermaid_chart')[0];

        // Insert Mermaid text
        el.innerHTML = this.chartDefinition;

        // Render it
        el.removeAttribute('data-processed');
        // mermaid.init(null, el);
        mermaid.init(undefined, el);
    }
});
