
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

console.log("Production Mode");

module.exports = {
	target: 'web',
	mode: 'production',
  devtool: 'inline-source-map',

	entry: './app/scripts/entry.js',

	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, './app/dist')
	},
};

// Minify CSS
