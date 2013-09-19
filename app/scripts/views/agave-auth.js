define(['app'], function(App) {

    'use strict';

    var AgaveAuth = {}, UtilViews = App.Views.Util;

    AgaveAuth.NewTokenForm = Backbone.View.extend({
        template: 'auth/new-token-form',
        serialize: function() {
            return {
                'internalUsername': this.model.get('internalUsername')
            };
        },
        events: {
            'submit form': 'submitForm'
        },
        submitForm: function(e) {

            e.preventDefault();

            var formData = Backbone.Syphon.serialize(this);

            if (formData.internalUsername && formData.password) {

                var message = new App.Models.MessageModel({
                    'header': 'Getting token',
                    'body':   '<p>Please wait while we authenticate you...</p>'
                });

                var modal = new UtilViews.ModalMessage({
                    model:    message,
                    backdrop: 'static',
                    keyboard: false
                });

                var that = this;

                console.log('about to do model save append');

                $('<div class="login-modal">').appendTo(this.el);
                modal.$el.on('shown', function() {
                    that.$el.find('.alert-error').remove();
                    console.log('saving model from view. internalUsername is: ' + formData.internalUsername);
                    console.log('formdata is: ' + JSON.stringify(formData));
                    console.log('also, model is: ' + JSON.stringify(that.model));

                    that.model.save(
                        formData,
                        {
                            password: formData.password,
                            success: function() {
                                console.log('save success');
                                Backbone.Vdj.password = formData.password;
                                message.set('body', message.get('body') + '<p>Success!</p>');
                                modal.close();
                                App.router.navigate('auth/active', {
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

    AgaveAuth.TokenView = Backbone.View.extend({
        template: 'auth/token',
        className: function() {
            var clazz = 'token';
            if (this.model.id === App.Agave.token().id) {
                clazz += ' token-current';
            }
            return clazz;
        },
        initialize: function() {
            this.model.on('change', this.render, this);
        },
        serialize: function() {
            var json = this.model.toJSON();
            console.log('authtokenView json is: ' + json);
            json.created_date = moment.unix(json.created).format('YYYY-MM-DD HH:mm');
            json.expires_date = moment.unix(json.expires).format('YYYY-MM-DD HH:mm');
            json.canDelete = this.model.id !== App.Agave.token().id;
            return json;
        },
        events: {
            'click .btn-renew':    'renewToken',
            'click .btn-validate': 'validateToken',
            'click .btn-delete':   'deleteToken'
        },
        renewToken: function() {
            var modalWrap = new UtilViews.ModalView({
                model: new App.Models.MessageModel({
                    header: 'Renew Token'
                })
            }),
                renewView = new AgaveAuth.RenewTokenForm({
                    model: this.model
                });
            renewView.cleanup = function() {
                modalWrap.close();
            };
            modalWrap.setView('.child-view', renewView);
            modalWrap.$el.on('hidden', function() {
                modalWrap.remove();
            });
            modalWrap.render();
            return false;
        },
        validateToken: function(e) {
            var btn = $(e.currentTarget);
            this.model.fetch({
                silent: true,
                success: function() {
                    btn.popover({
                        content:   'This token is <span class="label label-success">Valid</span>.',
                        html:      true,
                        placement: 'top',
                        trigger:   'manual'
                    }).popover('show');
                    setTimeout(function() {
                        btn.popover('destroy');
                    }, 2000);
                },
                error: function() {
                    alert('Ohnoes!');
                }
            });
        },
        deleteToken: function() {
            this.model.destroy();
            this.remove();
        }
    });

    AgaveAuth.RenewTokenForm = Backbone.View.extend({
        template: 'auth/renew-token-form',
        events: {
            'submit .renew-form': 'renewToken',
            'click .btn-cancel':  'dismiss'
        },
        renewToken: function() {
            var password = this.$el.find('#password').val(),
                that = this;
            this.$el.find('alert-error').remove();
            that.model.save({}, {
                password: password,
                success: function() {
                    that.model.set({
                        expires: moment().add('hours', 2).unix()
                    });
                    that.remove();
                },
                error: function() {
                    that.$el.prepend('<div class="alert alert-error">Unable to renew token.  Please check your password and try again.</div>');
                    that.$el.find('#password').val('');
                }
            });
            return false;
        },
        dismiss: function() {
            this.remove();
            return false;
        }
    });

    AgaveAuth.ActiveTokens = Backbone.View.extend({
        template: 'auth/active-tokens',
        initialize: function() {

            console.log('init ok');
            var view = new AgaveAuth.TokenView({model: this.model});
            this.insertView('.tokens', view);
            view.render();

            console.log('after view render');
        },
        afterRender: function() {
            if (!this.model.isValid()) {
                this.$el.find('.tokens').html(
                    $('<p class="alert alert-warning">').html('<i class="icon-warning-sign"></i> You have no active tokens.')
                );
            }
        }
    /*
            ,
        events: {
            'click .btn-new-token': 'getNewToken'
        },
        getNewToken: function(e) {
            if (App.Agave.token().isValid()) {
                App.router.navigate('auth/new', {
                    trigger: true
                });
            } else {
                App.router.navigate('auth/login', {
                    trigger: true
                });
            }
        }
        */
    });

    App.Views.AgaveAuth = AgaveAuth;
    return AgaveAuth;
});
