//
// project-import-samples.js
// Modal view for sample processing table import
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

import Marionette from 'backbone.marionette';
import template from 'Templates/project/project-import-samples.html';
import Handlebars from 'handlebars';


export default Marionette.View.extend({
    template: Handlebars.compile(template),
    region: '#modal',

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        this.file = null;
        this.operation = null;
        let collections = this.controller.getCollections();
        this.tsvFiles = collections.fileList.getTSVCollection();
    },

    templateContext: function() {
        return {
            //metadataName: this.metadataName,
            tsvFiles: this.tsvFiles.toJSON(),
        };
    },

    events: {
        'click #submit-import': 'submitImportForm',
    },

    submitImportForm: function(e) {
        var fileUuid = $('#file-import-name').val();
        this.operation = $('#data-operation').val();
        this.file = this.tsvFiles.get(fileUuid);
    },

});
