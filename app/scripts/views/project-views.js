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
            this.modelId = parameters.projectId;
            this.model = App.Datastore.Collection.ProjectCollection.get(this.modelId);

            // Set VDJAuth Permissions
            this.model.users.create(this.model.users.getVDJAuthPermissions());

            // File Animation Mutex
            this.firstFileHasBeenAdded = false;
        },
        serialize: function() {
            if (this.model) {
                return {
                    projectDetail: this.model.toJSON()
                };
            }
        },
        afterRender: function() {
            console.log("calling afterRender");
/*
            // File Drop
            var dropZone = document.getElementById('file-drop');
            dropZone.addEventListener('dragover', this.fileDrag, false);
            dropZone.addEventListener('drop', this.fileDrop, false);
*/
            this.setupFlow();
        },
        events: {
            'click .delete-project': 'deleteProject'
        },
        deleteProject: function(e) {
            e.preventDefault();

            this.model.destroy()
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
        setupFlow: function() {

            this.flow = new Flow({
                target: 'http://localhost:8443'
            });
            this.flow.assignBrowse(document.getElementById('file-drop'));
            this.flow.assignDrop(document.getElementById('file-drop'));

            if (! this.firstFileHasBeenAdded) {
            
                var that = this;
                this.flow.on('fileAdded', function(file, event) {

                    $('#drag-and-drop-box').animate(
                        {width: '50%'},
                        2000,
                        function() {

                            $('#drag-and-drop-box').toggleClass('col-md-12 col-md-6');
                            $('#file-staging').addClass('col-md-6');

                            that.addStagedFileView(file);
                        }
                    );
                    console.log("file id is: " + file.uniqueIdentifier);
                    console.log("file is: " + file.name);
                    console.log("file size is: " + file.size);
                });
            }
            /*
            this.flow.on('fileSuccess', this.flowSuccess);
            this.flow.on('fileError',   this.flowError);
            this.flow.on('progress', function(progress) {
                console.log("flow progress is: " + progress);
            });
            */
        },
        addStagedFileView: function(file) {

            var stagedFile = new Backbone.Agave.Model.ProjectFile({
                name: file.name,
                length: file.size
            });

            var fileTransferView = new Projects.FileTransfer({model: stagedFile});
            this.insertView('#file-staging', fileTransferView);
            fileTransferView.render();
        }
        /*
        fileDrag: function(e) {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
        },
        fileDrop: function(e) {
            e.stopPropagation();
            e.preventDefault();
            console.log("fileDrop ok!");
        }
        */
    });

    Projects.FileTransfer = Backbone.View.extend({
        template: 'project/file-transfer',
        initialize: function(parameters) {

        },
        serialize: function() {
            return this.model.toJSON()
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
                        console.log("save success");
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
            console.log("username is: " + username);

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
