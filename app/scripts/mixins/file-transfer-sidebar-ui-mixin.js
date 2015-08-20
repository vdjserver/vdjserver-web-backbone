define([
    'app',
], function(App) {

    'use strict';

    var FileTransferSidebarUiMixin = {
        _uiSetUploadProgress: function(percentCompleted, fileUniqueIdentifier) {
            percentCompleted = percentCompleted.toFixed(2);
            percentCompleted += '%';

            $('.' + fileUniqueIdentifier)
                .width(percentCompleted)
            ;

            $('.' + fileUniqueIdentifier + '-progress-text')
                .text(percentCompleted)
            ;
        },
        _uiSetSidemenuTransferSuccess: function(fileUniqueIdentifier) {
            $('.' + fileUniqueIdentifier).parent().removeClass('progress-striped active');
            $('.' + fileUniqueIdentifier).addClass('progress-bar-success');

            $('.' + fileUniqueIdentifier + '-button').prop('disabled', false);
            $('.' + fileUniqueIdentifier + '-button').one('click', function() {
                var listView = App.Layouts.sidebar.getView('.sidebar');
                listView.removeFileTransfer(fileUniqueIdentifier);

                // If this doesn't return false, then the webapp will refresh.
                return false;
            });
        },
        _setListMenuFileTransferView: function(projectUuid, fileUniqueIdentifier, name) {
            var listView = App.Layouts.sidebar.getView('.sidebar');

            listView.addFileTransfer(
                projectUuid,
                fileUniqueIdentifier,
                name
            );
        },
    };

    App.Mixins.FileTransferSidebarUiMixin = FileTransferSidebarUiMixin;
    return FileTransferSidebarUiMixin;
});
