/* global Bloodhound */
define([
    'app',
    'handlebars',
    'filesize',
    'environment-config',
    'moment',
    'socket-io',
    'backbone.syphon',
], function(
    App,
    Handlebars,
    filesize,
    EnvironmentConfig,
    moment
) {

    'use strict';

    Handlebars.registerHelper('IfJobSelectableFileType', function(filename, fileType, options) {
        var fileExtension = filename.split('.').pop();
        fileExtension = fileExtension.slice(0);

        if (fileExtension === 'qual') {
            return options.inverse(this);
        }

        if (parseInt(fileType) !== 2 && parseInt(fileType) !== 4) {
            return options.inverse(this);
        }

        return options.fn(this);
    });

    Handlebars.registerHelper('FormatAgaveDate', function(agaveDate) {

        var formattedDate = moment(agaveDate).format('D-MMM-YYYY hh:mm');

        return formattedDate;
    });

    Handlebars.registerHelper('ManageUsersShouldDisableDelete', function(data, options) {

        if (data.username === Backbone.Agave.instance.token().get('username')) {
            return options.fn(data);
        }

        return options.inverse(data);
    });

    Handlebars.registerHelper('GetHumanReadableFileSize', function(data) {
        if (data) {
            return filesize(data);
        }
    });

    Handlebars.registerHelper('GetTagDisplay', function(privateAttributes) {
        if (privateAttributes && privateAttributes['tags']) {

            var tags = privateAttributes['tags'];

            if (_.isArray(tags)) {
                tags = tags.join(', ');
            }

            return tags;
        }
    });

    Handlebars.registerHelper('SelectFileType', function(option, fileType) {
        if (option === fileType) {
            return 'selected';
        }
    });

    Handlebars.registerHelper('SelectReadDirection', function(option, value) {
        if (option === value['read-direction']) {
            return 'selected';
        }
    });

    Handlebars.registerHelper('SelectQualityScoreMetadata', function(option, value) {
        if (value && value['quality-score-metadata-uuid']) {
            if (option.uuid === value['quality-score-metadata-uuid']) {
                return 'selected';
            }
        }
    });

    var Projects = {};

    Projects.Index = Backbone.View.extend({
        initialize: function() {
            $('html,body').animate({scrollTop:0});

            // Get File Listings
            var loadingView = new App.Views.Util.Loading({keep: true});
            this.insertView(loadingView);
            loadingView.render();
        },
    });

    Projects.Create = Backbone.View.extend({
        template: 'project/create',
        initialize: function() {
            this.model = new Backbone.Agave.Model.Project();
        },
        afterRender: function() {
            // TODO: these can probably be moved out to global listening events for this file
            this.setupModalView();
        },
        // UI
        setupModalView: function() {

            var message = new App.Models.MessageModel({
                'header': 'Creating Project',
                'body':   '<p>Please wait while your project is created.</p>'
            });

            var modal = new App.Views.Util.ModalMessage({
                model: message
            });

            $('<div id="modal-view">').appendTo(this.el);

            this.setView('#modal-view', modal);
            modal.render();
        },
        events: {
            'submit form': 'submitForm',
        },
        submitForm: function(e) {

            e.preventDefault();

            this._clearErrorMessages();

            var formData = Backbone.Syphon.serialize(this);

            if (!formData.name) {
                App.clearMessage().setStandardErrorMessage('There was a problem creating your project. Please try again.');
            }
            else {

                this.setupModalView();
                var that = this;

                this.model.setAttributesFromFormData(formData);

                $('#modal-message')
                    .modal('show')
                    .on('shown.bs.modal', function() {

                        that.model
                            .save()
                            .done(function() {

                                $('#modal-message')
                                    .modal('hide')
                                    .on('hidden.bs.modal', function() {
                                        App.Datastore.Collection.ProjectCollection.add(that.model, {merge: true});
                                        App.router.navigate('project/' + that.model.get('uuid'), {
                                            trigger: true
                                        });
                                    });
                            })
                            .fail(function() {
                                that._displayErrorMessage();
                                $('#modal-message').modal('hide');
                            });
                    });
            }

            return false;
        },

        // Private Methods
        _clearErrorMessages: function() {
            this.$el.find('.alert-danger').fadeOut(function() {
                this.remove();
            });
        },
        _displayErrorMessage: function() {
            this.$el.find('.alert-danger').remove().end().prepend($('<div class="alert alert-danger">').text('There was a problem creating your project. Please try again.').fadeIn());
        },
    });

    Projects.Detail = Backbone.View.extend({
        template: 'project/detail',
        initialize: function(parameters) {

            this.fileListings = new Backbone.Agave.Collection.Files.Metadata({projectUuid: parameters.projectUuid});


            /*
                This is a little tricky. If we're arriving from a page
                refresh, then we are stuck with two asynchronous fetches.
                If the file list loads faster than the project list, then
                we'll need to re-insert our subview and re-render the page
                once the project list data has been fetched.
            */
            var that = this;
            if (App.Datastore.Collection.ProjectCollection.models.length === 0) {
                App.Datastore.Collection.ProjectCollection.on('sync', function() {
                    that.projectModel = App.Datastore.Collection.ProjectCollection.get(parameters.projectUuid);
                    that._initialDependencyDataSetup();
                });
            }
            else {
                this.projectModel = App.Datastore.Collection.ProjectCollection.get(parameters.projectUuid);
                this._initialDependencyDataSetup();
            }
        },
        serialize: function() {
            if (this.projectModel && this.fileListings && this.projectUsers) {
                return {
                    projectDetail: this.projectModel.toJSON(),
                    fileListingCount: this.fileListings.getFileCount() + ' files',
                    userCount: this.projectUsers.getUserCount(),
                };
            }
        },
        afterRender: function() {
            // Tooltips
            $('.has-tooltip').tooltip();
        },
        events: {
            'click #file-upload':    '_clickFilesSelectorWrapper',
            'change #file-dialog':   '_changeFilesSelector',
            'click .selected-files': '_uiToggleDisabledButtonStatus',
            'change #select-all-files-checkbox': '_toggleSelectAllFiles',
            'click .run-job':       '_clickRunJob',
            'change #search-text':  '_searchFileListings',
            'click .delete-files':  '_clickDeleteFiles',
            'click .download-file': '_clickDownloadFile',
            'click .download-multiple-files': '_clickDownloadMultipleFiles',
        },

        // Private Methods

        // Loading
        _setupLoadingViews: function() {

            var fileListingsLoadingView = new App.Views.Util.Loading({keep: true});
            this.setView('.file-listings', fileListingsLoadingView);
            fileListingsLoadingView.render();

            var detailsLoadingView = new App.Views.Util.Loading({keep: true});
            this.setView('.project-details-loading-view', detailsLoadingView);
            detailsLoadingView.render();
        },
        _removeLoadingViews: function() {

            var fileListingsLoadingView = this.getView('.file-listings');
            if (fileListingsLoadingView) {
                fileListingsLoadingView.remove();
            }

            var detailsLoadingView = this.getView('.project-details-loading-view');
            if (detailsLoadingView) {
                detailsLoadingView.remove();
            }
        },

        // Data Management
        _fetchAndRenderFileListings: function() {

            var that = this;
            this.fileListings.fetch()
                .done(function() {

                    that._removeLoadingViews();

                    // Need to render main view before rendering fileListing subview
                    that.render();

                    that._setupFileListingsView(that.fileListings);
                })
                .fail(function() {
                });
        },

        _initialDependencyDataSetup: function() {

            this._setupLoadingViews();

            var that = this;

            this.projectUsers = new Backbone.Agave.Collection.Permissions({
                uuid: this.projectModel.get('uuid')
            });

            this.projectUsers.fetch()
                .done(function() {
                    that._fetchAndRenderFileListings();
                })
                .fail(function() {

                });
        },

        _getSelectedFileUuids: function() {

            var selectedFileMetadataUuids = [];

            $('.selected-files:checked').each(function() {
                selectedFileMetadataUuids.push($(this).val());
            });

            return selectedFileMetadataUuids;
        },

        // File Listings
        _setupFileListingsView: function(fileListings) {

            var fileListingsView = new Projects.FileListings({fileListings: fileListings});

            // listen to events on fileListingsView
            this._fileListingsViewEvents(fileListingsView);
            this.setView('.file-listings', fileListingsView);
            fileListingsView.render();
        },
        _fileListingsViewEvents: function(fileListingsView) {

            var that = this;

            fileListingsView.on('fileDragDrop', function(files) {
                that._parseFiles(files);
            });
        },
        _parseFiles: function(files) {

            $('#file-staging-errors').addClass('hidden');

            var projectUuid = this.projectModel.get('uuid');

            for (var i = 0; i < files.length; i++) {
                var file = files[i];

                var stagedFile = new Backbone.Agave.Model.File({
                    name: file.name,
                    length: file.size,
                    lastModified: file.lastModifiedDate,
                    projectUuid: projectUuid,
                    fileReference: file,
                });

                var isDuplicate = this.fileListings.checkForDuplicateFilename(file.name);

                if (isDuplicate) {
                    $('#file-staging-errors')
                        .text('The file "' + file.name  + '" can not be uploaded because another file exists with the same name.')
                        .removeClass('hidden alert alert-success')
                        .addClass('alert alert-danger')
                        .fadeIn()
                        ;
                }
                else {
                    var fileTransferView = new Projects.FileTransfer({
                        model: stagedFile,
                        projectUuid: this.projectModel.get('uuid'),
                    });

                    this.insertView('#file-staging', fileTransferView);
                    fileTransferView.render();

                    // listen to events on fileTransferView
                    this._fileTransferViewEvents(fileTransferView);
                }
            }
        },

        // File Transfer
        _fileTransferViewEvents: function(fileTransferView) {

            var that = this;

            fileTransferView.on('addNewFileToProjectFileList', function(newFile) {

                that.fileListings.add(newFile);

                fileTransferView.remove();

                var fileListingsView = that.getView('.file-listings');
                fileListingsView.fileListings = that.fileListings;
                fileListingsView.render();

            });
        },

        // Job Staging
        _showJobStagingView: function() {

            //var jobType = e.target.dataset.jobtype;

            this.removeView('#job-submit');
            this.removeView('#workflow-modal');

            var selectedFileMetadataUuids = this._getSelectedFileUuids();
            var selectedFileListings = this.fileListings.getNewCollectionForUuids(selectedFileMetadataUuids);

            var jobSubmitView = new App.Views.Jobs.Submit({
                selectedFileListings: selectedFileListings,
                //jobType: jobType,
                projectModel: this.projectModel,
                allFiles: this.fileListings,
            });

            this.setView('#job-submit', jobSubmitView);

            jobSubmitView.fetchNetworkData()
                .done(function() {
                    jobSubmitView.render();
                });

            var that = this;

            this.listenToOnce(
                jobSubmitView,
                App.Views.Jobs.WorkflowEditor.events.openWorkflowCreateView,
                function() {

                    $('#job-modal')
                        .modal('hide')
                        .on('hidden.bs.modal', function() {
                            var workflowEditorView = new App.Views.Jobs.WorkflowEditor();

                            that.setView('#job-submit', workflowEditorView);

                            workflowEditorView.fetchNetworkData()
                                .done(function() {
                                    workflowEditorView.render();
                                    that._handleWorkflowViewEvents(workflowEditorView);
                                });
                        });
                }
            );

            this.listenToOnce(
                jobSubmitView,
                App.Views.Jobs.WorkflowEditor.events.openWorkflowEditorView,
                function(editableWorkflow) {
                    $('#job-modal')
                        .modal('hide')
                        .on('hidden.bs.modal', function() {

                            var workflowEditorView = new App.Views.Jobs.WorkflowEditor();

                            // The editable workflow needs to be set before render is called.
                            workflowEditorView.editableWorkflow = editableWorkflow;
                            that.setView('#job-submit', workflowEditorView);

                            workflowEditorView.fetchNetworkData()
                                .done(function() {
                                    workflowEditorView.render();
                                    that._handleWorkflowViewEvents(workflowEditorView);
                                });
                        });
                }
            );
        },

        _handleWorkflowViewEvents: function(workflowEditorView) {

            var that = this;

            this.listenToOnce(
                workflowEditorView,
                App.Views.Jobs.WorkflowEditor.events.closeWorkflowEditorView,
                function() {
                    $('#workflow-modal')
                        .modal('hide')
                        .on('hidden.bs.modal', function() {
                            that._showJobStagingView();
                        });
                }
            );
        },

        // Search
        _setupFileSearchNoResultsView: function() {
            var fileSearchNoResultsView = new Projects.FileSearchNoResults();

            this.setView('.file-listings', fileSearchNoResultsView);
            fileSearchNoResultsView.render();
        },

        _searchFileListings: function() {
            var searchString = $('#search-text').val();

            if (!searchString) {
                this._setupFileListingsView(this.fileListings);
            }
            else {
                var filteredFileListings = this.fileListings.search(searchString);

                if (filteredFileListings.length > 0) {
                    this._setupFileListingsView(filteredFileListings);
                }
                else {
                    this._setupFileSearchNoResultsView();
                }
            }
        },

        // UI
        _uiToggleDisabledButtonStatus: function() {
            if ($('.selected-files:checked').length) {
                $('.files-selected-button').removeClass('disabled');
            }
            else {
                $('.files-selected-button').addClass('disabled');
            }
        },

        // Event Responders
        _clickFilesSelectorWrapper: function() {
            document.getElementById('file-dialog').click();
        },
        _changeFilesSelector: function(e) {
            var files = e.target.files;
            this._parseFiles(files);
        },
        _toggleSelectAllFiles: function(e) {
            e.preventDefault();

            if (e.target.checked === true) {
                $('.selected-files').each(function() {
                    this.checked = true;
                });
            }
            else {
                $('.selected-files').each(function() {
                    this.checked = false;
                });
            }

            this._uiToggleDisabledButtonStatus();
        },
        _clickRunJob: function(e) {
            e.preventDefault();

            this._showJobStagingView();
            //this.handleJobStagingViewEvents();
        },
        _clickDeleteFiles: function(e) {
            e.preventDefault();

            var selectedFileMetadataUuids = this._getSelectedFileUuids();

            // Kind of a hack, but hey it's elegant
            var softDeletePromise = $.Deferred();

            for (var i = 0; i < selectedFileMetadataUuids.length; i++) {
                var fileMetadataModel = this.fileListings.get(selectedFileMetadataUuids[i]);

                var fileModel = fileMetadataModel.getFileModel();

                fileModel.softDelete()
                    .done(function() {
                    })
                    .fail(function() {
                    })
                ;

                fileMetadataModel.softDelete()
                    .always(function() {
                        if (i === selectedFileMetadataUuids.length) {
                            // All files are deleted, let's get out of here
                            softDeletePromise.resolve(true);
                        }
                    })
                ;
            }

            // All files are deleted, time to reload
            var that = this;
            $.when(softDeletePromise).then(function() {
                that._fetchAndRenderFileListings();
            });

        },

        _clickDownloadFile: function(e) {
            e.preventDefault();

            var fileName = e.target.dataset.filename;
            var agaveFile = new Backbone.Agave.Model.File({projectUuid: this.projectUuid, name: fileName});
            agaveFile.downloadFileToDisk();
        },

        _clickDownloadMultipleFiles: function(e) {
            e.preventDefault();

            var selectedFileMetadataUuids = this._getSelectedFileUuids();

            for (var i = 0; i < selectedFileMetadataUuids.length; i++) {
                var fileMetadataModel = this.fileListings.get(selectedFileMetadataUuids[i]);

                var fileModel = fileMetadataModel.getFileModel();
                fileModel.downloadFileToDisk();
            }
        },
    });

    Projects.FileSearchNoResults = Backbone.View.extend({
        template: 'project/file-search-no-results',
    });

    Projects.FileListings = Backbone.View.extend({

        // Public Methods
        template: 'project/file-listings',
        serialize: function() {
            return {
                fileListings: this.fileListings.toJSON(),
                readDirections: Backbone.Agave.Model.File.Metadata.getReadDirections(),
                fileTypes: Backbone.Agave.Model.File.Metadata.getFileTypes(),
            };
        },
        events: {
            'click #drag-and-drop-box': '_clickFilesSelectorWrapper',
            'change .project-file-type': '_updateFileType',
            'change .project-file-read-direction': '_updateReadDirection',
            'change .project-file-tags': '_updateFileTags',
        },
        afterRender: function() {
            this._setupDragDropEventHandlers();
        },

        // Private Methods

        // Event Handlers
        _updateFileType: function(e) {
            e.preventDefault();

            var that = this;

            var fileTypeId = parseInt(e.currentTarget.value);

            var fileMetadata = this.fileListings.get(e.target.dataset.fileuuid);

            fileMetadata.updateFileType(fileTypeId)
                .then(function() {
                    // Show animation before render so it doesn't get lost
                    return that._uiShowSaveSuccessAnimation(e.target);
                })
                .done(function() {
                    // Need to re-render here because some file types can be
                    // selected for jobs and the re-render will restore checkboxes
                    that.render();
                })
                .fail(function() {
                    that._uiShowSaveErrorAnimation(e.target);
                })
                ;
        },
        _updateReadDirection: function(e) {
            e.preventDefault();

            var that = this;

            var fileMetadata = this.fileListings.get(e.target.dataset.fileuuid);

            fileMetadata.updateReadDirection(e.target.value)
                .done(function() {
                    that._uiShowSaveSuccessAnimation(e.target);
                })
                .fail(function() {
                    that._uiShowSaveErrorAnimation(e.target);
                })
                ;

        },
        _updateFileTags: function(e) {
            e.preventDefault();

            var that = this;

            var fileMetadata = this.fileListings.get(e.target.dataset.fileuuid);
            fileMetadata.updateTags(e.target.value)
                .done(function() {
                    that._uiShowSaveSuccessAnimation(e.target);
                })
                .fail(function() {
                    that._uiShowSaveErrorAnimation(e.target);
                })
                ;
        },
        _uiShowSaveSuccessAnimation: function(domSelector) {

            var deferred = $.Deferred();

            $('<i class="icon-checkmark-green">Saved</i>')
                .insertAfter(domSelector)
                .fadeOut('slow', function() {
                    this.remove();
                    deferred.resolve();
                })
                ;

            return deferred;
        },
        _uiShowSaveErrorAnimation: function(domSelector) {
            $('<i class="icon-error-red">Saved</i>')
                .insertAfter(domSelector)
                .fadeOut('slow', function() {
                    this.remove();
                })
                ;

        },
        _setupDragDropEventHandlers: function() {
            if (this.fileListings.models.length === 0) {

                // Drag and Drop Listeners
                var dropZone = document.getElementById('drag-and-drop-box');
                dropZone.addEventListener('dragover', this._fileContainerDrag, false);

                // Using fancy bind trick to keep 'this' context
                // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener
                dropZone.addEventListener('drop', this._fileContainerDrop.bind(this), false);
            }
        },
        _fileContainerDrag: function(e) {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
        },
        _fileContainerDrop: function(e) {
            e.stopPropagation();
            e.preventDefault();

            var files = e.dataTransfer.files;

            //Hand off these file handlers to the parent view through this event.

            this.trigger('fileDragDrop', files);
        },

        // Event Responders
        _clickFilesSelectorWrapper: function() {
            /*
                This actually fires off an event that the parent view will catch.
                The advantage of doing it this way is that the same file handling
                logic can be reused no matter how the user is actually uploading
                the file.
            */
            document.getElementById('file-dialog').click();
        },
    });

    Projects.FileTransfer = Backbone.View.extend({

        // Public Methods
        template: 'project/file-transfer',
        initialize: function(parameters) {
            if (parameters && parameters.projectUuid) {
                this.projectUuid = parameters.projectUuid;
            }

            this.fileUniqueIdentifier = this._createFileUniqueIdentifier();
        },
        serialize: function() {
            return {
                file: this.model.toJSON(),
                fileUniqueIdentifier: this.fileUniqueIdentifier,
                fileTypes: Backbone.Agave.Model.File.Metadata.getFileTypes(),
            };
        },
        events: {
            'change .file-type': '_updateTypeTags',
            'click #cancel-upload-button': '_cancelUpload',
            'submit form':  '_startUpload',
        },

        // Private Methods

        // Event Responders
        _updateTypeTags: function(e) {
            e.preventDefault();

            var fileTypeId = parseInt(e.target.value);
            var hasReadDirection = Backbone.Agave.Model.File.Metadata.doesFileTypeIdHaveReadDirection(fileTypeId);

            if (hasReadDirection) {
                $('.file-type-tags').removeClass('hidden');
            }
            else {
                $('.file-type-tags').addClass('hidden');
            }
        },

        _cancelUpload: function(e) {
            e.preventDefault();
            this.remove();

            //this.model.abort();

            var listView = App.Layouts.sidebar.getView('.sidebar');

            listView.removeFileTransfer(this.fileUniqueIdentifier);

            this.model.trigger(Backbone.Agave.Model.File.CANCEL_UPLOAD);
        },

        _startUpload: function(e) {
            e.preventDefault();

            this._setListMenuFileTransferView();
            this._uiUploadStart();

            var formData = Backbone.Syphon.serialize(this);

            var that = this;

            this.model.on(Backbone.Agave.Model.File.UPLOAD_PROGRESS, function(percentCompleted) {
                that._uiSetUploadProgress(percentCompleted);
            });

            this.model.save()
                .done(function() {

                    // Notify user that permissions are being set
                    that._uiSetProgressMessage('Setting file permissions...');

                    // VDJAuth saves the day by fixing file pems
                    that.model.syncFilePermissionsWithProjectPermissions()
                        .done(function() {
                            that._createFileMetadata(formData);
                        })
                        .fail(function() {
                            that._uiSetUploadProgress(0);
                            that._uiSetErrorMessage('Permission error. Please try uploading your file again.');

                            // Delete file too??
                        });
                })
                .fail(function() {
                    // Notify user that upload failed
                    that._uiSetErrorMessage('File upload error. Please try uploading your file again.');
                });

            //request.abort()
        },

        // Data Management
        _createFileMetadata: function(formData) {

            // Setup file metadata
            var fileMetadata = new Backbone.Agave.Model.File.Metadata();
            fileMetadata.setInitialMetadata(this.model, formData);

            var that = this;
            fileMetadata.save()
                .done(function() {

                    // VDJAuth saves the day by fixing metadata pems
                    fileMetadata.syncMetadataPermissionsWithProjectPermissions()
                        .done(function() {
                        })
                        .fail(function() {

                        });

                    $('.progress').removeClass('progress-striped active');
                    $('.progress-bar').addClass('progress-bar-success');

                    $('.start-upload').remove();
                    $('.cancel-upload').remove();

                    // Disable buttons
                    $('.upload-button')
                        .removeAttr('disabled')
                    ;

                    that.trigger('addNewFileToProjectFileList', fileMetadata);

                    that._uiSetSuccessMessage('File "' + that.model.get('name') + '" uploaded successfully.');
                })
                .fail(function() {
                    that._uiSetErrorMessage('Metadata creation error. Please try uploading your file again.');
                });
        },
        _createFileUniqueIdentifier: function() {
            return this.model.getDomFriendlyName() + '-progress';
        },

        // UI
        _setListMenuFileTransferView: function() {
            var listView = App.Layouts.sidebar.getView('.sidebar');

            listView.addFileTransfer(
                this.projectUuid,
                this.fileUniqueIdentifier,
                this.model.get('name')
            );
        },
        _uiUploadStart: function() {
            // Disable user selectable UI components
            $('#form-' + this.fileUniqueIdentifier).find('.user-selectable').attr('disabled', 'disabled');

            // Hide previous notifications for this file
            $('#file-upload-notifications-' + this.fileUniqueIdentifier)
                .addClass('hidden')
            ;

            // Hide previous project notifications
            $('#file-staging-errors')
                .empty()
                .removeClass('alert alert-danger alert-success')
                .addClass('hidden')
            ;
        },

        _uiSetUploadProgress: function(percentCompleted) {
            percentCompleted = percentCompleted.toFixed(2);
            percentCompleted += '%';

            $('.' + this.fileUniqueIdentifier)
                .width(percentCompleted)
                .text(percentCompleted)
            ;
        },

        _uiSetProgressMessage: function(progressMessage) {
            $('#file-upload-notifications-' + this.fileUniqueIdentifier)
                .removeClass()
                .addClass('alert alert-info')
                .text(progressMessage)
                .fadeIn()
                .removeClass('hidden')
            ;
        },

        _uiSetErrorMessage: function(errorMessage) {
            this._uiSetUploadProgress(0);

            $('#file-upload-notifications-' + this.fileUniqueIdentifier)
                .removeClass()
                .addClass('alert alert-danger')
                .text(errorMessage)
                .fadeIn()
                .removeClass('hidden')
            ;

            $('#form-' + this.fileUniqueIdentifier).find('.user-selectable').removeAttr('disabled');

            $('#start-upload-button').text('Try again');
        },

        _uiSetSuccessMessage: function(successMessage) {

            $('#file-staging-errors')
                .empty() // Hide previous project notifications
                .text(successMessage)
                .removeClass('hidden alert alert-danger')
                .addClass('alert alert-success')
                .fadeIn()
            ;
        },
    });

    Projects.FileAssociations = Backbone.View.extend({
        template: 'project/file-associations',
        initialize: function(parameters) {
            this.fastaMetadatas = new Backbone.Agave.Collection.Files.Metadata({projectUuid: parameters.projectUuid});
            this.qualMetadatas = new Backbone.Agave.Collection.Files.Metadata({projectUuid: parameters.projectUuid});

            var fileMetadatas = new Backbone.Agave.Collection.Files.Metadata({projectUuid: parameters.projectUuid});

            var that = this;

            fileMetadatas.fetch()
                .done(function() {
                    that.fastaMetadatas = fileMetadatas.getQualAssociableFastaCollection();
                    that.qualMetadatas  = fileMetadatas.getQualCollection();

                    that.render();
                })
                .fail(function() {

                })
                ;
        },
        serialize: function() {
            if (this.fastaMetadatas) {
                return {
                    fastaMetadatas: this.fastaMetadatas.toJSON(),
                    qualMetadatas: this.qualMetadatas.toJSON(),
                    fileTypes: Backbone.Agave.Model.File.Metadata.getFileTypes(),
                };
            }
        },
        events: {
            'change .quality-score': '_updateQualityScoreAssociation',
            'change .project-file-type': '_updateFileType',
        },

        // Private Methods
        _updateQualityScoreAssociation: function(e) {
            e.preventDefault();

            var that = this;

            var fastaUuid = e.target.dataset.fastauuid;
            var qualName = e.target.value;

            var fastaModel = this.fastaMetadatas.get(fastaUuid);

            if (qualName.length > 0) {

                var qualModel = this.qualMetadatas.getModelForName(qualName);

                fastaModel.updateAssociatedQualityScoreMetadata(qualModel.get('uuid'))
                    .then(function() {
                        return that._uiShowSaveSuccessAnimation(e.target);
                    })
                    .done(function() {
                        that.render();
                    })
                    ;
            }
            else {
                fastaModel.removeQualityScoreMetadataAssociation()
                    .then(function() {
                        return that._uiShowSaveSuccessAnimation(e.target);
                    })
                    .done(function() {
                        that.render();
                    })
                    ;
            }
        },
        _updateFileType: function(e) {
            e.preventDefault();

            var that = this;

            var fileTypeId = parseInt(e.currentTarget.value);

            var fileMetadata = this.fastaMetadatas.get(e.target.dataset.fileuuid);

            fileMetadata.updateFileType(fileTypeId)
                .then(function() {

                    var deferred = $.Deferred();

                    if (Backbone.Agave.Model.File.Metadata.isFileTypeIdQualAssociable(fileTypeId) === true) {
                        deferred.resolve();
                        return deferred;
                    }
                    else {
                        that.fastaMetadatas.remove(fileMetadata);
                        return fileMetadata.removeQualityScoreMetadataAssociation();
                    }
                })
                .then(function() {
                    // Show animation before render so it doesn't get lost
                    return that._uiShowSaveSuccessAnimation(e.target);
                })
                .done(function() {
                    // Need to re-render here because some file types can be
                    // selected for jobs and the re-render will restore checkboxes
                    that.render();
                })
                .fail(function() {
                    that._uiShowSaveErrorAnimation(e.target);
                })
                ;

        },
        _uiShowSaveSuccessAnimation: function(domSelector) {

            var deferred = $.Deferred();

            $('<i class="icon-checkmark-green">Saved</i>')
                .insertAfter(domSelector)
                .fadeOut('slow', function() {
                    this.remove();
                    deferred.resolve();
                })
                ;

            return deferred;
        },
    });

    Projects.ManageUsers = Backbone.View.extend({
        template: 'project/manage-users',
        initialize: function(parameters) {

            this.modelId = parameters.projectUuid;
            this.model = App.Datastore.Collection.ProjectCollection.get(this.modelId);

            this.permissions = new Backbone.Agave.Collection.Permissions({uuid: this.modelId});

            var that = this;
            this.permissions.fetch()
                .done(function() {
                    that.permissions.remove(EnvironmentConfig.serviceAccountUsername);
                    that.render();

                    that.tenantUsers = new Backbone.Agave.Collection.TenantUsers();
                    that.tenantUsers.fetch()
                        .done(function() {
                            that.tenantUsers.remove(EnvironmentConfig.serviceAccountUsername);
                            that._usernameTypeahead(that.permissions, that.tenantUsers);
                        });
                })
                .fail(function() {
                });
        },
        serialize: function() {
            return {
                users: this.permissions.toJSON()
            };
        },
        events: {
            'submit form': '_addUserToProject',
            'click .remove-user-from-project': '_removeUserFromProject'
        },

        // Private Methods

        // Typeahead
        _usernameTypeahead: function(permissions, tenantUsers) {

            // Prune users that shouldn't be in typeahead.
            var vdjUsernames = tenantUsers.pluck('username');
            var projectUsernames = permissions.pluck('username');

            vdjUsernames = _.difference(vdjUsernames, projectUsernames);

            // Instantiate the bloodhound suggestion engine
            var usernameSuggestionEngine = new Bloodhound({
                datumTokenizer: function(data) {
                    return Bloodhound.tokenizers.whitespace(data);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                local: vdjUsernames
            });

            // Initialize the bloodhound suggestion engine
            usernameSuggestionEngine.initialize()
                .done(function() {

                    // Instantiate the typeahead UI
                    $('#add-username').typeahead(
                        {
                            minLength: 1,
                            highlight: true
                        },
                        {
                            displayKey: function(value) {
                                return value;
                            },
                            source: usernameSuggestionEngine.ttAdapter()
                        }
                    );
                })
                .fail(function() {
                    // Do or do not do, there is no try
                });

        },

        // Event Responders
        _addUserToProject: function(e) {
            e.preventDefault();

            var username = $('#add-username').val();

            // TODO: Check that username exists

            var that = this;
            var newUserPermission = this.permissions.create(
                {
                    username: username,
                    permission: 'READ_WRITE',
                    uuid: this.permissions.uuid,
                },
                {
                    success: function() {

                        newUserPermission.addUserToProject()
                            .then(function() {
                            })
                            .fail(function() {
                            });

                        that.permissions.add(newUserPermission);
                        that.render();
                        that._usernameTypeahead(that.permissions, that.tenantUsers);
                    },
                    error: function() {
                    },
                }
            );

        },
        _removeUserFromProject: function(e) {
            e.preventDefault();

            var username = e.target.dataset.id;

            var userPermission = this.permissions.findWhere({username: username});

            var that = this;

            // Try to let VDJAuth handle this
            // Only go to Agave if there's a problem
            userPermission.removeUserFromProject()
                .always(function() {
                    userPermission.destroy()
                        .done(function() {
                            that.render();
                            that._usernameTypeahead(that.permissions, that.tenantUsers);
                        })
                        .fail(function() {
                        });
                })
            ;
        },
    });

    Projects.Settings = Backbone.View.extend({

        // Public Methods
        template: 'project/settings',
        initialize: function(parameters) {
            this.modelId = parameters.projectUuid;
            this.model = App.Datastore.Collection.ProjectCollection.get(this.modelId);

            if (App.Datastore.Collection.ProjectCollection.models.length === 0) {
                var that = this;
                App.Datastore.Collection.ProjectCollection.on('sync', function() {
                    that.model = App.Datastore.Collection.ProjectCollection.get(parameters.projectUuid);
                    that.render();
                });
            }

            this.render();
        },
        serialize: function() {
            if (this.model) {
                return {
                    project: this.model.toJSON()
                };
            }
        },
        events: {
            'click #launch-delete-project-modal': '_launchDeleteProjectModal',
            'click #delete-project': '_deleteProject',
            'click #save-project-name': '_saveProjectName',
        },

        // Private Methods

        // Event Responders
        _launchDeleteProjectModal: function(e) {
            e.preventDefault();

            $('#delete-modal').modal('show');
        },
        _saveProjectName: function(e) {
            e.preventDefault();

            var newProjectName = $('#project-name').val();

            var value = this.model.get('value');
            value.name = newProjectName;

            this.model.set('value', value);

            this.model.save()
                .done(function() {
                })
                .fail(function() {
                });
        },
        _deleteProject: function(e) {
            e.preventDefault();

            // Note: Agave currently returns what backbone considers to be the 'wrong' http status code
            this.model.destroy()
                .always(function() {
                    $('#delete-modal').modal('hide')
                        .on('hidden.bs.modal', function() {
                            App.router.navigate('/project', {
                                trigger: true
                            });
                        })
                    ;
                })
            ;
        },
    });

    App.Views.Projects = Projects;
    return Projects;
});
