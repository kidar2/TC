const path = require('path');

module.exports = {
	entry: path.join(__dirname, '/src/index.ts'),
	mode: 'development',
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [
			{
				test: /\.ts?$/,
				loader: 'ts-loader',
				exclude: /node_modules/,
			},
		]
	},
	resolve: {
		extensions: [".ts"]
	},
	plugins: []
};