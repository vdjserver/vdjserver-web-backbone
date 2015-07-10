/* global Bloodhound */
define([
    'app',
    'handlebars',
    'filesize',
    'environment-config',
    'moment',
    'handlebars-utilities',
    'chance',
    'file-download-detection-mixin',
    'file-transfer-sidebar-ui-mixin',
    'socket-io',
    'backbone.syphon',
], function(
    App,
    Handlebars,
    filesize,
    EnvironmentConfig,
    moment,
    HandlebarsUtilities,
    Chance,
    FileDownloadDetectionMixin,
    FileTransferSidebarUiMixin
) {

    'use strict';

    HandlebarsUtilities.registerRawPartial(
        'shared-fragments/file-downloads-unsupported',
        'file-downloads-unsupported'
    );

    HandlebarsUtilities.registerRawPartial(
        'project/fragments/project-file-list-title',
        'project-file-list-title'
    );

    HandlebarsUtilities.registerRawPartial(
        'project/fragments/project-file-list-last-modified',
        'project-file-list-last-modified'
    );

    HandlebarsUtilities.registerRawPartial(
        'project/fragments/project-file-list-size',
        'project-file-list-size'
    );

    HandlebarsUtilities.registerRawPartial(
        'project/fragments/project-file-list-origin',
        'project-file-list-origin'
    );

    HandlebarsUtilities.registerRawPartial(
        'project/fragments/project-file-list-tags',
        'project-file-list-tags'
    );

    HandlebarsUtilities.registerRawPartial(
        'project/fragments/project-file-list-spacer',
        'project-file-list-spacer'
    );

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
                            .fail(function(error) {
                                var telemetry = new Backbone.Agave.Model.Telemetry();
                                telemetry.set('error', JSON.stringify(error));
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

    Projects.Detail = Backbone.View.extend(
        _.extend({}, FileTransferSidebarUiMixin, {
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
                'click #dropbox-upload': '_dropboxUpload',
                'click #file-upload':    '_clickFilesSelectorWrapper',
                'change #file-dialog':   '_changeFilesSelector',
                'click .selected-files': '_uiToggleDisabledButtonStatus',
                'change #select-all-files-checkbox': '_toggleSelectAllFiles',
                'click .unlink-qual':   '_unlinkQual',
                'click .unlink-paired-read':   '_unlinkPairedRead',
                'click #run-job-button':  '_clickJobDropdown',
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
                this.fileListings.reset();
                return this.fileListings.fetch()
                    .then(function() {
                        that._removeLoadingViews();

                        // Need to render main view before rendering fileListing subview
                        that.render();

                        that._setupFileListingsView(that.fileListings);
                    })
                    .fail(function(error) {
                        var telemetry = new Backbone.Agave.Model.Telemetry();
                        telemetry.set('error', JSON.stringify(error));
                        telemetry.set('method', 'Backbone.Agave.Collection.Files.Metadata().fetch()');
                        telemetry.set('view', 'Projects.Detail');
                        telemetry.save();
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
                    .fail(function(error) {
                        var telemetry = new Backbone.Agave.Model.Telemetry();
                        telemetry.set('error', JSON.stringify(error));
                        telemetry.set('method', 'Backbone.Agave.Collection.Permissions().fetch()');
                        telemetry.set('view', 'Projects.Detail');
                        telemetry.save();
                    });
            },

            _getSelectedFileUuids: function() {

                var that = this;

                var selectedFileMetadataUuids = [];

                $('.selected-files:checked').each(function() {
                    var uuid = $(this).val();

                    var model = that.fileListings.get(uuid);
                    var pairedUuid = model.getPairedReadMetadataUuid();

                    selectedFileMetadataUuids.push(uuid);

                    // If we're dealing with a paired read,
                    // then include the other paired file too
                    if (pairedUuid) {
                        selectedFileMetadataUuids.push(pairedUuid);
                    }
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

                    // Putting this in |singleReadListings| for now. If we ever
                    // support paired file uploads, then it will need to be updated.
                    fileListingsView.singleReadFileListings.add(newFile);
                    fileListingsView.render();
                });
            },

            // Job Staging
            _showJobStagingView: function(StagingSubview) {

                this.removeView('#job-submit');
                this.removeView('#workflow-modal');
                this.removeView('#job-staging-subview');

                var selectedFileMetadataUuids = this._getSelectedFileUuids();
                var selectedFileListings = this.fileListings.getNewCollectionForUuids(selectedFileMetadataUuids);

                var jobSubmitView = new App.Views.Jobs.Submit({
                    selectedFileListings: selectedFileListings,
                    projectModel: this.projectModel,
                    allFiles: this.fileListings,
                });

                var stagingSubview = new StagingSubview({
                    selectedFileListings: selectedFileListings,
                    projectModel: this.projectModel,
                    allFiles: this.fileListings,
                });

                jobSubmitView.setView('#job-staging-subview', stagingSubview);
                stagingSubview.render();

                this.setView('#job-submit', jobSubmitView);

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
                                                telemetry.set('error', JSON.stringify(error));
                                                telemetry.set('method', 'workflowEditorView.fetchNetworkData()');
                                                telemetry.set('view', 'Projects.Detail');
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
                                                telemetry.set('error', JSON.stringify(error));
                                                telemetry.set('method', 'workflowEditorView.fetchNetworkData()');
                                                telemetry.set('view', 'Projects.Detail');
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
            _clickFilesSelectorWrapper: function(e) {
                e.preventDefault();
                document.getElementById('file-dialog').click();
            },
            _changeFilesSelector: function(e) {
                var files = e.target.files;
                this._parseFiles(files);
            },
            _dropboxUpload: function(e) {
                e.preventDefault();

                var that = this;
                var options = {
                    success: function(files) {

                        var createFileSavePromise = function(model) {
                            return model.save()
                                .then(function(response) {

                                    if (response.hasOwnProperty('result') === true && response.result.hasOwnProperty('uuid') === true) {
                                        var fileTransferNotification = new Backbone.Agave.Model.Notification.FileImport();

                                        fileTransferNotification.set('associatedUuid', response.result.uuid);
                                        fileTransferNotification.projectUuid = that.projectUuid;
                                        fileTransferNotification.filename = model.filename;
                                        fileTransferNotification.projectView = that;

                                        return fileTransferNotification.save()
                                            .then(function() {
                                                App.Instances.WebsocketManager.subscribeToEvent(response.result.uuid);
                                            })
                                            .then(function() {
                                                var listView = App.Layouts.sidebar.getView('.sidebar');
                                                listView.addFileImportNotification(fileTransferNotification);
                                            })
                                            ;
                                    }
                                })
                                ;
                        };

                        var fileSavePromises = [];
                        for (var i = 0; i < files.length; i++) {

                            var agaveFile = new Backbone.Agave.Model.File.Dropbox({
                                projectUuid: that.projectUuid,
                                urlToIngest: files[i].link,
                            });

                            agaveFile.filename = files[i].name;

                            fileSavePromises[fileSavePromises.length] = createFileSavePromise(agaveFile);
                        };

                        $.when.apply($, fileSavePromises)
                            .then(function(results) {
                                //console.log("all fileSaves done. results are: " + JSON.stringify(results));
                            })
                            ;
                    },
                    linkType: 'direct',
                    multiselect: true,
                };

                Dropbox.choose(options);
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
            _unlinkQual: function(e) {
                e.preventDefault();

                // Use this instead of e.target.id because the click event will
                // sometimes land on a child element instead of the button itself.
                // If that happens, e.target.id will refer to the child and not the button.
                var uuid = $(e.target).closest('button').attr('id');

                var fileMetadataModel = this.fileListings.get(uuid);

                if (fileMetadataModel) {

                    var that = this;

                    fileMetadataModel.removeQualityScoreMetadataUuid()
                        .done(function() {
                            that._fetchAndRenderFileListings();
                        })
                        .fail(function(error) {
                            var telemetry = new Backbone.Agave.Model.Telemetry();
                            telemetry.set('error', JSON.stringify(error));
                            telemetry.set('method', 'fileMetadataModel.removeQualityScoreMetadataUuid()');
                            telemetry.set('view', 'Projects.Detail');
                            telemetry.save();
                        })
                        ;
                }
            },
            _unlinkPairedRead: function(e) {
                e.preventDefault();

                // Use this instead of e.target.id because the click event will
                // sometimes land on a child element instead of the button itself.
                // If that happens, e.target.id will refer to the child and not the button.
                var uuid = $(e.target).closest('button').attr('id');

                var pairFile1Model = this.fileListings.get(uuid);

                var pairFile2Model = this.fileListings.get(pairFile1Model.getPairedReadMetadataUuid());

                if (pairFile1Model && pairFile2Model) {

                    var that = this;

                    Backbone.Agave.Collection.Files.Metadata.disassociatePairedReads(pairFile1Model, pairFile2Model)
                        .then(function() {
                            // Workaround for occasional rendering failure
                            setTimeout(function() {
                                that._fetchAndRenderFileListings();
                            }, 100);
                        })
                        ;
                }
            },
            _clickJobDropdown: function(e) {
                e.preventDefault();

                $('.not-job-selectable').each(function() {
                    this.checked = false;
                });

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
            _clickDeleteFiles: function(e) {
                e.preventDefault();

                var selectedFileMetadataUuids = this._getSelectedFileUuids();

                var createFileSoftDeletePromise = function(model) {
                    return model.softDelete();
                };

                var createFileMetadataSoftDeletePromise = function(model) {
                    return model.softDelete();
                };

                var filePromises = [];
                var metadataPromises = [];

                for (var i = 0; i < selectedFileMetadataUuids.length; i++) {
                    var fileMetadataModel = this.fileListings.get(selectedFileMetadataUuids[i]);

                    if (fileMetadataModel.get('name') === 'projectFile') {

                        var fileModel = fileMetadataModel.getFileModel();

                        filePromises[filePromises.length] = createFileSoftDeletePromise(fileModel);
                    }

                    metadataPromises[i] = createFileMetadataSoftDeletePromise(fileMetadataModel);
                }

                var that = this;

                $.when.apply($, filePromises, metadataPromises)
                    .always(function() {
                        that._fetchAndRenderFileListings();
                    })
                    .fail(function(error) {
                        var telemetry = new Backbone.Agave.Model.Telemetry();
                        telemetry.set('error', JSON.stringify(error));
                        telemetry.set('method', 'softDelete()');
                        telemetry.set('view', 'Projects.Detail');
                        telemetry.save();
                    })
                    ;
            },

            _clickDownloadFile: function(e) {
                e.preventDefault();

                var metadataUuid = e.target.dataset.metadatauuid;

                var fileMetadataModel = this.fileListings.get(metadataUuid);
                var fileModel = fileMetadataModel.getFileModel();

                var chance = new Chance();

                var fileUniqueIdentifier = chance.guid();

                this._setListMenuFileTransferView(
                    this.projectUuid,
                    fileUniqueIdentifier,
                    fileMetadataModel.get('value')['name']
                );

                // Agave won't provide the length header on the download, but we
                // can retrieve this now and use this instead.
                var totalSize = fileMetadataModel.get('value')['length'];

                var that = this;

                var xhr = fileModel.downloadFileToDisk();

                xhr.addEventListener(
                    'progress',
                    function(progress) {

                        var percentCompleted = 0;

                        if (progress.lengthComputable) {
                            percentCompleted = progress.loaded / progress.total;
                        }
                        else {
                            percentCompleted = progress.loaded / totalSize;
                        }

                        percentCompleted *= 100;

                        that._uiSetUploadProgress(percentCompleted, fileUniqueIdentifier);
                    },
                    false
                );

                xhr.addEventListener(
                    'load',
                    function() {
                        that._uiSetSidemenuTransferSuccess(fileUniqueIdentifier);
                    },
                    false
                );
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
        })
    );

    Projects.FileSearchNoResults = Backbone.View.extend({
        template: 'project/file-search-no-results',
    });

    Projects.FileListings = Backbone.View.extend(
        _.extend({}, ProjectMixin, FileDownloadDetectionMixin, {

            // Public Methods
            initialize: function() {

                /*
                    1.) get paired reads
                    2.) add quals to paired reads

                    3.) remove paired reads + quals from single reads
                    4.) add quals to single reads
                */

                // Paired Reads w/ quals
                // 1.
                this.pairedReadFileListings = this.fileListings.getPairedReadCollection();

                // 2.
                this.pairedReadFileListings = this.pairedReadFileListings.embedQualModels(this.fileListings);
                this.pairedReads = this.pairedReadFileListings.getSerializableOrganizedPairedReads();

                // Single Reads w/ quals
                var embeddedPairedReadQualModels = this.pairedReadFileListings.getAllEmbeddedQualModels(this.fileListings);

                this.singleReadFileListings = this.fileListings.clone();

                // 3.
                this.singleReadFileListings.remove(embeddedPairedReadQualModels);

                // 4.
                this.singleReadFileListings = this.singleReadFileListings.embedQualModels(this.fileListings);

                var embeddedSingleReadQualModels = this.singleReadFileListings.getEmbeddedQualModels(this.fileListings);

                // Remove associated quals from file listing since they're embedded now
                this.singleReadFileListings.remove(embeddedSingleReadQualModels);

                //this.render();

                // Blob Save Detection
                this._setDownloadCapabilityDetection();
            },
            template: 'project/file-listings',
            serialize: function() {
                return {
                    singleReadFileListings: this.singleReadFileListings.toJSON(),
                    pairedReadFileListings: this.pairedReads,
                    readDirections: Backbone.Agave.Model.File.Metadata.getReadDirections(),
                    fileTypes: Backbone.Agave.Model.File.Metadata.getFileTypes(),
                    canDownloadFiles: this.canDownloadFiles,
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
                    .fail(function(error) {
                        that._uiShowSaveErrorAnimation(e.target);

                        var telemetry = new Backbone.Agave.Model.Telemetry();
                        telemetry.set('error', JSON.stringify(error));
                        telemetry.set('method', 'Backbone.Agave.Model.File.Metadata.updateFileType()');
                        telemetry.set('view', 'Projects.FileListings');
                        telemetry.save();
                    })
                    ;
            },
            _updateReadDirection: function(e) {
                e.preventDefault();

                var that = this;

                var fileMetadata = this.fileListings.get(e.target.dataset.fileuuid);

                fileMetadata.setReadDirection(e.target.value)
                    .done(function() {
                        that._uiShowSaveSuccessAnimation(e.target);
                    })
                    .fail(function(error) {
                        that._uiShowSaveErrorAnimation(e.target);

                        var telemetry = new Backbone.Agave.Model.Telemetry();
                        telemetry.set('error', JSON.stringify(error));
                        telemetry.set('method', 'Backbone.Agave.Model.File.Metadata.setReadDirection()');
                        telemetry.set('view', 'Projects.FileListings');
                        telemetry.save();
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
                    .fail(function(error) {
                        that._uiShowSaveErrorAnimation(e.target);

                        var telemetry = new Backbone.Agave.Model.Telemetry();
                        telemetry.set('error', JSON.stringify(error));
                        telemetry.set('method', 'Backbone.Agave.Model.File.Metadata.updateTags()');
                        telemetry.set('view', 'Projects.FileListings');
                        telemetry.save();
                    })
                    ;
            },
            _setupDragDropEventHandlers: function() {

                //if (this.fileListings.models.length === 0) {
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
        })
    );

    Projects.FileTransfer = Backbone.View.extend(
        _.extend({}, FileTransferSidebarUiMixin, {

            // Public Methods
            template: 'project/file-transfer',
            initialize: function(parameters) {
                if (parameters && parameters.projectUuid) {
                    this.projectUuid = parameters.projectUuid;
                }

                var chance = new Chance();

                this.fileUniqueIdentifier = chance.guid();
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

                this._setListMenuFileTransferView(
                    this.projectUuid,
                    this.fileUniqueIdentifier,
                    this.model.get('name')
                );

                this._uiUploadStart();

                var formData = Backbone.Syphon.serialize(this);

                var that = this;

                this.model.on(Backbone.Agave.Model.File.UPLOAD_PROGRESS, function(percentCompleted) {
                    that._uiSetUploadProgress(percentCompleted, that.fileUniqueIdentifier);
                });

                this.model.save()
                    /*
                    .then(function() {
                        console.log("model save post is: " + JSON.stringify(that.model));
                        var notification = new Backbone.Agave.Model.Notification.FileUpload();
                        notification.set('associatedUuid', that.model.get('uuid'));
                        return notification.save();
                    })
                    */
                    .done(function() {

                        // Notify user that permissions are being set
                        that._uiSetProgressMessage('Setting file permissions...');

                        // VDJAuth saves the day by fixing file pems
                        that.model.syncFilePermissionsWithProjectPermissions()
                            .done(function() {
                                that._createFileMetadata(formData);
                            })
                            .fail(function(error) {
                                that._uiSetUploadProgress(0, that.fileUniqueIdentifier);
                                that._uiSetErrorMessage('Permission error. Please try uploading your file again.');

                                // Delete file too??

                                var telemetry = new Backbone.Agave.Model.Telemetry();
                                telemetry.set('error', JSON.stringify(error));
                                telemetry.set('method', 'syncFilePermissionsWithProjectPermissions()');
                                telemetry.set('view', 'Projects.FileTransfer');
                                telemetry.save();
                            });
                    })
                    .fail(function(error) {
                        // Notify user that upload failed
                        that._uiSetErrorMessage('File upload error. Please try uploading your file again.');

                        var telemetry = new Backbone.Agave.Model.Telemetry();
                        telemetry.set('error', JSON.stringify(error));
                        telemetry.set('method', 'Backbone.Agave.Model.save()');
                        telemetry.set('view', 'Projects.FileTransfer');
                        telemetry.save();
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
                            .fail(function(error) {
                                var telemetry = new Backbone.Agave.Model.Telemetry();
                                telemetry.set('error', JSON.stringify(error));
                                telemetry.set('method', 'syncMetadataPermissionsWithProjectPermissions()');
                                telemetry.set('view', 'Projects.FileTransfer');
                                telemetry.save();

                            });

                        /*
                        $('.progress').removeClass('progress-striped active');
                        $('.progress-bar').addClass('progress-bar-success');
                        */
                        that._uiSetSidemenuTransferSuccess(that.fileUniqueIdentifier);

                        $('.start-upload').remove();
                        $('.cancel-upload').remove();

                        // Disable buttons
                        $('.upload-button')
                            .removeAttr('disabled')
                        ;

                        that.trigger('addNewFileToProjectFileList', fileMetadata);

                        that._uiSetSuccessMessage('File "' + that.model.get('name') + '" uploaded successfully.');
                    })
                    .fail(function(error) {
                        that._uiSetErrorMessage('Metadata creation error. Please try uploading your file again.');

                        var telemetry = new Backbone.Agave.Model.Telemetry();
                        telemetry.set('error', JSON.stringify(error));
                        telemetry.set('method', 'Backbone.Agave.Model.File.Metadata()');
                        telemetry.set('view', 'Projects.FileTransfer');
                        telemetry.save();
                    });
            },

            // UI
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

                // Timer
                this._uiStartTimer();
            },

            _uiStartTimer: function() {

                $('#file-upload-timer-' + this.fileUniqueIdentifier)
                    .removeClass('hidden')
                ;

                var duration = moment.duration(0, 'seconds');

                // Start timer
                var that = this;
                setInterval(function() {
                    duration.add(1, 'second');

                    $('#file-upload-timer-' + that.fileUniqueIdentifier).html(
                        'Upload time: ' + duration.as('seconds') + ' seconds'
                    );

                }, 1000);
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
                this._uiSetUploadProgress(0, this.fileUniqueIdentifier);

                $('#file-upload-notifications-' + this.fileUniqueIdentifier)
                    .removeClass()
                    .addClass('alert alert-danger')
                    .text(errorMessage)
                    .fadeIn()
                    .removeClass('hidden')
                ;

                $('#file-upload-timer-' + this.fileUniqueIdentifier)
                    .addClass('hidden')
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
                        telemetry.set('error', JSON.stringify(error));
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
                            telemetry.set('error', JSON.stringify(error));
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
                            telemetry.set('error', JSON.stringify(error));
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
                        telemetry.set('error', JSON.stringify(error));
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
                            telemetry.set('error', JSON.stringify(error));
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
                            telemetry.set('error', JSON.stringify(error));
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
                        telemetry.set('error', JSON.stringify(error));
                        telemetry.set('method', 'Backbone.Agave.Collection.Files.Metadata.updateFileType()');
                        telemetry.set('view', 'Projects.QualFileAssociations');
                        telemetry.save();
                    })
                    ;

            },
        })
    );

    Projects.ManageUsers = Backbone.View.extend({
        template: 'project/manage-users',
        initialize: function(parameters) {

            this.modelId = parameters.projectUuid;
            this.model = App.Datastore.Collection.ProjectCollection.get(this.modelId);

            this.permissions = new Backbone.Agave.Collection.Permissions({uuid: this.modelId});

            var that = this;
            this.permissions.fetch()
                .done(function() {
                    that.permissions.remove(EnvironmentConfig.agave.serviceAccountUsername);
                    that.render();

                    that.tenantUsers = new Backbone.Agave.Collection.TenantUsers();
                    that.tenantUsers.fetch()
                        .done(function() {
                            that.tenantUsers.remove(EnvironmentConfig.agave.serviceAccountUsername);
                            that._usernameTypeahead(that.permissions, that.tenantUsers);
                        })
                        .fail(function(error) {
                            var telemetry = new Backbone.Agave.Model.Telemetry();
                            telemetry.set('error', JSON.stringify(error));
                            telemetry.set('method', 'Backbone.Agave.Collection.TenantUsers.fetch()');
                            telemetry.set('view', 'Projects.ManageUsers');
                            telemetry.save();
                        })
                        ;
                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.set('error', JSON.stringify(error));
                    telemetry.set('method', 'Backbone.Agave.Collection.Permissions.fetch()');
                    telemetry.set('view', 'Projects.ManageUsers');
                    telemetry.save();
                })
                ;
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
                            .fail(function(error) {
                                var telemetry = new Backbone.Agave.Model.Telemetry();
                                telemetry.set('error', JSON.stringify(error));
                                telemetry.set('method', 'Backbone.Agave.Model.Permission.addUserToProject()');
                                telemetry.set('view', 'Projects.ManageUsers');
                                telemetry.save();
                            });

                        that.permissions.add(newUserPermission);
                        that.render();
                        that._usernameTypeahead(that.permissions, that.tenantUsers);
                    },
                    error: function() {
                        var telemetry = new Backbone.Agave.Model.Telemetry();
                        telemetry.set('error', JSON.stringify(error));
                        telemetry.set('method', 'Backbone.Agave.Model.Permission.create()');
                        telemetry.set('view', 'Projects.ManageUsers');
                        telemetry.save();
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
                        .fail(function(error) {
                            var telemetry = new Backbone.Agave.Model.Telemetry();
                            telemetry.set('error', JSON.stringify(error));
                            telemetry.set('method', 'Backbone.Agave.Model.Permission.destroy()');
                            telemetry.set('view', 'Projects.ManageUsers');
                            telemetry.save();
                        })
                        ;
                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.set('error', JSON.stringify(error));
                    telemetry.set('method', 'Backbone.Agave.Model.Permission.removeUserFromProject()');
                    telemetry.set('view', 'Projects.ManageUsers');
                    telemetry.save();
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
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.set('error', JSON.stringify(error));
                    telemetry.set('method', 'Backbone.Agave.Model.Project.save()');
                    telemetry.set('view', 'Projects.Settings');
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
                            App.router.navigate('/project', {
                                trigger: true
                            });
                        })
                    ;
                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.set('error', JSON.stringify(error));
                    telemetry.set('method', 'Backbone.Agave.Model.Project.destroy()');
                    telemetry.set('view', 'Projects.Settings');
                    telemetry.save();
                })
                ;
        },
    });

    App.Views.Projects = Projects;
    return Projects;
});
