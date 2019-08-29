const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	target: 'web', //target: 'node',
	mode: 'development',
	entry: './app/scripts/entry.js',
	// entry: {
	// 	app: './app/scripts/app.js',
	// 	public: './app/scripts/views/public-views.js'
	// },

  devtool: 'inline-source-map',

	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, './app/dist')
	},

	// resolveLoader: {
	//     modules: ['node_modules'],
	//     extensions: ['.js', '.json'],
	//     mainFields: ['loader', 'main']
	//   },
	resolve: {
			alias: {
				// File
				'app': path.resolve(__dirname, 'app') + '/scripts/app.js',
				'top-level': './requirejs-main.js',

				// Packages from RequireJS
				'backbone': 'backbone',
				'backbone.syphon': 'backbone.syphon',
				'backbone-retry-sync': path.resolve(__dirname, 'app') + '/scripts/backbone-retry-sync/backbone-retry-sync.js',
				'bootstrap': 'bootstrap-sass',
				'bootstrap-multiselect': path.resolve(__dirname,'node_modules') + '/bootstrap-multiselect/dist/js/bootstrap-multiselect',
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
        'backbone-agave':  path.resolve(__dirname,'app') + '/scripts/backbone/backbone-agave',
				'error': path.resolve(__dirname,'app') + '/scripts/models/error',
				'recaptcha': path.resolve(__dirname,'app') + '/scripts/models/recaptcha',
        'airr-schema': path.resolve(__dirname,'app') + '/scripts/models/airr-schema',

        // Agave - Models/Collections
        'telemetry': path.resolve(__dirname,'app') + '/scripts/models/telemetry',

        'agave-account': path.resolve(__dirname,'app') + '/scripts/models/agave-account',
        'agave-feedback': path.resolve(__dirname,'app') + '/scripts/models/agave-feedback',

        'agave-community-data': path.resolve(__dirname,'app') + '/scripts/models/agave-community-data',
        'agave-community-datas': path.resolve(__dirname,'app') + '/scripts/collections/agave-community-datas',

				'agave-notification': path.resolve(__dirname,'app') + '/scripts/models/agave-notification',
        'agave-password-reset': path.resolve(__dirname,'app') + '/scripts/models/agave-password-reset',
        'agave-password-change': path.resolve(__dirname,'app') + '/scripts/models/agave-password-change',
        'agave-system': path.resolve(__dirname,'app') + '/scripts/models/agave-system',
        'agave-systems': path.resolve(__dirname,'app') + '/scripts/collections/agave-systems',
        'agave-tenant-user': path.resolve(__dirname,'app') + '/scripts/models/agave-tenant-user',
        'agave-tenant-users': path.resolve(__dirname,'app') + '/scripts/collections/agave-tenant-users',

        'agave-file': path.resolve(__dirname,'app') + '/scripts/models/agave-file',
        'agave-files': path.resolve(__dirname,'app') + '/scripts/collections/agave-files',

				'agave-job': path.resolve(__dirname,'app') + '/scripts/models/agave-job',
        'agave-jobs': path.resolve(__dirname,'app') + '/scripts/collections/agave-jobs',

        // Agave - Metadata Models/Collections
        'agave-permission':  path.resolve(__dirname,'app') + '/scripts/models/agave-permission',
        'agave-permissions': path.resolve(__dirname,'app') + '/scripts/collections/agave-permissions',
        'agave-project': path.resolve(__dirname,'app') + '/scripts/models/agave-project',
        'agave-projects': path.resolve(__dirname,'app') + '/scripts/collections/agave-projects',
        'agave-profile': path.resolve(__dirname,'app') + '/scripts/models/agave-profile',
        'agave-metadata': path.resolve(__dirname,'app') + '/scripts/models/agave-metadata',
        'agave-metadata-collections': path.resolve(__dirname,'app') + '/scripts/collections/agave-metadata-collections',

				// Misc.
        'box': path.resolve(__dirname,'app') + '/scripts/vendor/box',
        'jquery.event.drag': path.resolve(__dirname,'app') + '/scripts/vendor/jquery.event.drag',
        'jquery.event.drop': path.resolve(__dirname,'app') + '/scripts/vendor/jquery.event.drop',

        // Handlebars Helpers
        'handlebars-utilities':   path.resolve(__dirname,'app') + '/scripts/views/utilities/handlebars-utilities',

        // Utilities
        'websocket-manager': path.resolve(__dirname,'app') + '/scripts/utilities/websocket-manager',
        'serialization-tools': path.resolve(__dirname,'app') + '/scripts/utilities/serialization-tools',
        'vdjpipe-workflow-parser': path.resolve(__dirname,'app') + '/scripts/utilities/vdjpipe-workflow-parser',
        'vdjpipe-view-factory': path.resolve(__dirname,'app') + '/scripts/utilities/vdjpipe-view-factory',
        'presto-view-factory': path.resolve(__dirname,'app') + '/scripts/utilities/presto-view-factory',
        'repcalc-view-factory': path.resolve(__dirname,'app') + '/scripts/utilities/repcalc-view-factory',

        // Generic Views
        'generic-vdjpipe-option-views': path.resolve(__dirname,'app') + '/scripts/views/generic/generic-vdjpipe-option-views',

				// Mixins
        'file-transfer-project-ui-mixin': path.resolve(__dirname,'app') + '/scripts/mixins/file-transfer-project-ui-mixin',
        'comparators-mixin': path.resolve(__dirname,'app') + '/scripts/collections/mixins/comparators-mixin',
        'file-transfer-mixins': path.resolve(__dirname,'app') + '/scripts/models/mixins/file-transfer-mixins',

        // View Helpers
        'view-layouts': path.resolve(__dirname,'app') + '/scripts/views/layouts/view-layouts',

        // Views
        'util-views': path.resolve(__dirname,'app') + '/scripts/views/app/util-views',
        'not-found-views': path.resolve(__dirname,'app') + '/scripts/views/not-found-views',

        'account-views': path.resolve(__dirname,'app') + '/scripts/views/account-views.js',
        'forgot-password-views': path.resolve(__dirname,'app') + '/scripts/views/forgot-password-views',
        'profile-views': path.resolve(__dirname,'app') + '/scripts/views/profile-views',
        'job-views': path.resolve(__dirname,'app') + '/scripts/views/job-views',
        'project-views': path.resolve(__dirname,'app') + '/scripts/views/project-views',
        'sidemenu-views': path.resolve(__dirname,'app') + '/scripts/views/sidemenu-views',
        'notification-views': path.resolve(__dirname,'app') + '/scripts/views/notification-views',
        'navbar-views': path.resolve(__dirname,'app') + '/scripts/views/navbar-views',
        'public-views': path.resolve(__dirname,'app') + '/scripts/views/public-views',
        'analyses-views': path.resolve(__dirname,'app') + '/scripts/views/analyses-views',
        'vdjpipe-views': path.resolve(__dirname,'app') + '/scripts/views/vdjpipe-views',
        'presto-views': path.resolve(__dirname,'app') + '/scripts/views/presto-views',
        'repcalc-views': path.resolve(__dirname,'app') + '/scripts/views/repcalc-views',
        'feedback-views': path.resolve(__dirname,'app') + '/scripts/views/feedback-views',
        'software-views': path.resolve(__dirname,'app') + '/scripts/views/software-views',
        'community-views': path.resolve(__dirname,'app') + '/scripts/views/community-views',

        // Routers
        'router': path.resolve(__dirname,'app') + '/scripts/routers/router',
				//'node_modules': path.join(__dirname,'node_modules')

				'collections/notifications': path.resolve(__dirname,'app') + '/scripts/collections/notifications',
				'models/message': path.resolve(__dirname,'app') + '/scripts/models/message',
				'models/notification': path.resolve(__dirname,'app') + '/scripts/models/notification',
				'config/airr-schema.yaml.html': path.resolve(__dirname,'app') + '/scripts/config/airr-schema.yaml.html'
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
			_: 'underscore'
		}),
		new MiniCssExtractPlugin({
			filename: 'main.css'
		})
	],

	module: {
		rules: [
/*			{
				test: /.(js|jsx)$/,
				include: [path.resolve(__dirname, 'app')],
				loader: 'babel-loader',
				exclude:/(node_modules)/,

				options: {
					plugins: ['syntax-dynamic-import'],

					presets: [
						[
							'@babel/preset-env',
							{
								modules: false
							}
						]
					]
				}
			},
*/
			// Shim
/*
			{
				test: /bootstrap/,
				use: [
					'imports-loader?this=>window,jquery'
				]
			},
			{
				test: /bootstrap-multiselect/,
				use: [
					'imports-loader?this=>window,bootstrap'
				]
			},
			{
				test: /jquery.event.drag/,
				use: [
					'imports-loader?this=>window,jquery'
				]
			},
			{
				test: /jquery.event.drop/,
				use: [
					'imports-loader?this=>window,jquery'
				]
			},
			{
				test: /\.(hbs|handlebars)$/,
				exclude:/(node_modules)/,
				loader:"handlebars-loader"
			},
			{
				test: /highcharts/,
				use: [
					'imports-loader?this=>window,jquery',
					'expose-loader?Highcharts'
				]
			},
			{
				test: /highcharts-data/,
				use: [
					'imports-loader?this=>window,highcharts'
				]
			},
			{
				test: /highcharts-drilldown/,
				use: [
					'imports-loader?this=>window,highcharts'
				]
			},
			{
				test: /highcharts-more/,
				use: [
					'imports-loader?this=>window,highcharts'
				]
			},
			{
				test: /highcharts-exporting/,
				use: [
					'imports-loader?this=>window,highcharts'
				]
			},
			{
				test: /highcharts-offline-exporting/,
				use: [
					'imports-loader?this=>window,highcharts-exporting'
				]
			},
			{
				test: /layoutmanager/,
				use: [
					'imports-loader?this=>window,backbone',
					'expose-loader?layoutmanager'
				]
			},
			{
				test: /box/,
				use: [
					'imports-loader?this=>window,d3',
					'expose-loader?box'
				]
			},
			{
				test: /nvd3/,
				use: [
					'imports-loader?this=>window,d3',
					'expose-loader?nv'
				]
			},
			{
				test: /typeahead/,
				use: [
					'imports-loader?this=>window,jquery'
				]
			},
*/
			// Agave
			{
				test: /backbone-agave/,
				use: [
					'imports-loader?this=>window,backbone',
					'expose-loader?Backbone.Agave'
				]
			},
/*
			// Agave - Models
			{
				test: /telemetry/,
				use: [
					'imports-loader?this=>window,backbone,backbone-agave',
					'expose-loader?Backbone.Agave.Model.Telemetry'
				]
			},
			{
				test: /agave-account/,
				use: [
					'imports-loader?this=>window,backbone,backbone-agave',
					'expose-loader?Backbone.Agave.Model.Account'
				]
			},
			{
				test: /agave-community-data/,
				use: [
					'imports-loader?this=>window,backbone,backbone-agave',
					'expose-loader?Backbone.Agave.Model.CommunityData'
				]
			},
			{
				test: /agave-community-datas/,
				use: [
					'imports-loader?this=>window,backbone,backbone-agave,agave-community-data',
					'expose-loader?Backbone.Agave.Collection.CommunityDatas'
				]
			},
			{
				test: /agave-notification/,
				use: [
					'imports-loader?this=>window,backbone,backbone-agave',
					'expose-loader?Backbone.Agave.Model.Notification'
				]
			},
			{
				test: /agave-password-reset/,
				use: [
					'imports-loader?this=>window,backbone,backbone-agave',
					'expose-loader?Backbone.Agave.Model.PasswordReset'
				]
			},
			{
				test: /agave-password-change/,
				use: [
					'imports-loader?this=>window,backbone,backbone-agave',
					'expose-loader?Backbone.Agave.Model.PasswordChange	'
				]
			},
			{
				test: /agave-tenant-user/,
				use: [
					'imports-loader?this=>window,backbone,backbone-agave',
					'expose-loader?Backbone.Agave.Model.TenantUser'
				]
			},
			{
				test: /agave-tenant-users/,
				use: [
					'imports-loader?this=>window,backbone,backbone-agave,agave-tenant-user',
					'expose-loader?Backbone.Agave.Model.TenantUsers'
				]
			},
			{
				test: /agave-feedback/,
				use: [
					'imports-loader?this=>window,backbone,backbone-agave',
					'expose-loader?Backbone.Agave.Model.FeedbackModel'
				]
			},
			{
				test: /agave-file/,
				use: [
					'imports-loader?this=>window,backbone,backbone-agave',
					'expose-loader?Backbone.Agave.Model.File'
				]
			},
			{
				test: /agave-files/,
				use: [
					'imports-loader?this=>window,backbone,backbone-agave,agave-file',
					'expose-loader?Backbone.Agave.Collection.Files'
				]
			},
			{
				test: /agave-job/,
				use: [
					'imports-loader?this=>window,backbone,backbone-agave',
					'expose-loader?Backbone.Agave.Model.Job'
				]
			},
			{
				test: /agave-jobs/,
				use: [
					'imports-loader?this=>window,backbone,backbone-agave,agave-job',
					'expose-loader?Backbone.Agave.Collection.Jobs'
				]
			},
			{
				test: /agave-system/,
				use: [
					'imports-loader?this=>window,backbone,backbone-agave',
					'expose-loader?Backbone.Agave.Model.System'
				]
			},
			{
				test: /agave-systems/,
				use: [
					'imports-loader?this=>window,backbone,backbone-agave,agave-system',
					'expose-loader?Backbone.Agave.Collection.Systems'
				]
			},
			{
				test: /agave-profile/,
				use: [
					'imports-loader?this=>window,backbone,backbone-agave',
					'expose-loader?Backbone.Agave.Model.Profile'
				]
			},

			// Projects
			{
				test: /agave-permission/,
				use: [
					'imports-loader?this=>window,backbone,backbone-agave',
					'expose-loader?Backbone.Agave.Model.ProjectUser'
				]
			},
			{
				test: /agave-permissions/,
				use: [
					'imports-loader?this=>window,backbone,backbone-agave,agave-permission',
					'expose-loader?Backbone.Agave.Collection.ProjectUsers'
				]
			},
			{
				test: /agave-project/,
				use: [
					'imports-loader?this=>window,backbone,backbone-agave,agave-permissions',
					'expose-loader?Backbone.Agave.Model.Project'
				]
			},
			{
				test: /agave-projects/,
				use: [
					'imports-loader?this=>window,backbone,backbone-agave,agave-project',
					'expose-loader?Backbone.Agave.Collection.Projects'
				]
			},

			// Metadata Entry
			{
				test: /agave-metadata/,
				use: [
					'imports-loader?this=>window,backbone,backbone-agave',
					'expose-loader?Backbone.Agave.ModelMetadata'
				]
			},
			{
				test: /agave-metadata-collections/,
				use: [
					'imports-loader?this=>window,backbone,backbone-agave,agave-metadata',
					'expose-loader?Backbone.Agave.Collection.Metadata'
				]
			},
			{
				test: /agave-analyses/,
				use: [
					'imports-loader?this=>window,backbone,backbone-agave,agave-project',
					'expose-loader?Backbone.Agave.Collection.Analyses'
				]
			}, */

			// CSS/SCSS and Fonts
      {
         test: /\.scss$/,
          use: [
              MiniCssExtractPlugin.loader,
							"css-loader",
							"sass-loader",
							// "sass-loader?outputStyle=expanded&includePaths[]=" + path.resolve(__dirname, "./node_modules/compass-mixins/lib"),
							{
								loader: "sass-resources-loader",
								options: {
									// resources: [path.resolve(__dirname, "./node_modules/bootstrap-sass/assets/stylesheets/bootstrap/mixins/_mixins.scss")]
									// resources: [path.resolve(__dirname, "./node_modules/compass-mixins/lib/compass/_compass.scss")]

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
				test: /.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
        use: "url-loader?limit=100000"
			}
			// {
			// 	test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+?.*$|$)/,
			// 	use: [
			// 		{
			// 		loader: 'file-loader',
			// 		options: {
			// 			name: '[name].[ext]',
			// 			outputPath: 'fonts/'
			// 		}
			// 		// options: {url: false}
			// 	}]
			// //	use: 'file-loader?name=fonts/[name].[ext]!static'
			// }

			{
			test: require.resolve('jquery'),
	    use: [{
	        loader: 'expose-loader',
	        options: 'jQuery'
	    },{
	        loader: 'expose-loader',
	        options: '$'
	    }]
		}
		]
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				vendors: {
					priority: -10,
					test: /[\\/]node_modules[\\/]/
				}
			},

			chunks: 'async',
			minChunks: 1,
			minSize: 30000,
			name: true
		}
	},

	devServer: {
		open: true
	}
};

/*
 * SplitChunksPlugin is enabled by default and replaced
 * deprecated CommonsChunkPlugin. It automatically identifies modules which
 * should be splitted of chunk by heuristics using module duplication count and
 * module category (i. e. node_modules). And splits the chunks…
 *
 * It is safe to remove "splitChunks" from the generated configuration
 * and was added as an educational example.
 *
 * https://webpack.js.org/plugins/split-chunks-plugin/
 *
 */

//const HtmlWebpackPlugin = require('html-webpack-plugin');

/*
 * We've enabled HtmlWebpackPlugin for you! This generates a html
 * page for you when you compile webpack, which will make you start
 * developing and prototyping faster.
 *
 * https://github.com/jantimon/html-webpack-plugin
 *
 */

	//plugins: [new webpack.ProgressPlugin(), new HtmlWebpackPlugin()],
