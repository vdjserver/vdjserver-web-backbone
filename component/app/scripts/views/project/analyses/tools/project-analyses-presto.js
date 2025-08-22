import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import 'bootstrap-select';
import { File } from 'Scripts/models/agave-file';

import parameter_template from 'Templates/project/analyses/tools/project-analyses-presto.html';
export var PrestoParameterView = Marionette.View.extend({
    template: Handlebars.compile(parameter_template),
    toolName: 'presto',

    initialize: function(parameters) {
        // our controller
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
        'change #presto-parameters-filter-toggle' : function(e) {this.controller.updateToggle(e, this.model, this, 'presto-parameters-filter-child')},
        'change #presto-parameters-barcode-toggle' : function(e) {this.controller.updateToggle(e, this.model, this, 'presto-parameters-barcode-child')},
        'change #presto-parameters-umi-toggle' : function(e) {this.controller.updateToggle(e, this.model, this, 'presto-parameters-umi-child')},
        'change #presto-parameters-forward-primer-toggle' : function(e) {this.controller.updateToggle(e, this.model, this, 'presto-parameters-forward-primer-child')},
        'change #presto-parameters-reverse-primer-toggle' : function(e) {this.controller.updateToggle(e, this.model, this, 'presto-parameters-reverse-primer-child')},
        'change #presto-parameters-find-unique-toggle' : function(e) {this.controller.updateToggle(e, this.model, null)},
        'change .form-control-presto' : function(e) {this.controller.updateField(e, this.model);}, 
        'change .form-control-presto-select' : function(e) {this.controller.updateSelect(e, this.model);}, 
    },
});
