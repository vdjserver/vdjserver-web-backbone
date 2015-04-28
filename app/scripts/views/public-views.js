define([
    'app',
    'backbone.syphon',
], function(App) {

    'use strict';

    var Public = {};

    Public.Home = Backbone.View.extend({
        template: 'public/home',
        initialize: function() {

            //this.model.destroy();
            this.render;
        },
        serialize: function() {
            return {
                'username': this.model.get('username')
            };
        },
        afterRender: function() {
            this.setupModalView();
        },
        setupModalView: function() {

            var message = new App.Models.MessageModel({
                'header': 'Logging in',
                'body':   '<p>Please wait while we authenticate you...</p>'
            });

            var modal = new App.Views.Util.ModalMessageConfirm({
                model: message
            });

            $('<div id="modal-view">').appendTo(this.el);

            this.setView('#modal-view', modal);
            modal.render();

        },
        events: {
            'click #home-login': 'login'
        },
        login: function(e) {

            e.preventDefault();

            this.$el.find('.alert-danger').fadeOut(function() {
                this.remove();
            });

            var formData = {
                username: $('#username').val(),
                password: $('#password').val()
            };

            //var formData = Backbone.Syphon.serialize(this);

            this.setupModalView();

            var that = this;

            $('#modal-message')
                .modal('show')
                .on('shown.bs.modal', function() {

                    that.model
                        .save(formData, {password: formData.password})
                        .done(function() {
                            $('#modal-message')
                                .modal('hide')
                                .on('hidden.bs.modal', function() {

                                    App.router.navigate('/project', {
                                        trigger: true
                                    });

                                });
                        })
                        .fail(function(error) {
                            var telemetry = new Backbone.Agave.Model.Telemetry();
                            telemetry.set('error', JSON.stringify(error));
                            telemetry.set('method', 'App.Agave.token().save()');
                            telemetry.set('view', 'Public.Home');
                            telemetry.save();

                            if (error && error['status']) {

                                var httpCode = error['status'];

                                if (httpCode === 403) {
                                    App.router.navigate('/account/pending', {
                                        trigger: true
                                    });

                                    return;
                                }
                            }

                            App.Agave.token().clear();
                            $('#confirmation-button').removeClass('hidden');
                            $('.modal-body').html('');

                            $('.modal-body').prepend(
                                $('<div class="alert alert-danger">')
                                    .text('Authentication failed. Please check your username and password')
                                    .fadeIn()
                            );

                            $('#password').val('');
                        });
                });
            return false;
        },
    });

    App.Views.Public = Public;
    return Public;
});
