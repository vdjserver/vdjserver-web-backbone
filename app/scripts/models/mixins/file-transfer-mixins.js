define([
    'app',
], function(App) {

    'use strict';

    var FileTransferMixins = {};

    FileTransferMixins.progressJqxhr = function(that, totalSize) {
        return {
            xhr: function() {

                var progressHandler = function(evt) {
                    var percentCompleted = 0;

                    if (evt.lengthComputable) {
                        percentCompleted = evt.loaded / evt.total;
                    }
                    else {
                        percentCompleted = evt.loaded / totalSize;
                    }

                    percentCompleted *= 100;
                    that.trigger(Backbone.Agave.Model.File.UPLOAD_PROGRESS, percentCompleted);
                };

                var xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', progressHandler);
                xhr.addEventListener('progress', progressHandler);

                return xhr;
            },
        };
    };

    App.Mixins.FileTransferMixins = FileTransferMixins;
    return FileTransferMixins;
});
