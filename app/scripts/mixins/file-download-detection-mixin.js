define([
    'app',
], function(App) {

    'use strict';

    var FileDownloadDetectionMixin = {
        _setDownloadCapabilityDetection: function() {

            // Blob Save Detection
            this.canDownloadFiles = true;
            var uagent = navigator.userAgent.toLowerCase();
            if (/safari/.test(uagent) && !/chrome/.test(uagent)) {
                // Safari: long live the new IE
                this.canDownloadFiles = false;
            }
        },
    };

    App.Mixins.FileDownloadDetectionMixin = FileDownloadDetectionMixin;
    return FileDownloadDetectionMixin;
});
