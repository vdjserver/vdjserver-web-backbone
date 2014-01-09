define(['app'], function(App) {

    'use strict';

    var Profile   = {};

    Profile.Login = Backbone.View.extend({
        template: 'profile/login',
        initialize: function() {
            window.scrollTo(0.0);
        }
    });

    Profile.Form = Backbone.View.extend({
        template: 'profile/profile-form',
        initialize: function() {

            $('html,body').animate({scrollTop:0});

            this.model = new Backbone.Agave.Model.Profile();

            var loadingView = new App.Views.Util.Loading({keep: true});
            this.insertView(loadingView);

            this.fetchComplete = false;

            var that = this;
            this.model.fetch({
                success: function() {

                    loadingView.remove();

                    that.fetchComplete = true;

                    that.render();
                },
                error: function() {
                    console.log('fetch error');
                    that.fetchComplete = true;
                    that.render();
                }
            });
        },
        serialize: function() {

            return {
                profileData: this.model.get('value'),
                fetchComplete: this.fetchComplete
            };
        },
        afterRender: function() {
            this.setupModalView();
        },
        setupModalView: function() {

            var message = new App.Models.MessageModel({
                'header': 'Updating Profile'
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

            if (formData.value.email) {

                var that = this;

                $('#modal-message').on('shown.bs.modal', function() {

                    that.model.save(
                        formData,
                        {
                            password: formData.password,
                            url: that.model.getSaveUrl(),
                            success: function() {

                                $('#modal-message').on('hidden.bs.modal', function() {
/*
                                    App.router.navigate('/', {
                                        trigger: true
                                    });
*/
                                });

                                $('#modal-message').modal('hide');
                            },
                            error: function() {

                                that.$el.find('.alert-danger').remove().end().prepend($('<div class="alert alert-danger">').text('Profile update failed. Please try again.').fadeIn());
                                $('#password').val('');
                                $('#modal-message').modal('hide');
                            }
                        }
                    );
                });

                $('#modal-message').modal('show');
            }
            else {
                console.log('ran into else...');
                this.$el.find('.alert-danger').remove().end().prepend($('<div class="alert alert-danger">').text('Profile update failed. Please try again.').fadeIn());
            }

            return false;
        }
    });


    App.Views.Profile = Profile;
    return Profile;
});
