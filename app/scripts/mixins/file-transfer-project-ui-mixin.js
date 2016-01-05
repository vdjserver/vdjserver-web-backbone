define([
    'app',
], function(App) {

    'use strict';

    var FileTransferProjectUiMixin = {
        _mixinUiProgressBar: function(counter, total) {
            var percentCompleted = (counter / total) * 100;
            this._mixinUiSetUploadProgress(this.fileUniqueIdentifier, percentCompleted);
        },
        _mixinUiSetUploadProgress: function(fileUniqueIdentifier, percentCompleted) {

            if (_.isNumber(percentCompleted)) {

                percentCompleted = percentCompleted.toFixed(2);
                percentCompleted += '%';

                $('.' + fileUniqueIdentifier)
                    .width(percentCompleted)
                ;

                $('.' + fileUniqueIdentifier + '-progress-text')
                    .text(percentCompleted)
                ;
            }
        },
        _mixinUiUploadStart: function(fileUniqueIdentifier) {
            // Disable user selectable UI components
            $('#form-' + fileUniqueIdentifier).find('.user-selectable').attr('disabled', 'disabled');

            // Hide previous notifications for this file
            $('#file-upload-notifications-' + fileUniqueIdentifier)
                .addClass('hidden')
            ;

            // Hide previous project notifications
            $('#file-staging-errors')
                .empty()
                .removeClass('alert alert-danger alert-success')
                .addClass('hidden')
            ;

        },
        _mixinUiSetProgressMessage: function(fileUniqueIdentifier, progressMessage) {
            $('#file-upload-notifications-' + fileUniqueIdentifier)
                .removeClass()
                .addClass('alert alert-info')
                .text(progressMessage)
                .fadeIn()
                .removeClass('hidden')
            ;
        },
        _mixinUiSetErrorMessage: function(fileUniqueIdentifier, errorMessage) {

            this._mixinUiSetUploadProgress(fileUniqueIdentifier, 0);

            $('#file-staging-errors')
                .empty()
                .text(errorMessage)
                .removeClass('hidden alert alert-success')
                .addClass('alert alert-danger')
                .fadeIn()
            ;

            $('#form-' + fileUniqueIdentifier).find('.user-selectable').removeAttr('disabled');

            $('#start-upload-button').text('Try again');
        },
        _mixinUiSetSuccessMessage: function(successMessage) {

            $('#file-staging-errors')
                .empty() // Hide previous project notifications
                .text(successMessage)
                .removeClass('hidden alert alert-danger')
                .addClass('alert alert-success')
                .fadeIn()
            ;
        },
    };

    App.Mixins.FileTransferProjectUiMixin = FileTransferProjectUiMixin;
    return FileTransferProjectUiMixin;
});
