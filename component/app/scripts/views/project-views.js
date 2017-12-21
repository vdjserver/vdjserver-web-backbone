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

        var formattedDate = moment(new Date(agaveDate)).format('D-MMM-YYYY h:mm a');

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

    Handlebars.registerHelper('ifCondChecked', function(v1, v2 /*, options*/) {
        if (v1 === v2) {
            return 'checked';
        }
    });

    Handlebars.registerHelper('ifCondEnabled', function(v1, v2 /*, options*/) {
        if (v1 !== v2) {
            return 'disabled';
        }
    });

    Handlebars.registerHelper('ifCond', function(v1, v2, options) {

        if (v1 === v2) {
            return options.fn(this);
        }

        return options.inverse(this);
    });

    Handlebars.registerHelper('ifLinkField', function(v1, options) {

        if (v1 == 'subject_uuid') return options.fn(this);
        if (v1 == 'sample_uuid') return options.fn(this);
        if (v1 == 'cell_processing_uuid') return options.fn(this);
        if (v1 == 'filename_uuid') return options.fn(this);

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

    Handlebars.registerHelper('communityModeDisable', function() {

        if (App.Routers.communityMode) {
            return 'disabled';
        } else {
            return '';
        }
    });

    Handlebars.registerHelper('communityModeReadOnly', function() {

        if (App.Routers.communityMode) {
            return 'readonly';
        } else {
            return '';
        }
    });

    Handlebars.registerHelper('if3Or', function(v1, v2, v3, options) {

        if (_.isArray(v1) && _.isArray(v2) && _.isArray(v3)) {
            if (v1.length > 0 || v2.length > 0 || v3.length > 0) {
                return options.fn(this);
            }
        }
        else if (v1 || v2 || v3) {
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

            this.projectFiles = new Backbone.Agave.Collection.Files.Metadata({projectUuid: this.projectUuid, communityMode: App.Routers.communityMode});
            this.projectJobFiles = new Backbone.Agave.Collection.Files.ProjectJobFiles({projectUuid: this.projectUuid, communityMode: App.Routers.communityMode});
            this.projectJobs = new Backbone.Agave.Collection.Jobs.Subset({communityMode: App.Routers.communityMode});

            this.jobListings = new Backbone.Agave.Collection.Jobs.Listings({projectUuid: this.projectUuid, communityMode: App.Routers.communityMode});
            this.archivedJobs = new Backbone.Agave.Collection.Jobs.Archived({projectUuid: this.projectUuid, communityMode: App.Routers.communityMode});

            // This is a little tricky. If we're arriving from a page
            // refresh, then we are stuck with two asynchronous fetches.
            // If the file list loads faster than the project list, then
            // we'll need to re-insert our subview and re-render the page
            // once the project list data has been fetched.
            var that = this;
            if (App.Datastore.Collection.ProjectCollection.models.length === 0) {
                that.listenToOnce(App.Datastore.Collection.ProjectCollection, 'initialFetchComplete', function() {
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
                projectJobFiles: this.projectJobFiles,
                projectJobs: this.projectJobs,
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
                    return that.projectJobFiles.fetch();
                })
                .then(function() {
                    // determine subset of jobs which are displaying output files
                    var jobs = new Set();
                    for (var i = 0; i < that.projectJobFiles.models.length; ++i) {
                        var m = that.projectJobFiles.at(i);
                        var value = m.get('value');
                        jobs.add(value.jobUuid);
                    }

                    var jobList = '';
                    var first = true;
                    jobs.forEach(function(e) {
                        if (!first) jobList += ',';
                        jobList += e;
                        first = false;
                    })

                    if (jobList.length > 0) {
                        that.projectJobs.jobList = jobList;
                        return that.projectJobs.fetch();
                    }
                })
                .then(function() {
                    var promises = [];

                    // Set up promises
                    // process metadata
                    that.projectJobs.map(function(jobModel) {
                        var m = new Backbone.Agave.Model.Job.ProcessMetadata({jobId: jobModel.get('id'), communityMode: App.Routers.communityMode});
                        jobModel.set('processMetadata', m);
                        promises[promises.length] = function() {
                            return m.fetch();
                        }
                    });

                    // Execute promises
                    return promises.reduce(
                        function(previous, current) {
                            return previous.then(current);
                        },
                        $.Deferred().resolve()
                    )
                })
                .then(function() {
                    // job output file descriptions
                    for (var i = 0; i < that.projectJobFiles.length; ++i) {
                        var m = that.projectJobFiles.at(i);
                        var value = m.get('value');
                        var jobModel = that.projectJobs.get(value.jobUuid);
                        var pm = jobModel.get('processMetadata');
                        var desc = pm.getDescriptionForFilename(value.name);
                        if (desc) m.set('description', desc);
                    }
                })
                .then(function() {
                    // job metadata
                    return that.jobListings.fetch();
                })
                .then(function() {
                    // link jobs to their metadata record
                    that.jobListings.linkToJobs(that.projectJobs);

                    // archive jobs
                    return that.archivedJobs.fetch();
                })
                .then(function() {
                    // remove archived jobs
                    that.projectJobs.remove(that.archivedJobs.jobUuids());

                    // don't render if user has moved to a different view
                    if ((App.Routers.currentRouteView == 'projectDetail') && (App.Routers.currentProjectUuid == that.projectUuid)) {
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
                    }
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

                    var fileMetadata = new Backbone.Agave.Model.File.Metadata({communityMode: App.Routers.communityMode});
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

                    var fileMetadata = new Backbone.Agave.Model.File.Metadata({communityMode: App.Routers.communityMode});
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

                    var fileMetadata = new Backbone.Agave.Model.File.Metadata({communityMode: App.Routers.communityMode});
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
                uuid: this.projectUuid,
                communityMode: App.Routers.communityMode
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
            var fileCount = this.projectFiles.getFileCount() + this.projectJobFiles.getFileCount();
            return {
                project: this.projectModel.toJSON(),
                fileListingCount: fileCount + ' files',
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

            this.systems = new Backbone.Agave.Collection.Systems({communityMode: App.Routers.communityMode});

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
                communityMode: App.Routers.communityMode
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
                                    urlToIngest: file.link
                                });

                                return agaveFile.save()
                                    .then(function() {
                                        return agaveFile.notifyApiUploadComplete();
                                    })
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
                    var selectionView = App.Views.Jobs.SelectedFiles;
                    this._showJobStagingView(igBlastView, selectionView, true);
                    break;

                case 'presto':
                    var prestoView = App.Views.Jobs.PrestoStaging;
                    var selectionView = App.Views.Jobs.SelectedFiles;
                    this._showJobStagingView(prestoView, selectionView, true);
                    break;

                case 'vdjpipe':
                    var vdjpipeView = App.Views.Jobs.VdjpipeStaging;
                    var selectionView = App.Views.Jobs.SelectedFiles;
                    this._showJobStagingView(vdjpipeView, selectionView, true);
                    break;

                case 'repcalc':
                    var repcalcView = App.Views.Jobs.RepCalcStaging;
                    var selectionView = App.Views.Jobs.SelectedMetadata;
                    this._showJobStagingView(repcalcView, selectionView, false);
                    break;

                default:
                    break;
            }
        },
        // TODO: simplify this
        _showJobStagingView: function(StagingSubview, SelectionSubview, requireFiles) {

            this.parentView.removeView('#project-job-staging');

            var selectedFileMetadataUuids = this._getSelectedFileUuids(true);
            var selectedFileListings = this.projectFiles.getNewCollectionForUuids(selectedFileMetadataUuids);
            var filteredFileListings = this.projectFiles.getNewCollectionForUuids(selectedFileMetadataUuids);

            selectedFileMetadataUuids = this._getSelectedFileUuids(false);
            selectedFileListings.add(this.projectJobFiles.getNewCollectionForUuids(selectedFileMetadataUuids).models);
            filteredFileListings.add(this.projectJobFiles.getNewCollectionForUuids(selectedFileMetadataUuids).models);

            var allFiles = this.projectFiles.clone();
            allFiles.add(this.projectJobFiles.models);

            // Remove qual files here
            selectedFileListings.forEach(function(model) {
                if (model.get('value')['fileType'] === Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_QUALITY) {
                    filteredFileListings.remove(model);
                }
            });

            if (requireFiles && filteredFileListings.length == 0) return;

            // TODO: rename selectedFileListings param
            var stagingSubview = new StagingSubview({
                selectedFileListings: filteredFileListings,
                projectModel: this.projectModel,
                allFiles: allFiles,
            });

            var selectionSubview = new SelectionSubview({
                selectedFileListings: filteredFileListings,
                projectModel: this.projectModel,
                allFiles: allFiles,
            });

            var jobSubmitView = new App.Views.Jobs.Submit({
                selectedFileListings: filteredFileListings,
                projectModel: this.projectModel,
                allFiles: allFiles,
                appSubview: stagingSubview,
            });

            jobSubmitView.setView('#job-selection-subview', selectionSubview);
            selectionSubview.render();

            jobSubmitView.setView('#job-staging-subview', stagingSubview);
            stagingSubview.render();

            this.parentView.setView('#project-job-staging', jobSubmitView);

            jobSubmitView.render();
        },
        /**
         *  Files
         */
        _getSelectedFileUuids: function(forProject) {

            var that = this;

            var selectedFileMetadataUuids = [];

            $('.selected-files:checked').each(function() {
                var uuid = $(this).val();

                var model;
                if (forProject) model = that.projectFiles.get(uuid);
                else model = that.projectJobFiles.get(uuid);

                if (!model) return;
                selectedFileMetadataUuids.push(uuid);

                var pairedUuid = model.getPairedReadMetadataUuid();

                if (model.getQualityScoreMetadataUuid()) {
                    if (forProject) {
                        var qualModel = that.projectFiles.get(model.getQualityScoreMetadataUuid());
                        var qualUuid = qualModel.get('uuid');
                        selectedFileMetadataUuids.push(qualUuid);
                    }
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

            var selectedFileMetadataUuids = this._getSelectedFileUuids(true);

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

            var selectedFileMetadataUuids = this._getSelectedFileUuids(true);
            this._downloadProjectFilesForMetadataUuids(selectedFileMetadataUuids);
        },
        _downloadProjectFilesForMetadataUuids: function(metadataUuids) {
            var that = this;

            // NOTE: this is cleaner and more efficient than the current download code.
            // Swap out the current download code with this once the Safari "Frame Load Interrupted" bug is fixed.
            /*
            var downloadPromises = metadataUuids.map(function(metadataUuid) {

                return function() {

                    var fileMetadataModel = that.projectFiles.get(metadataUuid);
                    var fileModel = fileMetadataModel.getFileModel();

                    return fileModel.downloadFileToDisk()
                        .fail(function(error) {

                            var telemetry = new Backbone.Agave.Model.Telemetry();
                            telemetry.setError(error);
                            telemetry.set('method', 'Backbone.Agave.Model.File.ProjectFile.downloadFileToDisk()');
                            telemetry.set('view', 'Projects.DetailActions');
                            telemetry.save();
                        })
                        ;

                };

            });

            var sequentialPromiseResults = downloadPromises.reduce(
                function(previous, current) {
                    return previous.then(current);
                },
                $.Deferred().resolve()
            )
            ;
            */

            var timer = 0;
            var timerValue = 7000;

            metadataUuids.forEach(function(metadataUuid) {
                var fileMetadataModel = that.projectFiles.get(metadataUuid);
                var fileModel = fileMetadataModel.getFileModel();

                setTimeout(function() {

                    fileModel.downloadFileToDisk()
                        .fail(function(error) {
                            var telemetry = new Backbone.Agave.Model.Telemetry();
                            telemetry.setError(error);
                            telemetry.set('method', 'Backbone.Agave.Model.File.ProjectFile.downloadFileToDisk()');
                            telemetry.set('view', 'Projects.DetailActions');
                            telemetry.save();
                        })
                        ;
                }, timer);

                timer += timerValue;
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

                var headerView = new Projects.DetailHeader(subviewParameters);
                this.parentView.setView('#project-header', headerView);
                headerView.render();
            }
            else {

                var filteredFileListings = this.projectFiles.search(searchString);
                var filteredJobFileListings = this.projectJobFiles.search(searchString);

                // results
                if (filteredFileListings.length > 0 || filteredJobFileListings.length > 0) {
                    subviewParameters.projectFiles = filteredFileListings;
                    subviewParameters.projectJobFiles = filteredJobFileListings;

                    filesView = new Projects.DetailFiles(subviewParameters);

                    this.parentView.setView('#project-files', filesView);
                    filesView.render();

                    var headerView = new Projects.DetailHeader(subviewParameters);
                    this.parentView.setView('#project-header', headerView);
                    headerView.render();

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

                this.setupFileListings();

                loadingView.remove();
            },
            setupFileListings: function() {
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

            },
            serialize: function() {
                // Job output files
                for (var i = 0; i < this.projectJobs.models.length; ++i) {
                    var m = this.projectJobs.at(i);
                    var fileCollection = this.projectJobFiles.getFilesForJobId(m.get('id'));
                    //fileCollection = fileCollection.getProjectFileOutput();
                    m.set('fileCollection', fileCollection.toJSON());
                }

                return {
                    projectUuid: this.projectUuid,
                    singleReadFileListings: this.singleReadFileListings.toJSON(),
                    pairedReadFileListings: this.pairedReads,
                    readDirections: Backbone.Agave.Model.File.Metadata.getReadDirections(),
                    fileTypes: Backbone.Agave.Model.File.Metadata.getFileTypes(),
                    fileTypeNames: Backbone.Agave.Model.File.Metadata.getNamesForFileTypes(Backbone.Agave.Model.File.Metadata.getFileTypes()),
                    projectJobs: this.projectJobs.toJSON(),
                    communityMode: App.Routers.communityMode
                };
            },
            events: {
                'click #drag-and-drop-box': '_clickFilesSelectorWrapper',
                'change .project-file-type': '_updateFileType',
                'change .project-file-read-direction': '_updateReadDirection',
                'change .project-file-tags': '_updateFileTags',
                'click .unlink-qual': '_unlinkQual',
                'click .unlink-paired-read':   '_unlinkPairedRead',

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
                if (!fileMetadata) fileMetadata = this.projectJobFiles.get(e.target.dataset.fileuuid);

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
                if (!fileMetadata) fileMetadata = this.projectJobFiles.get(e.target.dataset.fileuuid);

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
                if (!fileMetadata) fileMetadata = this.projectJobFiles.get(e.target.dataset.fileuuid);

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
            _unlinkQual: function(e) {
                e.preventDefault();

                // Use this instead of e.target.id because the click event will
                // sometimes land on a child element instead of the button itself.
                // If that happens, e.target.id will refer to the child and not the button.
                var uuid = $(e.target).closest('button').attr('id');

                var fileMetadataModel = this.projectFiles.get(uuid);

                if (fileMetadataModel) {

                    var that = this;

                    fileMetadataModel.removeQualityScoreMetadataUuid()
                        .then(function() {
                            that.projectFiles.reset();

                            return that.projectFiles.fetch();
                        })
                        .then(function() {
                            that.setupFileListings();
                        })
                        .done(function() {
                            that.render();
                        })
                        .fail(function(error) {
                            var telemetry = new Backbone.Agave.Model.Telemetry();
                            telemetry.setError(error);
                            telemetry.set('method', 'fileMetadataModel.removeQualityScoreMetadataUuid()');
                            telemetry.set('view', 'Projects.DetailFiles');
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

                var pairFile1Model = this.projectFiles.get(uuid);

                var pairFile2Model = this.projectFiles.get(pairFile1Model.getPairedReadMetadataUuid());

                if (pairFile1Model && pairFile2Model) {

                    var that = this;

                    Backbone.Agave.Collection.Files.Metadata.disassociatePairedReads(pairFile1Model, pairFile2Model)
                        .then(function() {
                            that.projectFiles.reset();

                            return that.projectFiles.fetch();
                        })
                        .then(function() {
                            that.setupFileListings();
                        })
                        .done(function() {
                            that.render();
                        })
                        .fail(function(error) {
                            var telemetry = new Backbone.Agave.Model.Telemetry();
                            telemetry.setError(error);
                            telemetry.set('method', 'Backbone.Agave.Collection.Files.Metadata.disassociatePairedReads()');
                            telemetry.set('view', 'Projects.DetailFiles');
                            telemetry.save();
                        })
                        ;
                }
            },
            _setupDragDropEventHandlers: function() {

                //if (this.projectFiles.models.length === 0) {
                if (
                    this.singleReadFileListings.models.length === 0
                    &&
                    this.pairedReads.length === 0
                    &&
                    this.projectJobs.length === 0
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
                                    return agaveFile.notifyApiUploadComplete();
                                })
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
                    var guessType = stagedFile.guessTypeFromName();
                    stagedFile.set('type', guessType);

                    this.models.push(stagedFile);

                    var fileUploadSelectedView = new Projects.FileUploadSelected({model: stagedFile});

                    this.insertView('.file-upload-subviews-' + this.fileUniqueIdentifier, fileUploadSelectedView);
                    fileUploadSelectedView.render();
                };
            },
            _checkDuplicateFile: function(filename) {

                var isDuplicate = this.fileListings.checkForDuplicateFilename(filename);

                if (isDuplicate === true) {
                    this.projectDetailView.trigger('duplicateFileError', filename);
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
                        that.readLevelMetadatas = fileMetadatas.getForwardReadLevelCollection();
                        that.pairableMetadatas = fileMetadatas.getReverseReadLevelCollection();

                        // don't render if user has moved to a different view
                        if ((App.Routers.currentRouteView == 'projectFilePairedReadAssociations') && (App.Routers.currentProjectUuid == parameters.projectUuid)) {
                            that.render();
                        }
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
                var fileModel = this.pairableMetadatas.get(fileUuid);

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
                    fileModel = this.pairableMetadatas.get(fileUuid);

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
                fileMetadatas.comparator = App.Mixins.Comparators.Name.comparator;

                var that = this;

                fileMetadatas.fetch()
                    .done(function() {
                        that.fastaMetadatas = fileMetadatas.getQualAssociableFastaCollection();
                        that.qualMetadatas  = fileMetadatas.getQualCollection();

                        // don't render if user has moved to a different view
                        if ((App.Routers.currentRouteView == 'projectFileQualAssociations') && (App.Routers.currentProjectUuid == parameters.projectUuid)) {
                            that.render();
                        }
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
            this.permissions = new Backbone.Agave.Collection.Permissions({uuid: this.projectUuid, communityMode: App.Routers.communityMode});
            this.tenantUsers = new Backbone.Agave.Collection.TenantUsers({communityMode: App.Routers.communityMode});
            this.model = new Backbone.Agave.Model.Project({communityMode: App.Routers.communityMode});
            this.allowUnpublish = false;

            var that = this;

            if (App.Datastore.Collection.ProjectCollection.models.length === 0) {
                this.listenTo(App.Datastore.Collection.ProjectCollection, 'initialFetchComplete', function() {
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
                            // don't render if user has moved to a different view
                            if ((App.Routers.currentRouteView == 'projectSettings') && (App.Routers.currentProjectUuid == that.projectUuid)) {
                                that.render();
                            }
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
            // the service account or an original project user can unpublish
            if (App.Routers.communityMode && this.model && this.model.get('name') == 'publicProject' && App.Agave.token().isActive()) {
                if (Backbone.Agave.instance.token().get('username') == EnvironmentConfig.agave.serviceAccountUsername) this.allowUnpublish = true;
                for (var i = 0; i < this.permissions.length; ++i) {
                    var m = this.permissions.at(i);
                    if (m.get('username') == Backbone.Agave.instance.token().get('username')) this.allowUnpublish = true;
                }
            }

            return {
                project: this.model.toJSON(),
                users: this.permissions.toJSON(),
                communityMode: App.Routers.communityMode,
                allowUnpublish: this.allowUnpublish
            };
        },
        afterRender: function() {
            this.tenantUsers.remove(EnvironmentConfig.agave.serviceAccountUsername);
            this._usernameTypeahead(this.permissions, this.tenantUsers);
            this.setupModalView();
        },
        events: {
            'click #launch-delete-project-modal': '_launchDeleteProjectModal',

            'click .switch-archived-jobs': '_switchArchivedJobs',

            'click .publish-project': '_publishProject',
            'click .unpublish-project': '_unpublishProject',

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

            if (App.Routers.communityMode) return;

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
        _switchArchivedJobs: function(e) {
            e.preventDefault();

            if (App.Routers.communityMode) return;

            var value = this.model.get('value');

            if (value.showArchivedJobs) value.showArchivedJobs = false;
            else value.showArchivedJobs = true;

            this.model.set('value', value);

            var that = this;
            this.model.save()
                .done(function() {
                    that.render();
                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(error);
                    telemetry.set('method', 'Backbone.Agave.Model.Project.save()');
                    telemetry.set('view', 'Projects.Settings._switchArchivedJobs');
                    telemetry.save();
                })
                ;
        },
        _deleteProject: function(e) {
            e.preventDefault();

            if (App.Routers.communityMode) return;

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

        _publishProject: function(e) {
            e.preventDefault();

            if (App.Routers.communityMode) return;

            this.removeView('#project-publish');

            var publishProjectView = new App.Views.Projects.Publish({
                project: this.model,
                parentView: this
            });

            this.setView('#project-publish', publishProjectView);
            publishProjectView.render();
        },

        _unpublishProject: function(e) {
            e.preventDefault();

            if (!this.allowUnpublish) return;

            this.removeView('#project-unpublish');

            var unpublishProjectView = new App.Views.Projects.Unpublish({
                project: this.model,
                parentView: this
            });

            this.setView('#project-unpublish', unpublishProjectView);
            unpublishProjectView.render();
        },

        setupModalView: function(header, body) {
            this.removeView('#modal-view');

            var message = new App.Models.MessageModel({
                'header': header,
                'body':   body,
                successStyle: true
            });

            var modal = new App.Views.Util.ModalMessageConfirm({
                model: message
            });

            $('<div id="modal-view">').appendTo(this.el);

            this.setView('#modal-view', modal);
            modal.render();
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

            if (App.Routers.communityMode) return;

            var username = $('#add-username').val();

            // Check that username exists before adding
            var tenantUsers = this.tenantUsers.clone();
            if (_.has(tenantUsers._byId, username)) {
                var that = this;
                this.setupModalView('Adding User to Project',
                                    '<p>User is being added to project! You will receive an email when it is done.</p>');

                this.model.addUserToProject(username)
                    .then(function() {
                        $('#confirmation-button').removeClass('hidden');

                        $('#modal-message').modal('show')
                            .on('shown.bs.modal', function() {
                            })
                    })
                    .fail(function(error) {
                        var telemetry = new Backbone.Agave.Model.Telemetry();
                        telemetry.setError(error);
                        telemetry.set('method', 'Backbone.Agave.Model.Permission.addUserToProject()');
                        telemetry.set('view', 'Projects.ManageUsers');
                        telemetry.save();
                    })
                    ;
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

    Projects.Publish = Backbone.View.extend({
        // Public Methods
        template: 'project/publish-project',
        initialize: function(parameters) {
            this.project = parameters.project;
            this.parentView = parameters.parentView;
        },
        events: {
            'click #submit-publish': '_submitForm',
            'click #publish-exit': '_exitForm',
        },
        serialize: function() {
            return {
                project: this.project.toJSON(),
            };
        },
        afterRender: function() {
            $('#publish-modal').modal('show');
            $('#publish-modal').on('shown.bs.modal', function() {
                $('#job-name').focus();
            });
        },

        _exitForm: function(e) {
            e.preventDefault();

            var that = this;
            $('#publish-modal').on('hidden.bs.modal', function(e) {
                // force reload of page
                App.router.navigate('/project', {
                    trigger: true,
                });
            });
        },

        _submitForm: function(e) {
            e.preventDefault();

            $('.publish-submit-button').addClass('disabled');

            var that = this;
            this.project.publishProject()
                .then(function() {
                    that._uiDoneView();
                })
                .fail(function(error) {
                    if (error.responseText) that._uiDoneView(error.responseText);
                    else that._uiDoneView('Unknown server error.');

                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(error);
                    telemetry.set('projectId', that.project.get('uuid'));
                    telemetry.set('method', '_submitForm()');
                    telemetry.set('view', 'Projects.Publish');
                    telemetry.save();
                })
                ;
        },

        _uiDoneView: function(error) {
            this.removeView('#publish-processing-view');

            $('#publish-processing-view').removeClass('alert alert-info');
            $('.publish-submit-button').addClass('hidden');
            $('#publish-exit').removeClass('hidden');

            if (error) {
                $('#publish-processing-view').addClass('alert alert-danger');
                var msg = 'There was an error publishing the project.<br/>';
                msg += error + '<br/>';
                $('#publish-processing-view').append(msg);
            } else {
                var message = new App.Models.MessageModel({
                    'body': 'Publish project has been started! You will receive an email when it is done.'
                });

                var alertView = new App.Views.Util.Alert({
                    options: {
                        type: 'success'
                    },
                    model: message
                });

                this.setView('#publish-processing-view', alertView);
                alertView.render();
            }
        },

    });

    Projects.Unpublish = Backbone.View.extend({
        // Public Methods
        template: 'project/unpublish-project',
        initialize: function(parameters) {
            this.project = parameters.project;
            this.parentView = parameters.parentView;
        },
        events: {
            'click #submit-unpublish': '_submitForm',
            'click #unpublish-exit': '_exitForm',
        },
        serialize: function() {
            return {
                project: this.project.toJSON(),
            };
        },
        afterRender: function() {
            $('#unpublish-modal').modal('show');
            $('#unpublish-modal').on('shown.bs.modal', function() {
                $('#job-name').focus();
            });
        },

        _exitForm: function(e) {
            e.preventDefault();

            var that = this;
            $('#unpublish-modal').on('hidden.bs.modal', function(e) {
                // force reload of page
                App.router.navigate('/project', {
                    trigger: true,
                });
            });
        },

        _submitForm: function(e) {
            e.preventDefault();

            $('.unpublish-submit-button').addClass('disabled');

            var that = this;
            this.project.unpublishProject()
                .then(function() {
                    that._uiDoneView();
                })
                .fail(function(error) {
                    if (error.responseText) that._uiDoneView(error.responseText);
                    else that._uiDoneView('Unknown server error.');

                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(error);
                    telemetry.set('projectId', that.project.get('uuid'));
                    telemetry.set('method', '_submitForm()');
                    telemetry.set('view', 'Projects.Unpublish');
                    telemetry.save();
                })
                ;
        },

        _uiDoneView: function(error) {
            this.removeView('#unpublish-processing-view');

            $('#unpublish-processing-view').removeClass('alert alert-info');
            $('.unpublish-submit-button').addClass('hidden');
            $('#unpublish-exit').removeClass('hidden');

            if (error) {
                $('#unpublish-processing-view').addClass('alert alert-danger');
                var msg = 'There was an error unpublishing the project.<br/>';
                msg += error + '<br/>';
                $('#unpublish-processing-view').append(msg);
            } else {
                var message = new App.Models.MessageModel({
                    'body': 'Unpublish project has been started! You will receive an email when it is done.'
                });

                var alertView = new App.Views.Util.Alert({
                    options: {
                        type: 'success'
                    },
                    model: message
                });

                this.setView('#unpublish-processing-view', alertView);
                alertView.render();
            }
        },

    });

    Projects.StudyMetadata = Backbone.View.extend({

        // Public Methods
        template: 'project/metadata/study-metadata',
        initialize: function(parameters) {

            // Project settings
            //this.permissions = new Backbone.Agave.Collection.Permissions({uuid: this.model.get('uuid')});

            this.render();

        },
        serialize: function() {
            return {
                project: this.model.toJSON(),
                //users: this.permissions.toJSON(),
            };
        },
        afterRender: function() {
        },
        events: {
            'click  #save-project-metadata': '_saveProjectMetadata',
            'submit #project-metadata-form': '_saveProjectMetadata',

            'click  #revert-project-modal': '_revertModal',
            'click  #revert-metadata': '_revertProjectMetadata',
        },

        // Private Methods
        // Event Responders
        _saveProjectMetadata: function(e) {
            e.preventDefault();

            var value = this.model.get('value');
            var d = Backbone.Agave.Model.Project.prototype.defaults.call();

            for (var p in d.value) {
              value[p] = $('#project-' + p).val();
            }

            this.model.set('value', value);

            this.model.save()
                .done(function() {
                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(error);
                    telemetry.set('method', 'Backbone.Agave.Model.Project.save()');
                    telemetry.set('view', 'Projects.Metadata._saveProjectMetadata');
                    telemetry.save();
                })
                ;
        },

        _revertModal: function(e) {
            e.preventDefault();

            $('#revert-modal').modal('show');
        },

        _revertProjectMetadata: function(e) {
            var that = this;
            $('#revert-modal').modal('hide')
                .on('hidden.bs.modal', function() {
                    that.render();
                })
            ;
        },
    });

    Projects.SubjectMetadata = Backbone.View.extend({

        // Public Methods
        template: 'project/metadata/subject-metadata',
        initialize: function(parameters) {

            var that = this;

            var loadingView = new App.Views.Util.Loading({keep: true});
            this.setView('', loadingView);
            loadingView.render();

            this.columns = new Backbone.Agave.Model.Metadata.SubjectColumns({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode});
            this.columnNames = [];

            this.objectCollection = new Backbone.Agave.Collection.Metadata.Subject({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode});

            this.objectCollection.fetch()
            .then(function() {
                // save clone of original metadata collection
                that.saveCollection = that.objectCollection.getClonedCollection();

                return that.columns.fetch();
            })
            .then(function() {

                that.columnNames = that.columns.getColumnNames();

                loadingView.remove();

                that.render();
            })
        },

        serialize: function() {
            var rowValues = [];
            for (var i = 0; i < this.objectCollection.models.length; ++i) {
                var m = this.objectCollection.at(i);
                var value = m.get('value');
                var values = [];
                for (var j = 0; j < this.columnNames.length; ++j)
                    values[j] = { name: this.columnNames[j], value: value[this.columnNames[j]] };
                rowValues[i] = { row: values };
                rowValues[i]['uuid'] = m.get('uuid');
            }

            return {
                rowValues: rowValues,
                columnNames: this.columnNames,
                objectCollection: this.objectCollection.toJSON(),
            };
        },
        afterRender: function() {
            this.setupModalView();
        },
        events: {
            'click  #save-subject-metadata': '_saveMetadata',
            'submit #subject-metadata-form': '_saveMetadata',

            'click  #revert-subject-modal': '_revertModal',
            'click  #revert-metadata': '_revertMetadata',

            'click #addEntry': '_addEntry',
            'click .removeEntry': '_removeEntry',
            'change .subjectMetadata': '_changeEntryMetadata',

            'click #importFromFile': '_importFromFile',
            'click #exportToFile': '_exportToFile',
        },

        // Private Methods
        setupModalView: function() {

            var message = new App.Models.MessageModel({
                'header': 'Saving Metadata',
                'body':   '<p>Please wait while we save the metadata to the server...</p>'
            });

            var modal = new App.Views.Util.ModalMessageConfirm({
                model: message
            });

            $('<div id="modal-view">').appendTo(this.el);

            this.setView('#modal-view', modal);
            modal.render();

        },

        // Event Responders
        _addEntry: function(e){
            var that = this;
            var m = new Backbone.Agave.Model.Metadata.Subject({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode})
            m.set('uuid', m.cid);
            this.objectCollection.add(m);
            this.render();
        },
        _removeEntry: function(e){
            var m = this.objectCollection.at(e.target.dataset.tuple);
            this.objectCollection.remove(m);
            this.render();
        },
        _changeEntryMetadata: function(e) {
            // we use ids with attribute name embedded to have a generic change method
            e.preventDefault();
            var m = this.objectCollection.at(e.target.dataset.tuple);
            var value = m.get('value');
            var field = e.target.id.replace('subject-', '');
            value[field] = e.target.value;
            m.set('value', value);
        },

        _importFromFile: function(e) {
            var importView = new Projects.MetadataImport({
                projectUuid: this.model.get('uuid'),
                metadataName: 'Subject Metadata',
                parentView: this,
                projectFiles: this.projectFiles
            });

            this.setView('#import-metadata-staging', importView);
            importView.render();
        },

        _performImport: function(file, op) {
            return this.objectCollection.importFromFile(file, op);
        },

        _exportToFile: function(e) {
            var that = this;
            this.objectCollection.createExportFile()
              .then(function(response) {
                  if (response.status == 'success') return that.objectCollection.downloadExportFileToDisk();
                  else return $.Deferred().reject('Unable to export subject metadata.');
              })
              .then(function() {
              })
              .fail(function(error) {
                  var telemetry = new Backbone.Agave.Model.Telemetry();
                  telemetry.setError(error);
                  telemetry.set('method', '_exportToFile()');
                  telemetry.set('view', 'Projects.SubjectMetadata');
                  telemetry.set('project', this.model.get('uuid'));
                  telemetry.save();
              })
              ;
        },
        _saveMetadata: function(e) {
            e.preventDefault();

            var that = this;

            $('#modal-message').modal('show')
                .on('shown.bs.modal', function() {

            // see if any are deleted
            var deletedModels = that.saveCollection.getMissingModels(that.objectCollection);

            var promises = [];

            // Set up promises
            // deletions
            deletedModels.map(function(uuid) {
                var m = that.saveCollection.get(uuid);
                promises[promises.length] = function() {
                    return m.destroy();
                }
            });

            // updates and new
            that.objectCollection.map(function(uuid) {
                var m = that.objectCollection.get(uuid);
                promises[promises.length] = function() {
                    // clear uuid for new entries so they get created
                    if (m.get('uuid') == m.cid) m.set('uuid', '');
                    else { // if existing entry, check if attributes changed
                        var origModel = that.saveCollection.get(uuid);
                        if (!origModel) return;
                        var changed = m.changedAttributes(origModel.attributes);
                        if (!changed) return;
                    }
                    return m.save()
                        .then(function() {
                            return m.syncMetadataPermissionsWithProjectPermissions(that.model.get('uuid'));
                        });
                }
            });

            // Execute promises
            var sequentialPromiseResults = promises.reduce(
                function(previous, current) {
                    return previous.then(current);
                },
                $.Deferred().resolve()
            )
            .always(function() {
                $('#modal-message')
                  .modal('hide')
                  .on('hidden.bs.modal', function() {

                      // new original collection
                      that.saveCollection = that.objectCollection.getClonedCollection();

                      that.render();
                  })
            })
            .fail(function(error) {
                var telemetry = new Backbone.Agave.Model.Telemetry();
                telemetry.setError(error);
                telemetry.set('method', '_saveSubjectMetadata()');
                telemetry.set('view', 'Projects.SubjectMetadata');
                telemetry.set('project', this.model.get('uuid'));
                telemetry.save();
            })
            ;
            })
        },

        _revertModal: function(e) {
            e.preventDefault();

            $('#revert-subject').modal('show');
        },

        _revertMetadata: function(e) {
            var that = this;
            $('#revert-subject').modal('hide')
                .on('hidden.bs.modal', function() {
                    // revert work samples back to original collection
                    that.objectCollection = that.saveCollection.getClonedCollection();

                    that.render();
                })
            ;
        },
    });

    Projects.DiagnosisMetadata = Backbone.View.extend({

        // Public Methods
        template: 'project/metadata/diagnosis-metadata',
        initialize: function(parameters) {

            var that = this;

            var loadingView = new App.Views.Util.Loading({keep: true});
            this.setView('', loadingView);
            loadingView.render();

            this.columns = new Backbone.Agave.Model.Metadata.DiagnosisColumns({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode});
            this.columnNames = [];

            this.subjectCollection = new Backbone.Agave.Collection.Metadata.Subject({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode});

            this.objectCollection = new Backbone.Agave.Collection.Metadata.Diagnosis({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode});

            this.objectCollection.fetch()
            .then(function() {
                // save clone of original metadata collection
                that.saveCollection = that.objectCollection.getClonedCollection();

                return that.subjectCollection.fetch();
            })
            .then(function() {
                return that.columns.fetch();
            })
            .then(function() {

                that.columnNames = that.columns.getColumnNames();

                loadingView.remove();

                that.render();
            })
        },

        serialize: function() {
            var rowValues = [];
            for (var i = 0; i < this.objectCollection.models.length; ++i) {
                var m = this.objectCollection.at(i);
                var value = m.get('value');
                var values = [];
                for (var j = 0; j < this.columnNames.length; ++j)
                    values[j] = { name: this.columnNames[j], value: value[this.columnNames[j]] };
                rowValues[i] = { row: values };
                rowValues[i]['uuid'] = m.get('uuid');
            }

            return {
                rowValues: rowValues,
                columnNames: this.columnNames,
                objectCollection: this.objectCollection.toJSON(),
                subjectCollection: this.subjectCollection.toJSON(),
            };
        },
        afterRender: function() {
            this.setupModalView();
        },
        events: {
            'click  #save-diagnosis-metadata': '_saveMetadata',
            'submit #diagnosis-metadata-form': '_saveMetadata',

            'click  #revert-diagnosis-modal': '_revertModal',
            'click  #revert-metadata': '_revertMetadata',

            'click #addEntry': '_addEntry',
            'click .removeEntry': '_removeEntry',
            'change .diagnosisMetadata': '_changeEntryMetadata',

            'click #importFromFile': '_importFromFile',
            'click #exportToFile': '_exportToFile',
        },

        // Private Methods
        setupModalView: function() {

            var message = new App.Models.MessageModel({
                'header': 'Saving Metadata',
                'body':   '<p>Please wait while we save the metadata to the server...</p>'
            });

            var modal = new App.Views.Util.ModalMessageConfirm({
                model: message
            });

            $('<div id="modal-view">').appendTo(this.el);

            this.setView('#modal-view', modal);
            modal.render();

        },

        // Event Responders
        _addEntry: function(e){
            var that = this;
            var m = new Backbone.Agave.Model.Metadata.Diagnosis({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode})
            m.set('uuid', m.cid);
            this.objectCollection.add(m);
            this.render();
        },
        _removeEntry: function(e){
            var m = this.objectCollection.at(e.target.dataset.tuple);
            this.objectCollection.remove(m);
            this.render();
        },
        _changeEntryMetadata: function(e) {
            // we use ids with attribute name embedded to have a generic change method
            e.preventDefault();
            var m = this.objectCollection.at(e.target.dataset.tuple);
            var value = m.get('value');
            var field = e.target.id.replace('diagnosis-', '');
            value[field] = e.target.value;
            m.set('value', value);
        },

        _importFromFile: function(e) {
            var importView = new Projects.MetadataImport({
                projectUuid: this.model.get('uuid'),
                metadataName: 'Diagnosis Metadata',
                parentView: this,
                projectFiles: this.projectFiles
            });

            this.setView('#import-metadata-staging', importView);
            importView.render();
        },

        _performImport: function(file, op) {
            return this.objectCollection.importFromFile(file, op);
        },

        _exportToFile: function(e) {
            var that = this;
            this.objectCollection.createExportFile()
              .then(function(response) {
                  if (response.status == 'success') return that.objectCollection.downloadExportFileToDisk();
                  else return $.Deferred().reject('Unable to export diagnosis metadata.');
              })
              .then(function() {
              })
              .fail(function(error) {
                  var telemetry = new Backbone.Agave.Model.Telemetry();
                  telemetry.setError(error);
                  telemetry.set('method', '_exportToFile()');
                  telemetry.set('view', 'Projects.DiagnosisMetadata');
                  telemetry.set('project', this.model.get('uuid'));
                  telemetry.save();
              })
              ;
        },
        _saveMetadata: function(e) {
            e.preventDefault();

            var that = this;

            $('#modal-message').modal('show')
                .on('shown.bs.modal', function() {

            // see if any are deleted
            var deletedModels = that.saveCollection.getMissingModels(that.objectCollection);

            var promises = [];

            // Set up promises
            // deletions
            deletedModels.map(function(uuid) {
                var m = that.saveCollection.get(uuid);
                promises[promises.length] = function() {
                    return m.destroy();
                }
            });

            // updates and new
            that.objectCollection.map(function(uuid) {
                var m = that.objectCollection.get(uuid);
                promises[promises.length] = function() {
                    // clear uuid for new entries so they get created
                    if (m.get('uuid') == m.cid) m.set('uuid', '');
                    else { // if existing entry, check if attributes changed
                        var origModel = that.saveCollection.get(uuid);
                        if (!origModel) return;
                        var changed = m.changedAttributes(origModel.attributes);
                        if (!changed) return;
                    }
                    return m.save()
                        .then(function() {
                            return m.syncMetadataPermissionsWithProjectPermissions(that.model.get('uuid'));
                        });
                }
            });

            // Execute promises
            var sequentialPromiseResults = promises.reduce(
                function(previous, current) {
                    return previous.then(current);
                },
                $.Deferred().resolve()
            )
            .always(function() {
                $('#modal-message')
                  .modal('hide')
                  .on('hidden.bs.modal', function() {

                      // new original collection
                      that.saveCollection = that.objectCollection.getClonedCollection();

                      that.render();
                  })
            })
            .fail(function(error) {
                var telemetry = new Backbone.Agave.Model.Telemetry();
                telemetry.setError(error);
                telemetry.set('method', '_saveSubjectMetadata()');
                telemetry.set('view', 'Projects.DiagnosisMetadata');
                telemetry.set('project', this.model.get('uuid'));
                telemetry.save();
            })
            ;
            })
        },

        _revertModal: function(e) {
            e.preventDefault();

            $('#revert-diagnosis').modal('show');
        },

        _revertMetadata: function(e) {
            var that = this;
            $('#revert-diagnosis').modal('hide')
                .on('hidden.bs.modal', function() {
                    // revert work samples back to original collection
                    that.objectCollection = that.saveCollection.getClonedCollection();

                    that.render();
                })
            ;
        },
    });

    Projects.SampleMetadata = Backbone.View.extend({

        // Public Methods
        template: 'project/metadata/sample-metadata',
        initialize: function(parameters) {

            var that = this;

            var loadingView = new App.Views.Util.Loading({keep: true});
            this.setView('', loadingView);
            loadingView.render();

            this.projectFiles = new Backbone.Agave.Collection.Files.Metadata({projectUuid: this.model.get('uuid'), includeJobFiles: false, communityMode: App.Routers.communityMode});
            this.nonpairedFiles = [];
            this.pairedFiles = [];
            this.pairedQualFiles = [];

            this.subjectCollection = new Backbone.Agave.Collection.Metadata.Subject({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode});

            this.sampleColumns = new Backbone.Agave.Model.Metadata.SampleColumns({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode});
            this.columnNames = [];

            this.workSamples = new Backbone.Agave.Collection.Metadata.Sample({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode});
            this.workSamples.fetch()
            .then(function() {
                // save clone of original metadata collection
                that.samples = that.workSamples.getClonedCollection();

                return that.projectFiles.fetch();
            })
            .then(function() {
                return that.sampleColumns.fetch();
            })
            .then(function() {
                return that.subjectCollection.fetch();
            })
            .then(function() {

                that.columnNames = that.sampleColumns.getColumnNames();

                that.nonpairedFiles = that.projectFiles.serializedNonPairedReadCollection();
                that.pairedFiles = that.projectFiles.serializedPairedReadCollection();
                that.pairedQualFiles = that.projectFiles.serializedPairedQualityCollection();

                loadingView.remove();

                that.render();
            })
            .fail(function(error) {
                var telemetry = new Backbone.Agave.Model.Telemetry();
                telemetry.setError(error);
                telemetry.set('method', 'Backbone.Agave.Collection.Metadata.Sample.fetch()');
                telemetry.set('view', 'Projects.SampleMetadata');
                telemetry.set('project', this.model.get('uuid'));
                telemetry.save();
            })
            ;
        },
        serialize: function() {
            var rowValues = [];
            for (var i = 0; i < this.workSamples.models.length; ++i) {
                var m = this.workSamples.at(i);
                var value = m.get('value');
                var values = [];
                for (var j = 0; j < this.columnNames.length; ++j)
                    values[j] = { name: this.columnNames[j], value: value[this.columnNames[j]] };
                rowValues[i] = { row: values };
                rowValues[i]['uuid'] = m.get('uuid');
            }

            return {
                rowValues: rowValues,
                workSamples: this.workSamples.toJSON(),
                subjectCollection: this.subjectCollection.toJSON(),
                nonpairedFiles: this.nonpairedFiles,
                pairedFiles: this.pairedFiles,
                pairedQualFiles: this.pairedQualFiles,
                columnNames: this.columnNames,
            };
        },
        afterRender: function() {
            this.setupModalView();
        },
        events: {
            'click  #save-sample-metadata': '_saveSampleMetadata',
            'submit #sample-metadata-form': '_saveSampleMetadata',

            'click  #revert-sample-modal': '_revertSampleModal',
            'click  #revert-metadata': '_revertSampleMetadata',

            'click #addSample': '_addSample',
            'click .removeSample': '_removeSample',
            'change .sampleMetadata': '_changeSampleMetadata',

            'click #importFromFile': '_importFromFile',
            'click #exportToFile': '_exportToFile',
        },

        // Private Methods
        setupModalView: function() {

            var message = new App.Models.MessageModel({
                'header': 'Saving Metadata',
                'body':   '<p>Please wait while we save the metadata to the server...</p>'
            });

            var modal = new App.Views.Util.ModalMessageConfirm({
                model: message
            });

            $('<div id="modal-view">').appendTo(this.el);

            this.setView('#modal-view', modal);
            modal.render();

        },

        // Event Responders
        _addSample: function(e){
            var m = new Backbone.Agave.Model.Metadata.Sample({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode})
            m.set('uuid', m.cid);
            this.workSamples.add(m);
            this.render();
        },

        _removeSample: function(e){
            var m = this.workSamples.at(e.target.dataset.tuple);
            this.workSamples.remove(m);
            this.render();
        },

        _changeSampleMetadata: function(e) {
            e.preventDefault();
            var m = this.workSamples.at(e.target.dataset.tuple);
            var value = m.get('value');
            var field = e.target.id.replace('sample-', '');
            value[field] = e.target.value;
            m.set('value', value);
        },

        _saveSampleMetadata: function(e) {
            e.preventDefault();

            var that = this;

            $('#modal-message').modal('show')
              .on('shown.bs.modal', function() {

                // see if any are deleted
                var deletedModels = that.samples.getMissingModels(that.workSamples);

                var promises = [];

                // Set up promises
                // deletions
                deletedModels.map(function(uuid) {
                    var m = that.samples.get(uuid);
                    promises[promises.length] = function() {
                        return m.destroy();
                    }
                });

                // updates and new
                that.workSamples.map(function(uuid) {
                    var m = that.workSamples.get(uuid);
                    promises[promises.length] = function() {
                        // clear uuid for new entries so they get created
                        if (m.get('uuid') == m.cid) m.set('uuid', '');
                        else { // if existing entry, check if attributes changed
                            var origModel = that.samples.get(uuid);
                            if (!origModel) return;
                            var changed = m.changedAttributes(origModel.attributes);
                            if (!changed) return;
                        }
                        return m.save()
                            .then(function() {
                                return m.syncMetadataPermissionsWithProjectPermissions(that.model.get('uuid'));
                            });
                    }
                });

                // Execute promises
                var sequentialPromiseResults = promises.reduce(
                    function(previous, current) {
                        return previous.then(current);
                    },
                    $.Deferred().resolve()
                )
                .always(function() {
                    $('#modal-message')
                      .modal('hide')
                      .on('hidden.bs.modal', function() {

                          // new original collection
                          that.samples = that.workSamples.getClonedCollection();
                          //that.samples = that.workSamples.clone();
                          that.render();
                      })
                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(error);
                    telemetry.set('method', '_saveSampleMetadata()');
                    telemetry.set('view', 'Projects.SampleMetadata');
                    telemetry.set('project', this.model.get('uuid'));
                    telemetry.save();
                })
                ;
            })
        },

        _revertSampleModal: function(e) {
            e.preventDefault();

            $('#revert-sample').modal('show');
        },

        _revertSampleMetadata: function(e) {
            var that = this;
            $('#revert-sample').modal('hide')
                .on('hidden.bs.modal', function() {
                    // revert work samples back to original collection
                    that.workSamples = that.samples.getClonedCollection();
                    //that.workSamples = that.samples.clone();
                    that.render();
                })
            ;
        },

        _importFromFile: function(e) {
            var importView = new Projects.MetadataImport({
                projectUuid: this.model.get('uuid'),
                metadataName: 'Sample Metadata',
                parentView: this,
                projectFiles: this.projectFiles
            });

            this.setView('#import-metadata-staging', importView);
            importView.render();
        },

        _performImport: function(file, op) {
            return this.workSamples.importFromFile(file, op);
        },

        _exportToFile: function(e) {
            var that = this;
            this.workSamples.createExportFile()
              .then(function(response) {
                  if (response.status == 'success') return that.workSamples.downloadExportFileToDisk();
                  else return $.Deferred().reject('Unable to export sample metadata.');
              })
              .then(function() {
              })
              .fail(function(error) {
                  var telemetry = new Backbone.Agave.Model.Telemetry();
                  telemetry.setError(error);
                  telemetry.set('method', 'Backbone.Agave.Collection.Metadata.Sample._exportToFile()');
                  telemetry.set('view', 'Projects.SampleMetadata');
                  telemetry.save();
              })
              ;
        },
    });

    Projects.CellProcessingMetadata = Backbone.View.extend({

        // Public Methods
        template: 'project/metadata/cell-processing-metadata',
        initialize: function(parameters) {

            var that = this;

            var loadingView = new App.Views.Util.Loading({keep: true});
            this.setView('', loadingView);
            loadingView.render();

            this.columns = new Backbone.Agave.Model.Metadata.CellProcessingColumns({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode});
            this.columnNames = [];

            this.sampleCollection = new Backbone.Agave.Collection.Metadata.Sample({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode});

            this.objectCollection = new Backbone.Agave.Collection.Metadata.CellProcessing({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode});

            this.objectCollection.fetch()
            .then(function() {
                // save clone of original metadata collection
                that.saveCollection = that.objectCollection.getClonedCollection();

                return that.sampleCollection.fetch();
            })
            .then(function() {
                return that.columns.fetch();
            })
            .then(function() {

                that.columnNames = that.columns.getColumnNames();

                loadingView.remove();

                that.render();
            })
        },

        serialize: function() {
            var rowValues = [];
            for (var i = 0; i < this.objectCollection.models.length; ++i) {
                var m = this.objectCollection.at(i);
                var value = m.get('value');
                var values = [];
                for (var j = 0; j < this.columnNames.length; ++j)
                    values[j] = { name: this.columnNames[j], value: value[this.columnNames[j]] };
                rowValues[i] = { row: values };
                rowValues[i]['uuid'] = m.get('uuid');
            }

            return {
                rowValues: rowValues,
                columnNames: this.columnNames,
                objectCollection: this.objectCollection.toJSON(),
                sampleCollection: this.sampleCollection.toJSON(),
            };
        },
        afterRender: function() {
            this.setupModalView();
        },
        events: {
            'click  #save-cp-metadata': '_saveMetadata',
            'submit #cp-metadata-form': '_saveMetadata',

            'click  #revert-cp-modal': '_revertModal',
            'click  #revert-metadata': '_revertMetadata',

            'click #addEntry': '_addEntry',
            'click .removeEntry': '_removeEntry',
            'change .cpMetadata': '_changeEntryMetadata',

            'click #importFromFile': '_importFromFile',
            'click #exportToFile': '_exportToFile',
        },

        // Private Methods
        setupModalView: function() {

            var message = new App.Models.MessageModel({
                'header': 'Saving Metadata',
                'body':   '<p>Please wait while we save the metadata to the server...</p>'
            });

            var modal = new App.Views.Util.ModalMessageConfirm({
                model: message
            });

            $('<div id="modal-view">').appendTo(this.el);

            this.setView('#modal-view', modal);
            modal.render();

        },

        // Event Responders
        _addEntry: function(e){
            var that = this;
            var m = new Backbone.Agave.Model.Metadata.CellProcessing({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode})
            m.set('uuid', m.cid);
            this.objectCollection.add(m);
            this.render();
        },
        _removeEntry: function(e){
            var m = this.objectCollection.at(e.target.dataset.tuple);
            this.objectCollection.remove(m);
            this.render();
        },
        _changeEntryMetadata: function(e) {
            // we use ids with attribute name embedded to have a generic change method
            e.preventDefault();
            var m = this.objectCollection.at(e.target.dataset.tuple);
            var value = m.get('value');
            var field = e.target.id.replace('cp-', '');
            value[field] = e.target.value;
            m.set('value', value);
        },

        _importFromFile: function(e) {
            var importView = new Projects.MetadataImport({
                projectUuid: this.model.get('uuid'),
                metadataName: 'Cell Processing Metadata',
                parentView: this,
                projectFiles: this.projectFiles
            });

            this.setView('#import-metadata-staging', importView);
            importView.render();
        },

        _performImport: function(file, op) {
            return this.objectCollection.importFromFile(file, op);
        },

        _exportToFile: function(e) {
            var that = this;
            this.objectCollection.createExportFile()
              .then(function(response) {
                  if (response.status == 'success') return that.objectCollection.downloadExportFileToDisk();
                  else return $.Deferred().reject('Unable to export cell processing metadata.');
              })
              .then(function() {
              })
              .fail(function(error) {
                  var telemetry = new Backbone.Agave.Model.Telemetry();
                  telemetry.setError(error);
                  telemetry.set('method', '_exportToFile()');
                  telemetry.set('view', 'Projects.CellProcessingMetadata');
                  telemetry.set('project', this.model.get('uuid'));
                  telemetry.save();
              })
              ;
        },
        _saveMetadata: function(e) {
            e.preventDefault();

            var that = this;

            $('#modal-message').modal('show')
                .on('shown.bs.modal', function() {

            // see if any are deleted
            var deletedModels = that.saveCollection.getMissingModels(that.objectCollection);

            var promises = [];

            // Set up promises
            // deletions
            deletedModels.map(function(uuid) {
                var m = that.saveCollection.get(uuid);
                promises[promises.length] = function() {
                    return m.destroy();
                }
            });

            // updates and new
            that.objectCollection.map(function(uuid) {
                var m = that.objectCollection.get(uuid);
                promises[promises.length] = function() {
                    // clear uuid for new entries so they get created
                    if (m.get('uuid') == m.cid) m.set('uuid', '');
                    else { // if existing entry, check if attributes changed
                        var origModel = that.saveCollection.get(uuid);
                        if (!origModel) return;
                        var changed = m.changedAttributes(origModel.attributes);
                        if (!changed) return;
                    }
                    return m.save()
                        .then(function() {
                            return m.syncMetadataPermissionsWithProjectPermissions(that.model.get('uuid'));
                        });
                }
            });

            // Execute promises
            var sequentialPromiseResults = promises.reduce(
                function(previous, current) {
                    return previous.then(current);
                },
                $.Deferred().resolve()
            )
            .always(function() {
                $('#modal-message')
                  .modal('hide')
                  .on('hidden.bs.modal', function() {

                      // new original collection
                      that.saveCollection = that.objectCollection.getClonedCollection();

                      that.render();
                  })
            })
            .fail(function(error) {
                var telemetry = new Backbone.Agave.Model.Telemetry();
                telemetry.setError(error);
                telemetry.set('method', '_saveMetadata()');
                telemetry.set('view', 'Projects.CellProcessingMetadata');
                telemetry.set('project', this.model.get('uuid'));
                telemetry.save();
            })
            ;
            })
        },

        _revertModal: function(e) {
            e.preventDefault();

            $('#revert-cp').modal('show');
        },

        _revertMetadata: function(e) {
            var that = this;
            $('#revert-cp').modal('hide')
                .on('hidden.bs.modal', function() {
                    // revert work samples back to original collection
                    that.objectCollection = that.saveCollection.getClonedCollection();

                    that.render();
                })
            ;
        },
    });

    Projects.NucleicAcidProcessingMetadata = Backbone.View.extend({

        // Public Methods
        template: 'project/metadata/nucleic-acid-processing-metadata',
        initialize: function(parameters) {

            var that = this;

            var loadingView = new App.Views.Util.Loading({keep: true});
            this.setView('', loadingView);
            loadingView.render();

            this.columns = new Backbone.Agave.Model.Metadata.NucleicAcidProcessingColumns({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode});
            this.columnNames = [];

            this.projectFiles = new Backbone.Agave.Collection.Files.Metadata({projectUuid: this.model.get('uuid'), includeJobFiles: false, communityMode: App.Routers.communityMode});
            this.nonpairedFiles = [];
            this.pairedFiles = [];
            this.pairedQualFiles = [];

            this.cpCollection = new Backbone.Agave.Collection.Metadata.CellProcessing({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode});

            this.objectCollection = new Backbone.Agave.Collection.Metadata.NucleicAcidProcessing({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode});

            this.objectCollection.fetch()
            .then(function() {
                // save clone of original metadata collection
                that.saveCollection = that.objectCollection.getClonedCollection();

                return that.cpCollection.fetch();
            })
            .then(function() {
                return that.projectFiles.fetch();
            })
            .then(function() {
                return that.columns.fetch();
            })
            .then(function() {

                that.columnNames = that.columns.getColumnNames();

                that.nonpairedFiles = that.projectFiles.serializedNonPairedReadCollection();
                that.pairedFiles = that.projectFiles.serializedPairedReadCollection();
                that.pairedQualFiles = that.projectFiles.serializedPairedQualityCollection();

                loadingView.remove();

                that.render();
            })
        },

        serialize: function() {
            var rowValues = [];
            for (var i = 0; i < this.objectCollection.models.length; ++i) {
                var m = this.objectCollection.at(i);
                var value = m.get('value');
                var values = [];
                for (var j = 0; j < this.columnNames.length; ++j)
                    values[j] = { name: this.columnNames[j], value: value[this.columnNames[j]] };
                rowValues[i] = { row: values };
                rowValues[i]['uuid'] = m.get('uuid');
            }

            return {
                rowValues: rowValues,
                columnNames: this.columnNames,
                objectCollection: this.objectCollection.toJSON(),
                cpCollection: this.cpCollection.toJSON(),
                nonpairedFiles: this.nonpairedFiles,
                pairedFiles: this.pairedFiles,
                pairedQualFiles: this.pairedQualFiles,
            };
        },
        afterRender: function() {
            this.setupModalView();
        },
        events: {
            'click  #save-nap-metadata': '_saveMetadata',
            'submit #nap-metadata-form': '_saveMetadata',

            'click  #revert-nap-modal': '_revertModal',
            'click  #revert-metadata': '_revertMetadata',

            'click #addEntry': '_addEntry',
            'click .removeEntry': '_removeEntry',
            'change .napMetadata': '_changeEntryMetadata',

            'click #importFromFile': '_importFromFile',
            'click #exportToFile': '_exportToFile',
        },

        // Private Methods
        setupModalView: function() {

            var message = new App.Models.MessageModel({
                'header': 'Saving Metadata',
                'body':   '<p>Please wait while we save the metadata to the server...</p>'
            });

            var modal = new App.Views.Util.ModalMessageConfirm({
                model: message
            });

            $('<div id="modal-view">').appendTo(this.el);

            this.setView('#modal-view', modal);
            modal.render();

        },

        // Event Responders
        _addEntry: function(e){
            var that = this;
            var m = new Backbone.Agave.Model.Metadata.NucleicAcidProcessing({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode})
            m.set('uuid', m.cid);
            this.objectCollection.add(m);
            this.render();
        },
        _removeEntry: function(e){
            var m = this.objectCollection.at(e.target.dataset.tuple);
            this.objectCollection.remove(m);
            this.render();
        },
        _changeEntryMetadata: function(e) {
            // we use ids with attribute name embedded to have a generic change method
            e.preventDefault();
            var m = this.objectCollection.at(e.target.dataset.tuple);
            var value = m.get('value');
            var field = e.target.id.replace('nap-', '');
            value[field] = e.target.value;
            m.set('value', value);
        },

        _importFromFile: function(e) {
            var importView = new Projects.MetadataImport({
                projectUuid: this.model.get('uuid'),
                metadataName: 'Nucleic Acid Processing Metadata',
                parentView: this,
                projectFiles: this.projectFiles
            });

            this.setView('#import-metadata-staging', importView);
            importView.render();
        },

        _performImport: function(file, op) {
            return this.objectCollection.importFromFile(file, op);
        },

        _exportToFile: function(e) {
            var that = this;
            this.objectCollection.createExportFile()
              .then(function(response) {
                  if (response.status == 'success') return that.objectCollection.downloadExportFileToDisk();
                  else return $.Deferred().reject('Unable to export nucleic acid processing metadata.');
              })
              .then(function() {
              })
              .fail(function(error) {
                  var telemetry = new Backbone.Agave.Model.Telemetry();
                  telemetry.setError(error);
                  telemetry.set('method', '_exportToFile()');
                  telemetry.set('view', 'Projects.NucleicAcidProcessingMetadata');
                  telemetry.set('project', this.model.get('uuid'));
                  telemetry.save();
              })
              ;
        },
        _saveMetadata: function(e) {
            e.preventDefault();

            var that = this;

            $('#modal-message').modal('show')
                .on('shown.bs.modal', function() {

            // see if any are deleted
            var deletedModels = that.saveCollection.getMissingModels(that.objectCollection);

            var promises = [];

            // Set up promises
            // deletions
            deletedModels.map(function(uuid) {
                var m = that.saveCollection.get(uuid);
                promises[promises.length] = function() {
                    return m.destroy();
                }
            });

            // updates and new
            that.objectCollection.map(function(uuid) {
                var m = that.objectCollection.get(uuid);
                promises[promises.length] = function() {
                    // clear uuid for new entries so they get created
                    if (m.get('uuid') == m.cid) m.set('uuid', '');
                    else { // if existing entry, check if attributes changed
                        var origModel = that.saveCollection.get(uuid);
                        if (!origModel) return;
                        var changed = m.changedAttributes(origModel.attributes);
                        if (!changed) return;
                    }
                    return m.save()
                        .then(function() {
                            return m.syncMetadataPermissionsWithProjectPermissions(that.model.get('uuid'));
                        });
                }
            });

            // Execute promises
            var sequentialPromiseResults = promises.reduce(
                function(previous, current) {
                    return previous.then(current);
                },
                $.Deferred().resolve()
            )
            .always(function() {
                $('#modal-message')
                  .modal('hide')
                  .on('hidden.bs.modal', function() {

                      // new original collection
                      that.saveCollection = that.objectCollection.getClonedCollection();

                      that.render();
                  })
            })
            .fail(function(error) {
                var telemetry = new Backbone.Agave.Model.Telemetry();
                telemetry.setError(error);
                telemetry.set('method', '_saveMetadata()');
                telemetry.set('view', 'Projects.NucleicAcidProcessingMetadata');
                telemetry.set('project', this.model.get('uuid'));
                telemetry.save();
            })
            ;
            })
        },

        _revertModal: function(e) {
            e.preventDefault();

            $('#revert-nap').modal('show');
        },

        _revertMetadata: function(e) {
            var that = this;
            $('#revert-nap').modal('hide')
                .on('hidden.bs.modal', function() {
                    // revert work samples back to original collection
                    that.objectCollection = that.saveCollection.getClonedCollection();

                    that.render();
                })
            ;
        },
    });

    Projects.SampleGroups = Backbone.View.extend({

        // Public Methods
        template: 'project/metadata/sample-groups',
        initialize: function(parameters) {

            var that = this;

            var loadingView = new App.Views.Util.Loading({keep: true});
            this.setView('', loadingView);
            loadingView.render();

            this.sampleGroups = new Backbone.Agave.Collection.Metadata.SampleGroup({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode});

            this.sampleCollection = new Backbone.Agave.Collection.Metadata.Sample({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode});

            this.sampleColumns = new Backbone.Agave.Model.Metadata.SampleColumns({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode});
            this.sampleColumnNames = [];

            this.subjectColumns = new Backbone.Agave.Model.Metadata.SubjectColumns({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode});
            this.subjectColumnNames = [];

            this.cpColumns = new Backbone.Agave.Model.Metadata.CellProcessingColumns({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode});
            this.cpColumnNames = [];

            this.napColumns = new Backbone.Agave.Model.Metadata.NucleicAcidProcessingColumns({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode});
            this.napColumnNames = [];

            this.sampleGroups.fetch()
            .then(function() {
                // save clone of original metadata collection
                that.groups = that.sampleGroups.getClonedCollection();

                return that.sampleCollection.fetch();
            })
            .then(function() {
                return that.sampleColumns.fetch();
            })
            .then(function() {

                var columnNames = that.sampleColumns.getColumnNames();
                for (var i = 0; i < columnNames.length; ++i) {
                    that.sampleColumnNames.push({ name: columnNames[i], value: 'sample.' + columnNames[i]});
                }

                return that.cpColumns.fetch();
            })
            .then(function() {

                var columnNames = that.cpColumns.getColumnNames();
                for (var i = 0; i < columnNames.length; ++i) {
                    that.cpColumnNames.push({ name: columnNames[i], value: 'cellProcessing.' + columnNames[i]});
                }

                return that.napColumns.fetch();
            })
            .then(function() {

                var columnNames = that.napColumns.getColumnNames();
                for (var i = 0; i < columnNames.length; ++i) {
                    that.napColumnNames.push({ name: columnNames[i], value: 'nucleicAcidProcessing.' + columnNames[i]});
                }

                return that.subjectColumns.fetch();
            })
            .then(function() {

                var columnNames = that.subjectColumns.getColumnNames();
                for (var i = 0; i < columnNames.length; ++i) {
                    that.subjectColumnNames.push({ name: columnNames[i], value: 'subject.' + columnNames[i]});
                }

                loadingView.remove();

                that.render();

            })
            .fail(function(error) {
                var telemetry = new Backbone.Agave.Model.Telemetry();
                telemetry.setError(error);
                telemetry.set('method', 'Backbone.Agave.Collection.Metadata.fetch()');
                telemetry.set('view', 'Projects.SampleGroups');
                telemetry.set('project', this.model.get('uuid'));
                telemetry.save();
            })
            ;
        },
        serialize: function() {
            return {
                sampleColumnNames: this.sampleColumnNames,
                cpColumnNames: this.cpColumnNames,
                napColumnNames: this.napColumnNames,
                subjectColumnNames: this.subjectColumnNames,
                sampleGroups: this.sampleGroups.toJSON(),
                sampleCollection: this.sampleCollection.toJSON(),
            };
        },
        afterRender: function() {
            this.setupModalView();

            var that = this;
            for (var i = 0; i < this.sampleGroups.models.length; ++i) {
                $(document).ready(function() {
                    $('#sample-groups-' + i + '-samples').multiselect({
                        sampleGroupIndex: i,
                        nonSelectedText: 'All Samples',
                        //enableFiltering: true,
                        //includeSelectAllOption: true,
                        //selectAllJustVisible: false,
                        onChange: function(option, checked, select) {
                            if (option) {
                                var m = that.sampleGroups.at(this.options.sampleGroupIndex);
                                var value = m.get('value');
                                var samples = _.clone(value.samples);
                                if (checked) samples.push($(option).val());
                                else samples.splice(samples.indexOf($(option).val()), 1);
                                value.samples = samples;
                                m.set('value', value);
                            }
                        },
/*                        onSelectAll: function() {
                            var m = that.sampleGroups.at(this.sampleGroupIndex);
                            var value = m.get('value');
                            value.samples = [ 'all' ];
                            m.set('value', value);
                        },
                        onDeselectAll: function() {
                            var m = that.sampleGroups.at(this.sampleGroupIndex);
                            var value = m.get('value');
                            value.samples = [ ];
                            m.set('value', value);
                        }, */
                    });

                    var m = that.sampleGroups.at(i);
                    var value = m.get('value');
                    //if ((value.samples.length == 1) && (value.samples[0] == 'all'))
                        //$('#sample-groups-' + i + '-samples').multiselect('selectAll', false);
                    //else
                        $('#sample-groups-' + i + '-samples').multiselect('select', value.samples);
                    $('#sample-groups-' + i + '-samples').multiselect('updateButtonText');
                });
            }
        },
        events: {
            //'click  #save-sample-groups': '_saveSampleGroups',
            'submit #sample-groups-form': '_saveSampleGroups',

            'click  #revert-sample-groups-modal': '_revertSampleGroupsModal',
            'click  #revert-metadata': '_revertSampleGroups',

            'click #addSampleGroup': '_addSampleGroup',
            'click .removeSampleGroup': '_removeSampleGroup',
            'change .sampleGroup': '_changeSampleGroup',
        },

        // Private Methods
        setupModalView: function() {

            var message = new App.Models.MessageModel({
                'header': 'Saving Sample Groups',
                'body':   '<p>Please wait while we save the metadata to the server...</p>'
            });

            var modal = new App.Views.Util.ModalMessageConfirm({
                model: message
            });

            $('<div id="modal-view">').appendTo(this.el);

            this.setView('#modal-view', modal);
            modal.render();

        },

        // Event Responders
        _addSampleGroup: function(e){
            var m = new Backbone.Agave.Model.Metadata.SampleGroup({projectUuid: this.model.get('uuid'), communityMode: App.Routers.communityMode})
            m.set('uuid', m.cid);
            this.sampleGroups.add(m);
            this.render();
        },

        _removeSampleGroup: function(e){
            var m = this.sampleGroups.at(e.target.dataset.tuple);
            this.sampleGroups.remove(m);
            this.render();
        },

        _changeSampleGroup: function(e) {
            e.preventDefault();
            var m = this.sampleGroups.at(e.target.dataset.tuple);
            var value = m.get('value');
            var field = e.target.id.replace('sample-groups-', '');
            value[field] = e.target.value;
            m.set('value', value);
        },

        _changeSampleSelection: function(i, option, checked, select) {
            var m = this.sampleGroups.at(i);
        },

        _saveSampleGroups: function(e) {
            e.preventDefault();

            var that = this;

            $('#modal-message').modal('show')
              .on('shown.bs.modal', function() {

                // see if any are deleted
                var deletedModels = that.groups.getMissingModels(that.sampleGroups);

                var promises = [];

                // Set up promises
                // deletions
                deletedModels.map(function(uuid) {
                    var m = that.groups.get(uuid);
                    promises[promises.length] = function() {
                        return m.destroy();
                    }
                });

                // updates and new
                that.sampleGroups.map(function(uuid) {
                    var m = that.sampleGroups.get(uuid);
                    promises[promises.length] = function() {
                        // clear uuid for new entries so they get created
                        if (m.get('uuid') == m.cid) m.set('uuid', '');
                        else { // if existing entry, check if attributes changed
                            var origModel = that.groups.get(uuid);
                            if (!origModel) return;
                            var changed = m.changedAttributes(origModel.attributes);
                            if (!changed) return;
                        }
                        return m.save()
                            .then(function() {
                                return m.syncMetadataPermissionsWithProjectPermissions(that.model.get('uuid'));
                            });
                    }
                });

                // Execute promises
                var sequentialPromiseResults = promises.reduce(
                    function(previous, current) {
                        return previous.then(current);
                    },
                    $.Deferred().resolve()
                )
                .always(function() {
                    $('#modal-message')
                      .modal('hide')
                      .on('hidden.bs.modal', function() {

                          // new original collection
                          that.groups = that.sampleGroups.getClonedCollection();

                          that.render();
                      })
                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(error);
                    telemetry.set('method', '_saveSampleGroups()');
                    telemetry.set('view', 'Projects.SampleGroups');
                    telemetry.set('project', this.model.get('uuid'));
                    telemetry.save();
                })
                ;
            })
        },

        _revertSampleGroupsModal: function(e) {
            e.preventDefault();

            $('#revert-groups').modal('show');
        },

        _revertSampleGroups: function(e) {
            var that = this;
            $('#revert-groups').modal('hide')
                .on('hidden.bs.modal', function() {
                    // revert back to original collection
                    that.sampleGroups = that.groups.getClonedCollection();

                    that.render();
                })
            ;
        },
    });

    Projects.MetadataImport = Backbone.View.extend({
        // Public Methods
        template: 'project/metadata/import-metadata',
        initialize: function(parameters) {
            this.tsvFiles = this.projectFiles.getTSVCollection();
        },
        serialize: function() {
            return {
                metadataName: this.metadataName,
                tsvFiles: this.tsvFiles.toJSON(),
            };
        },
        afterRender: function() {
            $('#import-modal').modal('show');
        },
        events: {
            'click #submit-import': '_submitImportForm',
            'click #import-exit': '_exitImportForm',
        },

        // Private Methods
        _exitImportForm: function(e) {
            e.preventDefault();

            var that = this;

            $('#import-modal').on('hidden.bs.modal', function(e) {
                // force reload of page
                Backbone.history.loadUrl(Backbone.history.fragment);
            });
        },

        _submitImportForm: function(e) {
            var that = this;
            var fileUuid = $('#file-import-name').val();
            var op = $('#data-operation').val();
            var file = this.tsvFiles.get(fileUuid);

            this._uiShowImportProcessingView();

            this.parentView._performImport(file, op)
              .then(function(response) {
                  that._uiCancelJobLoadingView();
              })
              .fail(function(error) {
                  if (error.responseText) that._uiCancelJobLoadingView(error.responseText);
                  else that._uiCancelJobLoadingView('Unknown server error.');

                  var telemetry = new Backbone.Agave.Model.Telemetry();
                  telemetry.setError(error);
                  telemetry.set('method', 'performImport()');
                  telemetry.set('view', 'Projects.MetadataImport');
                  telemetry.save();
              })
              ;
        },

        // UI
        _uiShowImportProcessingView: function() {
            // Clear out any previous errors
            $('#import-processing-view').html('');
            $('#import-processing-view').removeClass('alert alert-danger');

            var alertView = new App.Views.Util.Loading({ displayText: 'Importing... Please Wait.', keep: true});

            this.setView('#import-processing-view', alertView);
            alertView.render();

            $('.import-form-item').prop('disabled', true)
            $('.import-submit-button').prop('disabled', true)
        },

        _uiCancelJobLoadingView: function(error) {
            this.removeView('#import-processing-view');

            $('#import-processing-view').removeClass('alert alert-info');
            $('.import-submit-button').addClass('hidden');
            $('#import-exit').removeClass('hidden');

            if (error) {
                $('#import-processing-view').addClass('alert alert-danger');
                var msg = 'There was an error importing the metadata.<br/>';
                msg += error + '<br/>';
                $('#import-processing-view').append(msg);
            } else {
                var message = new App.Models.MessageModel({
                    'body': 'Import was successful!'
                });

                var alertView = new App.Views.Util.Alert({
                    options: {
                        type: 'success'
                    },
                    model: message
                });

                this.setView('#import-processing-view', alertView);
                alertView.render();
            }
        },
    });

    Projects.Metadata = Backbone.View.extend({
        template: 'project/metadata/metadata',
        initialize: function() {

            // explicitly fetch model instead of waiting for side menu view
            this.model = new Backbone.Agave.Model.Project({ uuid: this.projectUuid, communityMode: App.Routers.communityMode});
            var that = this;

            var loadingView = new App.Views.Util.Loading({keep: true});
            this.setView('#project-metadata-entry', loadingView);
            loadingView.render();

            this.model.fetch()
            .then(function() {
                that.projectFiles = new Backbone.Agave.Collection.Files.Metadata({projectUuid: that.model.get('uuid'), includeJobFiles: false, communityMode: App.Routers.communityMode});

                return that.projectFiles.fetch();
            })
            .then(function() {
                // Setup subviews
                that.projectView = new Projects.StudyMetadata({ model: that.model, projectFiles: that.projectFiles, projectUuid: this.projectUuid });
                that.setView('#project-metadata-entry', that.projectView);
                that.projectView.render();

                that.subjectView = new Projects.SubjectMetadata({ model: that.model, projectFiles: that.projectFiles, projectUuid: this.projectUuid });
                that.setView('#subject-metadata-entry', that.subjectView);
                that.subjectView.render();

                that.diagnosisView = new Projects.DiagnosisMetadata({ model: that.model, projectFiles: that.projectFiles, projectUuid: this.projectUuid });
                that.setView('#diagnosis-metadata-entry', that.diagnosisView);
                that.diagnosisView.render();

                that.sampleView = new Projects.SampleMetadata({ model: that.model, projectFiles: that.projectFiles, projectUuid: this.projectUuid });
                that.setView('#sample-metadata-entry', that.sampleView);
                that.sampleView.render();

                that.cpView = new Projects.CellProcessingMetadata({ model: that.model, projectFiles: that.projectFiles, projectUuid: this.projectUuid });
                that.setView('#cp-metadata-entry', that.cpView);
                that.cpView.render();

                that.napView = new Projects.NucleicAcidProcessingMetadata({ model: that.model, projectFiles: that.projectFiles, projectUuid: this.projectUuid });
                that.setView('#nap-metadata-entry', that.napView);
                that.napView.render();

                that.sampleGroupsView = new Projects.SampleGroups({ model: that.model, projectFiles: that.projectFiles, projectUuid: this.projectUuid });
                that.setView('#sample-groups-entry', that.sampleGroupsView);
                that.sampleGroupsView.render();
            })
            .fail(function(error) {
                var telemetry = new Backbone.Agave.Model.Telemetry();
                telemetry.setError(error);
                telemetry.set('method', 'Backbone.Agave.Model.Project.fetch()');
                telemetry.set('view', 'Projects.Metadata');
                telemetry.save();
            })
            ;
        },
        serialize: function() {
            return {
            };
        },
        events: {
        },

    });

    App.Views.Projects = Projects;
    return Projects;
});
