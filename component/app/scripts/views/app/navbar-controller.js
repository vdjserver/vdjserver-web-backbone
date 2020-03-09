import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';

import public_template from '../../../templates/app/navbar-public.html';
import private_template from '../../../templates/app/navbar-private.html';

// This is the navigation bar displayed to the public
var PublicNavBar = Marionette.View.extend({
  template: Handlebars.compile(public_template)
});

// This is the navigation bar displayed after the user logs in
var PrivateNavBar = Marionette.View.extend({
  template: Handlebars.compile(private_template)
});

// Navigation bar controller
//
// This manages the navigation bar with public options
// and after the user logs in
export default Marionette.View.extend({
  template: Handlebars.compile('<div id="navbar">'),

  // one region for the navigation bar
  regions: {
    navigationRegion: '#navbar'
  },

  initialize(options) {
    console.log('Initialize');
  },

  showPublicNavigation() {
    this.showChildView('navigationRegion', new PublicNavBar());
  },

  showPrivateNavigation() {
    this.showChildView('navigationRegion', new PrivateNavBar());
  },
});
