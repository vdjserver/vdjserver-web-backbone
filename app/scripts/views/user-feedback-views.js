define(['app', 'backbone.syphon'], function(App) {

    'use strict';

    var UserFeedback = {};

    UserFeedback.Main = Backbone.View.extend({
        template: 'user-feedback/user-feedback-main',
        subView: 'Form',
        initialize: function(opts) {
            this.subView = opts && opts.subView || 'Form';
        },
        beforeRender: function() {
            var subView = new UserFeedback[this.subView]();
            this.setView('.subview', subView);
        },
        serialize: function() {
            return {
                userFeedbackView: this.subView === 'Form',
            };
        }
    });

    UserFeedback.Form = Backbone.View.extend({
        template: 'user-feedback/user-feedback-form',
        initialize: function() {

            $('html,body').animate({
                scrollTop: 0
            });

            this.model = new Backbone.Agave.Model.UserFeedback();

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
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.set('error', JSON.stringify(error));
                    telemetry.set('method', 'Backbone.Agave.Model.UserFeedback().fetch()');
                    telemetry.set('view', 'UserFeedback.Form');
                    telemetry.save();

                    that.setupViews();
                })
                ;
        },
        setupViews: function() {
            this.fetchComplete = true;
            this.loadingView.remove();
            this.render();
        },
        serialize: function() {
            return {
                userFeedbackData: this.model.get('value'),
                fetchComplete: this.fetchComplete
            };
        },
        afterRender: function() {
            this.setupModalView();
        },
        setupModalView: function() {

            var message = new App.Models.MessageModel({
                'header': 'Sending User Feedback'
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

            if (formData.value.feedback) {

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
                            .fail(function(error) {

                                var telemetry = new Backbone.Agave.Model.Telemetry();
                                telemetry.set('error', JSON.stringify(error));
                                telemetry.set('method', 'Backbone.Agave.Model.UserFeedback().save()');
                                telemetry.set('view', 'UserFeedback.Form');
                                telemetry.save();

                                that.$el.find('.alert-danger')
                                    .remove()
                                    .end()
                                    .prepend(
                                        $('<div class="alert alert-danger">')
                                            .text('Sending feedback failed. Please try again.')
                                            .fadeIn()
                                    );
                                $('#modal-message').modal('hide');
                            });
                    });
            }
            else {
                this.$el.find('.alert-danger')
                    .remove()
                    .end()
                    .prepend(
                        $('<div class="alert alert-danger">')
                            .text('Sending feedback failed. Please try again.')
                            .fadeIn()
                    );
            }

            return false;
        }
    });

    App.Views.UserFeedback = UserFeedback;
    return UserFeedback;
});
