define(['app'], function(App) {

    'use strict';

    var UtilViews = App.Views.Util;
    var Projects = {};

    var projectCollection;

    Projects.Index = Backbone.View.extend({
        template: 'project/index',
        initialize: function() {

            window.scrollTo(0.0);

            var that = this;
            //this.collection.on('set', function() {
            //}, this);

            this.collection.fetch({success: function(collection) {

                projectCollection = collection;

                var view = new App.Views.Projects.List({collection: projectCollection});
                App.Layouts.main.setView('.sidebar', view);
                view.render();
            }});

        }
    });

    Projects.List = Backbone.View.extend({
        template: 'project/list',
        initialize: function() {

            var that = this;
            projectCollection.on('change add remove destroy', function() {

                console.log("collection change re-render for list");
                that.render;
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

            //$('.view-project[data-id=' + projectId + ']').addClass('selected-project');
            //console.log("selectProject - new id is: " + projectId);

            App.router.navigate('/project/' + projectId , {
                trigger: true
            });

            /*
            $('.view-project').removeClass('selected-project');
            $('#' + projectId).addClass('selected-project');
            */
        }
    });

    Projects.Create = Backbone.View.extend({
        template: 'project/create',
        initialize: function() {

        },
        events: {
            'click .create-project': 'createProject'
        },
        createProject: function(e) {

            e.preventDefault();

            var formData = Backbone.Syphon.serialize(this);

            if (formData.name) {

                var internalUsername = App.Agave.token().get('internalUsername');
                formData.members = [];
                formData.members.push(internalUsername);

                var message = new App.Models.MessageModel({
                    'header': 'Creating Project',
                    'body':   '<p>Please wait while we create your project...</p>'
                });

                var modal = new UtilViews.ModalMessage({
                    model:    message,
                    backdrop: 'static',
                    keyboard: false
                });

                var that = this;

                $('<div class="create-project-modal">').appendTo(this.el);
                modal.$el.on('shown', function() {
                    that.$el.find('.alert-error').remove();

                    that.model.save(
                        formData,
                        {
                            success: function(model) {
                                message.set('body', message.get('body') + '<p>Success!</p>');
                                modal.close();

                                projectCollection.add(model, {merge: true});
                                App.router.navigate('/project/' + model.get('_id'), {
                                    trigger: true
                                });
                            },
                            //error: function(model, xhr, options) {
                            error: function() {
                                console.log('project save error');
                                that.$el.prepend($('<div class="alert alert-error">').text('There was a problem saving your project. Please try again.').fadeIn());
                                modal.close();
                            }
                        }
                    );
                });
                modal.$el.on('hidden', function() {
                    modal.remove();
                });
                this.setView('.create-project-modal', modal);
                modal.render();
            } else {
                this.$el.find('.alert-error').remove().end().prepend($('<div class="alert alert-error">').text('There was a problem saving your project. Please try saving it again.').fadeIn());
            }
            return false;

        }
    });

    Projects.Detail = Backbone.View.extend({
        template: 'project/detail',
        initialize: function() {

            var that = this;
            this.model.fetch({success: function(model) {
                //App.Views.Projects.List.collection.add(model);
                projectCollection.add(that.model, {merge: true});
                console.log("collection is: " + JSON.stringify(projectCollection));
                that.render();
            }});

        },
        events: {
            'click .delete-project': 'deleteProject'
        },
        deleteProject: function(e) {
            e.preventDefault();

            console.log("about to destroy model. hold on!");
            projectCollection.add(this.model, {merge: true});
            console.log("pre delete collection check: " + JSON.stringify(projectCollection.toJSON()));
            
            this.model.trigger('destroy', this.model);

            console.log("post delete collection check: " + JSON.stringify(projectCollection.toJSON()));
            /*
            this.model.destroy({success: function() {

                console.log("model destroyed. proj col is: " + JSON.stringify(projectCollection.toJSON()));
                /*
                App.router.navigate('/project', {
                    trigger: true
                });
                */
           // }});
            
        }
    });

    App.Views.Projects = Projects;
    return Projects;
});
