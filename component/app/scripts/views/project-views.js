/* global Bloodhound */
define([
    'app',
    'handlebars',
    'filesize',
    'moment',
    'handlebars-utilities',
    'chance',
    'file-transfer-project-ui-mixin',
    'socket-io',
    'backbone.syphon',
], function(
    App,
    Handlebars,
    filesize,
    moment,
    HandlebarsUtilities,
    Chance,
    FileTransferProjectUiMixin
) {

    'use strict';

    HandlebarsUtilities.registerRawPartial(
        'project/detail/fragments/file-transfer-common',
        'file-transfer-common'
    );

    HandlebarsUtilities.registerRawPartial(
        'project/detail/fragments/project-file-list-title',
        'project-file-list-title'
    );

    HandlebarsUtilities.registerRawPartial(
        'project/detail/fragments/project-file-list-last-modified',
        'project-file-list-last-modified'
    );

    HandlebarsUtilities.registerRawPartial(
        'project/detail/fragments/project-file-list-size',
        'project-file-list-size'
    );

    HandlebarsUtilities.registerRawPartial(
        'project/detail/fragments/project-file-list-origin',
        'project-file-list-origin'
    );

    HandlebarsUtilities.registerRawPartial(
        'project/detail/fragments/project-file-list-tags',
        'project-file-list-tags'
    );

    HandlebarsUtilities.registerRawPartial(
        'project/detail/fragments/project-file-list-spacer',
        'project-file-list-spacer'
    );

    Handlebars.registerHelper('IfJobSelectableFileType', function(filename, fileType, options) {

        if (filename === undefined) {
            return options.inverse(this);
        }

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
            return filesize(data, {base: 10});
        }
    });

    Handlebars.registerHelper('GetTagDisplay', function(publicAttributes) {
        if (publicAttributes && publicAttributes['tags']) {

            var tags = publicAttributes['tags'];

            if (_.isArray(tags)) {
                tags = tags.join(', ');
            }

            return tags;
        }
    });

    Handlebars.registerHelper('ifCondSelected', function(v1, v2 /*, options*/) {
        if (v1 === v2) {
            return 'selected';
        }
    });

    Handlebars.registerHelper('ifCond', function(v1, v2, options) {

        if (v1 === v2) {
            return options.fn(this);
        }

        return options.inverse(this);
    });

    Handlebars.registerHelper('forLoop', function(from, to, options) {

        var total = '';

        for (var i = from; i < to; i++) {
            total += options.fn(i);
        };

        return total;
    });

    Handlebars.registerHelper('ifOr', function(v1, v2, options) {

        if (_.isArray(v1) && _.isArray(v2)) {
            if (v1.length > 0 || v2.length > 0) {
                return options.fn(this);
            }
        }
        else if (v1 || v2) {
            return options.fn(this);
        }

        return options.inverse(this);
    });

    var ProjectMixin = {
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
    };

    var Projects = {};

    Projects.Index = Backbone.View.extend({
        initialize: function() {
            $('html,body').animate({scrollTop: 0});

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

                                        // Start listening for websocket events on this new project
                                        var projectUuid = that.model.get('uuid');
                                        App.Instances.WebsocketManager.subscribeToEvent(projectUuid);

                                        // Store w/ other projects
                                        App.Datastore.Collection.ProjectCollection.add(that.model, {merge: true});
                                        // Send user to new project
                                        App.router.navigate('project/' + that.model.get('uuid'), {
                                            trigger: true
                                        });
                                    });
                            })
                            .fail(function(error) {
                                var telemetry = new Backbone.Agave.Model.Telemetry();
                                telemetry.setError(error);
                                telemetry.set('method', 'Backbone.Agave.Model.Project().save()');
                                telemetry.set('view', 'Projects.Create');
                                telemetry.save();

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
            this.$el.find('.alert-danger')
                .remove()
                .end()
                .prepend(
                    $('<div class="alert alert-danger">')
                        .text('There was a problem creating your project. Please try again.')
                        .fadeIn()
                )
                ;
        },
    });

    Projects.Detail = Backbone.View.extend({
        template: 'project/detail/detail',
        initialize: function(parameters) {

            this.projectFiles = new Backbone.Agave.Collection.Files.Metadata({projectUuid: this.projectUuid});

            // This is a little tricky. If we're arriving from a page
            // refresh, then we are stuck with two asynchronous fetches.
            // If the file list loads faster than the project list, then
            // we'll need to re-insert our subview and re-render the page
            // once the project list data has been fetched.
            var that = this;
            if (App.Datastore.Collection.ProjectCollection.models.length === 0) {
                that.listenToOnce(App.Datastore.Collection.ProjectCollection, 'sync', function() {
                    that.projectModel = App.Datastore.Collection.ProjectCollection.get(that.projectUuid);
                    that._setupSubviews();
                });
            }
            else {
                this.projectModel = App.Datastore.Collection.ProjectCollection.get(that.projectUuid);
                this._setupSubviews();
            }

            this._handleWebsocketEvents();
        },
        getSubviewParameters: function() {
            return {
                parentView: this,
                projectModel: this.projectModel,
                projectUuid: this.projectUuid,
                projectFiles: this.projectFiles,
            };
        },
        _setupSubviews: function() {

            var loadingView = new App.Views.Util.Loading({keep: true});
            this.setView('', loadingView);
            loadingView.render();

            var subviewParameters = this.getSubviewParameters();
            var that = this;

            this.projectFiles.fetch()
                .then(function() {
                    loadingView.remove();
                    that.render();

                    // Setup subviews
                    var headerView = new Projects.DetailHeader(subviewParameters);
                    that.setView('#project-header', headerView);

                    var actionsView = new Projects.DetailActions(subviewParameters);
                    that.setView('#project-actions', actionsView);

                    var errorsView = new Projects.DetailErrors(subviewParameters);
                    that.setView('#project-errors', errorsView);
                    errorsView.render();

                    var filesView = new Projects.DetailFiles(subviewParameters);
                    that.setView('#project-files', filesView);
                    filesView.render();
                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(error);
                    telemetry.set('method', 'Backbone.Agave.Collection.Files.Metadata().fetch()');
                    telemetry.set('view', 'Projects.Detail');
                    telemetry.save();
                })
                ;
        },
        _handleWebsocketEvents: function() {

            var that = this;

            this.listenTo(App.Instances.WebsocketManager, 'addFileImportPlaceholder', function(fileMetadataResponse) {

                if (fileMetadataResponse.hasOwnProperty('projectUuid')
                    && fileMetadataResponse.projectUuid === that.projectUuid
                ) {

                    var fileMetadata = new Backbone.Agave.Model.File.Metadata();
                    fileMetadata.set(fileMetadataResponse);

                    fileMetadata.addPlaceholderMarker();

                    that.projectFiles.add(fileMetadata);

                    var fileListingsView = that.getView('#project-files');

                    // Putting this in |singleReadListings| for now. If we ever
                    // support paired file uploads, then it will need to be updated.
                    fileListingsView.singleReadFileListings.add(fileMetadata);

                    fileListingsView.render();
                }
            });

            this.listenTo(App.Instances.WebsocketManager, 'updateFileImportProgress', function(fileMetadataResponse) {

                if (fileMetadataResponse.hasOwnProperty('fileInformation')
                    && fileMetadataResponse.fileInformation.hasOwnProperty('projectUuid')
                    && fileMetadataResponse.fileInformation.projectUuid === that.projectUuid
                ) {

                    var fileMetadata = new Backbone.Agave.Model.File.Metadata();
                    fileMetadata.set(fileMetadataResponse.fileInformation.metadata);

                    var nameGuid = fileMetadata.getNameGuid(fileMetadata.get('value').name);
                    var progress = App.Utilities.WebsocketManager.FILE_IMPORT_STATUS_PROGRESS[fileMetadataResponse.fileImportStatus];

                    var percentCompleted = progress + '%';

                    var fileListingsView = that.getView('#project-files');

                    fileListingsView.updatePlaceholderFileProgress(
                        '.placeholder-guid-' + nameGuid,
                        percentCompleted
                    );
                }
            });

            this.listenTo(App.Instances.WebsocketManager, 'addFileToProject', function(fileMetadataResponse) {

                if (fileMetadataResponse.hasOwnProperty('value')
                    && fileMetadataResponse.value.hasOwnProperty('projectUuid')
                    && fileMetadataResponse.value.projectUuid === that.projectUuid
                ) {

                    var fileMetadata = new Backbone.Agave.Model.File.Metadata();
                    fileMetadata.set(fileMetadataResponse);

                    var modelMatch = that.projectFiles.getModelForName(fileMetadata.get('value').name);

                    var fileListingsView = that.getView('#project-files');
                    fileListingsView.singleReadFileListings.remove(modelMatch);
                    that.projectFiles.remove(modelMatch);

                    fileListingsView.singleReadFileListings.add(fileMetadata);
                    that.projectFiles.add(fileMetadata);

                    fileListingsView.render();
                    that.render();
                }
            });

        },
    });

    Projects.DetailErrors = Backbone.View.extend({
        template: 'project/detail/errors',
        initialize: function(parameters) {

            var that = this;

            this.listenTo(this.parentView, 'duplicateFileError', function(filename) {
                that.uiDisplayDuplicateFileMessage(filename);
            });
        },
        uiDisplayDuplicateFileMessage: function(filename) {

            $('html,body').animate({scrollTop: 0});

            $('#file-error-details')
                .html(
                    'Unable to upload!'
                    + '<br><br>The file "' + filename  + '" can not be uploaded because another file exists with the same name.'
                    + '<br><br>Please try again with a different filename.'
                )
                .removeClass('hidden alert alert-success')
                .addClass('alert alert-danger')
                .fadeIn()
                ;
        },
    });

    Projects.DetailHeader = Backbone.View.extend({
        template: 'project/detail/header',
        initialize: function(parameters) {

            var loadingView = new App.Views.Util.Loading({keep: true});
            this.setView('', loadingView);
            loadingView.render();

            this.projectUsers = new Backbone.Agave.Collection.Permissions({
                uuid: this.projectUuid
            });

            var that = this;

            this.projectUsers.fetch()
                .then(function() {
                    loadingView.remove();

                    that.render();
                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(error);
                    telemetry.set('method', 'Backbone.Agave.Collection.Permissions().fetch()');
                    telemetry.set('view', 'Projects.DetailHeader');
                    telemetry.save();
                })
                ;

            this.listenTo(this.projectFiles, 'remove add', function() {
                that.render();
            });
        },
        serialize: function() {
            return {
                project: this.projectModel.toJSON(),
                fileListingCount: this.projectFiles.getFileCount() + ' files',
                userCount: this.projectUsers.getUserCount(),
            };
        },
    });

    Projects.DetailActions = Backbone.View.extend({
        template: 'project/detail/actions',
        initialize: function(parameters) {

            var loadingView = new App.Views.Util.Loading({keep: true});
            this.setView('', loadingView);
            loadingView.render();

            this.systems = new Backbone.Agave.Collection.Systems();

            var that = this;

            this.systems.fetch()
                .then(function() {

                    loadingView.remove();

                    that.render();
                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(error);
                    telemetry.set('method', 'Backbone.Agave.Collection.Systems().fetch()');
                    telemetry.set('view', 'Projects.DetailActions');
                    telemetry.save();
                })
                ;

            this.listenTo(this.parentView, 'filesSelected', function(selectedStatus) {
                that._uiToggleDisabledButtonStatus(selectedStatus);
            });

            this.listenTo(this.parentView, 'openFileDialog', function(selectedFiles) {
                that._uploadFileFromComputer(undefined, selectedFiles);
            });
        },
        serialize: function() {
            return {
                systems: this.systems.toJSON(),
                executionSystemsAvailable: this.systems.largeExecutionSystemAvailable(),
            };
        },

        /**
         * UI
         */
        _uiToggleDisabledButtonStatus: function(selectedStatus) {
            if (selectedStatus === true) {
                $('.files-selected-button').removeClass('disabled');
            }
            else {
                $('.files-selected-button').addClass('disabled');
            }
        },

        events: {
            // File Upload/Import
            'click #file-upload': '_uploadFileFromComputer',
            'click #dropbox-upload': '_dropboxUpload',
            'click #url-upload': '_urlUpload',

            // Jobs
            'click #run-job-button':  '_clickJobDropdown',
            'click .run-job': '_clickRunJob',

            // File Actions
            'click .delete-files':  '_clickDeleteFiles',
            'click .download-multiple-files': '_clickDownloadMultipleFiles',

            // Search
            'change #search-text': '_searchFileListings',
            'submit #file-search-form': '_searchFileListings',
        },

        /**
         * Files
         */
        _uploadFileFromComputer: function(e, stagedFiles) {
            if (e !== undefined) {
                e.preventDefault();
            }

            var viewOptions = {
                projectUuid: this.projectModel.get('uuid'),
                fileListings: this.projectFiles,
                projectDetailView: this.parentView,
            };

            if (stagedFiles !== undefined) {
                viewOptions['stagedFiles'] = stagedFiles;
            }

            var fileTransferView = new Projects.FileTransfer(viewOptions);
            this.parentView.setView('#project-file-staging', fileTransferView);
            fileTransferView.render();
        },
        _dropboxUpload: function(e) {
            e.preventDefault();

            var that = this;
            var options = {
                success: function(files) {

                    var isDuplicate = false;
                    var duplicateFilename = '';

                    for (var i = 0; i < files.length; i++) {
                        isDuplicate = that.projectFiles.checkForDuplicateFilename(files[i].name);

                        if (isDuplicate === true) {
                            duplicateFilename = files[i].name;
                            break;
                        }
                    };

                    if (isDuplicate === true) {
                        that.parentView.trigger('duplicateFileError', duplicateFilename);
                    }
                    else {

                        var fileSavePromises = $.map(files, function(file) {
                            return function() {

                                var agaveFile = new Backbone.Agave.Model.File.UrlImport({
                                    projectUuid: that.projectUuid,
                                    urlToIngest: file.link,
                                });

                                return agaveFile.save()
                                    .then(function() {

                                        var notificationData = agaveFile.getFileStagedNotificationData();

                                        App.Instances.WebsocketManager.trigger(
                                            'addFileImportPlaceholder',
                                            notificationData
                                        );
                                    })
                                    ;
                            };
                        });

                        var sequentialPromiseResults = fileSavePromises.reduce(
                            function(previous, current) {
                                return previous.then(current);
                            },
                            $.Deferred().resolve()
                        )
                        .then(function() {
                        })
                        .fail(function(error) {
                            var telemetry = new Backbone.Agave.Model.Telemetry();
                            telemetry.setError(error);
                            telemetry.set('method', 'Backbone.Agave.Model.File.UrlImport().save()');
                            telemetry.set('view', 'Projects.DetailActions');
                            telemetry.save();
                        })
                        ;
                    }
                },
                linkType: 'direct',
                multiselect: true,
            };

            Dropbox.choose(options);
        },
        _urlUpload: function(e) {
            e.preventDefault();

            var fileTransferView = new Projects.FileUrlTransfer({
                projectUuid: this.projectModel.get('uuid'),
                fileListings: this.projectFiles,
                projectDetailView: this.parentView,
            });

            this.parentView.setView('#project-file-staging', fileTransferView);
            fileTransferView.render();
        },

        _clickRunJob: function(e) {
            e.preventDefault();

            // Note: don't instantiate job subviews yet b/c we'll need to
            // include dependencies for that later on

            switch (e.currentTarget.dataset.jobtype) {
                case 'igblast':
                    var igBlastView = App.Views.Jobs.IgBlastStaging;
                    this._showJobStagingView(igBlastView);

                    break;

                case 'vdjpipe':
                    var vdjpipeView = App.Views.Jobs.VdjpipeStaging;
                    this._showJobStagingView(vdjpipeView);

                    break;

                default:
                    break;
            }
        },
        // TODO: simplify this
        _showJobStagingView: function(StagingSubview) {

            this.parentView.removeView('#project-job-staging');

            var selectedFileMetadataUuids = this._getSelectedFileUuids();
            var selectedFileListings = this.projectFiles.getNewCollectionForUuids(selectedFileMetadataUuids);
            var filteredFileListings = this.projectFiles.getNewCollectionForUuids(selectedFileMetadataUuids);

            // Remove qual files here
            selectedFileListings.forEach(function(model) {
                if (model.get('value')['fileType'] === Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_QUALITY) {
                    filteredFileListings.remove(model);
                }
            });

            // TODO: rename selectedFileListings param
            var jobSubmitView = new App.Views.Jobs.Submit({
                selectedFileListings: filteredFileListings,
                projectModel: this.projectModel,
                allFiles: this.projectFiles,
            });

            var stagingSubview = new StagingSubview({
                selectedFileListings: filteredFileListings,
                projectModel: this.projectModel,
                allFiles: this.projectFiles,
            });

            jobSubmitView.setView('#job-staging-subview', stagingSubview);
            stagingSubview.render();

            this.parentView.setView('#project-job-staging', jobSubmitView);

            var that = this;

            stagingSubview.fetchNetworkData()
                .done(function() {
                    jobSubmitView.render();

                    that.listenToOnce(
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
                                        })
                                        .fail(function(error) {
                                            var telemetry = new Backbone.Agave.Model.Telemetry();
                                            telemetry.setError(error);
                                            telemetry.set('method', 'workflowEditorView.fetchNetworkData()');
                                            telemetry.set('view', 'Projects.DetailActions');
                                            telemetry.save();
                                        })
                                        ;
                                });
                        }
                    );

                    that.listenToOnce(
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
                                        })
                                        .fail(function(error) {
                                            var telemetry = new Backbone.Agave.Model.Telemetry();
                                            telemetry.setError(error);
                                            telemetry.set('method', 'workflowEditorView.fetchNetworkData()');
                                            telemetry.set('view', 'Projects.DetailActions');
                                            telemetry.save();
                                        })
                                        ;
                                });
                        }
                    );

                })
                ;
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
        /**
         *  Files
         */
        _getSelectedFileUuids: function() {

            var that = this;

            var selectedFileMetadataUuids = [];

            $('.selected-files:checked').each(function() {
                var uuid = $(this).val();
                selectedFileMetadataUuids.push(uuid);

                var model = that.projectFiles.get(uuid);

                var pairedUuid = model.getPairedReadMetadataUuid();

                if (model.getQualityScoreMetadataUuid()) {
                    var qualModel = that.projectFiles.get(model.getQualityScoreMetadataUuid());
                    var qualUuid = qualModel.get('uuid');
                    selectedFileMetadataUuids.push(qualUuid);
                }

                // If we're dealing with a paired read,
                // then include the other paired file too
                if (pairedUuid) {
                    selectedFileMetadataUuids.push(pairedUuid);

                    // TODO: add paired read qual
                }
            });

            return selectedFileMetadataUuids;
        },
        _clickDeleteFiles: function(e) {
            e.preventDefault();

            var that = this;

            var selectedFileMetadataUuids = this._getSelectedFileUuids();

            var promises = [];

            // Set up promises
            selectedFileMetadataUuids.map(function(uuid) {

                var fileMetadataModel = that.projectFiles.get(uuid);

                // only delete 'projectFile' files
                if (fileMetadataModel.get('name') === 'projectFile') {

                    var fileModel = fileMetadataModel.getFileModel();

                    promises[promises.length] = function() {
                        return fileModel.softDelete();
                    };
                }

                // delete any matching metadata
                promises[promises.length] = function() {
                    return fileMetadataModel.softDelete();
                };
            });

            // Execute promises
            var sequentialPromiseResults = promises.reduce(
                function(previous, current) {
                    return previous.then(current);
                },
                $.Deferred().resolve()
            )
            .always(function() {
                that.projectFiles.remove(selectedFileMetadataUuids);

                var subviewParameters = that.parentView.getSubviewParameters();
                var filesView = new Projects.DetailFiles(subviewParameters);
                that.parentView.setView('#project-files', filesView);
                filesView.render();
            })
            .fail(function(error) {
                var telemetry = new Backbone.Agave.Model.Telemetry();
                telemetry.setError(error);
                telemetry.set('method', 'softDelete()');
                telemetry.set('view', 'Projects.DetailActions');
                telemetry.save();
            })
            ;

        },
        _clickDownloadMultipleFiles: function(e) {
            e.preventDefault();

            var selectedFileMetadataUuids = this._getSelectedFileUuids();

            this._downloadProjectFilesForMetadataUuids(selectedFileMetadataUuids);
        },
        _downloadProjectFilesForMetadataUuids: function(metadataUuids) {
            var that = this;

            metadataUuids.forEach(function(metadataUuid) {
                var fileMetadataModel = that.projectFiles.get(metadataUuid);
                var fileModel = fileMetadataModel.getFileModel();

                fileModel.downloadFileToDisk()
                    .fail(function(error) {
                        var telemetry = new Backbone.Agave.Model.Telemetry();
                        telemetry.setError(error);
                        telemetry.set('method', 'Backbone.Agave.Model.File.ProjectFile.downloadFileToDisk()');
                        telemetry.set('view', 'Projects.DetailActions');
                        telemetry.save();
                    })
                    ;
            });

        },
        /**
         *  Search
         */
        _searchFileListings: function(e) {
            e.preventDefault();

            var searchString = $('#search-text').val();

            var subviewParameters = this.parentView.getSubviewParameters();
            var filesView = new Projects.DetailFiles(subviewParameters);

            if (!searchString) {

                this.parentView.setView('#project-files', filesView);
                filesView.render();
            }
            else {

                var filteredFileListings = this.projectFiles.search(searchString);

                // results
                if (filteredFileListings.length > 0) {
                    subviewParameters.projectFiles = filteredFileListings;

                    filesView = new Projects.DetailFiles(subviewParameters);

                    this.parentView.setView('#project-files', filesView);
                    filesView.render();
                }
                // no results
                else {

                    var fileSearchNoResultsView = new Projects.FileSearchNoResults();
                    this.parentView.setView('#project-files', fileSearchNoResultsView);
                    fileSearchNoResultsView.render();
                }
            }
        },
    });

    Projects.DetailFiles = Backbone.View.extend(
        _.extend({}, ProjectMixin, {
            template: 'project/detail/files',

            // Public Methods
            initialize: function() {
                var loadingView = new App.Views.Util.Loading({keep: true});
                this.setView('', loadingView);
                loadingView.render();

                /*
                    1. get paired reads
                    2. add quals to paired reads

                    3. remove paired reads + quals from single reads
                    4. add quals to single reads
                */

                // Paired Reads w/ quals
                // 1.
                this.pairedReadFileListings = this.projectFiles.getPairedReadCollection();

                // 2.
                this.pairedReadFileListings = this.pairedReadFileListings.embedQualModels(this.projectFiles);
                this.pairedReads = this.pairedReadFileListings.getSerializableOrganizedPairedReads();

                // Single Reads w/ quals
                var embeddedPairedReadQualModels = this.pairedReadFileListings.getAllEmbeddedQualModels(this.projectFiles);

                this.singleReadFileListings = this.projectFiles.clone();

                // 3.
                this.singleReadFileListings.remove(embeddedPairedReadQualModels);

                // 4.
                this.singleReadFileListings = this.singleReadFileListings.embedQualModels(this.projectFiles);

                var embeddedSingleReadQualModels = this.singleReadFileListings.getEmbeddedQualModels(this.projectFiles);

                // Remove associated quals from file listing since they're embedded now
                this.singleReadFileListings.remove(embeddedSingleReadQualModels);

                //this.render();
                loadingView.remove();
            },
            serialize: function() {
                return {
                    singleReadFileListings: this.singleReadFileListings.toJSON(),
                    pairedReadFileListings: this.pairedReads,
                    readDirections: Backbone.Agave.Model.File.Metadata.getReadDirections(),
                    fileTypes: Backbone.Agave.Model.File.Metadata.getFileTypes(),
                    fileTypeNames: Backbone.Agave.Model.File.Metadata.getNamesForFileTypes(Backbone.Agave.Model.File.Metadata.getFileTypes()),
                };
            },
            events: {
                'click #drag-and-drop-box': '_clickFilesSelectorWrapper',
                'change .project-file-type': '_updateFileType',
                'change .project-file-read-direction': '_updateReadDirection',
                'change .project-file-tags': '_updateFileTags',

                'click .download-file': '_clickDownloadFile',

                // Select files
                'click .selected-files': '_selectFiles',
                'change #select-all-files-checkbox': '_selectAllFiles',

                'change #file-listings-dialog': '_openFileDialog',
            },
            afterRender: function() {
                this._setupDragDropEventHandlers();
            },
            _openFileDialog: function(e) {
                e.preventDefault();

                var selectedFiles = e.target.files;

                this.parentView.trigger('openFileDialog', selectedFiles);
            },

            _selectFiles: function(e) {

                if ($('.selected-files:checked').length) {
                    this.parentView.trigger('filesSelected', true);
                }
                else {
                    this.parentView.trigger('filesSelected', false);
                }
            },

            _selectAllFiles: function(e) {

                if (this.selectedAllFiles === true) {

                    this.selectedAllFiles = false;

                    $('.selected-files').each(function() {
                        this.checked = false;
                    });

                    this.parentView.trigger('filesSelected', false);
                }
                else {
                    this.selectedAllFiles = true;

                    $('.selected-files').each(function() {
                        this.checked = true;
                    });

                    this.parentView.trigger('filesSelected', true);
                }
            },

            _clickDownloadFile: function(e) {
                e.preventDefault();

                var metadataUuid = e.target.dataset.metadatauuid;

                var fileMetadataModel = this.projectFiles.get(metadataUuid);
                var fileModel = fileMetadataModel.getFileModel();

                fileModel.downloadFileToDisk()
                    .fail(function(error) {
                        var telemetry = new Backbone.Agave.Model.Telemetry();
                        telemetry.setError(error);
                        telemetry.set('method', 'Backbone.Agave.Model.File.ProjectFile.downloadFileToDisk()');
                        telemetry.set('view', 'Projects.DetailFiles');
                        telemetry.save();
                    })
                    ;
            },

            updatePlaceholderFileProgress: function(selector, percentCompleted) {
                $(selector)
                    .width(percentCompleted)
                    ;
            },

            // Private Methods

            // Event Handlers
            _updateFileType: function(e) {
                e.preventDefault();

                var that = this;

                var fileTypeId = parseInt(e.currentTarget.value);

                var fileMetadata = this.projectFiles.get(e.target.dataset.fileuuid);

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
                    .fail(function(error) {
                        that._uiShowSaveErrorAnimation(e.target);

                        var telemetry = new Backbone.Agave.Model.Telemetry();
                        telemetry.setError(error);
                        telemetry.set('method', 'Backbone.Agave.Model.File.Metadata.updateFileType()');
                        telemetry.set('view', 'Projects.DetailFiles');
                        telemetry.save();
                    })
                    ;
            },
            _updateReadDirection: function(e) {
                e.preventDefault();

                var that = this;

                var fileMetadata = this.projectFiles.get(e.target.dataset.fileuuid);

                fileMetadata.setReadDirection(e.target.value)
                    .done(function() {
                        that._uiShowSaveSuccessAnimation(e.target);
                    })
                    .fail(function(error) {
                        that._uiShowSaveErrorAnimation(e.target);

                        var telemetry = new Backbone.Agave.Model.Telemetry();
                        telemetry.setError(error);
                        telemetry.set('method', 'Backbone.Agave.Model.File.Metadata.setReadDirection()');
                        telemetry.set('view', 'Projects.DetailFiles');
                        telemetry.save();
                    })
                    ;

            },
            _updateFileTags: function(e) {
                e.preventDefault();

                var that = this;

                var fileMetadata = this.projectFiles.get(e.target.dataset.fileuuid);
                fileMetadata.updateTags(e.target.value)
                    .done(function() {
                        that._uiShowSaveSuccessAnimation(e.target);
                    })
                    .fail(function(error) {
                        that._uiShowSaveErrorAnimation(e.target);

                        var telemetry = new Backbone.Agave.Model.Telemetry();
                        telemetry.setError(error);
                        telemetry.set('method', 'Backbone.Agave.Model.File.Metadata.updateTags()');
                        telemetry.set('view', 'Projects.DetailFiles');
                        telemetry.save();
                    })
                    ;
            },
            _setupDragDropEventHandlers: function() {

                //if (this.projectFiles.models.length === 0) {
                if (
                    this.singleReadFileListings.models.length === 0
                    &&
                    this.pairedReads.length === 0
                ) {
                    // Drag and Drop Listeners
                    var dropZone = document.getElementById('drag-and-drop-box');
                    dropZone.addEventListener(
                        'dragover',
                        this._fileContainerDrag,
                        false
                    );

                    // Using fancy bind trick to keep 'this' context
                    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener
                    dropZone.addEventListener(
                        'drop',
                        this._fileContainerDrop.bind(this),
                        false
                    );
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

                // Hand off these file handlers to the parent view through this event.
                this.parentView.trigger('openFileDialog', files);
            },

            // Event Responders
            _clickFilesSelectorWrapper: function() {
                /*
                    This actually fires off an event that the parent view will catch.
                    The advantage of doing it this way is that the same file handling
                    logic can be reused no matter how the user is actually uploading
                    the file.
                */
                document.getElementById('file-listings-dialog').click();
            },
        })
    );

    Projects.FileSearchNoResults = Backbone.View.extend({
        template: 'project/detail/file-search-no-results',
    });

    Projects.FileUrlTransfer = Backbone.View.extend(
        _.extend({}, FileTransferProjectUiMixin, {

            // Public Methods
            template: 'project/detail/file-url-transfer',
            initialize: function(parameters) {

                var chance = new Chance();

                this.fileUniqueIdentifier = chance.guid();
            },
            serialize: function() {
                return {
                    fileUniqueIdentifier: this.fileUniqueIdentifier,
                };
            },
            events: function() {
                return {
                    'click .cancel-upload-button': '_cancelUpload',
                    'click .submit-upload-button': '_startUpload',
                };
            },

            // Private Methods

            // Event Responders
            _cancelUpload: function(e) {
                e.preventDefault();

                /*
                this.models.forEach(function(model) {
                    console.log("trigger upload cancel")
                    model.trigger(Backbone.Agave.Model.File.ProjectFile.CANCEL_UPLOAD);
                });
                */

                this.remove();
            },

            _startUpload: function(e) {
                e.preventDefault();

                var formData = Backbone.Syphon.serialize(this);

                var urls = [];

                for (var prop in formData) {
                    if (formData[prop].length > 0) {
                        urls.push(formData[prop]);
                    }
                }

                var isDuplicate = this._checkDuplicateFiles(urls);

                if (isDuplicate === true) {
                    return;
                }
                else {
                    var that = this;

                    var promises = $.map(urls, function(url) {
                        return function() {
                            var agaveFile = new Backbone.Agave.Model.File.UrlImport({
                                projectUuid: that.projectUuid,
                                urlToIngest: url,
                            });

                            return agaveFile.save()
                                .then(function() {
                                    var notificationData = agaveFile.getFileStagedNotificationData();

                                    App.Instances.WebsocketManager.trigger(
                                        'addFileImportPlaceholder',
                                        notificationData
                                    );
                                })
                                ;
                        };
                    });

                    this._mixinUiUploadStart(this.fileUniqueIdentifier);
                    this._mixinUiSetProgressMessage(this.fileUniqueIdentifier, 'Importing files...');

                    var counter = 1;

                    var sequentialPromiseResults = promises.reduce(
                        function(previous, current) {

                            that._mixinUiProgressBar(counter, promises.length);
                            counter++;

                            return previous.then(current);
                        },
                        $.Deferred().resolve()
                    )
                    .then(function() {
                        that._mixinUiSetSuccessMessage('Files imported successfully.');
                        that.remove();
                        $('html,body').animate({scrollTop: 0});
                    })
                    .fail(function() {
                        that._mixinUiSetUploadProgress(that.fileUniqueIdentifier, 0);
                        that._mixinUiSetErrorMessage(that.fileUniqueIdentifier, 'Import error. Please check your URLs and try again.');

                        var telemetry = new Backbone.Agave.Model.Telemetry();
                        telemetry.setError(error);
                        telemetry.set('method', 'Backbone.Agave.Model.File.UrlImport.save()');
                        telemetry.set('view', 'Projects.FileUrlTransfer');
                        telemetry.save();
                    })
                    ;
                }
            },
            _checkDuplicateFiles: function(urls) {
                var filenames = urls.map(function(url) {
                    // Example input: https://www.dropbox.com/s/tuhocuchput9y81/text9.txt?dl=0

                    url = url.split('/');
                    // Stage 1: ["https:","","www.dropbox.com","s","tuhocuchput9y81","text9.txt?dl=0"]

                    url = url.pop();
                    // Stage 2: "text9.txt?dl=0"

                    url = url.split('?');
                    // Stage 3: ["text9.txt","dl=0"]

                    url = url.shift();
                    // Stage 4: "text9.txt"

                    return url;
                });

                var isDuplicate = false;
                var duplicateFilename = '';

                for (var i = 0; i < filenames.length; i++) {
                    isDuplicate = this.fileListings.checkForDuplicateFilename(filenames[i]);

                    if (isDuplicate === true) {
                        duplicateFilename = filenames[i];
                        break;
                    }
                };

                if (isDuplicate) {
                    this.parentView.trigger('duplicateFileError', duplicateFilename);
                }

                return isDuplicate;
            },
        })
    );

    Projects.FileUploadSelected = Backbone.View.extend({
        template: 'project/detail/file-upload-from-computer-detail',
        serialize: function() {
            return {
                file: this.model.toJSON(),
                fileTypes: Backbone.Agave.Model.File.Metadata.getFileTypes(),
                fileTypeNames: Backbone.Agave.Model.File.Metadata.getNamesForFileTypes(Backbone.Agave.Model.File.Metadata.getFileTypes()),
            };
        },
    });

    Projects.FileTransfer = Backbone.View.extend(
        _.extend({}, FileTransferProjectUiMixin, {

            // Public Methods
            template: 'project/detail/file-upload-from-computer',
            initialize: function(parameters) {

                this.models = [];

                var chance = new Chance();

                this.fileUniqueIdentifier = chance.guid();

                if (parameters && parameters.hasOwnProperty('stagedFiles')) {
                    this._displayStagedFiles(parameters.stagedFiles);
                }
            },
            serialize: function() {
                return {
                    fileUniqueIdentifier: this.fileUniqueIdentifier,
                };
            },
            events: {
                'change .file-type': '_updateTypeTags',
                'click .cancel-upload-button': '_cancelUpload',
                'click #file-upload-from-computer-file-browser': '_selectFiles',
                'change #file-dialog': '_changeSelectedFiles',
                'submit form':  '_startUpload',
            },

            // Private Methods

            // Event Responders
            _selectFiles: function(e) {

                if (e !== undefined) {
                    e.preventDefault();
                }

                document.getElementById('file-dialog').click();
            },

            _changeSelectedFiles: function(e) {
                e.preventDefault();

                var selectedFiles = e.target.files;

                this._displayStagedFiles(selectedFiles);
            },
            _displayStagedFiles: function(files) {
                var chance = new Chance();

                // FileUploadSelected
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];

                    var formElementGuid = chance.guid();

                    var stagedFile = new Backbone.Agave.Model.File.ProjectFile({
                        name: file.name,
                        length: file.size,
                        lastModified: file.lastModifiedDate,
                        projectUuid: this.projectUuid,
                        fileReference: file,
                        formElementGuid: formElementGuid,
                    });

                    if (this._checkDuplicateFile(file.name) === true) {
                        continue;
                    }

                    this.models.push(stagedFile);

                    var fileUploadSelectedView = new Projects.FileUploadSelected({model: stagedFile});

                    this.insertView('.file-upload-subviews-' + this.fileUniqueIdentifier, fileUploadSelectedView);
                    fileUploadSelectedView.render();
                };
            },
            _checkDuplicateFile: function(filename) {

                var isDuplicate = this.fileListings.checkForDuplicateFilename(filename);

                if (isDuplicate === true) {
                    this.parentView.trigger('duplicateFileError', filename);
                }

                return isDuplicate;
            },

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

                this.models.forEach(function(model) {
                    model.trigger(Backbone.Agave.Model.File.ProjectFile.CANCEL_UPLOAD);
                });

                this.remove();
            },

            _startUpload: function(e) {
                e.preventDefault();

                var formData = Backbone.Syphon.serialize(this);

                var that = this;

                this._mixinUiUploadStart(this.fileUniqueIdentifier);
                this._mixinUiSetProgressMessage(this.fileUniqueIdentifier, 'Uploading files...');

                var totalLength = this.models.reduce(function(lengthSum, model) {
                    return lengthSum + model.get('length');
                }, 0);

                // Set up a placeholder for all model progress
                var progress = {};
                this.models.forEach(function(model) {
                    var name = model.get('name');
                    progress[name] = 0;
                });

                var modelSavePromises = $.map(this.models, function(file) {
                    return function() {

                        file.applyUploadAttributes(formData);

                        that.listenTo(file, Backbone.Agave.Model.File.UPLOAD_PROGRESS, function(progressLength) {
                            var totalProgressLength = 0;

                            // Update model progress placeholder
                            progress[file.get('name')] = progressLength;

                            // Sum current model progress placeholders
                            for (var key in progress) {
                                totalProgressLength += progress[key];
                            }

                            that._mixinUiProgressBar(totalProgressLength, totalLength);
                        });

                        var deferred = $.Deferred();

                        file.save()
                            .then(function() {
                                return file.notifyApiUploadComplete();
                            })
                            .then(function() {

                                var notificationData = file.getFileStagedNotificationData();

                                App.Instances.WebsocketManager.trigger(
                                    'addFileImportPlaceholder',
                                    notificationData
                                );

                                deferred.resolve();
                            })
                            .fail(function(error) {
                                var telemetry = new Backbone.Agave.Model.Telemetry();
                                telemetry.setError(error);
                                telemetry.set('method', 'Backbone.Agave.Model.File.ProjectFile.save()');
                                telemetry.set('view', 'Projects.FileTransfer');
                                telemetry.save();

                                deferred.resolve();
                            })
                            ;

                        return deferred;
                    };
                });

                var sequentialPromiseResults = modelSavePromises.reduce(
                    function(previous, current) {
                        return previous.then(current);
                    },
                    $.Deferred().resolve()
                )
                .then(function() {
                    that._mixinUiSetSuccessMessage('Files uploaded successfully.');
                    that.remove();
                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(error);
                    telemetry.set('method', 'file.save()');
                    telemetry.set('view', 'Projects.FileTransfer');
                    telemetry.save();
                })
                ;
            },
        })
    );

    Projects.PairedReadFileAssociations = Backbone.View.extend(
        _.extend({}, ProjectMixin, {
            template: 'project/paired-read-file-associations',
            initialize: function(parameters) {

                this.readLevelMetadatas = new Backbone.Agave.Collection.Files.Metadata({projectUuid: parameters.projectUuid});

                this.pairableMetadatas = new Backbone.Agave.Collection.Files.Metadata({projectUuid: parameters.projectUuid});

                var fileMetadatas = new Backbone.Agave.Collection.Files.Metadata({projectUuid: parameters.projectUuid});

                var that = this;

                fileMetadatas.fetch()
                    .done(function() {
                        that.readLevelMetadatas = fileMetadatas.getReadLevelCollection();
                        that.pairableMetadatas = fileMetadatas.getReadLevelCollection();

                        that.render();
                    })
                    .fail(function(error) {
                        var telemetry = new Backbone.Agave.Model.Telemetry();
                        telemetry.setError(error);
                        telemetry.set('method', 'Backbone.Agave.Collection.Files.Metadata()');
                        telemetry.set('view', 'Projects.PairedReadFileAssociations');
                        telemetry.save();
                    })
                    ;
            },
            serialize: function() {
                if (this.readLevelMetadatas) {
                    return {
                        readLevelMetadatas: this.readLevelMetadatas.toJSON(),
                        pairableMetadatas: this.pairableMetadatas.toJSON(),
                    };
                }
            },
            events: {
                'change .paired-read-file': '_updatePairedFileAssociation',
            },

            // Private Methods
            _updatePairedFileAssociation: function(e) {
                e.preventDefault();

                var that = this;

                var pairUuid = e.target.dataset.pairuuid;
                var fileUuid = e.target.value;

                var pairModel = this.readLevelMetadatas.get(pairUuid);
                var fileModel = this.readLevelMetadatas.get(fileUuid);

                if (fileUuid.length > 0) {

                    var savePairedReadPromises = [];

                    var createSavePairedReadPromise = function(model, uuid) {
                        model.setPairedReadMetadataUuid(uuid);
                    };

                    savePairedReadPromises.push(createSavePairedReadPromise(pairModel, fileUuid));
                    savePairedReadPromises.push(createSavePairedReadPromise(fileModel, pairUuid));

                    $.when.apply($, savePairedReadPromises)
                        .then(function() {
                            return that._uiShowSaveSuccessAnimation(e.target);
                        })
                        .always(function() {
                            that.render();
                        })
                        .fail(function(error) {
                            var telemetry = new Backbone.Agave.Model.Telemetry();
                            telemetry.setError(error);
                            telemetry.set('method', 'setPairedReadMetadataUuid()');
                            telemetry.set('view', 'Projects.PairedReadFileAssociations');
                            telemetry.save();
                        })
                        ;
                }
                else {

                    fileUuid = pairModel.getPairedReadMetadataUuid();
                    fileModel = this.readLevelMetadatas.get(fileUuid);

                    Backbone.Agave.Collection.Files.Metadata.disassociatePairedReads(fileModel, pairModel)
                        .then(function() {
                            return that._uiShowSaveSuccessAnimation(e.target);
                        })
                        .always(function() {
                            that.render();
                        })
                        .fail(function(error) {
                            var telemetry = new Backbone.Agave.Model.Telemetry();
                            telemetry.setError(error);
                            telemetry.set('method', 'Backbone.Agave.Collection.Files.Metadata.disassociatePairedReads()');
                            telemetry.set('view', 'Projects.PairedReadFileAssociations');
                            telemetry.save();
                        })
                        ;
                }
            },
        })
    );

    Projects.QualFileAssociations = Backbone.View.extend(
        _.extend({}, ProjectMixin, {
            template: 'project/qual-file-associations',
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
                    .fail(function(error) {
                        var telemetry = new Backbone.Agave.Model.Telemetry();
                        telemetry.setError(error);
                        telemetry.set('method', 'Backbone.Agave.Collection.Files.Metadata.fetch()');
                        telemetry.set('view', 'Projects.QualFileAssociations');
                        telemetry.save();
                    })
                    ;
            },
            serialize: function() {
                if (this.fastaMetadatas) {
                    return {
                        fastaMetadatas: this.fastaMetadatas.toJSON(),
                        qualMetadatas: this.qualMetadatas.toJSON(),
                        fileTypes: Backbone.Agave.Model.File.Metadata.getFileTypes(),
                        fileTypeNames: Backbone.Agave.Model.File.Metadata.getNamesForFileTypes(Backbone.Agave.Model.File.Metadata.getFileTypes()),
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

                    fastaModel.setQualityScoreMetadataUuid(qualModel.get('uuid'))
                        .then(function() {
                            return that._uiShowSaveSuccessAnimation(e.target);
                        })
                        .done(function() {
                            that.render();
                        })
                        .fail(function(error) {
                            var telemetry = new Backbone.Agave.Model.Telemetry();
                            telemetry.setError(error);
                            telemetry.set('method', 'Backbone.Agave.Collection.Files.Metadata.setQualityScoreMetadataUuid()');
                            telemetry.set('view', 'Projects.QualFileAssociations');
                            telemetry.save();
                        })
                        ;
                }
                else {
                    fastaModel.removeQualityScoreMetadataUuid()
                        .then(function() {
                            return that._uiShowSaveSuccessAnimation(e.target);
                        })
                        .done(function() {
                            that.render();
                        })
                        .fail(function(error) {
                            var telemetry = new Backbone.Agave.Model.Telemetry();
                            telemetry.setError(error);
                            telemetry.set('method', 'Backbone.Agave.Collection.Files.Metadata.removeQualityScoreMetadataUuid()');
                            telemetry.set('view', 'Projects.QualFileAssociations');
                            telemetry.save();
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
                            return fileMetadata.removeQualityScoreMetadataUuid();
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
                    .fail(function(error) {
                        that._uiShowSaveErrorAnimation(e.target);

                        var telemetry = new Backbone.Agave.Model.Telemetry();
                        telemetry.setError(error);
                        telemetry.set('method', 'Backbone.Agave.Collection.Files.Metadata.updateFileType()');
                        telemetry.set('view', 'Projects.QualFileAssociations');
                        telemetry.save();
                    })
                    ;

            },
        })
    );

    Projects.Settings = Backbone.View.extend({

        // Public Methods
        template: 'project/settings',
        initialize: function(parameters) {

            // Project settings
            this.permissions = new Backbone.Agave.Collection.Permissions({uuid: this.projectUuid});
            this.tenantUsers = new Backbone.Agave.Collection.TenantUsers();
            this.model = new Backbone.Agave.Model.Project();

            var that = this;

            if (App.Datastore.Collection.ProjectCollection.models.length === 0) {
                this.listenTo(App.Datastore.Collection.ProjectCollection, 'sync', function() {
                    that.model = App.Datastore.Collection.ProjectCollection.get(that.projectUuid);
                    that.render();
                });
            } else {
                this.model = App.Datastore.Collection.ProjectCollection.get(this.projectUuid);
                this.render();
            }

            // User settings
            this.permissions.fetch()
                .done(function() {
                    that.permissions.remove(EnvironmentConfig.agave.serviceAccountUsername);
                    that.tenantUsers.fetch()
                        .done(function() {
                            that.render();
                        })
                        .fail(function(error) {
                            var telemetry = new Backbone.Agave.Model.Telemetry();
                            telemetry.setError(error);
                            telemetry.set('method', 'Backbone.Agave.Collection.TenantUsers.fetch()');
                            telemetry.set('view', 'Projects.ManageUsers');
                            telemetry.save();
                        })
                        ;
                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(error);
                    telemetry.set('method', 'Backbone.Agave.Collection.Permissions.fetch()');
                    telemetry.set('view', 'Projects.ManageUsers');
                    telemetry.save();
                });

        },
        serialize: function() {
            return {
                project: this.model.toJSON(),
                users: this.permissions.toJSON(),
            };
        },
        afterRender: function() {
            this.tenantUsers.remove(EnvironmentConfig.agave.serviceAccountUsername);
            this._usernameTypeahead(this.permissions, this.tenantUsers);
        },
        events: {
            'click #launch-delete-project-modal': '_launchDeleteProjectModal',

            'click .remove-user-from-project': '_removeUserFromProject',

            'click  #delete-project': '_deleteProject',
            'submit #project-delete-form': '_deleteProject',

            'click  #save-project-name': '_saveProjectName',
            'submit #project-name-form': '_saveProjectName',

            'click  #save-project-description': '_saveProjectDescription',
            'submit #project-description-form': '_saveProjectDescription',

            'click  #add-user': '_addUserToProject',
            'submit #user-add-form': '_addUserToProject',
        },

        // Private Methods
        // Event Responders
        _launchDeleteProjectModal: function(e) {
            e.preventDefault();

            $('#delete-modal').modal('show');
        },
        _saveProjectDescription: function(e) {
            e.preventDefault();

            var newProjectDescription = $('#project-description').val();

            var value = this.model.get('value');

            value.description = newProjectDescription;

            this.model.set('value', value);

            this.model.save()
                .done(function() {
                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(error);
                    telemetry.set('method', 'Backbone.Agave.Model.Project.save()');
                    telemetry.set('view', 'Projects.Settings._saveProjectDescription');
                    telemetry.save();
                })
                ;
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
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(error);
                    telemetry.set('method', 'Backbone.Agave.Model.Project.save()');
                    telemetry.set('view', 'Projects.Settings._saveProjectName');
                    telemetry.save();
                })
                ;
        },
        _deleteProject: function(e) {
            e.preventDefault();

            // Note: Agave currently returns what backbone considers to be the 'wrong' http status code
            this.model.destroy()
                .always(function() {
                    $('#delete-modal').modal('hide')
                        .on('hidden.bs.modal', function() {

                            if (App.Datastore.Collection.ProjectCollection.models.length === 0) {
                                App.router.navigate('/project/create', {
                                    trigger: true,
                                });
                            }
                            else {
                                App.router.navigate('/project', {
                                    trigger: true,
                                });
                            }

                        })
                    ;
                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(error);
                    telemetry.set('method', 'Backbone.Agave.Model.Project.destroy()');
                    telemetry.set('view', 'Projects.Settings');
                    telemetry.save();
                })
                ;
        },

        // User Private Methods
        // Typeahead
        _usernameTypeahead: function(permissions, tenantUsers) {
            var filteredTenantUsers = tenantUsers.clone();

            for (var i = 0; i < tenantUsers.models.length; i++) {
                var tenantUser = tenantUsers.get(tenantUsers.models[i]);

                for (var j = 0; j < permissions.models.length; j++) {
                    var permission = permissions.get(permissions.models[j]);

                    // Prune users that shouldn't be in typeahead.
                    if (permission.get('username') === tenantUser.get('username')) {
                        filteredTenantUsers.remove(tenantUser);
                    }
                }
            }

            // Instantiate the bloodhound suggestion engine
            var usernameSuggestionEngine = new Bloodhound({
                datumTokenizer: function(data) {
                    data = data['first_name']
                         + ' ' + data['last_name']
                         + ' ' + data['email']
                         + ' ' + data['username']
                         ;

                    return Bloodhound.tokenizers.whitespace(data);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                local: filteredTenantUsers.toJSON(),
            });

            // Initialize the bloodhound suggestion engine
            usernameSuggestionEngine.initialize()
                .done(function() {

                    // Instantiate the typeahead UI
                    $('#add-username').typeahead(
                        {
                            minLength: 1,
                            highlight: true,
                            hint: false,
                        },
                        {
                            displayKey: function(value) {
                                value = value['username'];
                                return value;
                            },
                            source: usernameSuggestionEngine.ttAdapter(),
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

            // Check that username exists before adding
            var tenantUsers = this.tenantUsers.clone();
            if (_.has(tenantUsers._byId, username)) {
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
                                .fail(function(error) {
                                    var telemetry = new Backbone.Agave.Model.Telemetry();
                                    telemetry.setError(error);
                                    telemetry.set('method', 'Backbone.Agave.Model.Permission.addUserToProject()');
                                    telemetry.set('view', 'Projects.ManageUsers');
                                    telemetry.save();
                                })
                                ;

                            that.permissions.add(newUserPermission);
                            that.render();
                            that._usernameTypeahead(that.permissions, that.tenantUsers);
                        },
                        error: function() {
                            var telemetry = new Backbone.Agave.Model.Telemetry();
                            telemetry.setError(error);
                            telemetry.set('method', 'Backbone.Agave.Model.Permission.create()');
                            telemetry.set('view', 'Projects.ManageUsers');
                            telemetry.save();
                        },
                    }
                );
            }
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
                        .fail(function(error) {
                            var telemetry = new Backbone.Agave.Model.Telemetry();
                            telemetry.setError(error);
                            telemetry.set('method', 'Backbone.Agave.Model.Permission.destroy()');
                            telemetry.set('view', 'Projects.ManageUsers');
                            telemetry.save();
                        })
                        ;
                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(error);
                    telemetry.set('method', 'Backbone.Agave.Model.Permission.removeUserFromProject()');
                    telemetry.set('view', 'Projects.ManageUsers');
                    telemetry.save();
                })
                ;
        },
    });

    App.Views.Projects = Projects;
    return Projects;
});
