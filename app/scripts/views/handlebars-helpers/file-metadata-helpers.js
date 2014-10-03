define(['app'], function(App) {

    'use strict';

    var FileMetadataHelpers = {};

    FileMetadataHelpers.GetHumanReadableReadDirection = function(data/*, options*/) {

        if (data.privateAttributes['forward-reads'] && data.privateAttributes['reverse-reads']) {
            return 'FR';
        }
        else if (data.privateAttributes['forward-reads']) {
            return 'F';
        }
        else if (data.privateAttributes['reverse-reads']) {
            return 'R';
        }

        return;
    };

    App.Views.HandlebarsHelpers.FileMetadataHelpers = FileMetadataHelpers;
    return FileMetadataHelpers;
});
