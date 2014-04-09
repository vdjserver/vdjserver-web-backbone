define(['app'], function(App) {

    'use strict';

    Handlebars.registerHelper('FormatAgaveDate', function(data, options) {

        var formattedDate = moment(data/*, 'YYYY-MM-DDTHH:mm:ssZ'*/).format('D-MMM-YYYY hh:mm');

        return formattedDate;
    });

    Handlebars.registerHelper('ManageUsersShouldDisableDelete', function(data, options) {

        if (data.username === 'vdj' || data.isOwner) {
            return options.fn(data);
        }

        return options.inverse(data);
    });

    var Projects = {};

    Projects.Login = Backbone.View.extend({
        template: 'project/login',
        initialize: function() {
            $('html,body').animate({scrollTop:0});
        }
    });

    Projects.List = Backbone.View.extend({
        template: 'project/list',
        initialize: function() {

            App.Datastore.Collection.ProjectCollection = new Backbone.Agave.Collection.Projects();

            var that = this;

            App.Datastore.Collection.ProjectCollection.fetch()
                .done(function() {

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
        events: {
            'click .view-project': 'selectProject',
            'click .manage-users': 'manageUsers'
        },
        selectProject: function(e) {
            e.preventDefault();
            var projectUuid = e.target.dataset.id;

            this.setProjectActive(projectUuid);
            this.openProjectSubmenu(projectUuid);

            App.router.navigate('/project/' + projectUuid , {
                trigger: false
            });

            var detailView = new Projects.Detail({projectUuid: projectUuid});
            App.Layouts.main.setView('.content', detailView);
            detailView.render();

        },
        manageUsers: function(e) {
            e.preventDefault();

            var projectUuid = e.target.dataset.id;

            App.router.navigate('/project/' + projectUuid + '/users', {
                trigger: false
            });

            var manageUsersView = new Projects.ManageUsers({projectUuid: projectUuid});
            App.Layouts.main.setView('.content', manageUsersView);
            manageUsersView.render();
        },
        setProjectActive: function(projectUuid) {
            $('.list-group-item').removeClass('active');
            $('#' + projectUuid).addClass('active');
        },
        openProjectSubmenu: function(projectUuid) {
            $('.project-submenu').addClass('hidden');
            $('#' + projectUuid + '-submenu').removeClass('hidden');
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
        highlightList: function() {
            $('.list-group-item').removeClass('active');
            $('.create-project').addClass('active');
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

                                        App.router.navigate('/project/' + that.model.get('uuid'), {
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

            this.projectModel = App.Datastore.Collection.ProjectCollection.get(parameters.projectUuid);

            this.fileListings = new Backbone.Agave.Collection.FileMetadatas({projectUuid: parameters.projectUuid});
            this.fetchAndRenderFileListings();
        },
        fetchAndRenderFileListings: function() {

            // Get File Listings
            this.loadingView = new App.Views.Util.Loading({keep: true});
            this.insertView('.file-listings', this.loadingView);
            this.render();

            console.log("url check is: " + this.fileListings.url(this.fileCategory));

            var that = this;
            this.fileListings.fetch({url:this.fileListings.url(this.fileCategory)})
                .done(function() {

                    var fileListingsView = new Projects.FileListings({fileListings: that.fileListings});

                    // listen to events on fileListingsView
                    that.fileListingsViewEvents(fileListingsView);

                    that.insertView('.file-listings', fileListingsView);
                    that.loadingView.remove();

                    that.render();
                })
                .fail(function() {
                    console.log("file listings failure");
                });
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
            'click .file-category': 'changeFileCategory'
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
        clickFilesSelectorWrapper: function(e) {
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
            console.log("model is: " + JSON.stringify(this.model));
            return this.model.toJSON()
        },
        events: {
            'click .cancel-upload': 'cancelUpload',
            'click .start-upload':  'startUpload'
        },
        cancelUpload: function(e) {
            this.remove();
        },
        startUpload: function(e) {

            var that = this;

            this.model.on('uploadProgress', function(percentCompleted) {
                that.uploadProgress(percentCompleted);
            });

            /*
            this.model.on('uploadComplete', function() {
                that.fileUploadCompleted();
            });
            */

            this.model.save()
                .done(function(response) {

                    // A quick hack until I figure out how to do this in my custom FileSync function
                    var parsedJSON = JSON.parse(response);
                    parsedJSON = parsedJSON['result'];
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
                    console.log("fileMetadata initial save ok");

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
                    that.render();

                    that.tenantUsers = new Backbone.Agave.Collection.TenantUsers();
                    that.tenantUsers.fetch()
                        .done(function() {
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
            /*
            userPermission.destroy()
                .done(function() {

                    userPermission.removeUserFromProject()
                        .then(function() {
                            console.log("added user pems success");
                        })
                        .fail(function() {
                            console.log("added user pems fail");
                        });

                    console.log('user destroy ok');
                    that.render();
                    that.usernameTypeahead(that.permissions, that.tenantUsers);
                })
                .fail(function() {
                    console.log("user destroy fail");
                });
            */

            // Try to let VDJAuth handle this
            // Only go to Agave if there's a problem
            userPermission.removeUserFromProject()
                .then(function() {
                    console.log("initial remove user pems success");
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

    App.Views.Projects = Projects;
    return Projects;
});
