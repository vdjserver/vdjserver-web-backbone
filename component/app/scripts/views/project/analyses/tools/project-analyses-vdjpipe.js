import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import 'bootstrap-select';

import parameter_template from 'Templates/project/analyses/tools/project-analyses-vdjpipe.html';
export var VDJPipeParameterView = Marionette.View.extend({
    template: Handlebars.compile(parameter_template),
    toolName: 'vdjpipe',

    initialize: function (parameters) {
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
        if (parameters.analysisDetailView)
            this.analysisDetailView = parameters.analysisDetailView;
    },

    templateContext() {
        var colls = this.controller.getCollections();
        var primerList = [];
        var barcodeList = [];
        colls.fileList.models.forEach(file => {
            var fileValue = file.get('value');
            var fileType = fileValue['fileType'];
            if(fileType=='1') {primerList.push({uuid:file.get('uuid'), name:fileValue['name']});}
            else if(fileType=='4') {barcodeList.push({uuid:file.get('uuid'), name:fileValue['name']});}
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
        'click #vdjpipe-parameters-filter-toggle' : function(e) {this.analysisDetailView.toggleChildren('vdjpipe-parameters-filter-child', e)},
        'click #vdjpipe-parameters-barcode-toggle' : function(e) {this.analysisDetailView.toggleChildren('vdjpipe-parameters-barcode-child', e)},
        'click #vdjpipe-parameters-forward-primer-toggle' : function(e) {this.analysisDetailView.toggleChildren('vdjpipe-parameters-forward-primer-child', e)},
        'click #vdjpipe-parameters-reverse-primer-toggle' : function(e) {this.analysisDetailView.toggleChildren('vdjpipe-parameters-reverse-primer-child', e)},
        // below is not activating, need to move to parent view, logic in toggleSubview should handle this.
        'click .card' : function(e) {this.analysisDetailView.toggleSubview(null, null)},
        'change .form-control-vdjpipe' : function(e) {this.controller.updateField(e, this.model);}, 
        'change .form-control-vdjpipe-toggle' : function(e) {this.controller.updateToggle(e, this.model);}, 
        'change .form-control-vdjpipe-select' : function(e) {this.controller.updateSelect(e, this.model);}, 
    },

    // move to analysisDetailView similar to toggleChildren?
    
});
