const path = require('path');
const webpack = require('webpack');

module.exports = {
	target: 'web',
	mode: 'development',
	// entry: './app/scripts/entry.js',

	entry: {
		app: './app/scripts/app.js',
		public: './app/scripts/views/public-views.js'
	},

	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, './app/dist')
	},

	resolve: {
		modules: [
			"node_modules",
			path.resolve(__dirname, 'node_modules')
		],
		alias: {
			'handlebars': path.resolve(__dirname,'node_modules') + '/handlebars/dist/handlebars',
			'app': path.resolve(__dirname, 'app') + '/scripts/app.js'
		},
		extensions: ['.js']
	},

	plugins: [
		new webpack.ProvidePlugin({
			_: 'underscore'
		})
	],

	module: {
		rules: [
			{
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
			{
				test: /\.handlebars$/,
				exclude:/(node_modules)/,
				loader:"handlebars-loader"
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
