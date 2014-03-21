define(['app'], function(App) {

    'use strict';

    Handlebars.registerHelper('FormatAgaveDate', function(data, options) {

        var formattedDate = moment(data/*, 'YYYY-MM-DDTHH:mm:ssZ'*/).format('D-MMM-YYYY hh:mm');

        return formattedDate;
    });

    Handlebars.registerHelper('ManageUsersShouldDisableDelete', function(data, options) {

        if (data.username === 'VDJAuth' || data.isOwner) {
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
            var projectId = e.target.dataset.id;

            this.setProjectActive(projectId);
            this.openProjectSubmenu(projectId);

            App.router.navigate('/project/' + projectId , {
                trigger: false
            });

            var detailView = new Projects.Detail({projectId: projectId});
            App.Layouts.main.setView('.content', detailView);
            detailView.render();

        },
        manageUsers: function(e) {
            e.preventDefault();

            var projectId = e.target.dataset.id;

            App.router.navigate('/project/' + projectId + '/users', {
                trigger: false
            });

            var manageUsersView = new Projects.ManageUsers({projectId: projectId});
            App.Layouts.main.setView('.content', manageUsersView);
            manageUsersView.render();
        },
        setProjectActive: function(projectId) {
            $('.list-group-item').removeClass('active');
            $('#' + projectId).addClass('active');
        },
        openProjectSubmenu: function(projectId) {
            $('.project-submenu').addClass('hidden');
            $('#' + projectId + '-submenu').removeClass('hidden');
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
            this.model.unset('uuid');
        },
        afterRender: function() {
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
                            .save(formData, {url: that.model.getCreateUrl()})
                            .done(function() {

                                // Set VDJAuth Permissions - no need to verify for success because this is self-healing
                                var vdjAuthPermissions = that.model.users.create(that.model.users.getVDJAuthPermissions());

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

            this.projectModel = App.Datastore.Collection.ProjectCollection.get(parameters.projectId);

            // Set VDJAuth Permissions
            this.projectModel.users.create(this.projectModel.users.getVDJAuthPermissions());

            this.fileListings = new Backbone.Agave.Collection.Files();
            this.fetchAndRenderFileListings();
        },
        fetchAndRenderFileListings: function() {

            // Get File Listings
            this.loadingView = new App.Views.Util.Loading({keep: true});
            this.insertView('.file-listings', this.loadingView);
            this.render();

            var that = this;
            this.fileListings.fetch()
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
        fileListingsViewEvents: function(fileListingsView) {

            var that = this;

            fileListingsView.on('fileDragDrop', function(files) {
                that.parseFiles(files);
            });
        },
        events: {
            'click .delete-project': 'deleteProject',
            'click #file-upload': 'clickFilesSelectorWrapper',
            'change #file-dialog': 'changeFilesSelector'
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
        clickFilesSelectorWrapper: function(e) {
            document.getElementById('file-dialog').click();
        },
        changeFilesSelector: function(e) {
            var files = e.target.files;
            this.parseFiles(files);
        },
        parseFiles: function(files) {


            for (var i = 0; i < files.length; i++) {
                var file = files[i];

                var stagedFile = new Backbone.Agave.Model.File({
                    name: file.name,
                    length: file.size,
                    mimeType: file.type,
                    lastModified: file.lastModifiedDate,
                    fileReference: file
                });

                var fileTransferView = new Projects.FileTransfer({model: stagedFile});
                this.insertView('#file-staging', fileTransferView);
                fileTransferView.render();

                // listen to events on fileTransferView
                this.fileTransferViewEvents(fileTransferView);
            };
        },
        fileTransferViewEvents: function(fileTransferView) {

            var that = this;

            fileTransferView.on('viewFinished', function(newFile) {

                $('#file-staging').fadeOut('5000', function() {
                    fileTransferView.remove();

                    newFile.set({path: '/' + newFile.name});
                    that.fileListings.add(newFile);

                    var fileListingsView = that.getView('.file-listings');
                    fileListingsView.fileListings = that.fileListings;
                    fileListingsView.render();
                });

            });
        }
    });

    Projects.FileListings = Backbone.View.extend({
        template: 'project/file-listings',
        initialize: function(parameters) {


            // File Animation Mutex
            this.firstFileHasBeenAdded = false;
        },
        serialize: function() {
            return {
                fileListings: this.fileListings.toJSON()
            };
        },
        events: {
            'click #drag-and-drop-box': 'clickFilesSelectorWrapper'
            //,
            //'change #files-selector': 'changeFilesSelector'
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

        /*
        ,
        addStagedFileView: function(stagedFile) {

            var fileTransferView = new Projects.FileTransfer({model: stagedFile});

            if (! this.firstFileHasBeenAdded) {
                this.firstFileHasBeenAdded = true;

                var that = this;
                $('#drag-and-drop-box').animate(
                    {width: '50%'},
                    2000,
                    function() {

                        $('#drag-and-drop-box').toggleClass('col-md-12 col-md-6');
                        $('#file-staging').addClass('col-md-6');

                        that.insertView('#file-staging', fileTransferView);
                        fileTransferView.render();
                    }
                );
            }
            else {

                this.insertView('#file-staging', fileTransferView);
                fileTransferView.render();
            }
        }
        */
    });

    Projects.FileTransfer = Backbone.View.extend({
        template: 'project/file-transfer',
        serialize: function() {
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

            this.model.on('uploadComplete', function() {
                that.saveCompleted();
            });

            this.model.save();
        },
        uploadProgress: function(percentCompleted) {
            percentCompleted = percentCompleted.toFixed(2);
            percentCompleted += '%';

            $('.progress-bar').width(percentCompleted);
            $('.progress-bar').text(percentCompleted);
        },
        saveCompleted: function() {
            $('.progress').removeClass('progress-striped active');
            $('.progress-bar').addClass('progress-bar-success');

            $('.start-upload').remove();
            $('.cancel-upload').remove();

            this.trigger('viewFinished', this.model);
        }
    });

    Projects.ManageUsers = Backbone.View.extend({
        template: 'project/manage-users',
        initialize: function(parameters) {

            this.modelId = parameters.projectId;
            this.model = App.Datastore.Collection.ProjectCollection.get(this.modelId);

            var that = this;
            this.model.users.fetch()
                .done(function() {
                    that.render();

                    that.vdjUsers = new Backbone.Agave.Collection.Users();
                    that.vdjUsers.fetch()
                        .done(function() {
                            that.usernameTypeahead(that.model.users, that.vdjUsers);
                        });
                })
                .fail(function() {
                    console.log("user fetch fail");
                });
        },
        usernameTypeahead: function(projectUsers, vdjUsers) {

            // Prune users that shouldn't be in typeahead.
            var vdjUsernames = vdjUsers.pluck('username');
            var projectUsernames = projectUsers.pluck('username');

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
                users: this.model.users.toJSON()
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
            var newUser = this.model.users.create(
                {
                    username: username,
                    uuid: this.model.get('uuid')
                },
                {
                    success: function() {
                        that.model.users.add(newUser);
                        that.render();
                        that.usernameTypeahead(that.model.users, that.vdjUsers);
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

            var user = this.model.users.findWhere({username: username});

            var that = this;
            user.destroy()
                .done(function() {
                    console.log('user destroy ok');
                    that.render();
                    that.usernameTypeahead(that.model.users, that.vdjUsers);
                })
                .fail(function() {
                    console.log("user destroy fail");
                });
        }
    });

    App.Views.Projects = Projects;
    return Projects;
});
