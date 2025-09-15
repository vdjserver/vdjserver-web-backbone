import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import 'bootstrap-select';
import { File } from 'Scripts/models/agave-file';

import parameter_template from 'Templates/project/analyses/tools/project-analyses-takara-umi.html';
export var TakaraBioUMIParameterView = Marionette.View.extend({
    template: Handlebars.compile(parameter_template),
    toolName: 'TakaraBioUMI',

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
        'change .form-control-takara' : function(e) {this.controller.updateField(e, this.model);}, 
        'change .form-control-takara-select' : function(e) {this.controller.updateSelect(e, this.model);}, 
    },
});
