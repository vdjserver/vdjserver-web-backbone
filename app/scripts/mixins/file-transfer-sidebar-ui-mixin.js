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
                .text(percentCompleted)
            ;
        },
        _uiSetSidemenuTransferSuccess: function(fileUniqueIdentifier) {
            $('.' + fileUniqueIdentifier).parent().removeClass('progress-striped active');
            $('.' + fileUniqueIdentifier).addClass('progress-bar-success');
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
