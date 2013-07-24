define(['app'], function(App){
  var Util = {};

  Util.Message = Backbone.View.extend({
    template: 'util/message',
    serialize: function() {
      return this.model.toJSON();
    }
  });

  Util.Loading = Backbone.View.extend({
    template: 'util/loading',
    initialize: function() {
      if (! this.model) {
        this.model = new App.Models.MessageModel({body: 'Loading...'});
      }
    },
    serialize: function() {
      return this.model.toJSON();
    }
  });

  Util.Alert = Backbone.View.extend({
    template: 'util/alert',
    attributes: function() {
      var that = this;
      return {
        'class': function() {
          return 'alert alert-' + that.options.type;
        }
      };
    },
    serialize: function() {
      return this.model.toJSON();
    }
  });

  Util.ModalMessage = Backbone.View.extend({
    template: 'util/modal-message',
    attributes: {
      'class': 'modal hide fade',
      'role': 'dialog',
      'tabindex': '-1'
    },
    initialize: function() {
      this.model.on('change', this.render, this);
    },
    serialize: function() {
      return this.model.toJSON();
    },
    afterRender: function() {
      this.$el.modal(this.options);
    },
    show: function() {
      this.$el.modal('show');
      return this;
    },
    close: function() {
      this.$el.modal('hide');
      return this;
    }
  });

  Util.ModalView = Backbone.View.extend({
    template: 'util/modal-view',
    attributes: {
      'class': 'modal hide fade',
      'role': 'dialog',
      'tabindex': '-1'
    },
    serialize: function() {
      return this.model.toJSON();
    },
    afterRender: function() {
      this.$el.modal(this.options);
    },
    show: function() {
      this.$el.modal('show');
      return this;
    },
    close: function() {
      this.$el.modal('hide');
      return this;
    }
  });

  App.Views.Util = Util;
  return Util;
});
