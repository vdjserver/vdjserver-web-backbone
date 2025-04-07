import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
// import 'bootstrap-select';

import parameter_template from 'Templates/project/analyses/tools/project-analyses-presto.html';
export var PrestoParameterView = Marionette.View.extend({
    template: Handlebars.compile(parameter_template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

    },

    templateContext() {
        return {

        }
    },

    onRender() {
        // barcode toggle
        const barcodeToggle = this.el.querySelector('#presto-parameters-barcode');
        const barcodeLocation = this.el.querySelector('#project-analyses-presto-parameters-barcode-location-input');
        const barcodeDiscard = this.el.querySelector('#project-analyses-presto-parameters-barcode-discard-input');
        const barcodeGenerateHistogram = this.el.querySelector('#project-analyses-presto-parameters-barcode-generate-histogram-input');
        const barcodeMaxMismatch = this.el.querySelector('#project-analyses-presto-parameters-barcode-max-mismatch-input');
        const barcodeTrim = this.el.querySelector('#project-analyses-presto-parameters-barcode-trim-input');
        const barcodeSearchWindow = this.el.querySelector('#project-analyses-presto-parameters-barcode-search-window-input');
        const barcodeSplitFlag = this.el.querySelector('#project-analyses-presto-parameters-barcode-split-flag-input');
        
        barcodeToggle.addEventListener('change', (e) => {
            const checked = e.target.checked;
            barcodeLocation.disabled = !checked;
            barcodeDiscard.disabled = !checked;
            barcodeGenerateHistogram.disabled = !checked;
            barcodeMaxMismatch.disabled = !checked;
            barcodeTrim.disabled = !checked;
            barcodeSearchWindow.disabled = !checked;
            barcodeSplitFlag.disabled = !checked;
        });

            // Set initial disabled state (false by default)
        barcodeLocation.disabled = true;
        barcodeDiscard.disabled = true;
        barcodeGenerateHistogram.disabled = true;
        barcodeMaxMismatch.disabled = true;
        barcodeTrim.disabled = true;
        barcodeSearchWindow.disabled = true;
        barcodeSplitFlag.disabled = true;

        // forward primer toggle
        const forwardPrimerToggle = this.el.querySelector('#presto-parameters-forward-primer');
        const forwardPrimerMaxMismatch = this.el.querySelector('#project-analyses-presto-parameters-forward-primer-max-mismatch-input');
        const forwardPrimerTrim = this.el.querySelector('#project-analyses-presto-parameters-forward-primer-trim-input');
        const forwardPrimerSearchWindow = this.el.querySelector('#project-analyses-presto-parameters-forward-primer-search-window-input');
        
        forwardPrimerToggle.addEventListener('change', (e) => {
            const checked = e.target.checked;
            forwardPrimerMaxMismatch.disabled = !checked;
            forwardPrimerTrim.disabled = !checked;
            forwardPrimerSearchWindow.disabled = !checked;
        });

            // Set initial disabled state (false by default)
        forwardPrimerMaxMismatch.disabled = true;
        forwardPrimerTrim.disabled = true;
        forwardPrimerSearchWindow.disabled = true;

        // reverse primer toggle
        const reversePrimerToggle = this.el.querySelector('#presto-parameters-reverse-primer');
        const reversePrimerMaxMismatch = this.el.querySelector('#project-analyses-presto-parameters-reverse-primer-max-mismatch-input');
        const reversePrimerTrim = this.el.querySelector('#project-analyses-presto-parameters-reverse-primer-trim-input');
        const reversePrimerSearchWindow = this.el.querySelector('#project-analyses-presto-parameters-reverse-primer-search-window-input');
        
        reversePrimerToggle.addEventListener('change', (e) => {
            const checked = e.target.checked;
            reversePrimerMaxMismatch.disabled = !checked;
            reversePrimerTrim.disabled = !checked;
            reversePrimerSearchWindow.disabled = !checked;
        });

            // Set initial disabled state (false by default)
        reversePrimerMaxMismatch.disabled = true;
        reversePrimerTrim.disabled = true;
        reversePrimerSearchWindow.disabled = true;
    }
});
