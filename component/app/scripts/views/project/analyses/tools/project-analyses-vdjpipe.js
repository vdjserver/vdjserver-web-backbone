import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import 'bootstrap-select';

import parameter_template from 'Templates/project/analyses/tools/project-analyses-vdjpipe.html';

export var VDJPipeParameterView = Marionette.View.extend({
    template: Handlebars.compile(parameter_template),

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

    onRender() {
        // barcode toggle
        const barcodeToggle = this.el.querySelector('#vdjpipe-parameters-barcode');
        const barcodeLocation = this.el.querySelector('#project-analyses-vdjpipe-parameters-barcode-location-input');
        const barcodeDiscard = this.el.querySelector('#project-analyses-vdjpipe-parameters-barcode-discard-input');
        const barcodeGenerateHistogram = this.el.querySelector('#project-analyses-vdjpipe-parameters-barcode-generate-histogram-input');
        const barcodeMaxMismatch = this.el.querySelector('#project-analyses-vdjpipe-parameters-barcode-max-mismatch-input');
        const barcodeTrim = this.el.querySelector('#project-analyses-vdjpipe-parameters-barcode-trim-input');
        const barcodeSearchWindow = this.el.querySelector('#project-analyses-vdjpipe-parameters-barcode-search-window-input');
        const barcodeSplitFlag = this.el.querySelector('#project-analyses-vdjpipe-parameters-barcode-split-flag-input');
        const barcodeFile = this.$('#project-analyses-vdjpipe-parameters-barcode-file-select');
        
        barcodeToggle.addEventListener('change', (e) => {
            const checked = e.target.checked;
            barcodeLocation.disabled = !checked;
            barcodeDiscard.disabled = !checked;
            barcodeGenerateHistogram.disabled = !checked;
            barcodeMaxMismatch.disabled = !checked;
            barcodeTrim.disabled = !checked;
            barcodeSearchWindow.disabled = !checked;
            barcodeSplitFlag.disabled = !checked;
            barcodeFile.prop('disabled', !checked).selectpicker('refresh');
        });

            // Set initial disabled state (false by default)
        barcodeLocation.disabled = true;
        barcodeDiscard.disabled = true;
        barcodeGenerateHistogram.disabled = true;
        barcodeMaxMismatch.disabled = true;
        barcodeTrim.disabled = true;
        barcodeSearchWindow.disabled = true;
        barcodeSplitFlag.disabled = true;
        barcodeFile.prop('disabled', true).selectpicker('refresh');

        // forward primer toggle
        const forwardPrimerToggle = this.el.querySelector('#vdjpipe-parameters-forward-primer');
        const forwardPrimerMaxMismatch = this.el.querySelector('#project-analyses-vdjpipe-parameters-forward-primer-max-mismatch-input');
        const forwardPrimerTrim = this.el.querySelector('#project-analyses-vdjpipe-parameters-forward-primer-trim-input');
        const forwardPrimerSearchWindow = this.el.querySelector('#project-analyses-vdjpipe-parameters-forward-primer-search-window-input');
        const forwardPrimerFile = this.$('#project-analyses-vdjpipe-parameters-forward-primer-file-select');

        forwardPrimerToggle.addEventListener('change', (e) => {
            const checked = e.target.checked;
            forwardPrimerMaxMismatch.disabled = !checked;
            forwardPrimerTrim.disabled = !checked;
            forwardPrimerSearchWindow.disabled = !checked;
            forwardPrimerFile.prop('disabled', !checked).selectpicker('refresh');
        });

            // Set initial disabled state (false by default)
        forwardPrimerMaxMismatch.disabled = true;
        forwardPrimerTrim.disabled = true;
        forwardPrimerSearchWindow.disabled = true;
        forwardPrimerFile.prop('disabled', true).selectpicker('refresh');
        
        // reverse primer toggle
        const reversePrimerToggle = this.el.querySelector('#vdjpipe-parameters-reverse-primer');
        const reversePrimerMaxMismatch = this.el.querySelector('#project-analyses-vdjpipe-parameters-reverse-primer-max-mismatch-input');
        const reversePrimerTrim = this.el.querySelector('#project-analyses-vdjpipe-parameters-reverse-primer-trim-input');
        const reversePrimerSearchWindow = this.el.querySelector('#project-analyses-vdjpipe-parameters-reverse-primer-search-window-input');
        const reversePrimerFile = this.$('#project-analyses-vdjpipe-parameters-reverse-primer-file-select');
        
        reversePrimerToggle.addEventListener('change', (e) => {
            const checked = e.target.checked;
            reversePrimerMaxMismatch.disabled = !checked;
            reversePrimerTrim.disabled = !checked;
            reversePrimerSearchWindow.disabled = !checked;
            reversePrimerFile.prop('disabled', !checked).selectpicker('refresh');
        });
        
        // Set initial disabled state (false by default)
        reversePrimerMaxMismatch.disabled = true;
        reversePrimerTrim.disabled = true;
        reversePrimerSearchWindow.disabled = true;
        reversePrimerFile.prop('disabled', true).selectpicker('refresh');
    }
});
