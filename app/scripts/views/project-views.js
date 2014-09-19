define([
    'app',
    'handlebars',
    'filesize',
    'environment-config',
    'socket-io',
    'backbone.syphon'
], function(App, Handlebars, filesize, EnvironmentConfig, io) {

    'use strict';

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

    Handlebars.registerHelper('GetHumanReadableReadDirection', function(data /*, options*/) {
        return App.Views.HandlebarsHelpers.FileMetadataHelpers.GetHumanReadableReadDirection(data);
    });

    var Projects = {};

    Projects.List = Backbone.View.extend({
        template: 'project/list',
        initialize: function(parameters) {

            if (parameters && parameters.projectUuid) {
                this.selectedProjectUuid = parameters.projectUuid;
            }

            App.Datastore.Collection.ProjectCollection = new Backbone.Agave.Collection.Projects();

            var loadingView = new App.Views.Util.Loading({keep: true});
            this.insertView(loadingView);
            loadingView.render();

            var that = this;

            App.Datastore.Collection.ProjectCollection.fetch()
                .done(function() {
                    loadingView.remove();

                    App.Datastore.Collection.ProjectCollection.on('change add remove destroy', function() {
                        that.render();
                    });

                    that.render();

                    if (parameters.shouldLoadViewForIndex && parameters.shouldLoadViewForIndex === true) {
                        that.loadViewForIndex();
                    }
                })
                .fail(function() {

                });
        },
        serialize: function() {
            return {
                projects: App.Datastore.Collection.ProjectCollection.toJSON()
            };
        },
        afterRender: function() {
            // UI update in case of reload
            if (this.selectedProjectUuid) {
                this.uiSetProjectActive(this.selectedProjectUuid);
                this.uiOpenProjectSubmenu(this.selectedProjectUuid);
            }
        },
        uiSelectProject: function(projectUuid) {
            this.selectedProjectUuid = projectUuid;

            this.uiSetProjectActive(this.selectedProjectUuid);
            this.uiOpenProjectSubmenu(this.selectedProjectUuid);
        },
        uiSetProjectActive: function(projectUuid) {
            $('.list-group-item').removeClass('active');
            $('#project-' + projectUuid + '-menu').addClass('active');
        },
        uiOpenProjectSubmenu: function(projectUuid) {
            $('.project-submenu').addClass('hidden');
            $('#project-' + projectUuid + '-menu').nextUntil('.project-menu').removeClass('hidden');
        },
        loadViewForIndex: function() {
            if (App.Datastore.Collection.ProjectCollection.models.length === 0) {
                App.router.navigate('/project/create', {
                    trigger: true
                });
            }
            else {
                var projectModel = App.Datastore.Collection.ProjectCollection.at(0);
                App.router.navigate('/project/' + projectModel.get('uuid'), {
                    trigger: true
                });
            }
        },
        addNotification: function(jobNotification) {

            var jobNotificationView = new App.Views.Jobs.Notification({
                notificationModel: jobNotification,
            });

            this.insertView('#notifications-' + jobNotification.projectUuid, jobNotificationView);
            jobNotificationView.render();
        },
    });

    Projects.Navbar = Backbone.View.extend({
        template: 'project/navbar',
        initialize: function() {

        },
        serialize: function() {
            return {
                token: App.Agave.token().toJSON()
            };
        }
    });

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
            this.highlightList();
        },
        // UI
        highlightList: function() {
            $('.project-menu').removeClass('active');
            //$('.project-create').addClass('active');

            $('.project-submenu').addClass('hidden');
        },
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
            'submit form': 'submitForm'
        },
        submitForm: function(e) {

            e.preventDefault();

            this.$el.find('.alert-danger').fadeOut(function() {
                this.remove();
            });

            var formData = {
                value: Backbone.Syphon.serialize(this)
            };

            if (!formData.value.name) {
                App.clearMessage().setStandardErrorMessage('There was a problem creating your project. Please try again.');
            }
            else {

                this.setupModalView();
                var that = this;

                $('#modal-message')
                    .modal('show')
                    .on('shown.bs.modal', function() {

                        that.model
                            .save(formData)
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
                                that.$el.find('.alert-danger').remove().end().prepend($('<div class="alert alert-danger">').text('There was a problem creating your project. Please try again.').fadeIn());
                                $('#modal-message').modal('hide');
                            });
                    });
            }

            return false;
        }
    });

    Projects.Detail = Backbone.View.extend({
        template: 'project/detail',
        initialize: function(parameters) {

            this.fileCategory = 'uploaded';

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
                    that.initialDependencyDataSetup();
                });
            }
            else {
                this.projectModel = App.Datastore.Collection.ProjectCollection.get(parameters.projectUuid);
                this.initialDependencyDataSetup();
            }
        },
        initialDependencyDataSetup: function() {

            this.setupLoadingViews();

            var that = this;

            //console.log("proj model is: " + JSON.stringify(this.projectModel));

            this.projectUsers = new Backbone.Agave.Collection.Permissions({
                uuid: this.projectModel.get('uuid')
            });

            this.projectUsers.fetch()
                .done(function() {
                    that.fetchAndRenderFileListings();
                })
                .fail(function() {

                });
        },
        setupLoadingViews: function() {

            var fileListingsLoadingView = new App.Views.Util.Loading({keep: true});
            this.setView('.file-listings', fileListingsLoadingView);
            fileListingsLoadingView.render();

            var detailsLoadingView = new App.Views.Util.Loading({keep: true});
            this.setView('.project-details-loading-view', detailsLoadingView);
            detailsLoadingView.render();
        },
        removeLoadingViews: function() {

            var fileListingsLoadingView = this.getView('.file-listings');
            if (fileListingsLoadingView) {
                fileListingsLoadingView.remove();
            }

            var detailsLoadingView = this.getView('.project-details-loading-view');
            if (detailsLoadingView) {
                detailsLoadingView.remove();
            }
        },
        fetchAndRenderFileListings: function() {

            var that = this;
            this.fileListings.fetch({url:this.fileListings.url(this.fileCategory)})
                .done(function() {

                    that.removeLoadingViews();

                    // Need to render main view before rendering fileListing subview
                    that.render();

                    that.setupFileListingsView(that.fileListings);
                })
                .fail(function() {
                    //console.log("file listings failure");
                });
        },
        setupFileListingsView: function(fileListings) {

            var fileListingsView = new Projects.FileListings({fileListings: fileListings});

            // listen to events on fileListingsView
            this.fileListingsViewEvents(fileListingsView);
            this.setView('.file-listings', fileListingsView);
            fileListingsView.render();
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
            // UI
            $('.file-category').removeClass('active');
            $('#' + this.fileCategory).addClass('active');
        },
        events: {
            'click #file-upload': 'clickFilesSelectorWrapper',
            'change #file-dialog': 'changeFilesSelector',
            'click .file-category': 'changeFileCategory',
            'click .selected-files': 'uiToggleDisabledButtonStatus',
            'click .run-job': 'clickRunJob',
            'click #search-button': 'searchFileListings',
            'click .delete-files': 'deleteFiles',
            'click .download-file': 'downloadFile',
        },
        fileListingsViewEvents: function(fileListingsView) {

            var that = this;

            fileListingsView.on('fileDragDrop', function(files) {
                that.parseFiles(files);
            });
        },
        clickFilesSelectorWrapper: function() {
            //console.log("clickFilesSelectorWrapper hit");
            document.getElementById('file-dialog').click();
        },
        changeFilesSelector: function(e) {
            //console.log("changeFilesSelector hit");
            var files = e.target.files;
            this.parseFiles(files);
        },
        parseFiles: function(files) {

            $('#file-staging-errors').addClass('hidden');

            var projectUuid = this.projectModel.get('uuid');

            for (var i = 0; i < files.length; i++) {
                var file = files[i];

                var stagedFile = new Backbone.Agave.Model.File({
                    name: file.name,
                    length: file.size,
                    mimeType: file.type,
                    lastModified: file.lastModifiedDate,
                    projectUuid: projectUuid,
                    fileReference: file
                });

                var isDuplicate = this.fileListings.checkForDuplicateFilename(file.name);

                if (isDuplicate) {
                    $('#file-staging-errors')
                        .text('The file "' + file.name  + '" can not be uploaded because another file exists with the same name.')
                        .fadeIn()
                        .removeClass('hidden')
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
                    this.fileTransferViewEvents(fileTransferView);
                }
            }
        },
        fileTransferViewEvents: function(fileTransferView) {

            var that = this;

            fileTransferView.on('viewFinished', function(newFile) {

                $('#file-staging div').fadeOut('5000', function() {
                    fileTransferView.remove();

                    that.fileListings.add(newFile);

                    var fileListingsView = that.getView('.file-listings');
                    fileListingsView.fileListings = that.fileListings;
                    fileListingsView.render();
                });

            });
        },
        changeFileCategory: function(e) {
            e.preventDefault();

            this.fileCategory = e.target.dataset.id;

            this.fetchAndRenderFileListings();
        },
        uiToggleDisabledButtonStatus: function() {
            if ($('.selected-files:checked').length) {
                $('.files-selected-button').removeClass('disabled');
            }
            else {
                $('.files-selected-button').addClass('disabled');
            }
        },
        clickRunJob: function(e) {
            e.preventDefault();

            var jobType = e.target.dataset.jobtype;

            this.removeView('#job-submit');

            var selectedFileMetadataUuids = this.getSelectedFileUuids();
            var selectedFileListings = this.fileListings.getNewCollectionForUuids(selectedFileMetadataUuids);

            var jobSubmitView = new App.Views.Jobs.Submit({
                selectedFileListings: selectedFileListings,
                jobType: jobType,
                projectModel: this.projectModel,
                allFiles: this.fileListings,
            });

            this.setView('#job-submit', jobSubmitView);

            jobSubmitView.fetchNetworkData()
                .done(function() {
                    jobSubmitView.render();
                });

            this.handleJobViewEvents(jobSubmitView);
        },
        handleJobViewEvents: function(jobSubmitView) {

            var workflowEditorView = new App.Views.Jobs.WorkflowEditor();

            var that = this;

            this.listenToOnce(
                jobSubmitView,
                'setupCreateWorkflowView',
                function() {

                    $('#job-modal')
                        .modal('hide')
                        .on('hidden.bs.modal', function() {
                            that.setView('#job-submit', workflowEditorView);

                            workflowEditorView.fetchNetworkData()
                                .done(function() {
                                    workflowEditorView.render();
                                });
                        });
                }
            );

            this.listenToOnce(
                jobSubmitView,
                'setupEditWorkflowView',
                function(editableWorkflow) {
                    $('#job-modal')
                        .modal('hide')
                        .on('hidden.bs.modal', function() {
                            // The editable workflow needs to be set before render is called.
                            workflowEditorView.editableWorkflow = editableWorkflow;
                            that.setView('#job-submit', workflowEditorView);

                            workflowEditorView.fetchNetworkData()
                                .done(function() {
                                    workflowEditorView.render();
                                });
                        });
                }
            );

            this.listenToOnce(
                workflowEditorView,
                App.Views.Jobs.WorkflowEditor.events.closeWorkflowEditor,
                function() {
                    $('#workflow-modal')
                        .modal('hide')
                        .on('hidden.bs.modal', function() {

                            //workflowEditorView.remove();
                            that.setView('#job-submit', jobSubmitView);

                            jobSubmitView.fetchNetworkData()
                                .done(function() {
                                    jobSubmitView.render();

                                    // Reset listeners
                                    that.handleJobViewEvents(jobSubmitView);
                                });
                        });
                }
            );

        },
        getSelectedFileUuids: function() {

            var selectedFileMetadataUuids = [];

            $('.selected-files:checked').each(function() {
                selectedFileMetadataUuids.push($(this).val());
            });

            return selectedFileMetadataUuids;
        },
        searchFileListings: function() {
            var searchString = $('#search-text').val();

            if (!searchString) {
                this.setupFileListingsView(this.fileListings);
            }
            else {
                //console.log("searchString is: " + searchString);

                //var filteredModels = this.fileListings.where({'value':{'name':searchString}});
                var filteredModels = _.filter(this.fileListings.models, function(data) {
                    return data.get('value').name === searchString;
                });

                    //here({'value':{'name':searchString}});

                //console.log("filteredModels are: " + JSON.stringify(filteredModels));

                var filteredFileListings = new Backbone.Agave.Collection.Files.Metadata(filteredModels);
                //console.log("filteredFileListings are: " + JSON.stringify(filteredFileListings));

                this.setupFileListingsView(filteredFileListings);
            }
        },
        deleteFiles: function(e) {
            e.preventDefault();

            var selectedFileMetadataUuids = this.getSelectedFileUuids();

            // Kind of a hack, but hey it's elegant
            var softDeletePromise = $.Deferred();

            for (var i = 0; i < selectedFileMetadataUuids.length; i++) {
                var model = this.fileListings.get(selectedFileMetadataUuids[i]);
                model.softDeleteFile()
                    .done(function() {
                        if (i === selectedFileMetadataUuids.length) {
                            // All files are deleted, let's get out of here
                            softDeletePromise.resolve(true);
                        }
                    })
                    .fail(function() {
                        //console.log("softDelete fail");
                        if (i === selectedFileMetadataUuids.length) {
                            // All files are deleted, let's get out of here
                            softDeletePromise.resolve(true);
                        }
                    });
            }

            // All files are deleted, time to reload
            var that = this;
            $.when(softDeletePromise).then(function(data, textStatus, jqXHR) {
                that.fetchAndRenderFileListings();
            });
        },
        downloadFile: function(e) {
            e.preventDefault();

            var fileName = e.target.dataset.filename;
            var agaveFile = new Backbone.Agave.Model.File({projectUuid: this.projectUuid, name: fileName});
            agaveFile.downloadFile();
        },
    });

    Projects.FileListings = Backbone.View.extend({
        template: 'project/file-listings',
        serialize: function() {
            return {
                fileListings: this.fileListings.toJSON()
            };
        },
        events: {
            'click #drag-and-drop-box': 'clickFilesSelectorWrapper'
        },
        afterRender: function() {
            if (this.fileListings.models.length === 0) {

                var dropZone = document.getElementById('drag-and-drop-box');
                dropZone.addEventListener('dragover', this.fileContainerDrag, false);

                // Using fancy bind trick to keep 'this' context
                // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener
                dropZone.addEventListener('drop', this.fileContainerDrop.bind(this), false);
            }
        },
        clickFilesSelectorWrapper: function() {
            /*
                This actually fires off an event that the parent view will catch.
                The advantage of doing it this way is that the same file handling
                logic can be reused no matter how the user is actually uploading
                the file.
            */
            document.getElementById('file-dialog').click();
        },
        fileContainerDrag: function(e) {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
        },
        fileContainerDrop: function(e) {
            e.stopPropagation();
            e.preventDefault();

            var files = e.dataTransfer.files;

            //Hand off these file handlers to the parent view through this event.

            this.trigger("fileDragDrop", files);
        }
    });

    Projects.FileTransfer = Backbone.View.extend({
        template: 'project/file-transfer',
        initialize: function(parameters) {
            if (parameters && parameters.projectUuid) {
                this.projectUuid = parameters.projectUuid;
            }

            // Turn empty spaces into dashes
            this.fileProgressIdentifier = this.model.get('name').replace(/\s+/g, '-');

            // Remove periods - otherwise we don't be able to find this in the DOM
            this.fileProgressIdentifier = this.fileProgressIdentifier.replace(/\./g, '').toLowerCase() + '-progress';
        },
        serialize: function() {
            return {
                file: this.model.toJSON(),
                fileProgressIdentifier: this.fileProgressIdentifier,
            };
        },
        events: {
            'click #cancel-upload-button': 'cancelUpload',
            'submit form':  'startUpload',
        },
        cancelUpload: function(e) {
            e.preventDefault();
            this.remove();
        },
        startUpload: function(e) {
            e.preventDefault();

            // Disable buttons
            $('.upload-button')
                .attr('disabled', 'disabled')
            ;

            // Hide previous notifications
            $('#file-upload-notifications')
                .addClass('hidden')
            ;

            var formData = Backbone.Syphon.serialize(this);

            //console.log("formData is: " + JSON.stringify(formData));

            var that = this;

            this.model.on('uploadProgress', function(percentCompleted) {
                that.uploadProgress(percentCompleted);
            });

            this.model.save()
                .done(function(response) {

                    //console.log("submitting form");

                    //console.log("model save done and attributes are: " + JSON.stringify(that.model));
                    $('#file-upload-notifications')
                        .removeClass()
                        .addClass('alert alert-info')
                        .text('Setting file permissions...')
                        .fadeIn()
                        .removeClass('hidden')
                    ;


                    // Notify user that permissions are being set

                    // VDJAuth saves the day by fixing file pems
                    that.model.syncFilePermissionsWithProjectPermissions()
                        .done(function() {
                            //console.log("filePems save done");
                            that.createFileMetadata(formData);
                        })
                        .fail(function() {
                            // Notify user that permissions sync failed
                            // Delete file too??
                            //console.log("filePems save fail");

                            that.uploadProgress(0);

                            $('#file-upload-notifications')
                                .removeClass()
                                .addClass('alert alert-danger')
                                .text('Permission error. Please try uploading your file again.')
                                .fadeIn()
                                .removeClass('hidden')
                            ;

                            $('.upload-button').removeAttr('disabled');

                            $('#start-upload-button').text('Try again');

                        });

                })
                .fail(function() {
                    // Notify user that upload failed
                    //console.log("upload fail");

                    that.uploadProgress(0);

                    $('#file-upload-notifications')
                        .removeClass()
                        .addClass('alert alert-danger')
                        .text('File upload error. Please try uploading your file again.')
                        .fadeIn()
                        .removeClass('hidden')
                    ;

                    $('.upload-button').removeAttr('disabled');

                    $('#start-upload-button').text('Try again');
                });

        },
        uploadProgress: function(percentCompleted) {
            percentCompleted = percentCompleted.toFixed(2);
            percentCompleted += '%';

            $('.' + this.fileProgressIdentifier)
                .width(percentCompleted)
                .text(percentCompleted)
            ;
        },
        createFileMetadata: function(formData) {

            // Setup file metadata
            var fileMetadata = new Backbone.Agave.Model.File.Metadata();
            fileMetadata.setInitialMetadata(this.model, formData);

            var that = this;
            fileMetadata.save()
                .done(function() {

                    // VDJAuth saves the day by fixing metadata pems
                    fileMetadata.syncMetadataPermissionsWithProjectPermissions()
                        .done(function() {
                            //console.log("metadata pems saved");
                        })
                        .fail(function() {

                            //console.log("metadata pems fail");
                        });

                    $('.progress').removeClass('progress-striped active');
                    $('.progress-bar').addClass('progress-bar-success');

                    $('.start-upload').remove();
                    $('.cancel-upload').remove();

                    that.trigger('viewFinished', fileMetadata);

                })
                .fail(function() {
                    //console.log("fileMetadata save fail");
                });
        }
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
                            that.usernameTypeahead(that.permissions, that.tenantUsers);
                        });
                })
                .fail(function() {
                    //console.log("user fetch fail");
                });
        },
        usernameTypeahead: function(permissions, tenantUsers) {

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
        serialize: function() {
            return {
                users: this.permissions.toJSON()
            };
        },
        events: {
            'submit form': 'addUserToProject',
            'click .remove-user-from-project': 'removeUserFromProject'
        },
        addUserToProject: function(e) {
            e.preventDefault();

            var username = $('#add-username').val();

            // TODO: Check that username exists


            var that = this;
            var newUserPermission = this.permissions.create(
                {
                    username: username,
                    permission: 'READ_WRITE',
                    uuid: this.permissions.uuid
                },
                {
                    success: function() {

                        newUserPermission.addUserToProject()
                            .then(function() {
                                //console.log("added user pems success");
                            })
                            .fail(function() {
                                //console.log("added user pems fail");
                            });

                        that.permissions.add(newUserPermission);
                        that.render();
                        that.usernameTypeahead(that.permissions, that.tenantUsers);
                    },
                    error: function() {
                        //console.log("save error");
                    }
                }
            );

        },
        removeUserFromProject: function(e) {
            e.preventDefault();

            var username = e.target.dataset.id;

            var userPermission = this.permissions.findWhere({username: username});

            var that = this;

            // Try to let VDJAuth handle this
            // Only go to Agave if there's a problem
            userPermission.removeUserFromProject()
                .then(function() {
                    userPermission.destroy()
                        .done(function() {
                            //console.log('user destroy ok');
                            that.render();
                            that.usernameTypeahead(that.permissions, that.tenantUsers);
                        })
                        .fail(function() {
                            //console.log('user destroy fail');
                        });
                })
                .fail(function() {
                    //console.log("emergency remove");
                    userPermission.destroy()
                        .done(function() {
                            that.render();
                            that.usernameTypeahead(that.permissions, that.tenantUsers);
                        })
                        .fail(function() {
                            //console.log('user destroy fail');
                        });
                });
        }
    });

    Projects.Settings = Backbone.View.extend({
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
            'click #launch-delete-project-modal': 'launchDeleteProjectModal',
            'click #delete-project': 'deleteProject',
            'click #save-project-name': 'saveProjectName',
        },
        saveProjectName: function(e) {
            e.preventDefault();

            var newProjectName = $('#project-name').val();

            var value = this.model.get('value');
            value.name = newProjectName;

            this.model.set('value', value);

            this.model.save()
                .done(function() {
                    //console.log("model updated");
                })
                .fail(function() {
                    //console.log("model update fail");
                });
        },
        launchDeleteProjectModal: function(e) {
            e.preventDefault();

            $('#delete-modal').modal('show');
        },
        deleteProject: function(e) {
            e.preventDefault();

            this.model.destroy()
                .done(function() {
                    $('#delete-modal').modal('hide')
                        .on('hidden.bs.modal', function() {
                            App.router.navigate('/project', {
                                trigger: true
                            });
                    });
                })
                .fail(function() {
                    // Agave currently returns what backbone considers to be the 'wrong' http status code
                    $('#delete-modal').modal('hide')
                        .on('hidden.bs.modal', function() {
                            App.router.navigate('/project', {
                                trigger: true
                            });
                    });
                });
        },
    });

    App.Views.Projects = Projects;
    return Projects;
});
