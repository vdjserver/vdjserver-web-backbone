// Include for jquery to work: https://github.com/webpack/webpack/issues/4258
import $ from 'jquery';
window.jQuery = $;
window.$ = $;

//import 'handlebars';
//import 'backbone';
//import './backbone/backbone-agave';
//require('layoutmanager');
//console.log(Backbone);
//console.log(Backbone.Agave);

// Main JS
//import './requirejs-main.js'
import 'top-level';
//import { App } from './app.js';
//import { Public } from "./views/public-views.js";
//App.Views.Public = Public;
//console.log(App);
//App.start();

// SASS/CSS
import '../styles/main.scss'

// // node_modules
// require('animate.css/animate.min.css');
// // require('backbone');
// require('backbone.analytics');
// require('backbone.syphon');
// //require('bootstrap-multiselect/dist/js/bootstrap-multiselect');
// require('bootstrap-sass');
// require('chai');
// require('chance');
// require('connect-livereload');
// require('connect-modrewrite');
// require('datatables');
// require('datatables-responsive');
// require('datatables.net-bs');
// require('datatables.net-responsive');
// require('datatables.net-responsive-bs');
// require('datatables.net-scroller');
// require('datatables.net-scroller-bs/css/scroller.bootstrap.css');
// require('datatables.net-select');
// require('detect.js');
// require('file-saver');
// require('filesize');
// require('font-awesome/css/font-awesome.css');
// // require('grunt');
// // require('grunt-bower-requirejs');
// // require('grunt-contrib-clean');
// // require('grunt-contrib-coffee');
// // require('grunt-contrib-concat');
// // require('grunt-contrib-connect');
// // require('grunt-contrib-copy');
// // require('grunt-contrib-cssmin');
// // require('grunt-contrib-handlebars');
// // require('grunt-contrib-htmlmin');
// // require('grunt-contrib-imagemin');
// // require('grunt-contrib-jshint');
// // require('grunt-contrib-sass');
// // require('grunt-contrib-uglify');
// // require('grunt-contrib-watch');
// // require('grunt-jscs');
// // require('grunt-mocha');
// // require('grunt-open');
// // require('grunt-requirejs');
// // require('grunt-usemin');
// require('handlebars');
// // require('handlebars-loader');
// require('highstock-release/highstock.js');
// require('jquery');
// require('jquery-ui');
// require('js-yaml');
// require('jshint-stylish');
// require('layoutmanager');
// // require('load-grunt-tasks');
// require('moment');
// require('nvd3');
// require('simple-statistics');
// require('sinon');
// require('socket.io-client');
// // require('time-grunt');
// require('typeahead.js');
// require('underscore');
// require('underscore.string');
//
//
//
//
//
// // import "animate.css";
// // import "backbone";
// // import "backbone.analytics";
// // import "backbone.syphon";
// // import "bootstrap-multiselect";
// // import 'bootstrap/dist/css/bootstrap.min.css';
// // import "chai";
// // import "chance";
// // import "connect-livereload";
// // import "connect-modrewrite";
//
//
//
// console.log("Hello World from your main file!");
