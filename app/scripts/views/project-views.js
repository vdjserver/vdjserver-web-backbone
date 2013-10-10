define(['app'], function(App) {

    'use strict';

    var UtilViews = App.Views.Util;
    var Projects = {};

    Projects.Index = Backbone.View.extend({
        template: 'project/index',
        initialize: function() {

            window.scrollTo(0.0);

            /*
            if (App.Agave.token().isValid()) {
                new AgaveApps.AppForm({
                    model: this.model,
                    el: this.$el.find('.app-form')
                }).render();
                $(e.target).hide();
            } else {
                alert('You must be logged in to use applications.');
            }
            */

            var that = this;
            this.collection.on('reset', function() {
                var view = new App.Views.Projects.List({collection: that.collection});
                App.Layouts.main.setView('.sidebar', view);
                view.render();
            }, this);

            this.collection.fetch({reset:true});

        }
    /*
    ,
        serialize: function() {
            return {
                projects: this.collection.toJSON();
            }
        }
    */
    });

    Projects.List = Backbone.View.extend({
        template: 'project/list',
        initialize: function() {

            /*
            var that = this;
            this.collection.on('reset', function() {
                window.scrollTo(0.0);
                var view = new App.Views.Projects.Index({collection: that.collection});
                App.Layouts.main.setView('.content', view);
                view.render();
                this.render();
            }, this);

            this.collection.fetch({reset:true});
            */
        },
        serialize: function() {
            return {
                projects: this.collection.toJSON()
            };
        },
        events: {
            'click .view-project': 'viewProject'
        },
        viewProject: function(e) {
            e.preventDefault();
            var models = this.collection.where({id: e.target.dataset.id});
            if (models) {
                var view = new App.Views.Projects.Detail({model: models[0]});
                App.Layouts.main.setView('.content', view);
                view.render();
                App.router.navigate('#project/' + models[0].id);
                $('html,body').animate({scrollTop:view.$el.position().top - 100});
            }
            return false;
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

                console.log("formData is: " + JSON.stringify(formData));


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

                $('<div class="login-modal">').appendTo(this.el);
                modal.$el.on('shown', function() {
                    that.$el.find('.alert-error').remove();

                    that.model.save(
                        formData,
                        {
                            success: function() {
                                console.log('save success');
                                message.set('body', message.get('body') + '<p>Success!</p>');
                                modal.close();
                                App.router.navigate('/project', {
                                    trigger: true
                                });
                            },
                            //error: function(model, xhr, options) {
                            error: function() {
                                console.log('save error');
                                that.$el.prepend($('<div class="alert alert-error">').text('Authentication failed.  Please check your username and password.').fadeIn());
                                $('#password').val('');
                                modal.close();
                            }
                        }
                    );
                    console.log('after model save');
                });
                modal.$el.on('hidden', function() {
                    modal.remove();
                });
                this.setView('.login-modal', modal);
                modal.render();
            } else {
                this.$el.find('.alert-error').remove().end().prepend($('<div class="alert alert-error">').text('Username and Password are required.').fadeIn());
            }
            return false;

        }
    });

    Projects.Detail = Backbone.View.extend({
        template: 'project/detail',
        initialize: function() {
        }
    });

    App.Views.Projects = Projects;
    return Projects;
});
