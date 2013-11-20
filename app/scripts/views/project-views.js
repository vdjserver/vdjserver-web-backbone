define(['app'], function(App) {

    'use strict';

    var UtilViews = App.Views.Util;
    var Projects = {};

    var projectCollection;

    Projects.List = Backbone.View.extend({
        template: 'project/list',
        initialize: function() {

            projectCollection = new Backbone.Agave.Collection.Projects();

            var that = this;

            projectCollection.fetch({
                success: function() {
                    projectCollection.on('change add remove destroy', function() {
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
                projects: projectCollection.toJSON()
            };
        },
        events: {
            'click .view-project': 'selectProject'
        },
        selectProject: function(e) {
            e.preventDefault();
            var projectId = e.target.dataset.id;

            App.router.navigate('/project/' + projectId , {
                trigger: true
            });
        }
    });

    Projects.Index = Backbone.View.extend({
        template: 'project/index',
        initialize: function() {
            window.scrollTo(0.0);
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
        },
        setupModalView: function() {

            var message = new App.Models.MessageModel({
                'header': 'Creating Project',
                'body':   '<p>Please wait while your project is created.</p>'
            });

            var modal = new UtilViews.ModalMessage({
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

            if (formData.value.name) {

                var username = App.Agave.token().get('username');
                formData.members = [];
                formData.members.push(username);


                var that = this;

                $('#modal-message').on('shown.bs.modal', function() {

                    that.model.save(
                        formData,
                        {
                            url: that.model.getCreateUrl(),
                            success: function(model) {

                                $('#modal-message').on('hidden.bs.modal', function() {
                                    projectCollection.add(model, {merge: true});

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
            else {
                this.$el.find('.alert-danger').remove().end().prepend($('<div class="alert alert-danger">').text('There was a problem creating your project. Please try again.').fadeIn());
            }

            return false;
        }
    });

    Projects.Detail = Backbone.View.extend({
        template: 'project/detail',
        initialize: function(parameters) {
            this.modelId = parameters.projectId;
            this.model = projectCollection.get(this.modelId);
        },
        serialize: function() {
            if (this.model) {
                return {
                    projectDetail: this.model.toJSON()
                };
            }
        },
        events: {
            'click .delete-project': 'deleteProject'
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
    });

    App.Views.Projects = Projects;
    return Projects;
});
