//
// subjects-list.js
// List of subjects for projects
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2021 The University of Texas Southwestern Medical Center
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
import Handlebars from 'handlebars';

import detail_template from 'Templates/project/subjects/subjects-detail.html';
var SubjectDetailView = Marionette.View.extend({
    template: Handlebars.compile(detail_template),
    //tagName: 'tr',
    //className: 'community-project',

  events: {
  },

});

var SubjectsListView = Marionette.CollectionView.extend({
    template: Handlebars.compile("<div></div>"),
//     tagName: 'table',
//     className: 'table table-hover table-sm table-bordered',

    initialize: function(parameters) {
        this.childView = SubjectDetailView;
    }
});

export default SubjectsListView;
