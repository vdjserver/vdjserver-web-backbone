define(['app'], function(App) {

    'use strict';

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

            App.Datastore.Collection.ProjectCollection.fetch({
                success: function() {
                    App.Datastore.Collection.ProjectCollection.on('change add remove destroy', function() {

                        that.render();
                    });

                    that.render();
                },
                error: function() {

                }
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

                var username = App.Agave.token().get('username');
                formData.members = [];
                formData.members.push(username);

                this.setupModalView();
                var that = this;

                $('#modal-message').on('shown.bs.modal', function() {

                    that.model.save(
                        formData,
                        {
                            url: that.model.getCreateUrl(),
                            success: function(model) {

                                $('#modal-message').on('hidden.bs.modal', function() {
                                    App.Datastore.Collection.ProjectCollection.add(model, {merge: true});

                                    App.router.navigate('/project/' + model.get('uuid'), {
                                        trigger: true
                                    });
                                });

                                $('#modal-message').modal('hide');
                            },
                            error: function(/* model, xhr, options */) {
                                that.$el.find('.alert-danger').remove().end().prepend($('<div class="alert alert-danger">').text('There was a problem creating your project. Please try again.').fadeIn());
                                $('#modal-message').modal('hide');
                            }
                        }
                    );
                });

                $('#modal-message').modal('show');
            }

            return false;
        }
    });

    Projects.Detail = Backbone.View.extend({
        template: 'project/detail',
        initialize: function(parameters) {
            this.modelId = parameters.projectId;
            this.model = App.Datastore.Collection.ProjectCollection.get(this.modelId);
            console.log("model is: " + JSON.stringify(this.model));
        },
        serialize: function() {
            if (this.model) {
                return {
                    projectDetail: this.model.toJSON()
                };
            }
        },
        events: {
            'click .delete-project': 'deleteProject',
            'click #file-upload': 'fileUpload'
        },
        deleteProject: function(e) {
            e.preventDefault();

            this.model.destroy({

                success: function() {
                    App.router.navigate('/project', {
                        trigger: true
                    });
                },
                error: function() {
                    // Agave currently returns what backbone considers to be the 'wrong' http status code
                    App.router.navigate('/project', {
                        trigger: true
                    });
                }
            });
        }
    /*
    ,
        fileUpload: function(e) {
            e.preventDefault();

            var fileInput = document.getElementById('file-input');
            var file = fileInput.files[0];

            var reader = new FileReader();

            var that = this;

            reader.onload = function() {

                image.src = reader.result;

                // Remove other elements
                //$('#file-input').hide();
                //$('#file-input-button').hide();
            };

            reader.readAsDataURL(file);
        },
        */
    });

    Projects.ManageUsers = Backbone.View.extend({
        template: 'project/manage-users',
        initialize: function(parameters) {

            this.modelId = parameters.projectId;
            this.model = App.Datastore.Collection.ProjectCollection.get(this.modelId);

            var that = this;
            this.model.users.fetch({
                success: function() {

                    console.log('users are: ' + JSON.stringify(that.model.users.toJSON()));
                    that.render();
                },
                error: function() {
                    console.log("user fetch fail");
                }
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
            console.log("username is: " + username);

            // Check that username exists
            

            // Check that username isn't already on project


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
            user.destroy({
                success: function() {
                    console.log('user destroy ok');
                    that.render();
                },
                error: function() {
                    console.log("user destroy fail");
                }
            });
        }
    });

    App.Views.Projects = Projects;
    return Projects;
});
