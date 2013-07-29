define(['app'], function(App){
  var NewTokenFormView = Backbone.View.extend({
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
      var internalUsername = this.$el.find('#internalUsername').val(),
        password = this.$el.find('#password').val();
      if (internalUsername && password) {
        var message = new Util.Message({
          'header': 'Getting token',
          'body': '<p>Please wait while we authenticate you...</p>'
        }),
          modal = new Util.Views.ModalMessage({
            model: message,
            backdrop: 'static',
            keyboard: false
          }),
          that = this;
        $('<div class="login-modal">').appendTo(this.el);
        modal.$el.on('shown', function() {
          that.$el.find('.alert-error').remove();
          that.model.save({
            internalUsername: internalUsername,
            expires: null,
            token: null
          }, {
            password: password,
            success: function() {
              message.set('body', message.get('body') + '<p>Success!</p>');
              modal.close();
              app.router.navigate('auth/active', {
                trigger: true
              });
            },
            error: function() {
              that.$el.prepend($('<div class="alert alert-error">').text('Authentication failed.  Please check your username and password.').fadeIn());
              $('#password').val('');
              modal.close();
            }
          });
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

  App.Views.NewTokenFormView = NewTokenFormView;
  return NewTokenFormView;
});
