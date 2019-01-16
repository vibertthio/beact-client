const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = [
  // {
  //   test: /\.css$/,
  //   use: [
  //     { loader: 'style-loader' },
  //     {
  //       loader: 'css-loader?url=false',
  //       options: {
  //         module: true,
  //         localIdentName: '[name]__[local]--[hash:base64:5]',
  //       },
  //     },
  //   ],
  //   exclude: ['node_modules']
	// },
	{
		test: /\.css$/,
		use: ExtractTextPlugin.extract({
			fallback: 'style-loader',
			use: [
				{
					loader: 'css-loader',
					query: {
						modules: true,
						sourceMap: true,
						localIdentName: '[name]__[local]___[hash:base64:5]',
					},
				},
				'postcss-loader',
			],
		}),
		exclude: ['node_modules'],
	},
	{
		test: /\.scss$/,
		exclude: /node_modules/,
		use: ExtractTextPlugin.extract({
			fallback: 'style-loader',
			use: [
				{
					loader: 'css-loader',
					query: {
						modules: true,
						sourceMap: true,
						importLoaders: 2,
						localIdentName: '[name]__[local]___[hash:base64:5]',
					},
				},
				'postcss-loader',
				'sass-loader',
			],
		}),
	},
  {
    test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
    exclude: /(node_modules|bower_components)/,
    loader: "file-loader"
  },
  {
    test: /\.(woff|woff2)$/,
    exclude: /(node_modules|bower_components)/,
    loader: "url-loader?prefix=font/&limit=5000&name=assets/fonts/[hash].[ext]"
  },
  {
    test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
    exclude: /(node_modules|bower_components)/,
    loader: "url-loader?limit=10000&mimetype=application/octet-stream&name=assets/fonts/[hash].[ext]"
  },
  {
    test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
    exclude: /(node_modules|bower_components)/,
    loader: "url-loader?limit=10000&mimetype=image/svg+xml"
  },
  {
    test: /\.gif/,
    exclude: /(node_modules|bower_components)/,
    loader: "url-loader?limit=10000&mimetype=image/gif&name=assets/images/[hash].[ext]"
  },
  {
    test: /\.jpg/,
    exclude: /(node_modules|bower_components)/,
    loader: "url-loader?limit=10000&mimetype=image/jpg&name=assets/images/[hash].[ext]"
  },
  {
    test: /\.png/,
    exclude: /(node_modules|bower_components)/,
    loader: "url-loader?limit=10000&mimetype=image/png&name=assets/images/[hash].[ext]"
  },
  {
    test: /\.ico$/,
    loader: 'file-loader?name=[name].[ext]'  // <-- retain original file name
  },
  {
    test: /\.mp3$/,
    exclude: /(node_modules|bower_components)/,
    loader: 'file-loader?name=[name].[ext]'
  },
];
