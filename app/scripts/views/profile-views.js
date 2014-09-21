define(['app', 'backbone.syphon'], function(App) {

    'use strict';

    var Profile = {};

    Profile.Main = Backbone.View.extend({
        template: 'profile/profile-main',
        subView: 'Form',
        initialize: function(opts) {
            this.subView = opts && opts.subView || 'Form';
        },
        beforeRender: function() {
            var subView = new Profile[this.subView]();
            this.setView('.subview', subView);
        },
        serialize: function() {
            return {
                profileView: this.subView === 'Form',
                changePasswordView: this.subView === 'ChangePasswordForm'
            };
        }
    });

    Profile.Form = Backbone.View.extend({
        template: 'profile/profile-form',
        initialize: function() {

            $('html,body').animate({
                scrollTop: 0
            });

            this.model = new Backbone.Agave.Model.Profile();

            this.loadingView = new App.Views.Util.Loading({
                keep: true
            });
            this.insertView(this.loadingView);

            this.fetchComplete = false;

            var that = this;
            this.model.fetch()
                .done(function() {
                    that.setupViews();
                })
                .fail(function() {
                    that.setupViews();
                });
        },
        setupViews: function() {
            this.fetchComplete = true;
            this.loadingView.remove();
            this.render();
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

                this.setupModalView();
                var that = this;

                $('#modal-message')
                    .modal('show')
                    .on('shown.bs.modal', function() {

                        that.model
                            .save(formData, {
                                url: that.model.getSaveUrl()
                            })
                            .done(function() {
                                $('#modal-message').modal('hide');
                            })
                            .fail(function() {
                                that.$el.find('.alert-danger')
                                    .remove()
                                    .end()
                                    .prepend(
                                        $('<div class="alert alert-danger">')
                                            .text('Profile update failed. Please try again.')
                                            .fadeIn()
                                    );
                                $('#modal-message').modal('hide');
                            });
                    });
            } else {
                this.$el.find('.alert-danger')
                    .remove()
                    .end()
                    .prepend(
                        $('<div class="alert alert-danger">')
                            .text('Profile update failed. Please try again.')
                            .fadeIn()
                    );
            }

            return false;
        }
    });

    Profile.ChangePasswordForm = Backbone.View.extend({
        template: 'profile/change-password-form',

        initialize: function() {
            this.model = new Backbone.Agave.Model.PasswordChange();
            this.listenTo(this.model, 'change', this.render);
        },

        events: {
            'submit form': 'submitForm'
        },

        serialize: function() {
            return {
                alerts: this.model.get('alerts')
            };
        },

        afterRender: function() {
            this.model.unset('alerts', {silent: true});
            this.setupModalView();
        },

        setupModalView: function() {

            var message = new App.Models.MessageModel({
                'header': 'Submitting password change',
                'body': '<p>Please wait while we validate your password change...</p>'
            });

            var modal = new App.Views.Util.ModalMessage({
                model: message
            });

            $('<div id="modal-view">').appendTo(this.el);

            this.setView('#modal-view', modal);
            modal.render();
        },

        validateForm: function(formData) {
            this.model.set(formData, {
                silent: true
            });
            this.model.isValid();
            var errors = this.model.validationError;
            return errors;
        },

        submitForm: function(e) {
            e.preventDefault();

            this.$el.find('.alert-danger').fadeOut(function() {
                this.remove();
            });

            var formData = Backbone.Syphon.serialize(this);
            formData.username = Backbone.Agave.instance.token().get('username');

            var formErrors = this.validateForm(formData);
            this.displayFormErrors(formErrors);

            if (!_.isArray(formErrors)) {

                // Reset modal view - otherwise it inadvertently gets duplicated
                this.setupModalView();
                var that = this;

                $('#modal-message')
                    .modal('show')
                    .on('shown.bs.modal', function() {
                        that.model.callSave()
                            .done(function() {
                                $('#modal-message')
                                    .modal('hide')
                                    .on('hidden.bs.modal', function() {

                                        // password changed
                                        that.model.clear({silent: true});

                                        // let rerender happen
                                        that.model.set({
                                            alerts: [{
                                                type: 'success',
                                                message: '<i class="fa fa-thumbs-up"></i> Your password has been successfully changed!'
                                            }]
                                        });
                                    });
                            })
                            .fail(function() {
                                $('#modal-message').modal('hide').on('hidden.bs.modal', function() {
                                    that.$el.find('.alerts').append(
                                        $('<div class="alert alert-danger">').text('Password change failed! Please try again.').fadeIn()
                                    );
                                });
                            });
                    });
            }
        },

        displayFormErrors: function(formErrors) {

            // Clear out old errors
            //this.$el.find('.alert-danger').fadeOut(function() {
            $('.alert-danger').fadeOut(function() {
                this.remove();
            });

            $('.form-group').removeClass('has-error');

            // Display any new errors
            if (_.isArray(formErrors)) {

                for (var i = 0; i < formErrors.length; i++) {
                    var message = formErrors[i].message;
                    var type = formErrors[i].type;

                    this.$el.find('.alerts').append($('<div class="alert alert-danger">').text(message).fadeIn());
                    $('#' + type + '-container').addClass('has-error');
                }
            }
        }
    });

    App.Views.Profile = Profile;
    return Profile;
});
