define([
    'app',
], function(App) {

    'use strict';

    var FileTransferProjectUiMixin = {
        _mixinUiSetUploadProgress: function(fileUniqueIdentifier, percentCompleted) {

            console.log("percentCompleted type is: " + typeof percentCompleted);

            percentCompleted = percentCompleted.toFixed(2);
            percentCompleted += '%';

            $('.' + fileUniqueIdentifier)
                .width(percentCompleted)
            ;

            $('.' + fileUniqueIdentifier + '-progress-text')
                .text(percentCompleted)
            ;
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
            this._mixinUiSetUploadProgress(0, fileUniqueIdentifier);

            $('#file-upload-notifications-' + fileUniqueIdentifier)
                .removeClass()
                .addClass('alert alert-danger')
                .text(errorMessage)
                .fadeIn()
                .removeClass('hidden')
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
