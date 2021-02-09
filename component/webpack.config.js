//
// webpack.config.js
// Webpack configuration
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2020 The University of Texas Southwestern Medical Center
//
// Author: Olivia Dorsey <olivia.dorsey@utsouthwestern.edu>
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

//
// We have four configurations
// development mode or production mode
// main app or test app
//

module.exports = function(env, argv) {

    // default settings
    var settings = {
        target: 'web', //target: 'node',
        mode: 'development',
        entry: './app/scripts/entry.js',
        devtool: 'inline-source-map',

        output: {
            filename: 'main.js',
            path: path.resolve(__dirname, './app/dist')
        },

        resolve: {
            alias: {
                // directory aliases
                'Scripts': path.resolve(__dirname, 'app/scripts/'),
                'Templates': path.resolve(__dirname, 'app/templates/'),
                'Images': path.resolve(__dirname, 'app/images/'),

                // The main application
                //'app': path.resolve(__dirname, 'app') + '/scripts/app.js',
                // the global configuration
                //'environment-config': path.resolve(__dirname, 'app') + '/scripts/config/environment-config.js',

                // Third party Packages
                'backbone': 'backbone',
                'backbone.syphon': 'backbone.syphon',
                'backbone-retry-sync': path.resolve(__dirname, 'app') + '/scripts/backbone-retry-sync/backbone-retry-sync.js',
                'chance':           'chance',
                'datatables':       'datatables',
                'datatables-responsive': 'dataTables-responsive',
                'detect':           'detect.js',
                'filesize':         'filesize',
                'file-saver':       path.resolve(__dirname,'node_modules') + '/file-saver/FileSaver',
                'handlebars': path.resolve(__dirname,'node_modules') + '/handlebars/dist/handlebars',
                'highcharts':       'highstock-release/highstock',
                'highcharts-data':  'highstock-release/modules/data',
                'highcharts-drilldown': 'highstock-release/modules/drilldown',
                'highcharts-more':  'highstock-release/highcharts-more',
                'highcharts-exporting': 'highstock-release/modules/exporting',
                'highcharts-offline-exporting': 'highstock-release/modules/offline-exporting',
                'jquery':           'jquery',
                'jquery-ui':        'jquery-ui',
                'layoutmanager':    'layoutmanager',
                'moment':           'moment',
                'typeahead':        'typeahead.js',
                'underscore':       'underscore',
                'underscore.string': 'underscore.string',
                'd3':               'd3',
                'nvd3':             'nvd3',
                'socket-io':        'socket.io-client',
                'simple-statistics':'simple-statistics',
                'js-yaml': 'js-yaml',
                //'text':'requirejs-text/text',

                // Backbone Extensions
                //'backbone-agave':  path.resolve(__dirname,'app') + '/scripts/backbone/backbone-agave',

                // Bootstrap
                'bootstrap': 'bootstrap',
                'bootstrap-multiselect': path.resolve(__dirname,'node_modules') + '/bootstrap-multiselect/dist/js/bootstrap-multiselect',

                // Models/Collections
                //'agave-project': path.resolve(__dirname,'app') + '/scripts/models/agave-project',
                //'agave-projects': path.resolve(__dirname,'app') + '/scripts/collections/agave-projects',
                //'agave-public-projects': path.resolve(__dirname,'app') + '/scripts/collections/agave-public-projects',

                // Views and Controllers
                //'navbar-controller': path.resolve(__dirname,'app') + '/scripts/views/app/navbar-controller',
                //'project-controller': path.resolve(__dirname,'app') + '/scripts/views/project/project-controller',
                //'community-controller': path.resolve(__dirname,'app') + '/scripts/views/project/community-controller',
                //'create-controller': path.resolve(__dirname,'app') + '/scripts/views/project/create-controller',
                //'create-view': path.resolve(__dirname,'app') + '/scripts/views/project/create-view',

                //'createrep-controller': path.resolve(__dirname,'app') + '/scripts/views/project/create-repertoire',
                //'create-rep': path.resolve(__dirname,'app') + '/scripts/views/project/create-repertoire',

                //'repertoire-controller':
                //path.resolve(__dirname,'app') + '/scripts/views/project/repertoire-controller',
                //'rep-view': path.resolve(__dirname,'app') + '/scripts/views/project/rep-view',

                //'loading-view': path.resolve(__dirname,'app') + '/scripts/views/utilities/loading-view',

                //'error': path.resolve(__dirname,'app') + '/scripts/models/error',
                //'recaptcha': path.resolve(__dirname,'app') + '/scripts/models/recaptcha',
                //'airr-schema': path.resolve(__dirname,'app') + '/scripts/models/airr-schema',
                //'project-home': path.resolve(__dirname,'app') + '/scripts/views/project/project-home',
                //'project-list': path.resolve(__dirname,'app') + '/scripts/views/project/project-list',
                //'project-single': path.resolve(__dirname,'app') + '/scripts/views/project/project-single',
                //'files-view': path.resolve(__dirname,'app') + '/scripts/views/project/files-view',

                // Agave - Models/Collections
                //'message': path.resolve(__dirname,'app') + '/scripts/models/message',
                //'telemetry': path.resolve(__dirname,'app') + '/scripts/models/telemetry',

                //'agave-account': path.resolve(__dirname,'app') + '/scripts/models/agave-account',
                //'agave-feedback': path.resolve(__dirname,'app') + '/scripts/models/agave-feedback',

                //'agave-community-data': path.resolve(__dirname,'app') + '/scripts/models/agave-community-data',
                //'agave-community-datas': path.resolve(__dirname,'app') + '/scripts/collections/agave-community-datas',

                //'agave-notification': path.resolve(__dirname,'app') + '/scripts/models/agave-notification',
                //'agave-password-reset': path.resolve(__dirname,'app') + '/scripts/models/agave-password-reset',
                //'agave-password-change': path.resolve(__dirname,'app') + '/scripts/models/agave-password-change',
                //'agave-system': path.resolve(__dirname,'app') + '/scripts/models/agave-system',
                //'agave-systems': path.resolve(__dirname,'app') + '/scripts/collections/agave-systems',
                //'agave-tenant-user': path.resolve(__dirname,'app') + '/scripts/models/agave-tenant-user',
                //'agave-tenant-users': path.resolve(__dirname,'app') + '/scripts/collections/agave-tenant-users',

                //'agave-file': path.resolve(__dirname,'app') + '/scripts/models/agave-file',
                //'agave-files': path.resolve(__dirname,'app') + '/scripts/collections/agave-files',

                //'agave-job': path.resolve(__dirname,'app') + '/scripts/models/agave-job',
                //'agave-jobs': path.resolve(__dirname,'app') + '/scripts/collections/agave-jobs',

                // Agave - Metadata Models/Collections
                //'agave-permission':  path.resolve(__dirname,'app') + '/scripts/models/agave-permission',
                //'agave-permissions': path.resolve(__dirname,'app') + '/scripts/collections/agave-permissions',
                //'agave-profile': path.resolve(__dirname,'app') + '/scripts/models/agave-profile',
                //'agave-metadata': path.resolve(__dirname,'app') + '/scripts/models/agave-metadata',
                //'agave-metadata-collections': path.resolve(__dirname,'app') + '/scripts/collections/agave-metadata-collections',

                // Misc.
                //'box': path.resolve(__dirname,'app') + '/scripts/vendor/box',
                //'jquery.event.drag': path.resolve(__dirname,'app') + '/scripts/vendor/jquery.event.drag',
                //'jquery.event.drop': path.resolve(__dirname,'app') + '/scripts/vendor/jquery.event.drop',

                // Handlebars Helpers
                //'handlebars-utilities':   path.resolve(__dirname,'app') + '/scripts/views/utilities/handlebars-utilities',

                // Utilities
                //'websocket-manager': path.resolve(__dirname,'app') + '/scripts/utilities/websocket-manager',
                //'serialization-tools': path.resolve(__dirname,'app') + '/scripts/utilities/serialization-tools',
                //'vdjpipe-workflow-parser': path.resolve(__dirname,'app') + '/scripts/utilities/vdjpipe-workflow-parser',
                //'vdjpipe-view-factory': path.resolve(__dirname,'app') + '/scripts/utilities/vdjpipe-view-factory',
                //'presto-view-factory': path.resolve(__dirname,'app') + '/scripts/utilities/presto-view-factory',
                //'repcalc-view-factory': path.resolve(__dirname,'app') + '/scripts/utilities/repcalc-view-factory',

                // Generic Views
                //'generic-vdjpipe-option-views': path.resolve(__dirname,'app') + '/scripts/views/generic/generic-vdjpipe-option-views',

                // Mixins
                //'file-transfer-project-ui-mixin': path.resolve(__dirname,'app') + '/scripts/mixins/file-transfer-project-ui-mixin',
                //'comparators-mixin': path.resolve(__dirname,'app') + '/scripts/collections/mixins/comparators-mixin',
                //'file-transfer-mixins': path.resolve(__dirname,'app') + '/scripts/models/mixins/file-transfer-mixins',

                // View Helpers
                //'view-layouts': path.resolve(__dirname,'app') + '/scripts/views/layouts/view-layouts',

                // Views
                //'util-views': path.resolve(__dirname,'app') + '/scripts/views/app/util-views',
                //'not-found-views': path.resolve(__dirname,'app') + '/scripts/views/not-found-views',

                //'account-views': path.resolve(__dirname,'app') + '/scripts/views/account-views.js',
                //'forgot-password-views': path.resolve(__dirname,'app') + '/scripts/views/forgot-password-views',
                //'profile-views': path.resolve(__dirname,'app') + '/scripts/views/profile-views',
                //'job-views': path.resolve(__dirname,'app') + '/scripts/views/job-views',
                //'project-views': path.resolve(__dirname,'app') + '/scripts/views/project-views',
                //'sidemenu-views': path.resolve(__dirname,'app') + '/scripts/views/sidemenu-views',
                //'notification-views': path.resolve(__dirname,'app') + '/scripts/views/notification-views',
                //'navbar-views': path.resolve(__dirname,'app') + '/scripts/views/navbar-views',
                //'public-views': path.resolve(__dirname,'app') + '/scripts/views/app/public-views',
                //'analyses-views': path.resolve(__dirname,'app') + '/scripts/views/analyses-views',
                //'vdjpipe-views': path.resolve(__dirname,'app') + '/scripts/views/vdjpipe-views',
                //'presto-views': path.resolve(__dirname,'app') + '/scripts/views/presto-views',
                //'repcalc-views': path.resolve(__dirname,'app') + '/scripts/views/repcalc-views',
                //'feedback-views': path.resolve(__dirname,'app') + '/scripts/views/feedback-views',
                //'software-views': path.resolve(__dirname,'app') + '/scripts/views/software-views',
                //'community-views': path.resolve(__dirname,'app') + '/scripts/views/community-views',

                // Routers
                //'router': path.resolve(__dirname,'app') + '/scripts/routers/router',
                //'node_modules': path.join(__dirname,'node_modules')

                //'collections/notifications': path.resolve(__dirname,'app') + '/scripts/collections/notifications',
                //'models/notification': path.resolve(__dirname,'app') + '/scripts/models/notification',

                // AIRR Schema
                'airr-schema': path.resolve(__dirname,'airr-standards') + '/specs/airr-schema.yaml',
                'airr-repertoire-template': path.resolve(__dirname,'airr-standards') + '/lang/python/airr/specs/blank.airr.yaml'
            },
            extensions: ['.js'],
        },

        plugins: [
            new webpack.ProvidePlugin({
              $: 'jquery',
              'window.$': 'jquery',
              'window.jQuery': 'jquery',
              jQuery: 'jquery',
              jquery: 'jquery',
              _: 'underscore',
              Popper: ['popper.js', 'default']
            }),
            new MiniCssExtractPlugin({
              filename: 'main.css'
            })
        ],

        module: {
            rules: [
              // Agave
              {
                test: /backbone-agave/,
                use: [
                  'imports-loader?this=>window,backbone',
                  'expose-loader?Backbone.Agave'
                ]
              },

              {
                test: /\.(html)$/,
                use: {
                  loader: 'html-loader',
                  options: {
                    attrs: [':data-src']
                  }
                }
              },

              {
                test: /\.yaml$/,
                use: 'js-yaml-loader'
              },

              // CSS/SCSS and Fonts
              {
                 test: /\.scss$/,
                  use: [
                      MiniCssExtractPlugin.loader,
                      "css-loader",
                      "sass-loader",
                      {
                        loader: "sass-resources-loader",
                        options: {
                          resources: [path.resolve(__dirname, "./app/styles/main.scss")]
                        }
                      }
                  ]
              },
              {
                test: /\.css$/,
                use: [
                  { loader: "style-loader" },
                  { loader: "css-loader" }
                ]
              },
              {
                test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                  {
                    loader: 'file-loader',
                    options: {
                      name: '[name].[ext]',
                      outputPath: 'images/',
                      resources: [path.resolve(__dirname, "./app/images")]
                    }
                  }
                ]
              },
              {
                test: /\.(svg|woff|woff2|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                  {
                    loader: 'file-loader',
                    options: {
                      name: '[name].[ext]',
                      outputPath: 'fonts/'
                    }
                  }
                ]
              },

              {
              test: require.resolve('jquery'),
             use: [{
                  loader: 'expose-loader',
                  options: 'jQuery'
              },{
                  loader: 'expose-loader',
                  options: '$'
              }]
            },

                {
                    test: /integration-tests\.js$/,
                    use: 'mocha-loader',
                    exclude: /node_modules/,
                    include: [
                        path.resolve(__dirname, "test")
                    ]
                }
            ]
        },

        optimization: {
            splitChunks: {
              cacheGroups: {
                vendors: {
                  priority: -10,
                  test: '/[\\/]node_modules[\\/]/'
                }
              },

              chunks: 'async',
              minChunks: 1,
              minSize: 30000,
            name: true
            }
        },

        devServer: {
            // Display only errors to reduce the amount of output.
            //stats: "errors-only",
            contentBase: path.join(__dirname, 'app'),
            host: "0.0.0.0",
            port: 9001,
            // insure that URLs get routed to index.html to Backbone's router can handle them
            historyApiFallback: true,
            open: true,
            compress: true
        }
    };

    // override any default settings
    if (argv.mode == 'development') {
        // development mode
        if ((env) && (env.test)) {
            // test app
            console.log('Development Mode: integration test app');
            settings.entry = './test/integration.js';
        } else {
            // main app
            console.log('Development Mode: main app');
            settings.entry = './app/scripts/entry.js';
        }
    } else {
        if ((env) && (env.test)) {
            // test app
            console.log('Production Mode: integration test app');
        } else {
            // main app
            console.log('Production Mode: main app');
            settings.entry = './app/scripts/entry.js';
        }
    }

  return settings;
}
