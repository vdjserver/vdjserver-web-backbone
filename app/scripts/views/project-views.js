define(['app'], function(App) {

    'use strict';

    Handlebars.registerHelper('FormatAgaveDate', function(data /*, options*/) {

        var formattedDate = moment(data/*, 'YYYY-MM-DDTHH:mm:ssZ'*/).format('D-MMM-YYYY hh:mm');

        return formattedDate;
    });

    Handlebars.registerHelper('ManageUsersShouldDisableDelete', function(data, options) {

        if (data.username === Backbone.Agave.instance.token().get('username')) {
            return options.fn(data);
        }

        return options.inverse(data);
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
        }
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
        template: 'project/index',
        initialize: function() {
            $('html,body').animate({scrollTop:0});
        }
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

            /*
                This is a little tricky. If we're arriving from a page
                refresh, then we are stuck with two asynchronous fetches.
                If the file list loads faster than the project list, then
                we'll need to re-insert our subview and re-render the page
                once the project list data has been fetched.
            */
            if (App.Datastore.Collection.ProjectCollection.models.length === 0) {
                var that = this;
                App.Datastore.Collection.ProjectCollection.on('sync', function() {
                    that.projectModel = App.Datastore.Collection.ProjectCollection.get(parameters.projectUuid);
                    that.insertFileListingsView();
                    that.render();
                });
            }

            this.projectModel = App.Datastore.Collection.ProjectCollection.get(parameters.projectUuid);

            this.fileListings = new Backbone.Agave.Collection.FileMetadatas({projectUuid: parameters.projectUuid});
            this.fetchAndRenderFileListings();
        },
        fetchAndRenderFileListings: function() {

            // Get File Listings
            var loadingView = new App.Views.Util.Loading({keep: true});
            this.insertView('.file-listings', loadingView);
            loadingView.render();

            var that = this;
            this.fileListings.fetch({url:this.fileListings.url(this.fileCategory)})
                .done(function() {

                    loadingView.remove();

                    that.insertFileListingsView();
                    that.render();
                })
                .fail(function() {
                    console.log("file listings failure");
                });
        },
        insertFileListingsView: function() {

            var fileListingsView = new Projects.FileListings({fileListings: this.fileListings});
            // listen to events on fileListingsView
            this.fileListingsViewEvents(fileListingsView);
            this.insertView('.file-listings', fileListingsView);

        },
        serialize: function() {
            if (this.projectModel && this.fileListings) {
                return {
                    projectDetail: this.projectModel.toJSON(),
                    fileListings: this.fileListings.toJSON()
                };
            }
        },
        afterRender: function() {
            // UI
            $('.file-category').removeClass('active');
            $('#' + this.fileCategory).addClass('active');
        },
        events: {
            'click .delete-project': 'deleteProject',
            'click #file-upload': 'clickFilesSelectorWrapper',
            'change #file-dialog': 'changeFilesSelector',
            'click .file-category': 'changeFileCategory',
            'click .selected-files': 'uiDisableRunJob',
            'click .run-job': 'clickRunJob'
        },
        fileListingsViewEvents: function(fileListingsView) {

            var that = this;

            fileListingsView.on('fileDragDrop', function(files) {
                that.parseFiles(files);
            });
        },
        deleteProject: function(e) {
            e.preventDefault();

            this.projectModel.destroy()
                .done(function() {
                    App.router.navigate('/project', {
                        trigger: true
                    });
                })
                .fail(function() {
                    // Agave currently returns what backbone considers to be the 'wrong' http status code
                    App.router.navigate('/project', {
                        trigger: true
                    });
                });
        },
        clickFilesSelectorWrapper: function() {
            document.getElementById('file-dialog').click();
        },
        changeFilesSelector: function(e) {
            var files = e.target.files;
            this.parseFiles(files);
        },
        parseFiles: function(files) {

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

                var fileTransferView = new Projects.FileTransfer({model: stagedFile, projectUuid: this.projectModel.get('uuid')});
                this.insertView('#file-staging', fileTransferView);
                fileTransferView.render();

                // listen to events on fileTransferView
                this.fileTransferViewEvents(fileTransferView);
            }
        },
        fileTransferViewEvents: function(fileTransferView) {

            var that = this;

            fileTransferView.on('viewFinished', function(newFile) {

                $('#file-staging').fadeOut('5000', function() {
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
        uiDisableRunJob: function() {
            if ($('.selected-files:checked').length) {
                $('#run-job-button').removeClass('disabled');
            }
            else {
                $('#run-job-button').addClass('disabled');
            }
        },
        clickRunJob: function(e) {
            e.preventDefault();

            var jobType = e.target.dataset.jobtype;

            this.removeView('#job-submit');

            var selectedFileMetadataUuids = this.getSelectedFiles();

            var selectedFileListings = this.fileListings.clone();
            selectedFileListings.reset();

            for (var i = 0; i < selectedFileMetadataUuids.length; i++) {
                var model = this.fileListings.get(selectedFileMetadataUuids[i]);
                selectedFileListings.add(model);
            }

            var jobSubmitView = new App.Views.Jobs.Submit({
                selectedFileListings: selectedFileListings,
                jobType: jobType,
                projectModel: this.projectModel
            });

            this.insertView('#job-submit', jobSubmitView);
            jobSubmitView.render();
        },
        getSelectedFiles: function() {

            var selectedFileMetadataUuids = [];

            $('.selected-files:checked').each(function() {
                selectedFileMetadataUuids.push($(this).val());
            });

            return selectedFileMetadataUuids;
        }
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
        },
        serialize: function() {
            return this.model.toJSON();
        },
        events: {
            'click .cancel-upload': 'cancelUpload',
            'click .start-upload':  'startUpload'
        },
        cancelUpload: function() {
            this.remove();
        },
        startUpload: function() {

            var that = this;

            this.model.on('uploadProgress', function(percentCompleted) {
                that.uploadProgress(percentCompleted);
            });

            this.model.save()
                .done(function(response) {

                    // A quick hack until I figure out how to do this in my custom FileSync function
                    var parsedJSON = JSON.parse(response);
                    parsedJSON = parsedJSON.result;
                    that.model.set(parsedJSON);

                    that.fileUploadCompleted();
                })
                .fail(function() {
                    console.log("upload fail");
                });

        },
        uploadProgress: function(percentCompleted) {
            percentCompleted = percentCompleted.toFixed(2);
            percentCompleted += '%';

            $('.progress-bar').width(percentCompleted);
            $('.progress-bar').text(percentCompleted);
        },
        fileUploadCompleted: function() {

            // VDJAuth saves the day by fixing file pems
            this.model.syncFilePermissionsWithProjectPermissions()
                .done(function() {
                    console.log("filePems save done");
                })
                .fail(function() {
                    console.log("filePems save fail");
                });

            var associationId = this.model.getAssociationId();

            // Setup file metadata
            var fileMetadata = new Backbone.Agave.Model.FileMetadata();

            var initialMetadata = {
                associationIds: [ associationId ],
                value: {
                    projectUuid: this.projectUuid,
                    fileCategory: 'uploaded',
                    name: this.model.get('name'),
                    length: this.model.get('length'),
                    mimeType: this.model.get('mimeType')
                }
            };

            var that = this;
            fileMetadata.save(initialMetadata)
                .done(function() {

                    // VDJAuth saves the day by fixing metadata pems
                    fileMetadata.syncMetadataPermissionsWithProjectPermissions()
                        .done(function() {
                            console.log("metadata pems saved");
                        })
                        .fail(function() {

                            console.log("metadata pems fail");
                        });

                    $('.progress').removeClass('progress-striped active');
                    $('.progress-bar').addClass('progress-bar-success');

                    $('.start-upload').remove();
                    $('.cancel-upload').remove();

                    that.trigger('viewFinished', fileMetadata);

                })
                .fail(function() {
                    console.log("fileMetadata save fail");
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
                    console.log("user fetch fail");
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
                                console.log("added user pems success");
                            })
                            .fail(function() {
                                console.log("added user pems fail");
                            });

                        that.permissions.add(newUserPermission);
                        that.render();
                        that.usernameTypeahead(that.permissions, that.tenantUsers);
                    },
                    error: function() {
                        console.log("save error");
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
                            console.log('user destroy ok');
                            that.render();
                            that.usernameTypeahead(that.permissions, that.tenantUsers);
                        })
                        .fail(function() {
                            console.log('user destroy fail');
                        });
                })
                .fail(function() {
                    console.log("emergency remove");
                    userPermission.destroy()
                        .done(function() {
                            that.render();
                            that.usernameTypeahead(that.permissions, that.tenantUsers);
                        })
                        .fail(function() {
                            console.log('user destroy fail');
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
            'click #save-project-name': 'saveProjectName'
        },
        saveProjectName: function(e) {
            e.preventDefault();
            
            var newProjectName = $('#project-name').val();

            var value = this.model.get('value');
            value.name = newProjectName;

            this.model.set('value', value);

            this.model.save()
                .done(function() {
                    console.log("model updated");
                })
                .fail(function() {
                    console.log("model update fail");
                });
        },
    });

    App.Views.Projects = Projects;
    return Projects;
});
