// Custom jQuery
import './_custom.js';


// SASS/CSS
import '../styles/main.scss'

// Images
import logo from '../images/logo.png';

// Main JS
//import 'top-level';

import { Agave } from 'backbone-agave';
import Application from 'app';

// need this here so that it extends jQuery
import bootstrap from 'bootstrap';

document.addEventListener('DOMContentLoaded', () => {
  // the Agave object, attached to the global Backbone object
  //Backbone.Agave = Agave;
  // the global application object
  global.App = new Application();
  // start the application
  App.start();
});
