define(['app'], function(App) {

    'use strict';

    var FileMetadataHelpers = {};

    FileMetadataHelpers.GetHumanReadableReadDirection = function(data/*, options*/) {

        if (data.isForwardRead && data.isReverseRead) {
            return 'FR';
        }
        else if (data.isForwardRead) {
            return 'F';
        }
        else if (data.isReverseRead) {
            return 'R';
        }

        return;
    };

    App.Views.HandlebarsHelpers.FileMetadataHelpers = FileMetadataHelpers;
    return FileMetadataHelpers;
});
