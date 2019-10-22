import Marionette from 'backbone.marionette';
import template from '../../templates/public/home.html';
import Handlebars from 'handlebars';


export default Marionette.View.extend({
  template: Handlebars.compile(template),
  regions: {
    homeRegion: '#home',
    modalRegion: {
      el: '#modal',
      regionClass: ModalRegion
    }
  },

  initialize: function(parameters) {
    // we use a state variable to know what type of modal to display
    this.loginState = 'login';

    var view = new LoginView();
    this.showChildView('homeRegion', view);
  },
});
