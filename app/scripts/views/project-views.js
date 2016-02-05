/* global Bloodhound */
define([
    'app',
    'handlebars',
    'filesize',
    'environment-config',
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
    EnvironmentConfig,
    moment,
    HandlebarsUtilities,
    Chance,
    FileTransferProjectUiMixin
) {

    'use strict';

    HandlebarsUtilities.registerRawPartial(
        'project/fragments/file-transfer-common',
        'file-transfer-common'
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

    Handlebars.registerHelper('checkSystemUpStatus', function(systems, options) {

        var lonestarUp = Backbone.Agave.Collection.Systems.checkSystemUpStatus(systems, EnvironmentConfig.agave.executionSystems.lonestar);
        var storageUp = Backbone.Agave.Collection.Systems.checkSystemUpStatus(systems, EnvironmentConfig.agave.storageSystems.corral);

        if (lonestarUp === true && storageUp === true) {
            return options.fn(systems);
        }
        else {
            return options.inverse(systems);
        }
    });

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
                that.listenTo(App.Datastore.Collection.ProjectCollection, 'sync', function() {
                    that.projectModel = App.Datastore.Collection.ProjectCollection.get(parameters.projectUuid);
                    that._initialDependencyDataSetup();
                });
            }
            else {
                this.projectModel = App.Datastore.Collection.ProjectCollection.get(parameters.projectUuid);
                this._initialDependencyDataSetup();
            }

            this.handleWebsocketEvents();
        },
        handleWebsocketEvents: function() {

            var that = this;

            this.listenTo(App.Instances.WebsocketManager, 'addFileImportPlaceholder', function(fileMetadataResponse) {
                var fileMetadata = new Backbone.Agave.Model.File.Metadata();
                fileMetadata.set(fileMetadataResponse);
                fileMetadata.addPlaceholderMarker();

                that.fileListings.add(fileMetadata);

                // var fileListingsView = that.getView('.file-listings');
                //
                // NOTE: layoutManager/jquery are not able to reliably retrieve this view
                // so I'm using a model scoped ref as a workaround instead (that.fileListingsView)

                var fileListingsView = that.fileListingsView;

                // Putting this in |singleReadListings| for now. If we ever
                // support paired file uploads, then it will need to be updated.
                fileListingsView.singleReadFileListings.add(fileMetadata);

                fileListingsView.render();
            });

            this.listenTo(App.Instances.WebsocketManager, 'updateFileImportProgress', function(fileMetadataResponse) {

                var fileMetadata = new Backbone.Agave.Model.File.Metadata();
                fileMetadata.set(fileMetadataResponse.fileInformation.metadata);

                var nameGuid = fileMetadata.getNameGuid(fileMetadata.get('value').name);
                var progress = App.Utilities.WebsocketManager.FILE_IMPORT_STATUS_PROGRESS[fileMetadataResponse.fileImportStatus];

                var percentCompleted = progress + '%';

                // var fileListingsView = that.getView('.file-listings');
                //
                // NOTE: layoutManager/jquery are not able to reliably retrieve this view
                // so I'm using a model scoped ref as a workaround instead (that.fileListingsView)

                var fileListingsView = that.fileListingsView;

                fileListingsView.updatePlaceholderFileProgress(
                    '.placeholder-guid-' + nameGuid,
                    percentCompleted
                );
            });

            this.listenTo(App.Instances.WebsocketManager, 'addFileToProject', function(fileMetadataResponse) {
                var fileMetadata = new Backbone.Agave.Model.File.Metadata();
                fileMetadata.set(fileMetadataResponse);

                var modelMatch = that.fileListings.getModelForName(fileMetadata.get('value').name);

                // var fileListingsView = that.getView('.file-listings');
                //
                // NOTE: layoutManager/jquery are not able to reliably retrieve this view
                // so I'm using a model scoped ref as a workaround instead (that.fileListingsView)

                var fileListingsView = that.fileListingsView;
                fileListingsView.singleReadFileListings.remove(modelMatch);
                that.fileListings.remove(modelMatch);

                fileListingsView.singleReadFileListings.add(fileMetadata);
                that.fileListings.add(fileMetadata);

                fileListingsView.render();
            });

        },
        serialize: function() {
            if (this.projectModel && this.fileListings && this.projectUsers) {
                return {
                    projectDetail: this.projectModel.toJSON(),
                    fileListingCount: this.fileListings.getFileCount() + ' files',
                    systems: this.systems.toJSON(),
                    userCount: this.projectUsers.getUserCount(),
                };
            }
        },
        afterRender: function() {
            // Tooltips
            $('.has-tooltip').tooltip();
        },
        events: {
            // File Upload/Import
            'click #file-upload':    '_uploadFileFromComputer',
            'click #dropbox-upload': '_dropboxUpload',
            'click #url-upload': '_urlUpload',
            'change #file-dialog':   '_changeFilesSelector',

            // Select files
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

            this.systems = new Backbone.Agave.Collection.Systems();

            $.when(this.systems.fetch(), this.projectUsers.fetch())
                .always(function(results) {
                    that._fetchAndRenderFileListings();
                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.set('error', JSON.stringify(error));
                    telemetry.set('method', 'Backbone.Agave.Collection.Permissions().fetch()');
                    telemetry.set('view', 'Projects.Detail');
                    telemetry.save();
                })
                ;
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

            // LayoutManager/jquery workaround: create model scoped var reference for websocket file upload view updates
            this.fileListingsView = fileListingsView;

            // listen to events on fileListingsView
            this._fileListingsViewEvents(fileListingsView);
            this.setView('.file-listings', fileListingsView);
            fileListingsView.render();
        },
        _fileListingsViewEvents: function(fileListingsView) {

            var that = this;

            // TODO: FIX DRAG AND DROP
            fileListingsView.on('fileDragDrop', function(files) {
                var renderPromise = that._uploadFileFromComputer();

                renderPromise.promise().done(function(view) {
                    view._selectFiles();
                });
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
        uiDisplayDuplicateFileMessage: function(filename) {
            $('html,body').animate({scrollTop: 0});

            $('#file-staging-errors')
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

        _uiToggleDisabledButtonStatus: function() {
            if ($('.selected-files:checked').length) {
                $('.files-selected-button').removeClass('disabled');
            }
            else {
                $('.files-selected-button').addClass('disabled');
            }
        },

        // Event Responders
        _uploadFileFromComputer: function(e) {
            if (e !== undefined) {
                e.preventDefault();
            }

            var fileTransferView = new Projects.FileTransfer({
                projectUuid: this.projectModel.get('uuid'),
                fileListings: this.fileListings,
                projectDetailView: this,
            });

            this.setView('#file-staging', fileTransferView);
            return fileTransferView.render();
        },
        _urlUpload: function(e) {
            e.preventDefault();

            var fileTransferView = new Projects.FileUrlTransfer({
                projectUuid: this.projectModel.get('uuid'),
                fileListings: this.fileListings,
                projectDetailView: this,
            });

            this.setView('#file-staging', fileTransferView);
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
                        isDuplicate = that.fileListings.checkForDuplicateFilename(files[i].name);

                        if (isDuplicate === true) {
                            duplicateFilename = files[i].name;
                            break;
                        }
                    };

                    if (isDuplicate === true) {
                        that.uiDisplayDuplicateFileMessage(duplicateFilename);
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
                        .fail(function() {
                        })
                        ;
                    }
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

            var metadataUuid = [e.target.dataset.metadatauuid];

            this._downloadProjectFilesForMetadataUuids(metadataUuid);
        },
        _clickDownloadMultipleFiles: function(e) {
            e.preventDefault();

            var selectedFileMetadataUuids = this._getSelectedFileUuids();

            this._downloadProjectFilesForMetadataUuids(selectedFileMetadataUuids);
        },
        _downloadProjectFilesForMetadataUuids: function(metadataUuids) {
            var that = this;

            var fileModels = [];

            for (var i = 0; i < metadataUuids.length; i++) {
                var metadataUuid = metadataUuids[i];

                var fileMetadataModel = this.fileListings.get(metadataUuids[i]);
                var fileModel = fileMetadataModel.getFileModel();

                var createDownloadAction = function(tmpFileModel) {
                    tmpFileModel.downloadFileToDisk()
                        .fail(function(error) {
                            var telemetry = new Backbone.Agave.Model.Telemetry();
                            telemetry.set('error', JSON.stringify(error));
                            telemetry.set('method', 'Backbone.Agave.Model.File.ProjectFile.downloadFileToDisk()');
                            telemetry.set('view', 'Projects.Detail');
                            telemetry.save();
                        })
                        ;
                };

                createDownloadAction(fileModel);
            };

        },
    });

    Projects.FileSearchNoResults = Backbone.View.extend({
        template: 'project/file-search-no-results',
    });

    Projects.FileListings = Backbone.View.extend(
        _.extend({}, ProjectMixin, {

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
            },
            template: 'project/file-listings',
            serialize: function() {
                return {
                    singleReadFileListings: this.singleReadFileListings.toJSON(),
                    pairedReadFileListings: this.pairedReads,
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

    Projects.FileUrlTransfer = Backbone.View.extend(
        _.extend({}, FileTransferProjectUiMixin, {

            // Public Methods
            template: 'project/file-url-transfer',
            initialize: function(parameters) {
                if (parameters && parameters.projectUuid) {
                    this.projectUuid = parameters.projectUuid;
                }

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
                    this.projectDetailView.uiDisplayDuplicateFileMessage(duplicateFilename);
                }

                return isDuplicate;
            },
        })
    );

    Projects.FileUploadSelected = Backbone.View.extend({
        template: 'project/file-upload-from-computer-detail',
        serialize: function() {
            return {
                file: this.model.toJSON(),
                fileTypes: Backbone.Agave.Model.File.Metadata.getFileTypes(),
            };
        },
    });

    Projects.FileTransfer = Backbone.View.extend(
        _.extend({}, FileTransferProjectUiMixin, {

            // Public Methods
            template: 'project/file-upload-from-computer',
            initialize: function(parameters) {
                if (parameters && parameters.projectUuid) {
                    this.projectUuid = parameters.projectUuid;
                }

                this.models = [];

                var chance = new Chance();

                this.fileUniqueIdentifier = chance.guid();
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

                var chance = new Chance();

                // FileUploadSelected
                for (var i = 0; i < selectedFiles.length; i++) {
                    var file = selectedFiles[i];

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
                    this.projectDetailView.uiDisplayDuplicateFileMessage(filename);
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

                this.remove();

                // TODO: What about this?
                //this.model.trigger(Backbone.Agave.Model.File.ProjectFile.CANCEL_UPLOAD);
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

                        return file.save()
                            .then(function() {
                                return file.notifyApiUploadComplete();
                            })
                            .then(function() {

                                var notificationData = file.getFileStagedNotificationData();

                                App.Instances.WebsocketManager.trigger(
                                    'addFileImportPlaceholder',
                                    notificationData
                                );
                            })
                            ;
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
                    telemetry.set('error', JSON.stringify(error));
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

    Projects.Settings = Backbone.View.extend({

        // Public Methods
        template: 'project/settings',
        initialize: function(parameters) {

            // Project settings
            this.projectUuid = parameters.projectUuid;
            this.permissions = new Backbone.Agave.Collection.Permissions({uuid: this.projectUuid});
            this.tenantUsers = new Backbone.Agave.Collection.TenantUsers();
            this.model = new Backbone.Agave.Model.Project();

            var that = this;

            if (App.Datastore.Collection.ProjectCollection.models.length === 0) {
                that.listenTo(App.Datastore.Collection.ProjectCollection, 'sync', function() {
                    that.model = App.Datastore.Collection.ProjectCollection.get(that.projectUuid);
                    that.render();
                });
            } else {
              that.model = App.Datastore.Collection.ProjectCollection.get(that.projectUuid);
              that.render();
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
                });

        },
        serialize: function() {
                return {
                    project: this.model.toJSON(),
                    users: this.permissions.toJSON()
                };
        },
        afterRender: function(){
          this.tenantUsers.remove(EnvironmentConfig.agave.serviceAccountUsername);
          this._usernameTypeahead(this.permissions, this.tenantUsers);
        },
        events: {
            'click #launch-delete-project-modal': '_launchDeleteProjectModal',
            'click #delete-project': '_deleteProject',
            'click #save-project-name': '_saveProjectName',
            'click #add-user': '_addUserToProject',
            'click .remove-user-from-project': '_removeUserFromProject'
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
            if (_.has(tenantUsers._byId, username)){
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

    App.Views.Projects = Projects;
    return Projects;
});
