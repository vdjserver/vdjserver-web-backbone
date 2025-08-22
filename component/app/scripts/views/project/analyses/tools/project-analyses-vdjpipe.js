
'use strict';

//
// project-analyses-vdjpipe.js
// Parameter view for VDJPipe
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2025 The University of Texas Southwestern Medical Center
//
// Author: Sam Wollenburg <samuel.wollenburg@utsouthwestern.edu>
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
import 'bootstrap-select';
import { File } from 'Scripts/models/agave-file';

import parameter_template from 'Templates/project/analyses/tools/project-analyses-vdjpipe.html';
export var VDJPipeParameterView = Marionette.View.extend({
    template: Handlebars.compile(parameter_template),
    toolName: 'vdjpipe',

    initialize: function (parameters) {
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },

    templateContext() {
        var colls = this.controller.getCollections();
        var primerList = [];
        var barcodeList = [];
        colls.fileList.models.forEach(file => {
            var fileValue = file.get('value');
            var fileType = fileValue['fileType'];
            if(fileType==File.fileTypeCodes.FILE_TYPE_PRIMER) {primerList.push({uuid:file.get('uuid'), name:fileValue['name']});}
            else if(fileType==File.fileTypeCodes.FILE_TYPE_BARCODE) {barcodeList.push({uuid:file.get('uuid'), name:fileValue['name']});}
        });

        return {
            primer_list: primerList,
            barcode_list: barcodeList
        }
    },

    onAttach() {
        // init boostrap-select
        $('.selectpicker').selectpicker();
    },

    events: {
        'change #vdjpipe-parameters-filter-toggle' : function(e) {this.controller.updateToggle(e, this.model, this, 'vdjpipe-parameters-filter-child')},
        'change #vdjpipe-parameters-barcode-toggle' : function(e) {this.controller.updateToggle(e, this.model, this, 'vdjpipe-parameters-barcode-child')},
        'change #vdjpipe-parameters-forward-primer-toggle' : function(e) {this.controller.updateToggle(e, this.model, this, 'vdjpipe-parameters-forward-primer-child')},
        'change #vdjpipe-parameters-reverse-primer-toggle' : function(e) {this.controller.updateToggle(e, this.model, this,'vdjpipe-parameters-reverse-primer-child')},
        'change #vdjpipe-parameters-find-unique-toggle' : function(e) {this.controller.updateToggle(e, this.model, null)},
        'change .form-control-vdjpipe' : function(e) {this.controller.updateField(e, this.model);}, 
        'change .form-control-vdjpipe-select' : function(e) {this.controller.updateSelect(e, this.model);}, 
    },

});
