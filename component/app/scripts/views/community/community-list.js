
'use strict';

//
// community-list.js
// Manages the results list for the community data page
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
import list_template from 'Templates/community/community-list.html';
import template from 'Templates/community/study-summary.html';
import Handlebars from 'handlebars';

var StudySummaryView = Marionette.View.extend({
    template: Handlebars.compile(template),
    tagName: 'div',
    className: 'community-project',

  serializeModel() {
    const data = _.clone(this.model.attributes);

    // serialize nested model data
    data.study = data.study.attributes;

    return data;
  },

    templateContext() {

        // study badges
        var study = this.model.get('study');
        var value = study.get('value');
        var contains_ig = false;
        var contains_tcr = false;
        var contains_single_cell = false;
        var contains_paired_chain = false;
        if (value.keywords_study.indexOf("contains_ig") >= 0)
            contains_ig = true;
        if (value.keywords_study.indexOf("contains_tcr") >= 0)
            contains_tcr = true;
        if (value.keywords_study.indexOf("contains_single_cell") >= 0)
            contains_single_cell = true;
        if (value.keywords_study.indexOf("contains_paired_chain") >= 0)
            contains_paired_chain = true;

        return {
            object: JSON.stringify(this.model),
            num_subjects: this.model.get('subjects').length,
            num_samples: this.model.get('samples').length,
            num_repertoires: this.model.get('repertoires').length,
            contains_ig: contains_ig,
            contains_tcr: contains_tcr,
            contains_single_cell: contains_single_cell,
            contains_paired_chain: contains_paired_chain,
        };
    }
});

export default Marionette.CollectionView.extend({
    template: Handlebars.compile(list_template),
    //tagName: 'table',
    //className: 'table table-hover table-sm table-bordered',
    initialize: function(parameters) {
        this.childView = StudySummaryView;
  },
});
